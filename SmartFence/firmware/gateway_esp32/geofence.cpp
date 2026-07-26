#include "geofence.h"
#include "utils.h"
#include <string.h>

// ─── Almacenamiento interno ────────────────────────────────────────────────────
struct FenceSlot {
  uint16_t collarId;   // 0xFFFF = vacío
  int      n;
  GeoPoint pts[MAX_FENCE_POINTS];
};

static FenceSlot _slots[MAX_CERCAS];

void geofenceInit() {
  for (int i = 0; i < MAX_CERCAS; i++) _slots[i].collarId = 0xFFFF;
}

// ─── Guardar / reemplazar ──────────────────────────────────────────────────────
void geofenceSet(uint16_t collarId, const GeoPoint* pts, int n) {
  if (n < 3 || n > MAX_FENCE_POINTS) {
    debugPrintf("[GEO] puntos invalidos: %d\n", n);
    return;
  }

  // Buscar slot existente para este collar o uno libre
  int target = -1;
  for (int i = 0; i < MAX_CERCAS; i++) {
    if (_slots[i].collarId == collarId) { target = i; break; }
    if (_slots[i].collarId == 0xFFFF && target == -1) target = i;
  }
  if (target == -1) {
    debugPrint("[GEO] sin slots libres — descartando cerca");
    return;
  }

  _slots[target].collarId = collarId;
  _slots[target].n = n;
  memcpy(_slots[target].pts, pts, n * sizeof(GeoPoint));

  const char* label = (collarId == 0) ? "global" : "collar";
  debugPrintf("[GEO] cerca %s id=%d cargada con %d puntos\n", label, collarId, n);
}

// ─── Buscar cerca aplicable ────────────────────────────────────────────────────
static FenceSlot* findFence(uint16_t collarId) {
  FenceSlot* global = nullptr;
  for (int i = 0; i < MAX_CERCAS; i++) {
    if (_slots[i].collarId == collarId) return &_slots[i];   // específica
    if (_slots[i].collarId == 0)        global = &_slots[i]; // global
  }
  return global;
}

bool geofenceHasFence(uint16_t collarId) {
  return findFence(collarId) != nullptr;
}

// ─── Point-in-polygon — ray-casting ───────────────────────────────────────────
bool geofenceIsInside(uint16_t collarId, float lat, float lng) {
  FenceSlot* f = findFence(collarId);
  if (!f) return true;  // sin cerca → no hay fuera-de-cerca

  int  crossings = 0;
  int  n = f->n;
  for (int i = 0, j = n - 1; i < n; j = i++) {
    float xi = f->pts[i].lng, yi = f->pts[i].lat;
    float xj = f->pts[j].lng, yj = f->pts[j].lat;
    bool  cond1 = (yi > lat) != (yj > lat);
    bool  cond2 = (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (cond1 && cond2) crossings++;
  }
  return (crossings % 2) == 1;   // impar = dentro
}

int geofenceCount() {
  int c = 0;
  for (int i = 0; i < MAX_CERCAS; i++)
    if (_slots[i].collarId != 0xFFFF) c++;
  return c;
}
