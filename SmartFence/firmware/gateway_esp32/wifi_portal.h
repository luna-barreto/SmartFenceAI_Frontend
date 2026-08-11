#pragma once
#include <stddef.h>

bool wifiPortalLoad(char* ssid, size_t ssidLen, char* pass, size_t passLen);

// Abre red AP "SmartFence-Setup" y sirve página web para configurar WiFi.
// Guarda credenciales en NVS y reinicia el ESP32.
// Solo llamar desde setup() cuando WiFi.begin() falla.
void wifiPortalRun();
