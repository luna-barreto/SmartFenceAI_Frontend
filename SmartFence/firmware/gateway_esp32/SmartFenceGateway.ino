/**
 * SmartFence AI — Firmware del Gateway
 * ──────────────────────────────────────
 * Hardware  : ESP32-S3  (Heltec WiFi LoRa 32 V3 recomendado)
 * Recibe    : paquetes binarios LoRa de los collares
 * Publica   : JSON por MQTT al backend NestJS
 * Valida    : CRC-16 de cada paquete antes de publicar
 * Pantalla  : OLED 128x64 con estado de WiFi/MQTT/LoRa
 *
 * Tópicos MQTT publicados:
 *   smartfence/gps      → posición + sensores (principal)
 *   smartfence/battery  → batería
 *   smartfence/status   → correa + contacto
 *   smartfence/events   → eventos (boot, low_battery, fuera_cerca)
 *
 * Tópico MQTT suscrito:
 *   smartfence/config   → recibe geocerca desde el backend
 *
 * Librerías (Gestor de librerías):
 *   - RadioLib       (Jan Gromes)
 *   - PubSubClient   (Nick O'Leary)
 *   - ArduinoJson    (Benoit Blanchon) v7+
 *   - Adafruit SSD1306
 *   - Adafruit GFX
 *
 * Board manager: https://dl.espressif.com/dl/package_esp32_index.json
 * Placa: TTGO LoRa32-OLED  (o ESP32 Dev Module)
 */

#include <SPI.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <RadioLib.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "config.h"
#include "pins.h"
#include "telemetry.h"
#include "gw_display.h"
#include "geofence.h"
#include "utils.h"

// ─── LoRa SX1276 ─────────────────────────────────────────────────────────────
static SX1276 radio = new Module(LORA_CS, LORA_DIO0, LORA_RST, LORA_DIO1);
static bool   _loraOk      = false;
static volatile bool _pktReady = false;   // flag seteado por la ISR de DIO0

// ISR — se ejecuta cuando SX1276 señala RxDone en DIO0
void IRAM_ATTR onLoraReceived() {
  _pktReady = true;
}

// ─── WiFi + MQTT (TLS — HiveMQ Cloud puerto 8883) ────────────────────────────
static WiFiClientSecure wifiClient;
static PubSubClient     mqtt(wifiClient);

// ─── Estado del gateway ───────────────────────────────────────────────────────
static GwDisplayInfo dispInfo = {};
static unsigned long tHeartbeat    = 0;
static unsigned long tReconectWifi = 0;
static unsigned long tDisplay      = 0;

// ─── Seguimiento de collares activos (últimos 60 s) ───────────────────────────
#define MAX_COLLARES_ACTIVOS  20
#define COLLAR_TIMEOUT_MS     60000UL

struct CollarVivo {
  uint16_t     collarId;
  unsigned long ultimoMs;
};
static CollarVivo _vivos[MAX_COLLARES_ACTIVOS];
static int        _nVivos = 0;

static void registrarCollarActivo(uint16_t collarId) {
  unsigned long ahora = millis();
  // Actualizar si ya existe
  for (int i = 0; i < _nVivos; i++) {
    if (_vivos[i].collarId == collarId) {
      _vivos[i].ultimoMs = ahora;
      return;
    }
  }
  // Agregar nuevo
  if (_nVivos < MAX_COLLARES_ACTIVOS) {
    _vivos[_nVivos++] = { collarId, ahora };
  }
}

static int contarCollaresVivos() {
  unsigned long ahora = millis();
  int c = 0;
  for (int i = 0; i < _nVivos; i++) {
    if (ahora - _vivos[i].ultimoMs < COLLAR_TIMEOUT_MS) c++;
  }
  return c;
}

// ─── WiFi ─────────────────────────────────────────────────────────────────────
static void conectarWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  debugPrintf("[WiFi] conectando a %s...\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < TIMEOUT_WIFI_MS) {
    delay(300);
  }
  if (WiFi.status() == WL_CONNECTED) {
    debugPrintf("[WiFi] OK — IP: %s\n", WiFi.localIP().toString().c_str());
    dispInfo.wifiOk = true;
    ledBlink(2);
  } else {
    debugPrint("[WiFi] FALLO — reintentando...");
    dispInfo.wifiOk = false;
  }
}

