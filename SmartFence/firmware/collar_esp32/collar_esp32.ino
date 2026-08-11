/*
  SmartFence AI — Firmware del collar
  ─────────────────────────────────────────────────────────────────────────────
  Hardware : ESP32 + GPS NEO-6M (UART2) + LoRa SX1276 (SPI) + Buzzer GPIO4
  Rol      : Transmite posición GPS por LoRa cada 7 s.
             Escucha comandos del gateway (BUZZER_ON / BUZZER_OFF).
             BUZZER_ON  → alarma cíclica: beep de 1 s cada 8 s hasta recibir OFF.
             BUZZER_OFF → se envía desde el backend cuando la vaca vuelve al cercado.

  Librerías:
    - TinyGPSPlus  (Mikal Hart)
    - LoRa         (sandeepmistry/arduino-LoRa)
*/

#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <SPI.h>
#include <LoRa.h>
#include <stdint.h>

// ─── Configuración ────────────────────────────────────────────────────────────
#define COLLAR_ID      1        // ← cambiar por 1, 2, 3… para cada collar físico
#define GPS_RX_PIN     34       // TX del GPS → GPIO34 (solo entrada)
#define GPS_TX_PIN     13       // RX del GPS → GPIO13
#define LORA_SS        18
#define LORA_RST       14
#define LORA_DIO0      26
#define LORA_BAND      915E6
#define LORA_SYNC_WORD 0xAB
#define PIN_BATERIA    35       // ADC — no usar 34 (ya es GPS RX)
#define PIN_BUZZER     4
#define INTERVALO_MS   7000UL

// ─── Protocolo telemetría ─────────────────────────────────────────────────────
enum CollarStatus : uint8_t {
  STATUS_BOOTING       = 0x00,
  STATUS_GPS_SEARCHING = 0x01,
  STATUS_GPS_OK        = 0x02,
  STATUS_GPS_LOST      = 0x03,
  STATUS_LOW_BATTERY   = 0x04,
  STATUS_COLLAR_OFF    = 0x05,
};

#define FLAG_GPS_VALID 0x01
#define FLAG_MOVING    0x02
#define FLAG_LOW_BAT   0x04

#pragma pack(push, 1)
struct TelemetryPacket {
  uint16_t collarId;
  int32_t  latE6;
  int32_t  lngE6;
  uint8_t  battery;
  uint8_t  status;
  uint8_t  flags;
  uint16_t crc;
};
#pragma pack(pop)

static const size_t PACKET_SIZE = sizeof(TelemetryPacket);  // 15 bytes

// ─── Protocolo comandos (recibidos desde el gateway) ─────────────────────────
#define CMD_PKT_MAGIC   0xCD
#define CMD_BUZZER_ON   0x01
#define CMD_BUZZER_OFF  0x02

#pragma pack(push, 1)
struct CommandPacket {
  uint8_t  magic;
  uint16_t collarId;    // 0 = todos los collares
  uint8_t  cmd;
  uint32_t duracionMs;
  uint16_t crc;
};
#pragma pack(pop)

static const size_t CMD_PACKET_SIZE = sizeof(CommandPacket);  // 10 bytes

// ─── Globales ─────────────────────────────────────────────────────────────────
HardwareSerial gpsSerial(2);
TinyGPSPlus    gps;
unsigned long  ultimaTransmision = 0;
CollarStatus   estadoActual      = STATUS_BOOTING;

// Buzzer activo — ciclo de 8 s: 1 s ON, 7 s OFF, repite hasta CMD_BUZZER_OFF
#define BUZZER_BEEP_MS   1000UL   // duración del pitido
#define BUZZER_CICLO_MS  8000UL   // período total del ciclo

static bool          _buzzerAlarma  = false;  // alarma cíclica activa
static unsigned long _buzzerCicloIni = 0;     // inicio del ciclo actual

// ─── CRC-16/CCITT ─────────────────────────────────────────────────────────────
static uint16_t calcCRC16(const uint8_t* data, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= (uint16_t)data[i] << 8;
    for (int b = 0; b < 8; b++)
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return crc;
}

// ─── Batería ──────────────────────────────────────────────────────────────────
static uint8_t leerBateria() {
  int   raw     = analogRead(PIN_BATERIA);
  float voltaje = (raw / 4095.0f) * 3.3f * 2.0f;
  float pct     = (voltaje - 3.3f) / (4.2f - 3.3f) * 100.0f;
  return (uint8_t)constrain(pct, 0, 100);
}

// ─── Buzzer ───────────────────────────────────────────────────────────────────
// Inicia la alarma cíclica: beep de 1 s cada 8 s. duracionMs se ignora;
// el ciclo continúa hasta que el backend envíe CMD_BUZZER_OFF.
static void buzzerOn(uint32_t /*duracionMs*/) {
  _buzzerAlarma   = true;
  _buzzerCicloIni = millis();
  digitalWrite(PIN_BUZZER, HIGH);   // primer beep inmediato
  Serial.println("[BUZZER] ALARMA iniciada — ciclo 8 s");
}

