#pragma once
#include <stdint.h>
#include <cstddef>

// ═══════════════════════════════════════════════════
//  SmartFence AI — telemetry.h  (compartido collar/gateway)
//  Exactamente igual al del collar
// ═══════════════════════════════════════════════════

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
  uint16_t crc;
};
#pragma pack(pop)

static const size_t PACKET_SIZE = sizeof(TelemetryPacket);

// Mapa de collares — se actualiza en tiempo real desde el backend via MQTT.
// Topic: smartfence/gateway/collares
// Payload: { "fincaId": "...", "collares": [{"id":1,"serial":"SF-0001","nombre":"Vaca 1"}, ...] }
//
// Ya NO es necesario hardcodear collares aquí.
// El backend publica el mapa actualizado cada vez que se registra/edita/elimina un animal o collar.

#define MAX_COLLAR_MAP  50

struct CollarInfo {
  uint16_t id;
  char     serial[16];
  char     nombre[32];
};

// Tabla dinámica de collares (actualizada por MQTT desde el backend)
static CollarInfo _collarMap[MAX_COLLAR_MAP];
static int        _collarMapN = 0;

inline void collarMapClear() {
  _collarMapN = 0;
}

inline void collarMapSet(uint16_t id, const char* serial, const char* nombre) {
  // Actualizar si ya existe
  for (int i = 0; i < _collarMapN; i++) {
    if (_collarMap[i].id == id) {
      strncpy(_collarMap[i].serial, serial, sizeof(_collarMap[i].serial) - 1);
      strncpy(_collarMap[i].nombre, nombre, sizeof(_collarMap[i].nombre) - 1);
      return;
    }
  }
  // Agregar nuevo
  if (_collarMapN < MAX_COLLAR_MAP) {
    _collarMap[_collarMapN].id = id;
    strncpy(_collarMap[_collarMapN].serial, serial, sizeof(_collarMap[_collarMapN].serial) - 1);
    strncpy(_collarMap[_collarMapN].nombre, nombre, sizeof(_collarMap[_collarMapN].nombre) - 1);
    _collarMapN++;
  }
}

inline const CollarInfo* collarInfo(uint16_t id) {
  for (int i = 0; i < _collarMapN; i++)
    if (_collarMap[i].id == id) return &_collarMap[i];
  return nullptr;
}

inline const char* collarSerial(uint16_t id) {
  const CollarInfo* c = collarInfo(id);
  return c ? c->serial : "DESCONOCIDO";
}

inline const char* collarNombre(uint16_t id) {
  const CollarInfo* c = collarInfo(id);
  return c ? c->nombre : "Collar desconocido";
}
