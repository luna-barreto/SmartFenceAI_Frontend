import { useCallback, useEffect, useRef, useState } from "react";
import { Alerta, Animal, Cerca, Collar, Coordenada, TipoAlerta } from "@/types";
import { puntoDentroPoligono } from "@/utils/geo";
import { AnimalesAPI, CercasAPI, GpsAPI } from "@/services/api";
import { suscribirTelemetria, suscribirAlertas } from "@/services/socket";
import { useAuth } from "@/context/AuthContext";

// Cerca de referencia para modo sin backend (coordenadas Antioquia, Colombia)
export const CERCA_DEMO: Coordenada[] = [
  { lat: 6.2085, lng: -75.586 },
  { lat: 6.2101, lng: -75.5834 },
  { lat: 6.209,  lng: -75.5798 },
  { lat: 6.2058, lng: -75.5785 },
  { lat: 6.203,  lng: -75.5805 },
  { lat: 6.2022, lng: -75.5838 },
  { lat: 6.2045, lng: -75.5862 },
];

const NOMBRES = ["Lucero", "Canela", "Estrella", "Manchas", "Trueno", "Paloma", "Rocío", "Pinta", "Sultán", "Girasol"];
const RAZAS   = ["Cebú", "Holstein", "Pardo Suizo", "Brahman", "Angus", "Gyr"];

function centro(pts: Coordenada[]): Coordenada {
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  };
}

function generarAnimalesDemo(n: number): Animal[] {
  const c = centro(CERCA_DEMO);
  return Array.from({ length: n }, (_, i) => {
    const lat = c.lat + (Math.random() - 0.5) * 0.006;
    const lng = c.lng + (Math.random() - 0.5) * 0.006;
    const ubicacion = { lat, lng };
    return {
      id: `a-${i}`,
      codigo: `COD-${100 + i}`,
      nombre: `${NOMBRES[i % NOMBRES.length]} #${100 + i}`,
      raza: RAZAS[i % RAZAS.length],
      estado: "ACTIVO" as const,
      fincaId: "demo",
      peso: 320 + Math.floor(Math.random() * 180),
      salud: (["Excelente", "Buena", "Buena", "Regular"] as const)[Math.floor(Math.random() * 4)],
      ubicacion,
      dentroDeCerca: puntoDentroPoligono(ubicacion, CERCA_DEMO),
      collar: {
        id: `col-${i}`,
        serial: `SF-${1000 + i}`,
        fincaId: "demo",
        bateria: 55 + Math.floor(Math.random() * 45),
        bateriaPorcentaje: 55 + Math.floor(Math.random() * 45),
        señal: (["Excelente", "Buena", "Débil"] as const)[Math.floor(Math.random() * 3)],
        protocolo: "LoRa" as const,
        ultimaConexion: new Date().toISOString(),
        fechaRegistro: new Date().toISOString(),
        activo: true,
        estado: "en_linea" as const,
      },
    };
  });
}

interface UsarAnimalesOpciones {
  intervaloMs?: number;
  usarSimulacion?: boolean;
  onNuevaAlerta?: (alerta: Alerta) => void;
}

/**
 * Hook central del rebaño.
 * - Carga animales desde GET /animales (incluye animales sin GPS aún).
 * - Carga posiciones en vivo desde GET /gps/vivo y las fusiona con los animales.
 * - Se suscribe a "gps:posicion" (posición en tiempo real) y "alerta:nueva" (alertas del backend).
 * - Si el backend no responde, genera un rebaño simulado (modo demo/desarrollo).
 * - Expone `recargar()` para que pantallas recarguen tras crear/editar un animal.
 */
