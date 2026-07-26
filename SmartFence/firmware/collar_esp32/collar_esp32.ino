/*
  SmartFence AI — Firmware del collar
  ─────────────────────────────────────────────────────────────────────────────
  Hardware : ESP32 + GPS NEO-6M (UART2) + LoRa SX1276 (SPI)
  Rol      : Leer posición GPS y transmitirla por LoRa al gateway cada 20 s.

  Protocolo de transmisión: paquete BINARIO TelemetryPacket (23 bytes + CRC16).
  ¡No usar JSON! El gateway (SmartFenceGateway.ino) espera este formato exacto.

  Estructura TelemetryPacket (little-endian, packed):
    uint16_t collarId       — ID numérico único del collar
    int32_t  latE6          — latitud × 1 000 000  (ej. -4001230 → -4.001230)
    int32_t  lngE6          — longitud × 1 000 000
    uint16_t speedCmS       — velocidad en cm/s
    uint8_t  battery        — batería 0-100 %
    uint8_t  satellites     — satélites visibles
    uint8_t  hdop10         — HDOP × 10  (ej. 12 → HDOP 1.2)
    uint8_t  status         — CollarStatus enum
    uint8_t  flags          — bits: GPS_VALID TENSION_OK CONTACTO_PIEL MOVING LOW_BAT FUERA_CERCA
    uint32_t timestamp      — segundos desde boot (millis()/1000)
    uint16_t crc            — CRC-16/CCITT de los 21 bytes anteriores

  Librerías necesarias (Gestor de librerías Arduino IDE):
    - TinyGPSPlus   (Mikal Hart)
    - LoRa          (sandeepmistry/arduino-LoRa)

  IMPORTANTE — ajustar antes de compilar:
    1. COLLAR_ID       — número único por collar (1, 2, 3…)
    2. LORA_BAND       — 915E6 (América) o 868E6 (Europa)
    3. LORA_SYNC_WORD  — debe ser 0xAB (igual que el gateway)
    4. Pines según tu placa (ver sección de pines más abajo)
*/

#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <SPI.h>
#include <LoRa.h>
#include <stdint.h>

// ─── Identidad del collar ─────────────────────────────────────────────────────
// Cada collar físico debe tener un ID numérico único.
// También registrar ese ID (como serial) en la BD via la app → Dispositivos → Registrar.
#define COLLAR_ID   1     // ← cambiar por 1, 2, 3... para cada collar

// ─── Pines GPS (UART2 del ESP32) ─────────────────────────────────────────────
#define GPS_RX_PIN  16
#define GPS_TX_PIN  17

// ─── Pines LoRa (SPI) — ejemplo para TTGO LoRa32 / placa genérica ESP32 ──────
#define LORA_SS     18
#define LORA_RST    14
#define LORA_DIO0   26
#define LORA_BAND   915E6    // 868E6 para Europa / Colombia usa 915 MHz
#define LORA_SYNC_WORD 0xAB  // DEBE coincidir con el gateway

// ─── Pin batería (divisor resistivo) ─────────────────────────────────────────
#define PIN_BATERIA 34

// ─── Intervalo de transmisión ─────────────────────────────────────────────────
#define INTERVALO_MS 20000UL  // 20 segundos

// ─── Estructura del paquete (debe ser IDÉNTICA a telemetry.h del gateway) ─────
enum CollarStatus : uint8_t {
  STATUS_BOOTING       = 0x00,
  STATUS_GPS_SEARCHING = 0x01,
  STATUS_GPS_OK        = 0x02,
  STATUS_GPS_LOST      = 0x03,
  STATUS_LORA_ERROR    = 0x04,
  STATUS_LOW_BATTERY   = 0x05,
  STATUS_MOVING        = 0x06,
  STATUS_STOPPED       = 0x07,
  STATUS_COLLAR_OFF    = 0x08,
};

#define FLAG_GPS_VALID     0x01
#define FLAG_TENSION_OK    0x02
#define FLAG_CONTACTO_PIEL 0x04
#define FLAG_MOVING        0x08
#define FLAG_LOW_BAT       0x10
#define FLAG_FUERA_CERCA   0x20