// ─── Callback MQTT — recibe mensajes del backend ─────────────────────────────
static void mqttCallback(char* topic, byte* payload, unsigned int length) {
  debugPrintf("[MQTT] mensaje en %s (%d bytes)\n", topic, length);

  // ── smartfence/config — geocerca enviada desde el backend ──────────────────
  // Formato: { "collarId": 1, "geocerca": [{"lat":-4.001,"lng":-79.201}, ...] }
  // collarId = 0 → cerca global (aplica a todos los collares sin cerca propia)
  if (strcmp(topic, TOPIC_CONFIG) == 0) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, payload, length);
    if (err) { debugPrint("[MQTT] JSON invalido en config"); return; }

    uint16_t cid = doc["collarId"] | 0;
    JsonArray arr = doc["geocerca"].as<JsonArray>();
    int n = (int)arr.size();

    if (n < 3 || n > MAX_FENCE_POINTS) {
      debugPrintf("[MQTT] geocerca invalida: %d puntos\n", n);
      return;
    }

    GeoPoint pts[MAX_FENCE_POINTS];
    int i = 0;
    for (JsonObject p : arr) {
      pts[i].lat = p["lat"] | 0.0f;
      pts[i].lng = p["lng"] | 0.0f;
      i++;
    }

    geofenceSet(cid, pts, n);
    debugPrintf("[GEO] cerca actualizada en vivo para collarId=%d (%d pts)\n", cid, n);
    return;
  }

  // ── smartfence/gateway/collares — mapa de collares desde el backend ─────────
  // Formato: { "fincaId": "...", "collares": [{"id":1,"serial":"SF-0001","nombre":"Vaca 1"}, ...] }
  // Reemplaza el array hardcodeado de telemetry.h — se llama cada vez que se
  // registra, edita o elimina un animal o collar desde la app.
  if (strcmp(topic, TOPIC_COLLARES) == 0) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, payload, length);
    if (err) { debugPrint("[MQTT] JSON invalido en collares"); return; }

    JsonArray arr = doc["collares"].as<JsonArray>();
    if (arr.isNull()) { debugPrint("[MQTT] collares: array nulo"); return; }

    collarMapClear();
    int total = 0;
    for (JsonObject c : arr) {
      uint16_t    cid    = c["id"]     | 0;
      const char* serial = c["serial"] | "DESCONOCIDO";
      const char* nombre = c["nombre"] | serial;
      collarMapSet(cid, serial, nombre);
      total++;
    }
    debugPrintf("[MQTT] mapa de collares actualizado: %d collar(es)\n", total);
    return;
  }
}

// ─── MQTT ─────────────────────────────────────────────────────────────────────
static void conectarMqtt() {
  if (mqtt.connected()) return;
  debugPrintf("[MQTT] conectando a %s:%d...\n", MQTT_SERVER, MQTT_PORT);

  bool ok;
  if (strlen(MQTT_USER) > 0)
    ok = mqtt.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS);
  else
    ok = mqtt.connect(MQTT_CLIENT_ID);

  if (ok) {
    debugPrint("[MQTT] conectado");
    mqtt.subscribe(TOPIC_CONFIG);
    mqtt.subscribe(TOPIC_COLLARES);
    dispInfo.mqttOk = true;
    ledBlink(1);
  } else {
    debugPrintf("[MQTT] FALLO rc=%d\n", mqtt.state());
    dispInfo.mqttOk = false;
  }
}

