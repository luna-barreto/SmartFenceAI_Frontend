#include "gw_display.h"
#include "config.h"
#include "pins.h"
#include "utils.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

static Adafruit_SSD1306 _oled(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RST);
static bool _ok = false;

// ─── Foco de estado ───────────────────────────────────────────────────────────
static void foco(int cx, int cy, int r, bool ok, const char* label) {
  if (ok) _oled.fillCircle(cx, cy, r, SSD1306_WHITE);
  else {
    _oled.drawCircle(cx, cy, r, SSD1306_WHITE);
    _oled.drawLine(cx-r+2, cy-r+2, cx+r-2, cy+r-2, SSD1306_WHITE);
    _oled.drawLine(cx+r-2, cy-r+2, cx-r+2, cy+r-2, SSD1306_WHITE);
  }
  _oled.setTextSize(1);
  _oled.setCursor(cx + r + 2, cy - 3);
  _oled.print(label);
}

void gwDisplayInit() {
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!_oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    debugPrint("[OLED] no encontrado");
    return;
  }
  _ok = true;
  gwDisplayBoot();
}

void gwDisplayBoot() {
  if (!_ok) return;
  _oled.clearDisplay();
  _oled.setTextColor(SSD1306_WHITE);
  _oled.setTextSize(1);
  _oled.setCursor(10, 16); _oled.println("SmartFence Gateway");
  _oled.setCursor(28, 32); _oled.println("Iniciando...");
  _oled.display();
}

// ════════════════════════════════════════════════════════════════════
//  Layout 128×64
//
//  ┌────────────────────────────────┐
//  │ ●WiFi ●MQTT ●LoRa  Col:3       │  fila 0
//  ├────────────────────────────────┤
//  │ Vaca 1  (SF-0001)              │  fila 14
//  │ Lat: -4.00123                  │  fila 24
//  │ Lng:-79.20456                  │  fila 34
//  ├────────────────────────────────┤
//  │ RSSI:-87dBm  Pkts:1024         │  fila 46
//  └────────────────────────────────┘
// ════════════════════════════════════════════════════════════════════
void gwDisplayUpdate(const GwDisplayInfo& d) {
  if (!_ok) return;
  _oled.clearDisplay();
  _oled.setTextColor(SSD1306_WHITE);
  _oled.setTextSize(1);

  // ── Modo portal WiFi — pantalla especial ──────────────────────────
  if (d.modoPortal) {
    _oled.setCursor(14, 0);  _oled.print("CONFIG WiFi");
    _oled.drawFastHLine(0, 10, 128, SSD1306_WHITE);
    _oled.setCursor(0, 14);  _oled.print("Conectate al WiFi:");
    _oled.setCursor(0, 24);  _oled.print("SmartFence-Setup");
    _oled.setCursor(0, 36);  _oled.print("Abre el navegador");
    _oled.setCursor(0, 46);  _oled.print("http://192.168.4.1");
    _oled.display();
    return;
  }

  // ── Fila 0: focos + total collares ────────────────────────────────
  foco(5,  5, 3, d.wifiOk, "W");
  foco(25, 5, 3, d.mqttOk, "M");
  foco(45, 5, 3, d.loraOk, "L");
  _oled.setCursor(72, 1);
  _oled.printf("Col:%d", d.collaresVivos);

  _oled.drawFastHLine(0, 12, 128, SSD1306_WHITE);

  // ── Filas 14-44: último collar recibido ───────────────────────────
  if (d.ultimoNombre[0] != '\0') {
    _oled.setCursor(0, 14);
    char linea[28];
    snprintf(linea, sizeof(linea), "%s (%s)", d.ultimoNombre, d.ultimoSerial);
    _oled.print(linea);

    if (d.ultimoGpsValido) {
      _oled.setCursor(0, 24);
      _oled.printf("Lat: %.5f", d.ultimoLat);
      _oled.setCursor(0, 34);
      _oled.printf("Lng: %.5f", d.ultimoLng);
    } else {
      _oled.setCursor(0, 29);
      _oled.print("Sin fix GPS");
    }
  } else {
    _oled.setCursor(0, 24);
    _oled.print("Esperando collar...");
  }

  _oled.drawFastHLine(0, 44, 128, SSD1306_WHITE);

  // ── Fila 46: RSSI + paquetes ──────────────────────────────────────
  _oled.setCursor(0, 47);
  _oled.printf("RSSI:%ddBm Pkts:%lu", d.rssiUltimo, d.paquetesHoy);

  _oled.display();
}