#pragma pack(push, 1)
struct TelemetryPacket {
  uint16_t collarId;
  int32_t  latE6;
  int32_t  lngE6;
  uint16_t speedCmS;
  uint8_t  battery;
  uint8_t  satellites;
  uint8_t  hdop10;
  uint8_t  status;
  uint8_t  flags;
  uint32_t timestamp;
  uint16_t crc;        // CRC-16/CCITT de los bytes anteriores
};
#pragma pack(pop)

static const size_t PACKET_SIZE = sizeof(TelemetryPacket);

// ─── Globales ─────────────────────────────────────────────────────────────────
HardwareSerial gpsSerial(2);
TinyGPSPlus    gps;
unsigned long  ultimaTransmision = 0;
CollarStatus   estadoActual      = STATUS_BOOTING;

// ─── CRC-16/CCITT ─────────────────────────────────────────────────────────────
uint16_t calcCRC16(const uint8_t* data, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= (uint16_t)data[i] << 8;
    for (int b = 0; b < 8; b++)
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return crc;
}

// ─── Lectura de batería ───────────────────────────────────────────────────────
uint8_t leerBateria() {
  int   raw     = analogRead(PIN_BATERIA);
  float voltaje = (raw / 4095.0f) * 3.3f * 2.0f;  // ajustar según divisor real
  float pct     = (voltaje - 3.3f) / (4.2f - 3.3f) * 100.0f;
  return (uint8_t)constrain(pct, 0, 100);
}

// ─── Transmitir paquete binario ───────────────────────────────────────────────
void transmitir(bool gpsValido) {
  TelemetryPacket pkt = {};

  pkt.collarId  = COLLAR_ID;
  pkt.battery   = leerBateria();
  pkt.timestamp = (uint32_t)(millis() / 1000);

  if (gpsValido) {
    pkt.latE6      = (int32_t)(gps.location.lat() * 1e6);
    pkt.lngE6      = (int32_t)(gps.location.lng() * 1e6);
    pkt.speedCmS   = (uint16_t)(gps.speed.mps() * 100.0f);
    pkt.satellites = (uint8_t)min((int)gps.satellites.value(), 255);
    pkt.hdop10     = (uint8_t)min((int)(gps.hdop.hdop() * 10), 255);
    pkt.status     = (pkt.speedCmS > 50) ? STATUS_MOVING : STATUS_GPS_OK;
    pkt.flags      = FLAG_GPS_VALID | FLAG_TENSION_OK;
  } else {
    pkt.status = (estadoActual == STATUS_BOOTING) ? STATUS_GPS_SEARCHING : STATUS_GPS_LOST;
    pkt.flags  = FLAG_TENSION_OK;
  }

  if (pkt.battery < 20) {
    pkt.flags |= FLAG_LOW_BAT;
    pkt.status = STATUS_LOW_BATTERY;
  }

  // Calcular CRC sobre todos los bytes excepto los últimos 2 (el campo crc mismo)
  pkt.crc = calcCRC16((const uint8_t*)&pkt, PACKET_SIZE - 2);

  LoRa.beginPacket();
  LoRa.write((const uint8_t*)&pkt, PACKET_SIZE);
  LoRa.endPacket();

  Serial.printf("[TX] collarId=%d lat=%.6f lng=%.6f bat=%d%% sats=%d status=%d\n",
    pkt.collarId,
    gpsValido ? gps.location.lat() : 0.0,
    gpsValido ? gps.location.lng() : 0.0,
    pkt.battery,
    pkt.satellites,
    pkt.status);

  estadoActual = (CollarStatus)pkt.status;
}

// ─── Setup ────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  LoRa.setSyncWord(LORA_SYNC_WORD);
  if (!LoRa.begin(LORA_BAND)) {
    Serial.println("[ERROR] LoRa no inicia. Revisar conexiones.");
    while (true) delay(1000);
  }

  Serial.printf("[SmartFence] Collar #%d listo. Esperando GPS...\n", COLLAR_ID);
  Serial.printf("[SmartFence] Tamanio de paquete: %d bytes\n", (int)PACKET_SIZE);
}

// ─── Loop ─────────────────────────────────────────────────────────────────────
void loop() {
  // Alimentar el parser GPS con todos los bytes disponibles
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  unsigned long ahora = millis();
  if (ahora - ultimaTransmision >= INTERVALO_MS) {
    ultimaTransmision = ahora;
    transmitir(gps.location.isValid());
  }
}
