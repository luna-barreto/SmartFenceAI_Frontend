#pragma once
#include <stdint.h>

// ═══════════════════════════════════════════════════
//  Gateway display — pantalla OLED de estado
// ═══════════════════════════════════════════════════

struct GwDisplayInfo {
  bool     wifiOk;
  bool     mqttOk;
  bool     loraOk;
  uint8_t  collaresVivos;   // cuántos collares reportaron en los últimos 60s
  uint32_t paquetesHoy;
  int      rssiUltimo;
  char     ultimoSerial[12];
  char     ultimoNombre[20];
  float    ultimoLat;
  float    ultimoLng;
  bool     ultimoGpsValido;
};

void gwDisplayInit();
void gwDisplayUpdate(const GwDisplayInfo& info);
void gwDisplayBoot();
