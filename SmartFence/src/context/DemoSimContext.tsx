/**
 * Motor de simulación demo — fuente de verdad compartida entre MapScreen y AlertsScreen.
 *
 * Genera alertas en tiempo real que reflejan los mismos escenarios que la
 * animación Leaflet del mapa:
 *  • Luna (d-12): sale del perímetro cada ~35 s, regresa 20 s después.
 *  • Aurora (d-13): alerta de salud crítica periódica (sensor rojo).
 *  • Manchas (d-04): batería crítica recurrente.
 *  • Intruso: detección aleatoria cada ~2 min.
 *  • Alertas suplementarias variadas cada ~50 s.
 */

import React, {
  createContext, useCallback, useContext,
  useEffect, useRef, useState,
} from "react";
import {
  ALERTAS_DEMO, ANIMALES_DEMO, STATS_DEMO,
  type AlertaDemo,
} from "@/demo/demoData";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type AlertaTemplate = Omit<AlertaDemo, "id" | "fecha">;

interface DemoSimCtxType {
  alertas:   AlertaDemo[];
  stats:     typeof STATS_DEMO;
  nuevasIds: Set<string>;        // IDs de alertas agregadas en los últimos 8 s
}

// ─── Animales de referencia ───────────────────────────────────────────────────
const LUNA     = ANIMALES_DEMO.find(a => a.id === "d-12")!;
const AURORA   = ANIMALES_DEMO.find(a => a.id === "d-13")!;
const MANCHAS  = ANIMALES_DEMO.find(a => a.id === "d-04")!;
const ESTRELLA = ANIMALES_DEMO.find(a => a.id === "d-03")!;
const NIEVE    = ANIMALES_DEMO.find(a => a.id === "d-11")!;
const REINA    = ANIMALES_DEMO.find(a => a.id === "d-14")!;

// ─── Pool de alertas suplementarias (rotación) ────────────────────────────────
const SUPLEMENTARIAS: AlertaTemplate[] = [
  {
    tipo: "advertencia",
    titulo: `Batería crítica — ${MANCHAS.displayNombre}`,
    sub: `${MANCHAS.nombre} • ${MANCHAS.identificacion} • ${MANCHAS.potrero}`,
    desc: `El collar COL-1004 está al ${MANCHAS.bateria}%. Puede perder conectividad pronto.`,
    leida: false, resuelta: false, scenarioTag: "bateria_critica",
  },
  {
    tipo: "advertencia",
    titulo: `${ESTRELLA.displayNombre} — mucosa pálida (sensor de color)`,
    sub: `${ESTRELLA.nombre} • ${ESTRELLA.identificacion} • ${ESTRELLA.potrero}`,
    desc: `Sensor detectó palidez leve (R:${ESTRELLA.salud.r} G:${ESTRELLA.salud.g} B:${ESTRELLA.salud.b}). Seguimiento veterinario recomendado en 24 h.`,
    leida: false, resuelta: false, scenarioTag: "sensor_color",
  },
  {
    tipo: "critica",
    titulo: `${AURORA.displayNombre} enferma — anemia detectada`,
    sub: `${AURORA.nombre} • ${AURORA.identificacion} • Collar COL-1013`,
    desc: `Mucosa muy pálida (R:${AURORA.salud.r} G:${AURORA.salud.g} B:${AURORA.salud.b}). Índice CRÍTICO. Atención veterinaria inmediata.`,
    leida: false, resuelta: false, scenarioTag: "sensor_color",
  },
  {
    tipo: "advertencia",
    titulo: "Señal LoRa degradada — Potrero Norte",
    sub: "Gateway GW-01 • Potrero Norte",
    desc: "Señal por debajo del nivel óptimo. Posible obstrucción o interferencia temporal.",
    leida: false, resuelta: false,
  },
  {
    tipo: "advertencia",
    titulo: `${NIEVE.displayNombre} — atención, variación en mucosa`,
    sub: `${NIEVE.nombre} • ${NIEVE.identificacion} • ${NIEVE.potrero}`,
    desc: "Sensor de color indica leve variación en tonalidad. Monitorear en próximas horas.",
    leida: false, resuelta: false, scenarioTag: "sensor_color",
  },
  {
    tipo: "informativa",
    titulo: "Telemetría sincronizada",
    sub: "Todos los dispositivos • 16 collares activos",
    desc: "Todos los collares reportaron posición GPS correctamente en el último ciclo.",
    leida: false, resuelta: true,
  },
  {
    tipo: "informativa",
    titulo: `Collar ${REINA.collarId} sigue sin señal`,
    sub: `${REINA.nombre} • ${REINA.identificacion} • ${REINA.potrero}`,
    desc: "El collar continúa sin transmitir desde hace más de 30 min. Inspección física recomendada.",
    leida: false, resuelta: false, scenarioTag: "corte_correo",
  },
];

