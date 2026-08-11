#pragma once

// ═══════════════════════════════════════════════════
//  SmartFence AI — Gateway config.h
//  EDITAR SOLO AQUI antes de compilar
// ═══════════════════════════════════════════════════

// ── WiFi (credenciales por defecto) ──────────────
// Si la red no está disponible al arrancar, el gateway
// abre el AP "SmartFence-Setup" para configurar el WiFi
// desde el celular sin recompilar.
#define WIFI_SSID      "Flia_Barreto"
#define WIFI_PASSWORD  "3218981070"

// ── MQTT Broker — HiveMQ Cloud (TLS puerto 8883) ─
#define MQTT_SERVER    "d1a79bfa7e1549f9bf5ce29c92c11952.s1.eu.hivemq.cloud"
#define MQTT_PORT      8883
#define MQTT_USER      "smartfence"
#define MQTT_PASS      "SmartFence2026lm"
#define MQTT_CLIENT_ID "smartfence-gateway-01"

// ── Tópicos MQTT ──────────────────────────────────
#define TOPIC_GPS      "smartfence/gps"
#define TOPIC_BATTERY  "smartfence/battery"
#define TOPIC_EVENTS   "smartfence/events"
#define TOPIC_CONFIG   "smartfence/config"
#define TOPIC_COLLARES "smartfence/gateway/collares"

// ── LoRa SX1276 ───────────────────────────────────
#define LORA_FREQ      915E6    // 915 MHz para América / Colombia
#define LORA_SYNC_WORD 0xAB     // debe coincidir con el collar

// ── Tiempos ───────────────────────────────────────
#define INTERVALO_HEARTBEAT_MS  30000UL
#define MQTT_KEEPALIVE_S        60

// ── Debug serial ──────────────────────────────────
#define DEBUG_BAUD    115200
#define DEBUG_ENABLED 1
