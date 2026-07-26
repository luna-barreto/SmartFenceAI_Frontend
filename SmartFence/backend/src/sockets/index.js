import { pool } from "../db/pool.js";

/**
 * procesarTelemetria — núcleo de la lógica GPS/geofencing.
 *
 * Puede ser invocado desde dos fuentes:
 *   1. Socket.io  → evento "telemetria:collar" del gateway (o del collar directo)
 *   2. MQTT Bridge → topic "smartfence/gps" (gateway LoRa → HiveMQ Cloud)
 *
 * @param {{ collarId: string, lat: number, lng: number, bateria?: number }} evento
 * @param {import('socket.io').Server} io
 */
export async function procesarTelemetria(evento, io) {
  const { collarId, lat, lng, bateria } = evento;
  if (!collarId || lat == null || lng == null) return;

  try {
    // Auto-registrar el collar si es la primera vez que se ve en el sistema
    await pool.query(
      `INSERT INTO collares (id, serial, activo)
       VALUES ($1, $1, true)
       ON CONFLICT (id) DO NOTHING`,
      [collarId]
    );

    // Obtener estado anterior del collar
    const { rows: anterior } = await pool.query(
      `SELECT
         c.animal_id AS "animalId", c.finca_id AS "fincaId",
         a.nombre AS "animalNombre",
         EXISTS (
           SELECT 1 FROM cercas ce
           WHERE ce.activa = true AND ce.es_principal = true
             AND (ce.finca_id IS NULL OR ce.finca_id = c.finca_id)
             AND ST_Contains(ce.poligono::geometry, c.ultima_ubicacion::geometry)
         ) AS "estabaDentro"
       FROM collares c
       LEFT JOIN animales a ON a.id = c.animal_id
       WHERE c.id = $1`,
      [collarId]
    );
    const previo = anterior[0];

    // Actualizar posición
    await pool.query(
      `UPDATE collares
       SET ultima_ubicacion = ST_SetSRID(ST_MakePoint($1,$2),4326)::geography,
           bateria = $3, ultima_conexion = now()
       WHERE id = $4`,
      [lng, lat, bateria ?? null, collarId]
    );

    // Insertar en historial de telemetría
    await pool.query(
      `INSERT INTO telemetria (collar_id, ubicacion, bateria)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2,$3),4326)::geography, $4)`,
      [collarId, lng, lat, bateria ?? null]
    );

    // Calcular si está dentro de la cerca ahora
    const { rows: geo } = await pool.query(
      `SELECT EXISTS (
         SELECT 1 FROM cercas ce
         WHERE ce.activa = true AND ce.es_principal = true
           AND (ce.finca_id IS NULL OR ce.finca_id = (SELECT finca_id FROM collares WHERE id = $1))
           AND ST_Contains(ce.poligono::geometry, ST_SetSRID(ST_MakePoint($2,$3),4326)::geometry)
       ) AS dentro`,
      [collarId, lng, lat]
    );
    const dentroDeCerca = geo[0]?.dentro ?? false;

    const payload = {
      collarId,
      animalId: previo?.animalId ?? null,
      nombreAnimal: previo?.animalNombre ?? null,
      lat,
      lng,
      bateria: bateria ?? null,
      dentroDeCerca,
      fecha: new Date().toISOString(),
    };

    // Emitir "gps:posicion" — nombre que escucha el frontend
    const sala = previo?.fincaId ? `finca:${previo.fincaId}` : null;
    if (sala) {
      io.to(sala).emit("gps:posicion", payload);
    } else {
      io.emit("gps:posicion", payload);
    }

    // Generar alerta automática si cambió estado dentro/fuera
    if (previo && previo.estabaDentro !== dentroDeCerca && previo.animalId) {
      const tipo = dentroDeCerca ? "ANIMAL_ENTRO" : "ANIMAL_SALIO";
      const severidad = dentroDeCerca ? "INFO" : "CRITICA";
      const mensaje = dentroDeCerca
        ? `${previo.animalNombre} regresó al perímetro`
        : `${previo.animalNombre} salió del perímetro`;

      const { rows: alerta } = await pool.query(
        `INSERT INTO alertas (tipo, severidad, mensaje, animal_id, collar_id, finca_id, estado, leida, resuelta)
         VALUES ($1, $2, $3, $4, $5, $6, 'PENDIENTE', false, false)
         RETURNING *`,
        [tipo, severidad, mensaje, previo.animalId, collarId, previo.fincaId ?? null]
      );

      const alertaPayload = {
        id: alerta[0].id,
        tipo,
        severidad,
        mensaje,
        animalId: previo.animalId,
        collarId,
        estado: "PENDIENTE",
        leida: false,
        resuelta: false,
        fecha: alerta[0].creado_en,
      };

      if (sala) {
        io.to(sala).emit("alerta:nueva", alertaPayload);
      } else {
        io.emit("alerta:nueva", alertaPayload);
      }

      // Enviar comando buzzer al gateway LoRa
      const comandoBuzzer = dentroDeCerca ? "BUZZER_OFF" : "BUZZER_ON";
      const comandoPayload = { collarId, command: comandoBuzzer };
      if (sala) {
        io.to(sala).emit("collar:comando", comandoPayload);
      } else {
        io.emit("collar:comando", comandoPayload);
      }
      console.log(`[WS] Buzzer ${comandoBuzzer} → collar ${collarId} (${previo.animalNombre})`);
    }

    // Alerta batería baja (< 20%)
    if (bateria != null && bateria < 20 && previo) {
      const { rows: yaExiste } = await pool.query(
        `SELECT 1 FROM alertas
         WHERE collar_id = $1 AND tipo = 'BATERIA_BAJA'
           AND estado != 'RESUELTA'
           AND creado_en > now() - interval '1 hour'
         LIMIT 1`,
        [collarId]
      );
      if (!yaExiste.length) {
        const { rows: alertaBat } = await pool.query(
          `INSERT INTO alertas (tipo, severidad, mensaje, animal_id, collar_id, finca_id, estado, leida, resuelta)
           VALUES ('BATERIA_BAJA','MEDIA',$1,$2,$3,$4,'PENDIENTE',false,false)
           RETURNING *`,
          [
            `Batería baja (${bateria}%) en collar ${collarId}${previo.animalNombre ? ` - ${previo.animalNombre}` : ""}`,
            previo.animalId ?? null,
            collarId,
            previo.fincaId ?? null,
          ]
        );
        const bat = {
          id: alertaBat[0].id,
          tipo: "BATERIA_BAJA",
          severidad: "MEDIA",
          mensaje: alertaBat[0].mensaje,
          collarId,
          animalId: previo.animalId,
          estado: "PENDIENTE",
          leida: false,
          resuelta: false,
          fecha: alertaBat[0].creado_en,
        };
        if (sala) io.to(sala).emit("alerta:nueva", bat);
        else io.emit("alerta:nueva", bat);
      }
    }
  } catch (err) {
    console.error("[GPS] Error procesando telemetría:", err);
  }
}

/**
 * registrarSockets — configura los handlers de Socket.io.
 * Los eventos de collar vía Socket.io llaman a procesarTelemetria,
 * la misma función que usa el bridge MQTT.
 */
export function registrarSockets(io) {
  io.on("connection", (socket) => {
    console.log("[WS] Cliente conectado:", socket.id);

    socket.on("finca:unirse", (fincaId) => {
      socket.join(`finca:${fincaId}`);
      console.log(`[WS] ${socket.id} unido a finca:${fincaId}`);
    });

    socket.on("finca:salir", (fincaId) => {
      socket.leave(`finca:${fincaId}`);
    });

    // Telemetría desde ESP32 / gateway LoRa por Socket.io (alternativa al MQTT)
    socket.on("telemetria:collar", async (evento) => {
      await procesarTelemetria(evento, io);
    });

    socket.on("disconnect", () => {
      console.log("[WS] Cliente desconectado:", socket.id);
    });
  });
}