export function useAnimals(opciones: UsarAnimalesOpciones = {}) {
  const { intervaloMs = 20000, usarSimulacion = true, onNuevaAlerta } = opciones;
  const { usuario } = useAuth();
  const [animales, setAnimales] = useState<Animal[]>(() => generarAnimalesDemo(10));
  const [cerca, setCerca] = useState<Cerca | null>(null);
  const [cargandoCerca, setCargandoCerca] = useState(true);
  const [conectado, setConectado] = useState(true);
  const [ultimaSync, setUltimaSync] = useState<Date>(new Date());
  const destinosRef = useRef<Record<string, Coordenada>>({});
  const backendOkRef = useRef(false);

  const cargarDesdeBackend = useCallback(async (fincaId: string) => {
    try {
      // Carga base: lista de animales con sus collares
      const { data: listaAnimales } = await AnimalesAPI.listar(fincaId);
      if (!listaAnimales.length) return;
      backendOkRef.current = true;

      // Posiciones en vivo desde Redis (TTL 120 s) — da lat/lng/dentroDeCerca actuales
      let posicionesVivo: Record<string, { lat: number; lng: number; dentroDeCerca: boolean; fecha: string }> = {};
      try {
        const { data: vivo } = await GpsAPI.vivo(fincaId);
        for (const entry of vivo) {
          if (entry.posicion) posicionesVivo[entry.collar.id] = entry.posicion;
        }
      } catch { /* sin posiciones en vivo — usamos las que lleguen por WS */ }

      setAnimales(listaAnimales.map((a) => {
        const collarId = a.collar?.id ?? "";
        const pos = posicionesVivo[collarId];
        return {
          ...a,
          ubicacion: pos ? { lat: pos.lat, lng: pos.lng } : undefined,
          dentroDeCerca: pos ? pos.dentroDeCerca : undefined,
          collar: a.collar ? {
            ...a.collar,
            bateria: a.collar.bateriaPorcentaje ?? undefined,
            señal: (a.collar.senalCalidad as Collar["señal"]) ?? "Buena",
            protocolo: "LoRa" as const,
            ultimaConexion: a.collar.fechaUltimoReporte ?? new Date().toISOString(),
            // Un collar con reporte reciente (< 5 min) está en línea
            estado: (() => {
              if (!a.collar.fechaUltimoReporte) return "sin_señal" as const;
              const mins = (Date.now() - new Date(a.collar.fechaUltimoReporte).getTime()) / 60000;
              if (mins < 5) return "en_linea" as const;
              if (mins < 30) return "fuera_de_rango" as const;
              return "sin_señal" as const;
            })(),
            fechaRegistro: a.collar.fechaRegistro ?? new Date().toISOString(),
          } : null,
        };
      }));
      setUltimaSync(new Date());
    } catch {
      // sin backend: queda la simulación activa
    }
  }, []);

  // ── Carga inicial desde el backend ─────────────────────────────────────────
  useEffect(() => {
    if (!usuario?.fincaId) return;
    const fincaId = usuario.fincaId;

    // Cargar geocerca activa
    setCargandoCerca(true);
    CercasAPI.listar(fincaId)
      .then(({ data }) => {
        const activa = data.find((c) => c.activa) ?? data[0];
        if (activa) {
          setCerca({
            ...activa,
            puntos: activa.coordenadas,
            areaHa: activa.areaHectareas ?? undefined,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setCargandoCerca(false));

    cargarDesdeBackend(fincaId);
  }, [usuario?.fincaId, cargarDesdeBackend]);

  const recargarCerca = useCallback((fincaId: string) => {
    CercasAPI.listar(fincaId)
      .then(({ data }) => {
        const activa = data.find((c) => c.activa) ?? data[0];
        if (activa) setCerca({ ...activa, puntos: activa.coordenadas, areaHa: activa.areaHectareas ?? undefined });
      })
      .catch(() => undefined);
  }, []);

  const recargar = useCallback(() => {
    if (!usuario?.fincaId) return;
    cargarDesdeBackend(usuario.fincaId);
    recargarCerca(usuario.fincaId);
  }, [usuario?.fincaId, cargarDesdeBackend, recargarCerca]);

  // ── WebSocket — posición GPS en tiempo real ────────────────────────────────
  useEffect(() => {
    const cancelarGps = suscribirTelemetria((evento) => {
      backendOkRef.current = true;
      setConectado(true);
      setUltimaSync(new Date());

      // dentroDeCerca viene de PostGIS (ST_Covers + polígono CCW).
      // puntoDentroPoligono es solo fallback si el backend no lo envía.
      const puntosCercaFallback = cerca?.coordenadas ?? CERCA_DEMO;

      setAnimales((prev) =>
        prev.map((a) => {
          const esEste =
            (a.collar?.id === evento.collarId) ||
            (a.id === evento.animalId);
          if (!esEste) return a;
          const dentroCalculado =
            evento.dentroDeCerca !== undefined
              ? evento.dentroDeCerca
              : puntoDentroPoligono({ lat: evento.lat, lng: evento.lng }, puntosCercaFallback);
          return {
            ...a,
            ubicacion: { lat: evento.lat, lng: evento.lng },
            dentroDeCerca: dentroCalculado,
            collar: a.collar ? {
              ...a.collar,
              bateria: evento.bateria ?? a.collar.bateria,
              bateriaPorcentaje: evento.bateria ?? a.collar.bateriaPorcentaje,
              ultimaConexion: evento.fecha,
              estado: "en_linea" as const,
            } : a.collar,
          };
        })
      );
    });

    // ── WebSocket — alertas reales del backend (ANIMAL_SALIO, BATERIA_BAJA…) ─
    const cancelarAlertas = suscribirAlertas((alerta) => {
      if (!onNuevaAlerta) return;
      const tipoUI: Alerta["tipoUI"] =
        alerta.severidad === "CRITICA" ? "critica" :
        alerta.severidad === "MEDIA"   ? "advertencia" : "informativa";
      onNuevaAlerta({
        ...alerta,
        leida: false,
        resuelta: false,
        tipoUI,
        titulo: alerta.mensaje,
      });
    });

    return () => { cancelarGps?.(); cancelarAlertas?.(); };
  }, [cerca, onNuevaAlerta]);

  // ── Simulación local (solo cuando no hay backend disponible) ───────────────
  useEffect(() => {
    if (!usarSimulacion) return;
    const intervalo = setInterval(() => {
      if (backendOkRef.current) return; // backend activo → no simular

      const enLinea = Math.random() > 0.04;
      setConectado(enLinea);
      if (!enLinea) return;
      setUltimaSync(new Date());

      const puntosCerca = cerca?.coordenadas ?? CERCA_DEMO;

      setAnimales((prev) =>
        prev.map((a) => {
          const ub = a.ubicacion ?? centro(puntosCerca);
          let destino = destinosRef.current[a.id];
          const llego =
            !destino ||
            (Math.abs(ub.lat - destino.lat) < 0.0002 &&
              Math.abs(ub.lng - destino.lng) < 0.0002);
          if (Math.random() < 0.3 || llego) {
            destino = {
              lat: ub.lat + (Math.random() - 0.5) * 0.0025,
              lng: ub.lng + (Math.random() - 0.5) * 0.0025,
            };
            destinosRef.current[a.id] = destino;
          }
          const nuevaUbicacion: Coordenada = {
            lat: ub.lat + (destino.lat - ub.lat) * 0.2,
            lng: ub.lng + (destino.lng - ub.lng) * 0.2,
          };
          const dentroAhora = puntoDentroPoligono(nuevaUbicacion, puntosCerca);
          const bateria = Math.max(4, (a.collar?.bateria ?? 80) - (Math.random() < 0.15 ? 1 : 0));

          if (dentroAhora !== a.dentroDeCerca && onNuevaAlerta) {
            onNuevaAlerta({
              id: `al-${Date.now()}-${a.id}`,
              tipo: dentroAhora ? "ANIMAL_ENTRO" : "ANIMAL_SALIO",
              severidad: dentroAhora ? "INFO" : "CRITICA",
              mensaje: `${a.nombre} ${dentroAhora ? "volvió al perímetro seguro" : "salió del perímetro seguro"}`,
              animalId: a.id,
              estado: "PENDIENTE",
              fecha: new Date().toISOString(),
              leida: false,
              resuelta: false,
              tipoUI: dentroAhora ? "informativa" : "critica",
            });
          }

          return {
            ...a,
            ubicacion: nuevaUbicacion,
            dentroDeCerca: dentroAhora,
            collar: a.collar
              ? { ...a.collar, bateria, bateriaPorcentaje: bateria, ultimaConexion: new Date().toISOString() }
              : a.collar,
          };
        })
      );
    }, intervaloMs);
    return () => clearInterval(intervalo);
  }, [intervaloMs, usarSimulacion, onNuevaAlerta, cerca]);

  return { animales, conectado, ultimaSync, cerca, cargandoCerca, recargar };
}
