#pragma once
#include <stdint.h>

// ═══════════════════════════════════════════════════
//  SmartFence AI — geofence.h
//  Almacena geocercas por collar y detecta si un
//  punto está fuera del polígono (ray-casting).
//
//  collarId = 0  →  cerca global (aplica a todos
//                   los collares sin cerca propia)
// ═══════════════════════════════════════════════════

#define MAX_FENCE_POINTS  30   // vértices máx por polígono
#define MAX_CERCAS         5   // cercas simultáneas (1 global + 4 individuales)

struct GeoPoint { double lat, lng; };

void geofenceInit();

// Guarda o reemplaza la cerca para collarId (0 = global).
// n debe estar entre 3 y MAX_FENCE_POINTS.
void geofenceSet(uint16_t collarId, const GeoPoint* pts, int n);

// True si hay alguna cerca aplicable al collarId dado.
bool geofenceHasFence(uint16_t collarId);

// True si (lat, lng) está DENTRO de la cerca aplicable al collar.
// Prioridad: cerca específica > cerca global (collarId=0).
// Si no hay cerca configurada devuelve true (asume dentro).
bool geofenceIsInside(uint16_t collarId, double lat, double lng);

// Cuántas cercas hay cargadas actualmente.
int geofenceCount();