// ─── Publicar paquete recibido como JSON al backend ───────────────────────────
static void publicarPaquete(const TelemetryPacket& pkt, int rssi) {
  const char* serial = collarSerial(pkt.collarId);
  const char* nombre = collarNombre(pkt.collarId);

  float lat  = pkt.latE6 / 1e6f;
  float lng  = pkt.lngE6 / 1e6f;
  float vel  = pkt.speedCmS / 100.0f * 3.6f;   // cm/s → km/h
  float hdop = pkt.hdop10 / 10.0f;

  // Detectar si la vaca está fuera de la cerca en el gateway.
  // Solo evaluar si el GPS es válido; si no hay cerca configurada se asume dentro.
  bool gpsValido    = (pkt.flags & FLAG_GPS_VALID) != 0;
  bool fueraDeCerca = false;
  if (gpsValido) {
    fueraDeCerca = !geofenceIsInside(pkt.collarId, lat, lng);
  }

  // ── smartfence/gps ──────────────────────────────────────────────────────
  {
    JsonDocument doc;
    doc["serial"]                = serial;
    doc["nombre"]                = nombre;
    doc["lat"]                   = lat;
    doc["lng"]                   = lng;
    doc["velocidadKmh"]          = vel;
    doc["bateria"]               = pkt.battery;
    doc["magnitudImuG"]          = 1.0;   // sin IMU en este collar
    doc["tensionCorreaOk"]       = (bool)(pkt.flags & FLAG_TENSION_OK);
    doc["contactoPielDetectado"] = (bool)(pkt.flags & FLAG_CONTACTO_PIEL);
    doc["satellites"]            = pkt.satellites;
    doc["hdop"]                  = hdop;
    doc["rssiGateway"]           = rssi;
    doc["fueraDeCerca"]          = fueraDeCerca;
    doc["tieneCerca"]            = geofenceHasFence(pkt.collarId);

    char buf[400];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(TOPIC_GPS, buf, false);
    debugPrintf("[MQTT→GPS] %s\n", buf);
  }

  // ── smartfence/battery (si batería baja) ────────────────────────────────
  if (pkt.flags & FLAG_LOW_BAT) {
    JsonDocument doc;
    doc["serial"]  = serial;
    doc["nombre"]  = nombre;
    doc["bateria"] = pkt.battery;
    char buf[64];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(TOPIC_BATTERY, buf, false);
  }

  // ── smartfence/status ────────────────────────────────────────────────────
  {
    JsonDocument doc;
    doc["serial"]                = serial;
    doc["nombre"]                = nombre;
    doc["tensionCorreaOk"]       = (bool)(pkt.flags & FLAG_TENSION_OK);
    doc["contactoPielDetectado"] = (bool)(pkt.flags & FLAG_CONTACTO_PIEL);
    char buf[128];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(TOPIC_STATUS, buf, false);
  }

  // ── smartfence/events — eventos especiales ───────────────────────────────
  const char* evento = nullptr;
  if (pkt.status == STATUS_BOOTING)     evento = "boot";
  if (fueraDeCerca)                     evento = "fuera_cerca";
  if (pkt.status == STATUS_LOW_BATTERY) evento = "bateria_baja";
  if (pkt.status == STATUS_COLLAR_OFF)  evento = "collar_retirado";

  if (evento) {
    JsonDocument doc;
    doc["serial"] = serial;
    doc["nombre"] = nombre;
    doc["evento"] = evento;
    char buf[64];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(TOPIC_EVENTS, buf, false);
  }

  // (conteo actualizado antes de llamar esta función)
}

// ─── Heartbeat — el gateway se anuncia al broker ─────────────────────────────
static void publicarHeartbeat() {
  JsonDocument doc;
  doc["gateway"] = MQTT_CLIENT_ID;
  doc["uptime"]  = millis() / 1000;
  doc["ip"]      = WiFi.localIP().toString();
  doc["rssi_wifi"]= WiFi.RSSI();
  char buf[128];
  serializeJson(doc, buf, sizeof(buf));
  mqtt.publish("smartfence/gateway/heartbeat", buf, false);
  debugPrint("[MQTT] heartbeat enviado");
}

// ═════════════════════════════════════════════════════════════════════════════
// SETUP
// ═════════════════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(DEBUG_BAUD);
  delay(500);
  debugPrint("\n=== SmartFence AI — Gateway iniciando ===");

  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);

  geofenceInit();
  gwDisplayInit();

  // ── LoRa SX1262 ─────────────────────────────────────────────────────────
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_CS);
  int state = radio.begin(
    (float)LORA_FREQ / 1e6,
    (float)125.0,   // BW kHz
    9,              // SF
    5,              // CR 4/5
    LORA_SYNC_WORD,
    17,             // TX power
    8               // preamble
  );

  if (state == RADIOLIB_ERR_NONE) {
    radio.setCRC(true);
    // Modo recepción continua con interrupción — no bloquea el loop
    radio.setDio0Action(onLoraReceived, RISING);
    int rxState = radio.startReceive();
    if (rxState == RADIOLIB_ERR_NONE) {
      _loraOk = true;
      dispInfo.loraOk = true;
      debugPrint("[LoRa] OK — escucha continua activa");
    } else {
      debugPrintf("[LoRa] ERROR startReceive: %d\n", rxState);
    }
  } else {
    debugPrintf("[LoRa] ERROR init: %d\n", state);
  }

  // ── WiFi + MQTT (HiveMQ Cloud TLS) ──────────────────────────────────────
  wifiClient.setInsecure();   // acepta el certificado de HiveMQ sin pinning
  WiFi.mode(WIFI_STA);
  conectarWifi();
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(1024);
  mqtt.setKeepAlive(MQTT_KEEPALIVE_S);
  conectarMqtt();

  // Heartbeat de arranque
  if (mqtt.connected()) {
    publicarHeartbeat();
    JsonDocument doc;
    doc["gateway"] = MQTT_CLIENT_ID;
    doc["evento"]  = "gateway_boot";
    char buf[64];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish("smartfence/gateway/heartbeat", buf, false);
  }

  ledBlink(3);
  debugPrint("[MAIN] Gateway listo — escuchando LoRa");
  gwDisplayUpdate(dispInfo);
}