const SECTORES  = ["Noreste", "Noroeste", "Sur", "Este", "Suroeste"] as const;
const CAP_MAX   = 60; // máximo de alertas en lista (evitar crecimiento infinito)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeId() {
  return `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function iso() { return new Date().toISOString(); }

function calcStats(alertas: AlertaDemo[]): typeof STATS_DEMO {
  return {
    ...STATS_DEMO,
    alertasCriticas:    alertas.filter(a => a.tipo === "critica"     && !a.resuelta).length,
    alertasAdvertencia: alertas.filter(a => a.tipo === "advertencia" && !a.resuelta).length,
    alertasInformativas:alertas.filter(a => a.tipo === "informativa").length,
    alertasIntruso:     alertas.filter(a => a.tipo === "intruso"     && !a.resuelta).length,
    resueltas:          alertas.filter(a => a.resuelta).length,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DemoSimContext = createContext<DemoSimCtxType>({
  alertas:   ALERTAS_DEMO,
  stats:     STATS_DEMO,
  nuevasIds: new Set(),
});

export function useDemoSim() {
  return useContext(DemoSimContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DemoSimProvider({ children }: { children: React.ReactNode }) {
  const [alertas,   setAlertas]   = useState<AlertaDemo[]>(() => [...ALERTAS_DEMO]);
  const [stats,     setStats]     = useState(() => calcStats(ALERTAS_DEMO));
  const [nuevasIds, setNuevasIds] = useState<Set<string>>(new Set());

  const lunaFueraRef      = useRef(false);
  const lunaAlertaIdRef   = useRef<string | null>(null);
  const suppIdxRef        = useRef(0);

  // ── Agrega alerta al frente y actualiza stats ─────────────────────────────
  const addAlerta = useCallback((tpl: AlertaTemplate): string => {
    const id = makeId();
    const nueva: AlertaDemo = { ...tpl, id, fecha: iso() };

    setAlertas(prev => {
      const next = [nueva, ...prev].slice(0, CAP_MAX);
      setStats(calcStats(next));
      return next;
    });

    // Badge "NUEVO" durante 8 s
    setNuevasIds(prev => new Set([...prev, id]));
    setTimeout(() => setNuevasIds(prev => { const n = new Set(prev); n.delete(id); return n; }), 8000);

    return id;
  }, []);

  // ── Marca una alerta como resuelta ─────────────────────────────────────────
  const resolveAlerta = useCallback((id: string) => {
    setAlertas(prev => {
      const next = prev.map(a => a.id === id ? { ...a, resuelta: true, leida: true } : a);
      setStats(calcStats(next));
      return next;
    });
  }, []);

  // ── Ciclo Luna: sale cada 35 s, regresa 20 s después ─────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      if (lunaFueraRef.current) return;
      lunaFueraRef.current = true;

      const lat = (10.8720 + (Math.random() - 0.5) * 0.003).toFixed(4);
      const lng = (-74.9150 + (Math.random() - 0.5) * 0.003).toFixed(4);

      const id = addAlerta({
        tipo: "critica",
        titulo: `${LUNA.displayNombre} salió de la cerca virtual`,
        sub: `${LUNA.nombre} • ${LUNA.identificacion} • ${LUNA.potrero}`,
        desc: `${LUNA.displayNombre} cruzó el perímetro sur. Última posición: ${lat}° N, ${lng}° W.`,
        leida: false, resuelta: false, scenarioTag: "animal_suelto",
      });
      lunaAlertaIdRef.current = id;

      // Luna regresa 20 s después
      setTimeout(() => {
        if (!lunaFueraRef.current) return;
        lunaFueraRef.current = false;
        if (lunaAlertaIdRef.current) resolveAlerta(lunaAlertaIdRef.current);
        lunaAlertaIdRef.current = null;

        addAlerta({
          tipo: "informativa",
          titulo: `${LUNA.displayNombre} regresó al perímetro seguro`,
          sub: `${LUNA.nombre} • ${LUNA.identificacion} • ${LUNA.potrero}`,
          desc: `${LUNA.displayNombre} ingresó nuevamente al área segura. Cerca virtual funcionando correctamente.`,
          leida: false, resuelta: true, scenarioTag: "animal_suelto",
        });
      }, 20_000);
    }, 35_000);

    return () => clearInterval(tick);
  }, [addAlerta, resolveAlerta]);

  // ── Ciclo Aurora: alerta de salud crítica cada 45 s ──────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      addAlerta({
        tipo: "critica",
        titulo: `${AURORA.displayNombre} enferma — sensor crítico`,
        sub: `${AURORA.nombre} • ${AURORA.identificacion} • ${AURORA.potrero}`,
        desc: `Sensor de color detectó mucosa muy pálida (R:${AURORA.salud.r} G:${AURORA.salud.g} B:${AURORA.salud.b}). Requiere atención veterinaria inmediata.`,
        leida: false, resuelta: false, scenarioTag: "sensor_color",
      });
    }, 45_000);
    return () => clearInterval(tick);
  }, [addAlerta]);

  // ── Alertas suplementarias rotativas cada 50 s ────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const idx = suppIdxRef.current % SUPLEMENTARIAS.length;
      addAlerta(SUPLEMENTARIAS[idx]);
      suppIdxRef.current++;
    }, 50_000);
    return () => clearInterval(tick);
  }, [addAlerta]);

  // ── Intruso aleatorio cada ~2 min ─────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const sector = SECTORES[Math.floor(Math.random() * SECTORES.length)];
      const gw     = `GW-0${1 + Math.floor(Math.random() * 2)}`;
      addAlerta({
        tipo: "intruso",
        titulo: `Intruso detectado — Sector ${sector}`,
        sub: `Gateway ${gw} • Sin collar activo en la zona`,
        desc: "Movimiento detectado fuera del rango de collares conocidos. Verificar perímetro de inmediato.",
        leida: false, resuelta: false, scenarioTag: "intruso",
      });
    }, 120_000);
    return () => clearInterval(tick);
  }, [addAlerta]);

  return (
    <DemoSimContext.Provider value={{ alertas, stats, nuevasIds }}>
      {children}
    </DemoSimContext.Provider>
  );
}
