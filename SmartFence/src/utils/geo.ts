import { Coordenada } from "@/types";

/**
 * Determina si un punto está dentro de un polígono (cerca virtual)
 * usando el algoritmo de ray casting. Se usa tanto en el cliente
 * (para overlays offline) como referencia del cálculo que hará
 * PostGIS en el backend (ST_Contains) en producción.
 */
export function puntoDentroPoligono(punto: Coordenada, poligono: Coordenada[]): boolean {
  let dentro = false;
  const { lat: y, lng: x } = punto;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const xi = poligono[i].lng, yi = poligono[i].lat;
    const xj = poligono[j].lng, yj = poligono[j].lat;
    const interseccion =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (interseccion) dentro = !dentro;
  }
  return dentro;
}

/** Distancia aproximada en metros entre dos coordenadas (fórmula de Haversine). */
export function distanciaMetros(a: Coordenada, b: Coordenada): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Centro aproximado de un conjunto de coordenadas, útil para centrar el mapa. */
export function centroDe(puntos: Coordenada[]): Coordenada {
  const lat = puntos.reduce((s, p) => s + p.lat, 0) / puntos.length;
  const lng = puntos.reduce((s, p) => s + p.lng, 0) / puntos.length;
  return { lat, lng };
}

/**
 * Genera un polígono rectangular centrado en un punto GPS.
 * radioMetros define la mitad del lado (p.ej. 150 → cuadrado de ~300 m × 300 m).
 * Usado para crear una geocerca inicial alrededor de la ubicación del usuario.
 */
export function generarPoligonoCentrado(centro: Coordenada, radioMetros = 150): Coordenada[] {
  const latOff = radioMetros / 111320;
  const lngOff = radioMetros / (111320 * Math.cos((centro.lat * Math.PI) / 180));
  return [
    { lat: centro.lat + latOff, lng: centro.lng - lngOff }, // NO
    { lat: centro.lat + latOff, lng: centro.lng + lngOff }, // NE
    { lat: centro.lat - latOff, lng: centro.lng + lngOff }, // SE
    { lat: centro.lat - latOff, lng: centro.lng - lngOff }, // SO
  ];
}

/**
 * Traslada todos los vértices de un polígono moviendo su centro de oldCenter a
 * newCenter. Conserva exactamente la forma, el tamaño y el ángulo — solo cambian
 * las coordenadas en la misma cantidad (delta lat/lng).
 */
export function translatePolygon(
  polygon: Coordenada[],
  oldCenter: Coordenada,
  newCenter: Coordenada,
): Coordenada[] {
  const dLat = newCenter.lat - oldCenter.lat;
  const dLng = newCenter.lng - oldCenter.lng;
  return polygon.map(p => ({ lat: p.lat + dLat, lng: p.lng + dLng }));
}
