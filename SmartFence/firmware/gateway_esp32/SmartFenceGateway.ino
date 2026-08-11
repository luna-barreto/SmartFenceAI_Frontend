/**
 * SmartFence AI — Firmware del Gateway
 * ──────────────────────────────────────
 * Hardware : TTGO LoRa32 V1.6  (ESP32 + SX1276 + OLED 128×64)
 * Recibe   : paquetes binarios LoRa 15 bytes de los collares (cada 7 s)
 * Publica  : JSON por MQTT TLS → HiveMQ Cloud → backend NestJS
 *
 * Tópicos publicados:
 *   smartfence/gps             → posición + batería (cada paquete LoRa)
 *   smartfence/battery         → solo cuando batería < 20 %
 *   smartfence/events          → gateway_boot al arrancar
 *   smartfence/gateway/heartbeat → estado cada 30 s
 *
 * Tópicos suscritos:
 *   smartfence/config          → geocerca desde el backend
 *   smartfence/gateway/collares → mapa serial→nombre desde el backend
 *
 * Librerías (Gestor de librerías Arduino IDE):
 *   RadioLib, PubSubClient, ArduinoJson v7+, Adafruit SSD1306, Adafruit GFX
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
static bool          _loraOk   = false;
static volatile bool _pktReady = false;

void IRAM_ATTR onLoraReceived() { _pktReady = true; }

// ─── WiFi + MQTT ─────────────────────────────────────────────────────────────
static WiFiClientSecure wifiClient;
static PubSubClient     mqtt(wifiClient);

// ─── Estado global ────────────────────────────────────────────────────────────
static GwDisplayInfo dispInfo    = {};
static unsigned long tHeartbeat  = 0;
static unsigned long tWifi       = 0;
static unsigned long tMqtt       = 0;
static unsigned long tDisplay    = 0;

// ─── Collares activos (ventana 20 s) ─────────────────────────────────────────
#define MAX_COLLARES 20
#define COLLAR_TTL   20000UL

struct CollarVivo { uint16_t id; unsigned long ms; };
static CollarVivo _vivos[MAX_COLLARES];
static int        _nVivos = 0;

static void registrarCollar(uint16_t id) {
  unsigned long ahora = millis();
  for (int i = 0; i < _nVivos; i++) {
    if (_vivos[i].id == id) { _vivos[i].ms = ahora; return; }
  }
  if (_nVivos < MAX_COLLARES) _vivos[_nVivos++] = { id, ahora };
}

static int collaresVivos() {
  unsigned long ahora = millis();
  int n = 0;
  for (int i = 0; i < _nVivos; i++)
    if (ahora - _vivos[i].ms < COLLAR_TTL) n++;
  return n;
}

// ─── WiFi ─────────────────────────────────────────────────────────────────────
static void conectarWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  debugPrintf("[WiFi] conectando a '%s'...\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000UL)
    delay(300);

  if (WiFi.status() == WL_CONNECTED) {
    debugPrintf("[WiFi] OK — IP: %s\n", WiFi.localIP().toString().c_str());
    dispInfo.wifiOk = true;
    ledBlink(2);
  } else {
    debugPrint("[WiFi] FALLO — reintentando en 30s");
    dispInfo.wifiOk = false;
  }
}

// ─── MQTT callback ────────────────────────────────────────────────────────────
static void mqttCallback(char* topic, byte* payload, unsigned int length) {
  debugPrintf("[MQTT] %s (%u bytes)\n", topic, length);

  if (strcmp(topic, TOPIC_CONFIG) == 0) {
    JsonDocument doc;
    if (deserializeJson(doc, payload, length)) return;
    uint16_t cid = doc["collarId"] | 0;
    JsonArray arr = doc["geocerca"].as<JsonArray>();
    int n = (int)arr.size();
    if (n < 3 || n > MAX_FENCE_POINTS) return;
    GeoPoint pts[MAX_FENCE_POINTS];
    int i = 0;
    for (JsonObject p : arr) {
      pts[i].lat = p["lat"] | 0.0f;
      pts[i].lng = p["lng"] | 0.0f;
      i++;
    }
    geofenceSet(cid, pts, n);
    debugPrintf("[GEO] geocerca actualizada collarId=%d (%d pts)\n", cid, n);
    return;
  }

  if (strcmp(topic, TOPIC_COLLARES) == 0) {
    JsonDocument doc;
    if (deserializeJson(doc, payload, length)) return;
    JsonArray arr = doc["collares"].as<JsonArray>();
    if (arr.isNull()) return;
    collarMapClear();
    int total = 0;
    for (JsonObject c : arr) {
      uint16_t    cid    = c["id"]     | 0;
      const char* serial = c["serial"] | "DESCONOCIDO";
      const char* nombre = c["nombre"] | serial;
      collarMapSet(cid, serial, nombre);
      total++;
    }
    debugPrintf("[MQTT] mapa collares: %d\n", total);
    return;
  }

  // smartfence/collar/<serial>/command — comando del backend al collar
  if (strncmp(topic, "smartfence/collar/", 18) == 0) {
    JsonDocument doc;
    if (deserializeJson(doc, payload, length)) return;
    const char* comando   = doc["command"]  | "";
    uint32_t    duracion  = doc["duration"] | 5000;

    uint8_t cmd = 0;
    if (strcmp(comando, "BUZZER_ON")  == 0) cmd = 0x01;
    if (strcmp(comando, "BUZZER_OFF") == 0) cmd = 0x02;
    if (cmd == 0) return;

    // Extraer serial del tópico: smartfence/collar/SF-0001/command
    const char* p = topic + 18;
    char serial[16] = {};
    int i = 0;
    while (p[i] && p[i] != '/' && i < 15) { serial[i] = p[i]; i++; }
    uint16_t cid = collarIdPorSerial(serial);

    // Armar CommandPacket y enviar por LoRa
    #define CMD_PKT_MAGIC 0xCD
    #pragma pack(push,1)
    struct CmdPkt { uint8_t magic; uint16_t collarId; uint8_t cmd; uint32_t duracionMs; uint16_t crc; };
    #pragma pack(pop)

    CmdPkt pkt = {};
    pkt.magic      = CMD_PKT_MAGIC;
    pkt.collarId   = cid;
    pkt.cmd        = cmd;
    pkt.duracionMs = duracion;
    pkt.crc        = calcCRC16((const uint8_t*)&pkt, sizeof(pkt) - 2);

    radio.standby();
    radio.clearDio0Action();
    radio.transmit((uint8_t*)&pkt, sizeof(pkt));
    _pktReady = false;
    radio.setDio0Action(onLoraReceived, RISING);
    radio.startReceive();

    debugPrintf("[CMD] %s cmd=%d dur=%lu ms → collar %d\n", serial, cmd, duracion, cid);
    return;
  }
}

// ─── MQTT conexión ────────────────────────────────────────────────────────────
static void conectarMqtt() {
  if (mqtt.connected()) return;
  debugPrintf("[MQTT] conectando a %s:%d...\n", MQTT_SERVER, MQTT_PORT);
  bool ok = mqtt.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS);
  if (ok) {
    debugPrint("[MQTT] conectado");
    mqtt.subscribe(TOPIC_CONFIG);
    mqtt.subscribe(TOPIC_COLLARES);
    mqtt.subscribe("smartfence/collar/+/command");
    dispInfo.mqttOk = true;
    ledBlink(1);
  } else {
    debugPrintf("[MQTT] FALLO rc=%d\n", mqtt.state());
    dispInfo.mqttOk = false;
  }
}

// ─── Publicar telemetría al backend ───────────────────────────────────────────
static void publicarPaquete(const TelemetryPacket& pkt) {
  const char* serial = collarSerial(pkt.collarId);
  float lat = pkt.latE6 / 1e6f;
  float lng = pkt.lngE6 / 1e6f;
  bool  gpsOk       = (pkt.flags & FLAG_GPS_VALID) != 0;
  bool  fueraCerca  = gpsOk && !geofenceIsInside(pkt.collarId, lat, lng);

  // smartfence/gps — siempre
  {
    JsonDocument doc;
    doc["serial"]     = serial;
    doc["lat"]        = lat;
    doc["lng"]        = lng;
    doc["bateria"]    = pkt.battery;
    if (pkt.flags & FLAG_MOVING) doc["magnitudImuG"] = 1.5f;
    doc["fueraDeCerca"] = fueraCerca;
    doc["tieneCerca"]   = geofenceHasFence(pkt.collarId);
    char buf[256];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(TOPIC_GPS, buf, false);
    debugPrintf("[GPS] %s\n", buf);
  }

  // smartfence/battery — solo si batería baja
  if (pkt.flags & FLAG_LOW_BAT) {
    JsonDocument doc;
    doc["serial"]  = serial;
    doc["bateria"] = pkt.battery;
    char buf[64];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(TOPIC_BATTERY, buf, false);
  }
}

// ─── Heartbeat ────────────────────────────────────────────────────────────────
static void publicarHeartbeat() {
  JsonDocument doc;
  doc["gateway"]   = MQTT_CLIENT_ID;
  doc["uptime"]    = millis() / 1000;
  doc["ip"]        = WiFi.localIP().toString();
  doc["rssi_wifi"] = WiFi.RSSI();
  char buf[128];
  serializeJson(doc, buf, sizeof(buf));
  mqtt.publish("smartfence/gateway/heartbeat", buf, false);
}

// ═════════════════════════════════════════════════════════════════════════════
// SETUP
// ═════════════════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(DEBUG_BAUD);
  delay(300);
  debugPrint("\n=== SmartFence Gateway iniciando ===");

  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);

  geofenceInit();
  gwDisplayInit();

  // ── LoRa ────────────────────────────────────────────────────────────────
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_CS);
  int st = radio.begin(LORA_FREQ / 1e6f, 125.0f, 9, 5, LORA_SYNC_WORD, 17, 8);
  if (st == RADIOLIB_ERR_NONE) {
    radio.setCRC(true);   // collar usa enableCrc() → SX1276 valida y entrega exactamente PACKET_SIZE bytes
    radio.setDio0Action(onLoraReceived, RISING);
    if (radio.startReceive() == RADIOLIB_ERR_NONE) {
      _loraOk = true;
      dispInfo.loraOk = true;
      debugPrint("[LoRa] OK");
    }
  } else {
    debugPrintf("[LoRa] ERROR init: %d\n", st);
  }

  // ── WiFi + MQTT ──────────────────────────────────────────────────────────
  wifiClient.setInsecure();     // acepta certificado HiveMQ sin pinning
  wifiClient.setTimeout(4000);  // TLS handshake máx 4 s (evita bloqueos largos)
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);

  conectarWifi();

  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(1024);
  mqtt.setKeepAlive(MQTT_KEEPALIVE_S);
  conectarMqtt();

  if (mqtt.connected()) {
    publicarHeartbeat();
    // Notificar boot al backend — el backend debe responder con el mapa de collares
    JsonDocument doc;
    doc["serial"] = MQTT_CLIENT_ID;
    doc["evento"] = "gateway_boot";
    char buf[128];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(TOPIC_EVENTS, buf, false);
    // Pedir explícitamente el mapa de collares al backend
    mqtt.publish("smartfence/gateway/request_collares", buf, false);
  }

  ledBlink(3);
  debugPrint("[MAIN] listo — escuchando LoRa");
  gwDisplayUpdate(dispInfo);
}

// ═════════════════════════════════════════════════════════════════════════════
// LOOP
// ═════════════════════════════════════════════════════════════════════════════
void loop() {
  unsigned long ahora = millis();

  // ── Mantener WiFi ─────────────────────────────────────────────────────────
  if (WiFi.status() != WL_CONNECTED && ahora - tWifi > 15000UL) {
    tWifi = ahora;
    dispInfo.wifiOk = false;
    conectarWifi();
  }

  // ── Mantener MQTT (reintentar cada 10 s) ─────────────────────────────────
  if (!mqtt.connected() && WiFi.status() == WL_CONNECTED && ahora - tMqtt > 10000UL) {
    tMqtt = ahora;
    conectarMqtt();
  }
  mqtt.loop();

  // ── Recibir LoRa (ISR no-bloqueante) ─────────────────────────────────────
  if (_loraOk && _pktReady) {
    _pktReady = false;

    // Leer longitud ANTES de readData — después el FIFO ya fue consumido.
    // El collar usa arduino-LoRa enableCrc() que añade 2 bytes CRC hardware,
    // por eso pktLen puede ser PACKET_SIZE (15) o PACKET_SIZE+2 (17).
    // Leer siempre pktLen bytes para vaciar el FIFO; los primeros 15 son el paquete.
    int pktLen = (int)radio.getPacketLength();
    debugPrintf("[LoRa] pktLen=%d\n", pktLen);

    uint8_t buf[PACKET_SIZE] = {};
    int st = radio.readData(buf, PACKET_SIZE);

    if (st == RADIOLIB_ERR_NONE) {
      {
        TelemetryPacket pkt;
        memcpy(&pkt, buf, PACKET_SIZE);

        if (calcCRC16(buf, PACKET_SIZE - 2) != pkt.crc) {
          debugPrint("[LoRa] CRC invalido — paquete descartado");
        } else {
          int rssi = (int)radio.getRSSI();
          debugPrintf("[LoRa] RX collar=%d bat=%d%% RSSI=%ddBm\n",
                      pkt.collarId, pkt.battery, rssi);
          ledBlink(1, 50);

          registrarCollar(pkt.collarId);
          dispInfo.collaresVivos   = (uint8_t)collaresVivos();
          dispInfo.paquetesHoy++;
          dispInfo.rssiUltimo      = rssi;
          strncpy(dispInfo.ultimoSerial, collarSerial(pkt.collarId), sizeof(dispInfo.ultimoSerial) - 1);
          strncpy(dispInfo.ultimoNombre, collarNombre(pkt.collarId), sizeof(dispInfo.ultimoNombre) - 1);
          // Solo actualizar coordenadas cuando el paquete trae fix válido.
          // Si no trae GPS, conservar las últimas coordenadas conocidas.
          if (pkt.flags & FLAG_GPS_VALID) {
            dispInfo.ultimoLat       = pkt.latE6 / 1e6f;
            dispInfo.ultimoLng       = pkt.lngE6 / 1e6f;
            dispInfo.ultimoGpsValido = true;
          }

          if (mqtt.connected()) {
            publicarPaquete(pkt);
          } else {
            debugPrint("[MQTT] sin conexion — paquete descartado");
          }
        }
      }
    } else {
      debugPrintf("[LoRa] readData error: %d\n", st);
    }

    radio.startReceive();   // volver a escucha continua
  }

  // ── Heartbeat cada 30 s ───────────────────────────────────────────────────
  if (ahora - tHeartbeat > INTERVALO_HEARTBEAT_MS) {
    tHeartbeat = ahora;
    if (mqtt.connected()) publicarHeartbeat();
  }

  // ── Pantalla cada 2 s ─────────────────────────────────────────────────────
  if (ahora - tDisplay > 2000UL) {
    tDisplay = ahora;
    dispInfo.wifiOk       = (WiFi.status() == WL_CONNECTED);
    dispInfo.mqttOk       = mqtt.connected();
    dispInfo.loraOk       = _loraOk;
    dispInfo.collaresVivos = (uint8_t)collaresVivos();
    gwDisplayUpdate(dispInfo);
  }
}