// ═════════════════════════════════════════════════════════════════════════════
// LOOP
// ═════════════════════════════════════════════════════════════════════════════
void loop() {
  unsigned long ahora = millis();

  // ── Mantener WiFi ─────────────────────────────────────────────────────────
  if (WiFi.status() != WL_CONNECTED && ahora - tReconectWifi > TIMEOUT_WIFI_MS) {
    tReconectWifi = ahora;
    dispInfo.wifiOk = false;
    conectarWifi();
  }

  // ── Mantener MQTT ─────────────────────────────────────────────────────────
  if (!mqtt.connected() && WiFi.status() == WL_CONNECTED) {
    conectarMqtt();
  }
  mqtt.loop();

  // ── Recibir paquete LoRa (no-bloqueante, basado en ISR) ──────────────────
  if (_loraOk && _pktReady) {
    _pktReady = false;

    uint8_t buf[PACKET_SIZE];
    int state = radio.readData(buf, PACKET_SIZE);

    if (state == RADIOLIB_ERR_NONE) {
      if (radio.getPacketLength() != PACKET_SIZE) {
        debugPrintf("[LoRa] tamano incorrecto: %d bytes\n",
                    (int)radio.getPacketLength());
      } else {
        TelemetryPacket pkt;
        memcpy(&pkt, buf, PACKET_SIZE);

        uint16_t crcCalculado = calcCRC16(buf, PACKET_SIZE - 2);
        if (crcCalculado != pkt.crc) {
          debugPrintf("[LoRa] CRC invalido — calculado=0x%04X recibido=0x%04X\n",
                      crcCalculado, pkt.crc);
        } else {
          int rssi = (int)radio.getRSSI();
          debugPrintf("[LoRa] RX collar=%d bat=%d%% sat=%d RSSI=%ddBm\n",
                      pkt.collarId, pkt.battery, pkt.satellites, rssi);

          ledBlink(1, 50);

          // Registrar collar activo siempre, con o sin MQTT
          registrarCollarActivo(pkt.collarId);
          dispInfo.collaresVivos = (uint8_t)contarCollaresVivos();
          dispInfo.paquetesHoy++;
          dispInfo.rssiUltimo = rssi;
          strncpy(dispInfo.ultimoSerial, collarSerial(pkt.collarId),
                  sizeof(dispInfo.ultimoSerial) - 1);
          strncpy(dispInfo.ultimoNombre, collarNombre(pkt.collarId),
                  sizeof(dispInfo.ultimoNombre) - 1);
          dispInfo.ultimoLat      = pkt.latE6 / 1e6f;
          dispInfo.ultimoLng      = pkt.lngE6 / 1e6f;
          dispInfo.ultimoGpsValido = (pkt.flags & FLAG_GPS_VALID) != 0;

          if (mqtt.connected()) {
            publicarPaquete(pkt, rssi);
          } else {
            debugPrint("[MQTT] sin conexion — paquete descartado");
          }
        }
      }
    } else {
      debugPrintf("[LoRa] readData error: %d\n", state);
    }

    // Volver a modo escucha para el siguiente paquete
    radio.startReceive();
  }

  // ── Heartbeat cada 30 s ───────────────────────────────────────────────────
  if (ahora - tHeartbeat > INTERVALO_HEARTBEAT_MS) {
    tHeartbeat = ahora;
    if (mqtt.connected()) publicarHeartbeat();
  }

  // ── Actualizar pantalla cada 2 s ──────────────────────────────────────────
  if (ahora - tDisplay > 2000) {
    tDisplay = ahora;
    dispInfo.wifiOk      = (WiFi.status() == WL_CONNECTED);
    dispInfo.mqttOk      = mqtt.connected();
    dispInfo.loraOk      = _loraOk;
    dispInfo.collaresVivos = (uint8_t)contarCollaresVivos();
    gwDisplayUpdate(dispInfo);
  }
}
