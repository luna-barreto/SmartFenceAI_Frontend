// Tipos de dominio — alineados con el schema Prisma del backend NestJS.

export type EstadoConexion = "en_linea" | "fuera_de_rango" | "sin_señal";
export type NivelSalud = "Excelente" | "Buena" | "Regular";

// Mapeo de severidad del backend a la UI
export type TipoAlerta = "critica" | "advertencia" | "informativa";

// ── Enums del backend ────────────────────────────────────────────────────────
export type RolUsuario = "ADMINISTRADOR" | "GANADERO" | "VETERINARIO" | "OPERARIO";
export type EstadoAnimal = "ACTIVO" | "VENDIDO" | "FALLECIDO" | "EN_TRATAMIENTO";
export type TipoAlertaBackend =
  | "ANIMAL_SALIO"
  | "ANIMAL_ENTRO"
  | "BATERIA_BAJA"
  | "COLLAR_DESCONECTADO"
  | "COLLAR_RETIRADO"
  | "INTRUSO_DETECTADO"
  | "VELOCIDAD_ANORMAL"
  | "TEMPERATURA_ANORMAL";
export type SeveridadAlerta = "CRITICA" | "MEDIA" | "INFO";
export type EstadoAlerta = "PENDIENTE" | "RECONOCIDA" | "RESUELTA";

// ── Coordenada ───────────────────────────────────────────────────────────────
export interface Coordenada {
  lat: number;
  lng: number;
}

// ── Collar (modelo del backend) ──────────────────────────────────────────────
export interface Collar {
  id: string;
  serial: string;
  fincaId: string;
  animalId?: string | null;
  bateriaPorcentaje?: number | null;
  senalCalidad?: string | null;
  activo: boolean;
  fechaUltimoReporte?: string | null;
  fechaRegistro?: string;
  animal?: { id: string; nombre: string; codigo: string } | null;
  // Campos de UI locales (calculados en el hook)
  bateria?: number;
  señal?: "Excelente" | "Buena" | "Débil";
  protocolo?: "LoRa" | "GSM";
  ultimaConexion?: string;
  estado?: EstadoConexion;
}

// ── Animal ────────────────────────────────────────────────────────────────────
export interface Animal {
  id: string;
  codigo: string;
  nombre: string;
  raza?: string | null;
  estado: EstadoAnimal;
  fincaId: string;
  potreroId?: string | null;
  collar?: Collar | null;
  // Campos calculados por el hook (posición en vivo)
  ubicacion?: Coordenada;
  dentroDeCerca?: boolean;
  peso?: number;
  salud?: NivelSalud;
}

// ── Geocerca ─────────────────────────────────────────────────────────────────
export interface Cerca {
  id: string;
  fincaId: string;
  nombre: string;
  activa: boolean;
  coordenadas: Coordenada[];
  areaHectareas?: number | null;
  fechaCreacion?: string;
  // Campos calculados en UI
  areaHa?: number;
  perimetroKm?: number;
  esPrincipal?: boolean;
  puntos?: Coordenada[]; // alias de coordenadas para compatibilidad de pantallas
}

// ── Alerta ────────────────────────────────────────────────────────────────────
export interface Alerta {
  id: string;
  tipo: TipoAlertaBackend;
  severidad: SeveridadAlerta;
  mensaje: string;
  animalId?: string | null;
  collarId?: string | null;
  estado: EstadoAlerta;
  fecha: string;
  animal?: { id: string; nombre: string; finca?: { id: string; nombre: string } } | null;
  // Campos de UI calculados
  titulo?: string;
  detalle?: string;
  leida?: boolean;
  resuelta?: boolean;
  tipoUI?: TipoAlerta;
}

// ── Finca ─────────────────────────────────────────────────────────────────────
export interface Finca {
  id: string;
  nombre: string;
  propietarioId: string;
}

// ── Usuario ───────────────────────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  correo?: string; // alias para compatibilidad de pantallas existentes
  rol: RolUsuario;
  finca?: string;   // nombre de la primera finca (para UI)
  fincaId?: string; // ID de la primera finca (para queries)
  avatarUrl?: string;
  telefono?: string;
  direccion?: string;
  departamento?: string;
}

// ── Evento WebSocket gps:posicion ─────────────────────────────────────────────
export interface EventoTelemetria {
  collarId: string;
  animalId?: string | null;
  nombreAnimal?: string;
  lat: number;
  lng: number;
  bateria?: number;
  dentroDeCerca?: boolean;
  fecha: string;
}

// ── Respuesta login del backend ───────────────────────────────────────────────
export interface RespuestaLogin {
  tokenAcceso: string;
  usuario: Omit<Usuario, "finca" | "fincaId">;
}
