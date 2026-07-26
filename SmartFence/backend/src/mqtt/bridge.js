/**
 * SmartFence AI — Bridge MQTT → Socket.io
 *
 * El gateway LoRa (ESP32 + SX1276) publica telemetría en HiveMQ Cloud via MQTT.
 * Este módulo se suscribe a esos tópicos y los convierte al mismo flujo que
 * ya procesa registrarSockets() — es decir, llama directamente a la misma
 * lógica de PostGIS/alertas que usaría un evento "telemetria:collar" de Socket.io.
 *
 * Tópicos MQTT que consume:
 *   smartfence/gps      → posición + batería + flags del collar
 *   smartfence/battery  → batería baja (ya incluida en /gps, pero se procesa igual)
 *   smartfence/events   → boot, fuera_cerca, bateria_baja, collar_retirado
 *
 * Tópicos MQTT que publica (hacia el gateway):
 *   smartfence/config             → geocerca activa al conectar o al cambiarla
 *   smartfence/gateway/collares   → mapa collarId→serial/nombre para el display OLED
 */

import mqtt from "mqtt";
import { pool } from "../db/pool.js";

const MQTT_URL    = process.env.MQTT_URL    || "mqtts://d1a79bfa7e1549f9bf5ce29c92c11952.s1.eu.hivemq.cloud:8883";
const MQTT_USER   = process.env.MQTT_USER   || "smartfence";
const MQTT_PASS   = process.env.MQTT_PASS   || "SmartFence2026lm";
const CLIENT_ID   = "smartfence-backend-bridge";

let _client = null;
let _io     = null;       // referencia a la instancia de Socket.io
let _procesarTelemetria = null;  // función inyectada desde sockets/index.js

/**
 * Inicia el bridge MQTT.
 * @param {import('socket.io').Server} io   - instancia Socket.io del server
 * @param {Function} procesarTelemetria     - misma función que maneja "telemetria:collar"
 */
export function iniciarBridgeMQTT(io, procesarTelemetria) {
  _io = io;
  _procesarTelemetria = procesarTelemetria;

  _client = mqtt.connect(MQTT_URL, {
    username: MQTT_USER,
    password: MQTT_PASS,
    clientId: CLIENT_ID,
    rejectUnauthorized: false,   // HiveMQ Cloud usa certificado público, no necesita CA
    reconnectPeriod: 5000,
    keepalive: 60,
  });

  _client.on("connect", () => {
    console.log("[MQTT Bridge] Conectado a HiveMQ Cloud");
    _client.subscribe("smartfence/gps",     { qos: 1 });
    _client.subscribe("smartfence/battery", { qos: 1 });
    _client.subscribe("smartfence/events",  { qos: 1 });
    _client.subscribe("smartfence/gateway/heartbeat", { qos: 0 });

    // Publicar mapa de collares para el display OLED del gateway
    _publicarMapaCollares();
  });

  _client.on("reconnect", () => {
    console.log("[MQTT Bridge] Reconectando...");
  });

  _client.on("error", (err) => {
    console.error("[MQTT Bridge] Error:", err.message);
  });

  _client.on("message", (topic, payload) => {
    _manejarMensaje(topic, payload);
  });
}

// ─── Publicar geocerca activa al gateway ─────────────────────────────────────
export async function publicarGeocercaAlGateway(fincaId) {
  if (!_client?.connected) return;
  try {
    const { rows } = await pool.query(`
      SELECT ST_AsGeoJSON(poligono::geometry)::json AS geojson
      FROM cercas
      WHERE activa = true AND es_principal = true
        AND ($1::uuid IS NULL OR finca_id = $1::uuid)
      LIMIT 1
    `, [fincaId ?? null]);

    if (!rows[0]) return;
    const coords = rows[0].geojson?.coordinates?.[0] ?? [];
    const geocerca = coords.map(([lng, lat]) => ({ lat, lng }));
    const msg = JSON.stringify({ collarId: 0, geocerca });  // 0 = cerca global
    _client.publish("smartfence/config", msg, { qos: 1, retain: true });
    console.log(`[MQTT Bridge] Geocerca publicada al gateway (${geocerca.length} puntos)`);
  } catch (err) {
    console.error("[MQTT Bridge] Error publicando geocerca:", err.message);
  }
}

