import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  inicializarNotificaciones,
  limpiarBadge,
  limpiarListeners,
  notificarAnimalFueraDeCerca,
  notificarAnimalRegreso,
  notificarBateriaCollar,
  notificarCollarDesconectado,
  notificarGatewayDesconectado,
  notificarMovimientoInusual,
  notificarSenalDebil,
} from "./notificationService";
import { Animal } from "@/types";

const UMBRAL_BATERIA_BAJA = 20;
const UMBRAL_SEÑAL_DEBIL = "Débil";
const UMBRAL_SALUD_INUSUAL = "Regular";

interface OpcionesNotificaciones {
  habilitadas: boolean;
  alertasBateria: boolean;
  alertasRuptura: boolean;
}

/**
 * Hook que conecta el estado del rebaño con las notificaciones push del SO.
 * Se monta en el árbol principal (HomeScreen o AppNavigator) y escucha
 * cambios de `animales` para disparar notificaciones cuando corresponde.
 */
export function useNotificaciones(
  animales: Animal[],
  opciones: OpcionesNotificaciones = {
    habilitadas: true,
    alertasBateria: true,
    alertasRuptura: true,
  }
) {
  const estadoAnteriorRef = useRef<Map<string, Animal>>(new Map());
  const notificadosBateriaRef = useRef<Set<string>>(new Set());
  const notificadosDesconexionRef = useRef<Set<string>>(new Set());
  const notificadosMovimientoRef = useRef<Set<string>>(new Set());
  const gatewayNotificadoRef = useRef(false);
  const permisoConcedidoRef = useRef(false);

  // Inicializar permisos al montar
  useEffect(() => {
    inicializarNotificaciones().then((ok) => {
      permisoConcedidoRef.current = ok;
    });

    return () => {
      limpiarListeners();
    };
  }, []);

  // Limpiar badge cuando la app vuelve al primer plano
  useEffect(() => {
    const suscripcion = AppState.addEventListener(
      "change",
      (estado: AppStateStatus) => {
        if (estado === "active") limpiarBadge();
      }
    );
    return () => suscripcion.remove();
  }, []);

  // Detectar cambios de estado en los animales
  useEffect(() => {
    if (!permisoConcedidoRef.current || !opciones.habilitadas) {
      estadoAnteriorRef.current = new Map(animales.map((a) => [a.id, a]));
      return;
    }

    const anterior = estadoAnteriorRef.current;

    for (const animal of animales) {
      const prev = anterior.get(animal.id);

      if (!prev) {
        // Animal nuevo — no notificar en la primera carga
        continue;
      }

      // ── Ruptura / regreso de cerca ─────────────────────────────────────────
      if (opciones.alertasRuptura) {
        if (prev.dentroDeCerca && !animal.dentroDeCerca) {
          notificarAnimalFueraDeCerca(
            animal.nombre,
            animal.id,
            "Potrero Principal",
            animal.collar.id
          );
        } else if (!prev.dentroDeCerca && animal.dentroDeCerca) {
          notificarAnimalRegreso(
            animal.nombre,
            animal.id,
            "Potrero Principal"
          );
        }
      }

      // ── Batería baja ──────────────────────────────────────────────────────
      if (opciones.alertasBateria) {
        const keyBateria = `${animal.id}_bat`;
        if (
          animal.collar.bateria <= UMBRAL_BATERIA_BAJA &&
          prev.collar.bateria > UMBRAL_BATERIA_BAJA &&
          !notificadosBateriaRef.current.has(keyBateria)
        ) {
          notificadosBateriaRef.current.add(keyBateria);
          notificarBateriaCollar(
            animal.nombre,
            animal.id,
            animal.collar.id,
            animal.collar.bateria
          );
        }
        // Restablecer cuando la batería se recargue (> umbral)
        if (animal.collar.bateria > UMBRAL_BATERIA_BAJA + 5) {
          notificadosBateriaRef.current.delete(keyBateria);
        }
      }

      // ── Señal débil ───────────────────────────────────────────────────────
      const keySeñal = `${animal.id}_señal`;
      if (
        animal.collar.señal === UMBRAL_SEÑAL_DEBIL &&
        prev.collar.señal !== UMBRAL_SEÑAL_DEBIL &&
        !notificadosDesconexionRef.current.has(keySeñal)
      ) {
        notificadosDesconexionRef.current.add(keySeñal);
        notificarSenalDebil(animal.nombre, animal.id, animal.collar.id);
      }
      if (animal.collar.señal !== UMBRAL_SEÑAL_DEBIL) {
        notificadosDesconexionRef.current.delete(keySeñal);
      }

      // ── Collar desconectado ───────────────────────────────────────────────
      const keyDesconexion = `${animal.id}_collar`;
      if (
        prev.collar.estado !== "fuera_de_rango" &&
        animal.collar.estado === "fuera_de_rango" &&
        !notificadosDesconexionRef.current.has(keyDesconexion)
      ) {
        notificadosDesconexionRef.current.add(keyDesconexion);
        notificarCollarDesconectado(animal.nombre, animal.id, animal.collar.id);
      }
      if (animal.collar.estado !== "fuera_de_rango") {
        notificadosDesconexionRef.current.delete(keyDesconexion);
      }

      // ── Movimiento inusual (salud deteriora a "Regular") ─────────────────
      const keyMovimiento = `${animal.id}_mov`;
      if (
        prev.salud !== UMBRAL_SALUD_INUSUAL &&
        animal.salud === UMBRAL_SALUD_INUSUAL &&
        !notificadosMovimientoRef.current.has(keyMovimiento)
      ) {
        notificadosMovimientoRef.current.add(keyMovimiento);
        notificarMovimientoInusual(
          animal.nombre,
          animal.id,
          "Potrero Principal"
        );
      }
      if (animal.salud !== UMBRAL_SALUD_INUSUAL) {
        notificadosMovimientoRef.current.delete(keyMovimiento);
      }
    }

    // ── Gateway desconectado (todos los collares fuera de rango) ───────────
    if (animales.length > 0) {
      const todosDesconectados = animales.every(
        (a) => a.collar.estado === "fuera_de_rango"
      );
      if (todosDesconectados && !gatewayNotificadoRef.current) {
        gatewayNotificadoRef.current = true;
        notificarGatewayDesconectado();
      }
      if (!todosDesconectados) {
        gatewayNotificadoRef.current = false;
      }
    }

    // Actualizar estado anterior
    estadoAnteriorRef.current = new Map(animales.map((a) => [a.id, a]));
  }, [animales, opciones.habilitadas, opciones.alertasBateria, opciones.alertasRuptura]);
}
