/**
 * Demo data for the web view. This module is the single source of truth for all
 * simulated scenarios: animal health (color sensor), fence wire cut, animal loose,
 * intruder detection, and real-time alerts. Nothing here touches the backend.
 */

// ─── Coordenadas — finca de referencia ───────────────────────────────────────
export const CERCA_DEMO = [
  { lat: 10.8779, lng: -74.9121 },
  { lat: 10.8798, lng: -74.9073 },
  { lat: 10.8784, lng: -74.9035 },
  { lat: 10.8752, lng: -74.9024 },
  { lat: 10.8723, lng: -74.9044 },
  { lat: 10.8718, lng: -74.9088 },
  { lat: 10.8737, lng: -74.9126 },
];

export const CENTRO_DEMO = { lat: 10.875244, lng: -74.908449 };

// ─── Salud por sensor de calor ─────────────────────────────────────────────
// El sensor de calor del collar detecta el color de la mucosa: verde = sano,
// amarillo = atención, rojo = enfermo / anémico.
export type SaludSensor = "verde" | "amarillo" | "rojo";

export interface SaludDetalle {
  sensor: SaludSensor;
  label: string;
  descripcion: string;
  r: number; // valor RGB detectado
  g: number;
  b: number;
}

const SALUD_VERDE: SaludDetalle = {
  sensor: "verde", label: "Excelente",
  descripcion: "Mucosa rosada normal. Sin signos de anemia.",
  r: 180, g: 220, b: 170,
};
const SALUD_AMARILLO: SaludDetalle = {
  sensor: "amarillo", label: "Atención",
  descripcion: "Mucosa ligeramente pálida. Requiere revisión veterinaria.",
  r: 230, g: 200, b: 110,
};
const SALUD_ROJO: SaludDetalle = {
  sensor: "rojo", label: "Crítico",
  descripcion: "Mucosa muy pálida / cianótica. Posible anemia grave o estrés térmico.",
  r: 220, g: 100, b: 95,
};

// ─── Tipos demo ────────────────────────────────────────────────────────────────
export type EstadoCerca = "dentro" | "fuera" | "sin_collar";
export type EstadoCollar = "en_linea" | "bateria_baja" | "cortado" | "retirado" | "sin_señal";
export type AlertaTipo = "critica" | "advertencia" | "informativa" | "intruso";

export interface AnimalDemo {
  id: string;
  nombre: string;
  displayNombre: string;
  identificacion: string;
  categoria: "Vaca" | "Toro" | "Ternero";
  raza: string;
  edad: string;
  genero: "♀" | "♂";
  potrero: string;
  estado: EstadoCerca;
  estadoCollar: EstadoCollar;
  salud: SaludDetalle;
  bateria: number;
  señal: "Excelente" | "Buena" | "Débil";
  collarId: string;
  ubicacion: { lat: number; lng: number };
  dentroDeCerca: boolean;
  ultimaVez: string;
  peso: number;
}

export interface AlertaDemo {
  id: string;
  tipo: AlertaTipo;
  titulo: string;
  sub: string;
  desc: string;
  fecha: string;
  leida: boolean;
  resuelta: boolean;
  // Extra fields for special scenarios
  scenarioTag?: "intruso" | "corte_correo" | "animal_suelto" | "bateria_critica" | "sensor_color";
}

// ─── Animales demo (16 animales) ──────────────────────────────────────────────
const BASE_LAT = 10.875244;
const BASE_LNG = -74.908449;

function coord(dLat: number, dLng: number) {
  return { lat: BASE_LAT + dLat, lng: BASE_LNG + dLng };
}

