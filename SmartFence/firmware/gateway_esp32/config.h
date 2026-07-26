#pragma once

// ═══════════════════════════════════════════════════
//  SmartFence AI — Gateway config.h
//  ESP32-S3 + SX1262 (RadioLib) → WiFi → MQTT
//  EDITAR SOLO AQUI
// ═══════════════════════════════════════════════════

// ── WiFi ─────────────────────────────────────────
#define WIFI_SSID      "Funcionarios"
#define WIFI_PASSWORD  "SomosSena_2025*++*"

// ── MQTT Broker — HiveMQ Cloud (TLS obligatorio) ─
#define MQTT_SERVER    "d1a79bfa7e1549f9bf5ce29c92c11952.s1.eu.hivemq.cloud"
#define MQTT_PORT      8883              // TLS
#define MQTT_USER      "smartfence"
#define MQTT_PASS      "SmartFence2026lm"
#define MQTT_CLIENT_ID "smartfence-gateway-01"

// ── Tópicos MQTT (deben coincidir con gps.module.ts)
#define TOPIC_GPS      "smartfence/gps"
#define TOPIC_BATTERY  "smartfence/battery"
#define TOPIC_STATUS   "smartfence/status"
#define TOPIC_EVENTS   "smartfence/events"
#define TOPIC_CONFIG    "smartfence/config"           // gateway recibe geocercas del backend
#define TOPIC_COLLARES  "smartfence/gateway/collares" // gateway recibe mapa de collares del backend

// ── LoRa ─────────────────────────────────────────
#define LORA_FREQ      915E6    // 915 para América, 868 para Europa
#define LORA_SF        9
#define LORA_BW        125E3
#define LORA_SYNC_WORD 0xAB     // debe ser igual al collar
#define LORA_CRC       2

// ── Tiempos ───────────────────────────────────────
#define INTERVALO_HEARTBEAT_MS  30000UL  // heartbeat al broker cada 30s
#define TIMEOUT_WIFI_MS         15000UL  // reintentar WiFi cada 15s
#define MQTT_KEEPALIVE_S        60

// ── Debug ─────────────────────────────────────────
#define DEBUG_BAUD     115200
#define DEBUG_ENABLED  1
