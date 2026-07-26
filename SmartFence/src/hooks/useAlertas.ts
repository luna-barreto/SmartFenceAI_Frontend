import { useEffect, useState, useCallback } from "react";
import { Alerta, TipoAlerta } from "@/types";
import { AlertasAPI } from "@/services/api";
import { suscribirAlertas } from "@/services/socket";
import { useAuth } from "@/context/AuthContext";

// Mapea severidad del backend → tipo de UI
function severidadAUI(severidad: string): TipoAlerta {
  if (severidad === "CRITICA") return "critica";
  if (severidad === "MEDIA")   return "advertencia";
  return "informativa";
}

// Mapea tipo del backend → título legible
function tipoATitulo(tipo: string): string {
  const mapa: Record<string, string> = {
    ANIMAL_SALIO:       "Animal fuera de la cerca",
    ANIMAL_ENTRO:       "Animal regresó al perímetro",
    BATERIA_BAJA:       "Batería baja en dispositivo",
    COLLAR_DESCONECTADO:"Dispositivo desconectado",
    COLLAR_RETIRADO:    "Posible retiro de collar",
    INTRUSO_DETECTADO:  "Intruso detectado",
    VELOCIDAD_ANORMAL:  "Velocidad anormal detectada",
    TEMPERATURA_ANORMAL:"Temperatura anormal",
  };
  return mapa[tipo] ?? tipo;
}

function adaptarAlerta(a: Alerta): Alerta {
  return {
    ...a,
    titulo: a.titulo ?? tipoATitulo(a.tipo),
    detalle: a.detalle ?? a.mensaje,
    tipoUI: a.tipoUI ?? severidadAUI(a.severidad),
    leida: a.leida ?? a.estado !== "PENDIENTE",
    resuelta: a.resuelta ?? a.estado === "RESUELTA",
  };
}

export function useAlertas() {
  const { usuario } = useAuth();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    if (!usuario?.fincaId) return;
    setCargando(true);
    try {
      const { data } = await AlertasAPI.listar(usuario.fincaId);
      setAlertas(data.map(adaptarAlerta));
    } catch {
      // Sin backend disponible — alertas vacías, la simulación de useAnimals las genera
    } finally {
      setCargando(false);
    }
  }, [usuario?.fincaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Alertas en tiempo real via WebSocket
  useEffect(() => {
    const cancelar = suscribirAlertas((alerta) => {
      setAlertas((prev) => [adaptarAlerta(alerta), ...prev].slice(0, 100));
    });
    return () => { cancelar?.(); };
  }, []);

  const agregarAlerta = useCallback((a: Alerta) => {
    setAlertas((prev) => [adaptarAlerta(a), ...prev].slice(0, 100));
  }, []);

  const marcarLeida = useCallback(async (id: string) => {
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, leida: true, estado: "RECONOCIDA" as const } : a))
    );
    try { await AlertasAPI.marcarLeida(id); } catch { /* optimistic — si falla, se queda marcada localmente */ }
  }, []);

  const marcarResuelta = useCallback(async (id: string) => {
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resuelta: true, leida: true, estado: "RESUELTA" as const } : a))
    );
    try { await AlertasAPI.marcarResuelta(id); } catch { /* optimistic */ }
  }, []);

  const eliminar = useCallback(async (id: string) => {
    setAlertas((prev) => prev.filter((a) => a.id !== id));
    try { await AlertasAPI.eliminar(id); } catch { /* optimistic */ }
  }, []);

  return { alertas, cargando, cargar, agregarAlerta, marcarLeida, marcarResuelta, eliminar };
}
