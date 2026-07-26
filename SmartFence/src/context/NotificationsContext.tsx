import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { inicializarNotificaciones, limpiarBadge, programarReporteDiario, cancelarReporteDiario } from "@notifications/notificationService";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useNotificaciones } from "@notifications/useNotifications";

const STORAGE_KEY = "sf_notif_prefs";

interface PrefsNotificaciones {
  habilitadas: boolean;
  alertasBateria: boolean;
  alertasRuptura: boolean;
  reporteDiario: boolean;
}

interface ContextoNotificaciones extends PrefsNotificaciones {
  permisoConcedido: boolean;
  setHabilitadas: (v: boolean) => void;
  setAlertasBateria: (v: boolean) => void;
  setAlertasRuptura: (v: boolean) => void;
  setReporteDiario: (v: boolean) => void;
}

const defaultPrefs: PrefsNotificaciones = {
  habilitadas: true,
  alertasBateria: true,
  alertasRuptura: true,
  reporteDiario: true,
};

const NotificationsContext = createContext<ContextoNotificaciones>({
  ...defaultPrefs,
  permisoConcedido: false,
  setHabilitadas: () => {},
  setAlertasBateria: () => {},
  setAlertasRuptura: () => {},
  setReporteDiario: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<PrefsNotificaciones>(defaultPrefs);
  const [permisoConcedido, setPermisoConcedido] = useState(false);
  const { animales } = useAnimalsCtx();

  // Cargar prefs guardadas
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setPrefs(JSON.parse(raw));
      })
      .catch(() => {});

    inicializarNotificaciones().then((ok) => {
      setPermisoConcedido(ok);
      if (ok) {
        limpiarBadge();
        // Programar reporte diario si la preferencia ya estaba activa
        AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
          const saved: PrefsNotificaciones = raw ? JSON.parse(raw) : defaultPrefs;
          if (saved.reporteDiario !== false) programarReporteDiario();
        });
      }
    });
  }, []);

  // Persistir prefs cuando cambian
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs]);

  // Conectar con el monitor de animales
  useNotificaciones(animales, prefs);

  function setHabilitadas(v: boolean) {
    setPrefs((p) => ({ ...p, habilitadas: v }));
  }
  function setAlertasBateria(v: boolean) {
    setPrefs((p) => ({ ...p, alertasBateria: v }));
  }
  function setAlertasRuptura(v: boolean) {
    setPrefs((p) => ({ ...p, alertasRuptura: v }));
  }
  function setReporteDiario(v: boolean) {
    setPrefs((p) => ({ ...p, reporteDiario: v }));
    if (v) programarReporteDiario(); else cancelarReporteDiario();
  }

  return (
    <NotificationsContext.Provider
      value={{ ...prefs, permisoConcedido, setHabilitadas, setAlertasBateria, setAlertasRuptura, setReporteDiario }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsCtx() {
  return useContext(NotificationsContext);
}