export const ANIMALES_DEMO: AnimalDemo[] = [
  {
    id: "d-01", nombre: "Lucero", displayNombre: "Vaca 01", identificacion: "VAC-101",
    categoria: "Vaca", raza: "Holstein", edad: "3.5 años", genero: "♀", potrero: "Potrero Norte",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 87, señal: "Excelente", collarId: "COL-1001",
    ubicacion: coord(0.0012, 0.0009), dentroDeCerca: true, ultimaVez: "Hace 1 min", peso: 520,
  },
  {
    id: "d-02", nombre: "Canela", displayNombre: "Vaca 02", identificacion: "VAC-102",
    categoria: "Vaca", raza: "Pardo Suizo", edad: "2.5 años", genero: "♀", potrero: "Potrero Norte",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 75, señal: "Buena", collarId: "COL-1002",
    ubicacion: coord(0.0018, -0.0004), dentroDeCerca: true, ultimaVez: "Hace 3 min", peso: 480,
  },
  {
    id: "d-03", nombre: "Estrella", displayNombre: "Vaca 03", identificacion: "VAC-103",
    categoria: "Vaca", raza: "Cebú", edad: "4 años", genero: "♀", potrero: "Potrero Sur",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_AMARILLO,
    bateria: 62, señal: "Buena", collarId: "COL-1003",
    ubicacion: coord(-0.0009, 0.0015), dentroDeCerca: true, ultimaVez: "Hace 2 min", peso: 510,
  },
  {
    id: "d-04", nombre: "Manchas", displayNombre: "Vaca 04", identificacion: "VAC-104",
    categoria: "Vaca", raza: "Holstein", edad: "1.8 años", genero: "♀", potrero: "Potrero Sur",
    estado: "dentro", estadoCollar: "bateria_baja", salud: SALUD_AMARILLO,
    bateria: 14, señal: "Débil", collarId: "COL-1004",
    ubicacion: coord(-0.0015, -0.0011), dentroDeCerca: true, ultimaVez: "Hace 8 min", peso: 390,
  },
  {
    id: "d-05", nombre: "Trueno", displayNombre: "Toro 05", identificacion: "TOR-105",
    categoria: "Toro", raza: "Brahman", edad: "5 años", genero: "♂", potrero: "Potrero Norte",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 91, señal: "Excelente", collarId: "COL-1005",
    ubicacion: coord(0.002, 0.0005), dentroDeCerca: true, ultimaVez: "Hace 1 min", peso: 750,
  },
  {
    id: "d-06", nombre: "Paloma", displayNombre: "Vaca 06", identificacion: "VAC-106",
    categoria: "Vaca", raza: "Angus", edad: "2.2 años", genero: "♀", potrero: "Potrero Este",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 78, señal: "Buena", collarId: "COL-1006",
    ubicacion: coord(0.0005, 0.002), dentroDeCerca: true, ultimaVez: "Hace 4 min", peso: 460,
  },
  {
    id: "d-07", nombre: "Rocío", displayNombre: "Vaca 07", identificacion: "VAC-107",
    categoria: "Vaca", raza: "Gyr", edad: "3 años", genero: "♀", potrero: "Potrero Este",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 83, señal: "Excelente", collarId: "COL-1007",
    ubicacion: coord(-0.0003, 0.0018), dentroDeCerca: true, ultimaVez: "Hace 2 min", peso: 495,
  },
  {
    id: "d-08", nombre: "Pinta", displayNombre: "Vaca 08", identificacion: "VAC-108",
    categoria: "Vaca", raza: "Holstein", edad: "1.5 años", genero: "♀", potrero: "Potrero Oeste",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 69, señal: "Buena", collarId: "COL-1008",
    ubicacion: coord(0.0007, -0.002), dentroDeCerca: true, ultimaVez: "Hace 5 min", peso: 380,
  },
  {
    id: "d-09", nombre: "Sultán", displayNombre: "Toro 09", identificacion: "TOR-109",
    categoria: "Toro", raza: "Cebú", edad: "6 años", genero: "♂", potrero: "Potrero Oeste",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 95, señal: "Excelente", collarId: "COL-1009",
    ubicacion: coord(-0.0005, -0.0017), dentroDeCerca: true, ultimaVez: "Hace 1 min", peso: 820,
  },
  {
    id: "d-10", nombre: "Girasol", displayNombre: "Vaca 10", identificacion: "VAC-110",
    categoria: "Vaca", raza: "Pardo Suizo", edad: "2.8 años", genero: "♀", potrero: "Potrero Sur",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 72, señal: "Buena", collarId: "COL-1010",
    ubicacion: coord(-0.0011, 0.0007), dentroDeCerca: true, ultimaVez: "Hace 6 min", peso: 470,
  },
  {
    id: "d-11", nombre: "Nieve", displayNombre: "Vaca 11", identificacion: "VAC-111",
    categoria: "Vaca", raza: "Holstein", edad: "3.2 años", genero: "♀", potrero: "Potrero Norte",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_AMARILLO,
    bateria: 55, señal: "Buena", collarId: "COL-1011",
    ubicacion: coord(0.0015, -0.0012), dentroDeCerca: true, ultimaVez: "Hace 7 min", peso: 505,
  },
  {
    id: "d-12", nombre: "Luna", displayNombre: "Vaca 12", identificacion: "VAC-112",
    categoria: "Vaca", raza: "Brahman", edad: "4.5 años", genero: "♀", potrero: "Potrero Sur",
    // ⚠️ ANIMAL FUERA DE LA CERCA — escenario "animal suelto" (animación la saca y la regresa)
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_AMARILLO,
    bateria: 66, señal: "Buena", collarId: "COL-1012",
    ubicacion: coord(-0.0024, 0.0019), dentroDeCerca: true, ultimaVez: "Hace 2 min", peso: 490,
  },
  {
    id: "d-13", nombre: "Aurora", displayNombre: "Vaca 13", identificacion: "VAC-113",
    categoria: "Vaca", raza: "Angus", edad: "2 años", genero: "♀", potrero: "Potrero Este",
    // 🔴 SALUD CRÍTICA — sensor de calor detectó mucosa pálida
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_ROJO,
    bateria: 58, señal: "Buena", collarId: "COL-1013",
    ubicacion: coord(0.001, 0.0016), dentroDeCerca: true, ultimaVez: "Hace 3 min", peso: 420,
  },
  {
    id: "d-14", nombre: "Reina", displayNombre: "Vaca 14", identificacion: "VAC-114",
    categoria: "Vaca", raza: "Gyr", edad: "5 años", genero: "♀", potrero: "Potrero Oeste",
    // 🔴 COLLAR CORTADO — escenario "corte de correo" (animación la saca periódicamente)
    estado: "dentro", estadoCollar: "cortado", salud: SALUD_AMARILLO,
    bateria: 0, señal: "Débil", collarId: "COL-1014",
    ubicacion: coord(0.0027, -0.0033), dentroDeCerca: true, ultimaVez: "Hace 18 min", peso: 535,
  },
  {
    id: "d-15", nombre: "Perla", displayNombre: "Ternero 15", identificacion: "TER-115",
    categoria: "Ternero", raza: "Holstein", edad: "6 meses", genero: "♀", potrero: "Potrero Norte",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 88, señal: "Excelente", collarId: "COL-1015",
    ubicacion: coord(0.0022, 0.0013), dentroDeCerca: true, ultimaVez: "Hace 1 min", peso: 120,
  },
  {
    id: "d-16", nombre: "Tornado", displayNombre: "Toro 16", identificacion: "TOR-116",
    categoria: "Toro", raza: "Brahman", edad: "4 años", genero: "♂", potrero: "Potrero Sur",
    estado: "dentro", estadoCollar: "en_linea", salud: SALUD_VERDE,
    bateria: 80, señal: "Buena", collarId: "COL-1016",
    ubicacion: coord(-0.0007, 0.001), dentroDeCerca: true, ultimaVez: "Hace 2 min", peso: 680,
  },
];