static void buzzerOff() {
  _buzzerAlarma = false;
  digitalWrite(PIN_BUZZER, LOW);
  Serial.println("[BUZZER] ALARMA detenida por backend");
}

// Llamar desde loop(): gestiona el ciclo ON/OFF del buzzer activo
static void tickBuzzer() {
  if (!_buzzerAlarma) return;

  unsigned long fase = (millis() - _buzzerCicloIni) % BUZZER_CICLO_MS;
  // Dentro del beep → HIGH; fuera del beep → LOW
  digitalWrite(PIN_BUZZER, fase < BUZZER_BEEP_MS ? HIGH : LOW);
}

// ─── Procesar comando recibido por LoRa ──────────────────────────────────────
static void procesarComando(int pktLen) {
  if (pktLen < (int)CMD_PACKET_SIZE) return;

  uint8_t buf[CMD_PACKET_SIZE];
  LoRa.readBytes(buf, CMD_PACKET_SIZE);

  CommandPacket cmd;
  memcpy(&cmd, buf, CMD_PACKET_SIZE);

  // Verificar magic y CRC
  if (cmd.magic != CMD_PKT_MAGIC) return;
  uint16_t crcCalc = calcCRC16(buf, CMD_PACKET_SIZE - 2);
  if (crcCalc != cmd.crc) {
    Serial.println("[CMD] CRC invalido");
    return;
  }

  // Verificar que es para este collar o broadcast (collarId=0)
  if (cmd.collarId != 0 && cmd.collarId != COLLAR_ID) return;

  Serial.printf("[CMD] recibido cmd=%d dur=%lu ms\n", cmd.cmd, cmd.duracionMs);

  if (cmd.cmd == CMD_BUZZER_ON)  buzzerOn(cmd.duracionMs);
  if (cmd.cmd == CMD_BUZZER_OFF) buzzerOff();
}

// ─── Transmitir telemetría ────────────────────────────────────────────────────
static void transmitir(bool gpsValido) {
  TelemetryPacket pkt = {};
  pkt.collarId = COLLAR_ID;
  pkt.battery  = leerBateria();

  if (gpsValido) {
    pkt.latE6  = (int32_t)(gps.location.lat() * 1e6);
    pkt.lngE6  = (int32_t)(gps.location.lng() * 1e6);
    pkt.status = STATUS_GPS_OK;
    pkt.flags  = FLAG_GPS_VALID;
    if ((uint16_t)(gps.speed.mps() * 100.0f) > 83)
      pkt.flags |= FLAG_MOVING;
    gps.location.isUpdated();
  } else {
    pkt.status = (estadoActual == STATUS_BOOTING) ? STATUS_GPS_SEARCHING : STATUS_GPS_LOST;
    pkt.flags  = 0;
  }

  if (pkt.battery < 20) {
    pkt.flags  |= FLAG_LOW_BAT;
    pkt.status  = STATUS_LOW_BATTERY;
  }

  pkt.crc = calcCRC16((const uint8_t*)&pkt, PACKET_SIZE - 2);

  LoRa.beginPacket();
  LoRa.write((const uint8_t*)&pkt, PACKET_SIZE);
  LoRa.endPacket();  // no bloqueante: false para no detener el loop

  Serial.printf("[TX] id=%d lat=%.6f lng=%.6f bat=%d%% gps=%s\n",
    pkt.collarId,
    gpsValido ? gps.location.lat() : 0.0,
    gpsValido ? gps.location.lng() : 0.0,
    pkt.battery,
    gpsValido ? "OK" : "SIN FIX");

  estadoActual = (CollarStatus)pkt.status;
}

// ─── Setup ────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_BAND)) {
    Serial.println("[ERROR] LoRa no inicia");
    while (true) delay(1000);
  }
  LoRa.setSpreadingFactor(9);
  LoRa.setSyncWord(LORA_SYNC_WORD);
  LoRa.enableCrc();

  Serial.printf("[SmartFence] Collar #%d listo — %d bytes — %lu ms\n",
    COLLAR_ID, (int)PACKET_SIZE, INTERVALO_MS);
}

// ─── Loop ─────────────────────────────────────────────────────────────────────
void loop() {
  // Leer GPS
  while (gpsSerial.available() > 0)
    gps.encode(gpsSerial.read());

  // Ciclo ON/OFF del buzzer activo
  tickBuzzer();

  // Escuchar comandos LoRa entrantes
  int pktLen = LoRa.parsePacket();
  if (pktLen > 0) {
    uint8_t magic = LoRa.peek();
    if (magic == CMD_PKT_MAGIC) {
      procesarComando(pktLen);
    } else {
      // Descartar paquete que no es un comando (ej: telemetría de otro collar)
      while (LoRa.available()) LoRa.read();
    }
  }

  // Transmitir telemetría cada 7 s
  unsigned long ahora = millis();
  if (ahora - ultimaTransmision >= INTERVALO_MS) {
    ultimaTransmision = ahora;
    bool gpsValido = gps.location.isValid() && gps.location.age() < 15000UL;
    transmitir(gpsValido);
  }
}
