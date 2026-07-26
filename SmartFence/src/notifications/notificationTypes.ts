import { TipoAlerta } from "@/types";

export type TipoNotificacion =
  | "animal_fuera_cerca"
  | "animal_regreso"
  | "bateria_baja"
  | "collar_desconectado"
  | "señal_debil"
  | "movimiento_inusual"
  | "gateway_desconectado"
  | "reporte_diario"
  | "actualizacion_sistema";

export type PrioridadNotificacion = "critica" | "advertencia" | "informacion" | "exito";

export interface DatosNotificacionSmartFence {
  tipo: TipoNotificacion;
  prioridad: PrioridadNotificacion;
  animalNombre?: string;
  animalId?: string;
  potreroNombre?: string;
  collarId?: string;
  porcentajeBateria?: number;
  animalFotoUrl?: string;
  accionPrincipal?: "ver_mapa" | "abrir_animal" | "marcar_atendida";
}

export interface ConfigCanal {
  id: string;
  nombre: string;
  descripcion: string;
  importancia: "max" | "high" | "default" | "low" | "min";
  vibrar: boolean;
  sonido: boolean;
}

export const CANAL_CRITICO: ConfigCanal = {
  id: "sf_critico",
  nombre: "Alertas Críticas",
  descripcion: "Animal fuera de cerca, collar desconectado",
  importancia: "max",
  vibrar: true,
  sonido: true,
};

export const CANAL_ADVERTENCIA: ConfigCanal = {
  id: "sf_advertencia",
  nombre: "Advertencias",
  descripcion: "Batería baja, señal débil, movimiento inusual",
  importancia: "high",
  vibrar: true,
  sonido: true,
};

export const CANAL_INFORMACION: ConfigCanal = {
  id: "sf_informacion",
  nombre: "Información",
  descripcion: "Animal regresó al perímetro, actualizaciones",
  importancia: "default",
  vibrar: false,
  sonido: true,
};

export const CANAL_SISTEMA: ConfigCanal = {
  id: "sf_sistema",
  nombre: "Sistema",
  descripcion: "Reportes diarios y actualizaciones del sistema",
  importancia: "low",
  vibrar: false,
  sonido: false,
};

export const CANALES_NOTIFICACION = [
  CANAL_CRITICO,
  CANAL_ADVERTENCIA,
  CANAL_INFORMACION,
  CANAL_SISTEMA,
];

export function canalParaTipo(tipo: TipoNotificacion): ConfigCanal {
  switch (tipo) {
    case "animal_fuera_cerca":
    case "collar_desconectado":
    case "gateway_desconectado":
      return CANAL_CRITICO;
    case "bateria_baja":
    case "señal_debil":
    case "movimiento_inusual":
      return CANAL_ADVERTENCIA;
    case "animal_regreso":
      return CANAL_INFORMACION;
    case "reporte_diario":
    case "actualizacion_sistema":
      return CANAL_SISTEMA;
    default:
      return CANAL_INFORMACION;
  }
}

export function prioridadParaTipo(tipo: TipoNotificacion): PrioridadNotificacion {
  switch (tipo) {
    case "animal_fuera_cerca":
    case "collar_desconectado":
    case "gateway_desconectado":
      return "critica";
    case "bateria_baja":
    case "señal_debil":
    case "movimiento_inusual":
      return "advertencia";
    case "animal_regreso":
      return "exito";
    case "reporte_diario":
    case "actualizacion_sistema":
      return "informacion";
    default:
      return "informacion";
  }
}

export function colorParaPrioridad(prioridad: PrioridadNotificacion): string {
  switch (prioridad) {
    case "critica":     return "#EF4444";
    case "advertencia": return "#F59E0B";
    case "informacion": return "#3B82F6";
    case "exito":       return "#4CAF50";
    default:            return "#4CAF50";
  }
}

export function iconoParaTipo(tipo: TipoNotificacion): string {
  switch (tipo) {
    case "animal_fuera_cerca":    return "geocerca";
    case "animal_regreso":        return "geocerca";
    case "bateria_baja":          return "bateria";
    case "collar_desconectado":   return "collar";
    case "señal_debil":           return "señal_lora";
    case "movimiento_inusual":    return "alerta";
    case "gateway_desconectado":  return "gateway";
    case "reporte_diario":        return "reporte";
    case "actualizacion_sistema": return "sistema";
    default:                      return "alerta";
  }
}

export function tituloParaTipo(tipo: TipoNotificacion): string {
  switch (tipo) {
    case "animal_fuera_cerca":    return "Animal fuera de la cerca";
    case "animal_regreso":        return "Animal regresó al perímetro";
    case "bateria_baja":          return "Batería baja en collar";
    case "collar_desconectado":   return "Collar desconectado";
    case "señal_debil":           return "Señal LoRa débil";
    case "movimiento_inusual":    return "Movimiento inusual";
    case "gateway_desconectado":  return "Gateway desconectado";
    case "reporte_diario":        return "Reporte diario disponible";
    case "actualizacion_sistema": return "Actualización del sistema";
    default:                      return "Notificación SmartFence AI";
  }
}
