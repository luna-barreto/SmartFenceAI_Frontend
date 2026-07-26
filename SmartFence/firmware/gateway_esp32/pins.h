#pragma once

// ═══════════════════════════════════════════════════
//  SmartFence AI — Gateway pins.h
//  LilyGo TTGO LoRa32 V1.6 — ESP32 + SX1276
// ═══════════════════════════════════════════════════

// ── LoRa SX1276 ──────────────────────────────────
#define LORA_SCK    5
#define LORA_MISO   19
#define LORA_MOSI   27
#define LORA_CS     18
#define LORA_RST    14
#define LORA_DIO0   26   // IRQ principal (RadioLib: irq)
#define LORA_DIO1   33   // IRQ secundario (RadioLib: gpio)

// ── OLED SSD1306 0.96" ───────────────────────────
#define OLED_SDA    21
#define OLED_SCL    22
#define OLED_RST    -1
#define OLED_ADDR   0x3C
#define OLED_WIDTH  128
#define OLED_HEIGHT 64

// ── LED de estado ─────────────────────────────────
#define LED_PIN     25

// ── Botón ─────────────────────────────────────────
#define BTN_PIN     0