// ─── Publicar mapa de collares al gateway (display OLED) ─────────────────────
async function _publicarMapaCollares() {
  if (!_client?.connected) return;
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.serial, a.nombre
      FROM collares c
      LEFT JOIN animales a ON a.id = c.animal_id
      WHERE c.activo = true
    `);

    // El gateway espera id numérico — usamos un hash simple del serial
    const collares = rows.map(r => ({
      id:     serialToNumId(r.id),
      serial: r.id,         // id es el serial en nuestra BD (texto)
      nombre: r.nombre ?? r.id,
    }));

    const msg = JSON.stringify({ collares });
    _client.publish("smartfence/gateway/collares", msg, { qos: 1, retain: true });
    console.log(`[MQTT Bridge] Mapa de collares publicado: ${collares.length} collar(es)`);
  } catch (err) {
    console.error("[MQTT Bridge] Error publicando collares:", err.message);
  }
}

// ─── Procesar mensajes entrantes ──────────────────────────────────────────────
async function _manejarMensaje(topic, payload) {
  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch {
    console.warn("[MQTT Bridge] Payload no es JSON válido en", topic);
    return;
  }

  // ── smartfence/gps ────────────────────────────────────────────────────────
  if (topic === "smartfence/gps") {
    // El gateway publica: { serial, nombre, lat, lng, velocidadKmh, bateria,
    //                       magnitudImuG, tensionCorreaOk, contactoPielDetectado,
    //                       satellites, hdop, rssiGateway, fueraDeCerca, tieneCerca }
    const collarId = data.serial ?? data.collarId;
    if (!collarId || data.lat == null || data.lng == null) {
      console.warn("[MQTT Bridge] Paquete GPS inválido:", data);
      return;
    }

    // Traducir al formato que espera procesarTelemetria (mismo que el socket "telemetria:collar")
    const evento = {
      collarId,
      lat:    Number(data.lat),
      lng:    Number(data.lng),
      bateria: data.bateria != null ? Number(data.bateria) : null,
    };

    console.log(`[MQTT Bridge] GPS recibido — collar:${collarId} lat:${evento.lat} lng:${evento.lng} bat:${evento.bateria}%`);

    // Reusar exactamente la misma lógica que ya existe en sockets/index.js
    if (_procesarTelemetria) {
      await _procesarTelemetria(evento, _io);
    }

    // Alertas extra por eventos del gateway que el backend no puede calcular
    if (data.fueraDeCerca === true && data.tensionCorreaOk === false) {
      await _generarAlertaCollarRetirado(collarId, data.nombre);
    }
    return;
  }

  // ── smartfence/battery ────────────────────────────────────────────────────
  if (topic === "smartfence/battery") {
    console.log(`[MQTT Bridge] Batería baja — collar:${data.serial} bat:${data.bateria}%`);
    // La lógica de batería baja ya está dentro de procesarTelemetria,
    // pero si llega sin posición GPS procesamos solo la alerta de batería.
    if (data.serial && data.bateria != null) {
      await _alertaBateriaDirecta(data.serial, data.bateria, data.nombre);
    }
    return;
  }

  // ── smartfence/events ─────────────────────────────────────────────────────
  if (topic === "smartfence/events") {
    console.log(`[MQTT Bridge] Evento — collar:${data.serial} evento:${data.evento}`);
    if (data.evento === "collar_retirado") {
      await _generarAlertaCollarRetirado(data.serial, data.nombre);
    }
    if (data.evento === "gateway_boot") {
      console.log("[MQTT Bridge] Gateway reiniciado — republicando geocerca y collares");
      await _publicarMapaCollares();
      await publicarGeocercaAlGateway(null);
    }
    return;
  }

  // ── smartfence/gateway/heartbeat ─────────────────────────────────────────
  if (topic === "smartfence/gateway/heartbeat") {
    console.log(`[MQTT Bridge] Heartbeat gateway — uptime:${data.uptime}s ip:${data.ip}`);
    return;
  }
}

// ─── Generar alerta COLLAR_RETIRADO ───────────────────────────────────────────
async function _generarAlertaCollarRetirado(collarId, nombreAnimal) {
  try {
    const { rows: collar } = await pool.query(
      "SELECT animal_id, finca_id FROM collares WHERE id = $1",
      [collarId]
    );
    if (!collar[0]?.animal_id) return;

    // Evitar duplicados en la última hora
    const { rows: dup } = await pool.query(`
      SELECT 1 FROM alertas
      WHERE collar_id = $1 AND tipo = 'COLLAR_RETIRADO'
        AND estado != 'RESUELTA'
        AND creado_en > now() - interval '1 hour'
      LIMIT 1
    `, [collarId]);
    if (dup.length) return;

    const animal = nombreAnimal ?? collarId;
    const { rows: a } = await pool.query(`
      INSERT INTO alertas (tipo, severidad, mensaje, animal_id, collar_id, finca_id, estado, leida, resuelta)
      VALUES ('COLLAR_RETIRADO','CRITICA',$1,$2,$3,$4,'PENDIENTE',false,false)
      RETURNING *
    `, [
      `Posible retiro de collar en ${animal}`,
      collar[0].animal_id, collarId, collar[0].finca_id ?? null,
    ]);

    if (_io && collar[0].finca_id) {
      _io.to(`finca:${collar[0].finca_id}`).emit("alerta:nueva", {
        id: a[0].id, tipo: "COLLAR_RETIRADO", severidad: "CRITICA",
        mensaje: a[0].mensaje, collarId, estado: "PENDIENTE",
        leida: false, resuelta: false, fecha: a[0].creado_en,
      });
    }
  } catch (err) {
    console.error("[MQTT Bridge] Error alerta collar_retirado:", err.message);
  }
}

// ─── Alerta batería baja sin posición GPS ─────────────────────────────────────
async function _alertaBateriaDirecta(collarId, bateria, nombreAnimal) {
  try {
    const { rows: collar } = await pool.query(
      "SELECT animal_id, finca_id FROM collares WHERE id = $1",
      [collarId]
    );
    if (!collar[0]) return;

    const { rows: dup } = await pool.query(`
      SELECT 1 FROM alertas
      WHERE collar_id = $1 AND tipo = 'BATERIA_BAJA'
        AND estado != 'RESUELTA'
        AND creado_en > now() - interval '1 hour'
      LIMIT 1
    `, [collarId]);
    if (dup.length) return;

    const animal = nombreAnimal ?? collarId;
    const { rows: a } = await pool.query(`
      INSERT INTO alertas (tipo, severidad, mensaje, animal_id, collar_id, finca_id, estado, leida, resuelta)
      VALUES ('BATERIA_BAJA','MEDIA',$1,$2,$3,$4,'PENDIENTE',false,false)
      RETURNING *
    `, [
      `Batería baja (${bateria}%) en collar de ${animal}`,
      collar[0].animal_id ?? null, collarId, collar[0].finca_id ?? null,
    ]);

    if (_io && collar[0].finca_id) {
      _io.to(`finca:${collar[0].finca_id}`).emit("alerta:nueva", {
        id: a[0].id, tipo: "BATERIA_BAJA", severidad: "MEDIA",
        mensaje: a[0].mensaje, collarId, estado: "PENDIENTE",
        leida: false, resuelta: false, fecha: a[0].creado_en,
      });
    }
  } catch (err) {
    console.error("[MQTT Bridge] Error alerta batería:", err.message);
  }
}

// ─── Convierte serial texto → número uint16 (para el display OLED del gateway)
function serialToNumId(serial) {
  let h = 0;
  for (let i = 0; i < serial.length; i++) {
    h = (h * 31 + serial.charCodeAt(i)) & 0xFFFF;
  }
  return h || 1;
}
