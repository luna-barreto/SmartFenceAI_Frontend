#pragma once
#include <Arduino.h>

uint16_t calcCRC16(const uint8_t* data, size_t len);
void debugPrint(const char* msg);
void debugPrintf(const char* fmt, ...);
void ledBlink(int veces, int ms = 100);
