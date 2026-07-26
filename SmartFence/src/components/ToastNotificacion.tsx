import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import {
  AlertTriangle,
  BatteryLow,
  CheckCircle,
  Info,
  MapPin,
  WifiOff,
  Zap,
} from "lucide-react-native";
import { useT } from "@context/ThemeContext";
import {
  DatosNotificacionSmartFence,
  TipoNotificacion,
} from "@notifications/notificationTypes";
import { navigateTo } from "@navigation/navigationRef";

const DURACION_MS = 4500;
const STATUS_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;
const TOAST_TOP = STATUS_H + 12;

interface ToastData {
  id: string;
  titulo: string;
  cuerpo: string;
  tipo: TipoNotificacion;
  datos: DatosNotificacionSmartFence;
}

function iconoToast(tipo: TipoNotificacion, color: string) {
  const props = { size: 20, color, strokeWidth: 2 };
  switch (tipo) {
    case "animal_fuera_cerca":   return <MapPin {...props} />;
    case "animal_regreso":       return <CheckCircle {...props} />;
    case "bateria_baja":         return <BatteryLow {...props} />;
    case "collar_desconectado":
    case "gateway_desconectado": return <WifiOff {...props} />;
    case "señal_debil":          return <Zap {...props} />;
    case "movimiento_inusual":   return <AlertTriangle {...props} />;
    default:                     return <Info {...props} />;
  }
}

function colorToast(tipo: TipoNotificacion): string {
  switch (tipo) {
    case "animal_fuera_cerca":
    case "collar_desconectado":
    case "gateway_desconectado": return "#EF4444";
    case "bateria_baja":
    case "señal_debil":
    case "movimiento_inusual":   return "#F59E0B";
    case "animal_regreso":       return "#4CAF50";
    default:                     return "#3B82F6";
  }
}

export default function ToastNotificacion() {
  const T = useT();
  const [toast, setToast] = useState<ToastData | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notif) => {
      const datos = notif.request.content.data as DatosNotificacionSmartFence;
      if (!datos?.tipo) return;
      mostrar({
        id: notif.request.identifier,
        titulo: notif.request.content.title ?? "SmartFence AI",
        cuerpo: notif.request.content.body ?? "",
        tipo: datos.tipo,
        datos,
      });
    });
    return () => sub.remove();
  }, []);

  function mostrar(data: ToastData) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(data);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    timerRef.current = setTimeout(ocultar, DURACION_MS);
  }

  function ocultar() {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }

  function alPresionar() {
    if (!toast) return;
    ocultar();
    const { tipo, datos } = toast;
    if (tipo === "animal_fuera_cerca" || tipo === "señal_debil") {
      navigateTo("Map");
    } else if (datos.animalId) {
      navigateTo("AnimalDetail", { animalId: datos.animalId });
    } else {
      navigateTo("Alerts");
    }
  }

  if (!toast) return null;

  const accent = colorToast(toast.tipo);

  return (
    <Animated.View
      style={[
        st.wrapper,
        { top: TOAST_TOP, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        style={[st.toast, { backgroundColor: T.card, borderColor: T.borde, borderLeftColor: accent }]}
        onPress={alPresionar}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      >
        <View style={[st.iconBox, { backgroundColor: accent + "20" }]}>
          {iconoToast(toast.tipo, accent)}
        </View>
        <View style={st.textos}>
          <Text style={[st.titulo, { color: T.txtMain }]} numberOfLines={1}>
            {toast.titulo}
          </Text>
          <Text style={[st.cuerpo, { color: T.txtSec }]} numberOfLines={2}>
            {toast.cuerpo}
          </Text>
        </View>
        <Pressable style={st.cerrar} onPress={ocultar} hitSlop={10}>
          <Text style={[st.cerrarTxt, { color: T.txtSec }]}>✕</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 20,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  cuerpo: {
    fontSize: 12,
    lineHeight: 16,
  },
  cerrar: {
    paddingLeft: 4,
    flexShrink: 0,
  },
  cerrarTxt: {
    fontSize: 14,
    fontWeight: "600",
  },
});