// ─── Alertas demo ──────────────────────────────────────────────────────────────
function msAgo(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

export const ALERTAS_DEMO: AlertaDemo[] = [
  // ── INTRUSOR DETECTADO ─────────────────────────────────────────────────────
  {
    id: "a-01", tipo: "intruso",
    titulo: "Intruso detectado en el perímetro",
    sub: "Sector Noreste • Gateway GW-02",
    desc: "Movimiento no identificado detectado a 40 m del límite virtual. Sin collar activo en la zona.",
    fecha: msAgo(1000 * 60 * 3), leida: false, resuelta: false,
    scenarioTag: "intruso",
  },
  // ── ANIMAL SUELTO (FUERA DE LA CERCA) ─────────────────────────────────────
  {
    id: "a-02", tipo: "critica",
    titulo: "Vaca 12 salió de la cerca virtual",
    sub: "Luna • VAC-112 • Potrero Sur",
    desc: "Vaca 12 cruzó el perímetro sur hace 2 minutos. Última posición: 10.8747° N, -74.8783° W.",
    fecha: msAgo(1000 * 60 * 2), leida: false, resuelta: false,
    scenarioTag: "animal_suelto",
  },
  // ── CORTE DE CORREO / COLLAR ───────────────────────────────────────────────
  {
    id: "a-03", tipo: "critica",
    titulo: "Collar COL-1014 retirado o cortado",
    sub: "Reina (VAC-114) • Potrero Oeste",
    desc: "El collar dejó de transmitir señal. Posible remoción forzada o corte de la correa. Verificar animal.",
    fecha: msAgo(1000 * 60 * 18), leida: false, resuelta: false,
    scenarioTag: "corte_correo",
  },
  // ── SENSOR DE COLOR — SALUD CRÍTICA ───────────────────────────────────────
  {
    id: "a-04", tipo: "critica",
    titulo: "Vaca 13 enferma — anemia detectada",
    sub: "Aurora • VAC-113 • Collar COL-1013",
    desc: "Sensor de color detectó mucosa muy pálida (R:220 G:100 B:95). Índice de salud: CRÍTICO. Requiere atención veterinaria inmediata.",
    fecha: msAgo(1000 * 60 * 12), leida: false, resuelta: false,
    scenarioTag: "sensor_color",
  },
  // ── BATERÍA CRÍTICA ────────────────────────────────────────────────────────
  {
    id: "a-05", tipo: "advertencia",
    titulo: "Batería crítica del collar",
    sub: "Manchas (VAC-104) • Collar COL-1004",
    desc: "La batería del collar está al 14%. El dispositivo puede perder conectividad en pocas horas.",
    fecha: msAgo(1000 * 60 * 25), leida: false, resuelta: false,
    scenarioTag: "bateria_critica",
  },
  // ── SENSOR COLOR — ATENCIÓN ────────────────────────────────────────────────
  {
    id: "a-06", tipo: "advertencia",
    titulo: "Vaca 03 — mucosa pálida (sensor de color)",
    sub: "Estrella • VAC-103 • Collar COL-1003",
    desc: "Sensor de color detectó leve palidez en mucosa (R:230 G:200 B:110). Seguimiento veterinario recomendado.",
    fecha: msAgo(1000 * 60 * 40), leida: false, resuelta: false,
    scenarioTag: "sensor_color",
  },
  // ── SEÑAL DÉBIL ────────────────────────────────────────────────────────────
  {
    id: "a-07", tipo: "advertencia",
    titulo: "Señal LoRa débil",
    sub: "Gateway GW-01 • Potrero Norte",
    desc: "La señal LoRa está por debajo del nivel óptimo. Posible obstrucción física o interferencia.",
    fecha: msAgo(1000 * 60 * 55), leida: true, resuelta: false,
  },
  // ── ANIMAL REGRESÓ ─────────────────────────────────────────────────────────
  {
    id: "a-08", tipo: "informativa",
    titulo: "Animal regresó al perímetro",
    sub: "Paloma (VAC-106) • Potrero Este",
    desc: "El animal ingresó nuevamente al área segura tras 8 minutos fuera.",
    fecha: msAgo(1000 * 60 * 70), leida: true, resuelta: true,
  },
  // ── SINCRONIZACIÓN ─────────────────────────────────────────────────────────
  {
    id: "a-09", tipo: "informativa",
    titulo: "Sincronización completada",
    sub: "Todos los dispositivos • 16 collares",
    desc: "Telemetría actualizada correctamente para todos los collares activos.",
    fecha: msAgo(1000 * 60 * 90), leida: true, resuelta: true,
  },
  // ── SENSOR COLOR — NIEVE ATENCIÓN ─────────────────────────────────────────
  {
    id: "a-10", tipo: "advertencia",
    titulo: "Vaca 11 — atención, variación en mucosa",
    sub: "Nieve • VAC-111 • Collar COL-1011",
    desc: "Sensor de color indica leve variación en tonalidad de mucosa. Monitorear en próximas 24 h.",
    fecha: msAgo(1000 * 60 * 110), leida: false, resuelta: false,
    scenarioTag: "sensor_color",
  },
];

// ─── Estadísticas rápidas ──────────────────────────────────────────────────────
export const STATS_DEMO = {
  totalAnimales: ANIMALES_DEMO.length,
  dentroCount: ANIMALES_DEMO.filter((a) => a.dentroDeCerca).length,
  fueraCount: ANIMALES_DEMO.filter((a) => !a.dentroDeCerca).length,
  atencionCount: ANIMALES_DEMO.filter((a) => a.salud.sensor !== "verde").length,
  bateriaProm: Math.round(
    ANIMALES_DEMO.reduce((s, a) => s + a.bateria, 0) / ANIMALES_DEMO.length
  ),
  alertasCriticas: ALERTAS_DEMO.filter((a) => a.tipo === "critica" && !a.resuelta).length,
  alertasAdvertencia: ALERTAS_DEMO.filter((a) => a.tipo === "advertencia" && !a.resuelta).length,
  alertasInformativas: ALERTAS_DEMO.filter((a) => a.tipo === "informativa").length,
  alertasIntruso: ALERTAS_DEMO.filter((a) => a.tipo === "intruso" && !a.resuelta).length,
  resueltas: ALERTAS_DEMO.filter((a) => a.resuelta).length,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function tiempoRelativo(fecha: string): string {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

export function tiempoRelativoCorto(fecha: string): string {
  const diff = (Date.now() - new Date(fecha).getTime()) / 1000;
  if (diff < 60) return "Ahora";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}
