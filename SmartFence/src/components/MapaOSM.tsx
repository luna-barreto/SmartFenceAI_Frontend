import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { Animal, Coordenada } from "@/types";
import { GpsAPI } from "@services/api";

interface Props {
  animales: Animal[];
  cerca: Coordenada[];
  centro: Coordenada;
  editando?: boolean;
  onSeleccionarAnimal?: (id: string) => void;
  onGuardarCerca?: (nuevaPuntos: Coordenada[]) => void;
  zoom?: number;
  historialCollarId?: string | null;
  ubicacionUsuario?: Coordenada | null;
}

export interface MapaOSMHandle {
  centerarEnUsuario: () => void;
}

// El HTML del mapa vive en assets/mapa.html (generado por scripts/generate-leaflet.js).
// Se carga con require() para que Metro lo trate como asset estático y evitar el
// límite de ~256 KB de source={{ html }} en Android WebView.
const MAP_HTML = require("../../assets/mapa.html");

const MapaOSM = forwardRef<MapaOSMHandle, Props>(function MapaOSM({
  animales, cerca, centro, editando = false,
  onSeleccionarAnimal, onGuardarCerca, zoom = 16,
  historialCollarId = null, ubicacionUsuario = null,
}, ref) {
  const webviewRef = useRef<WebView>(null);
  const listaRef   = useRef(false); // true una vez que el WebView reporta "listo"

  useImperativeHandle(ref, () => ({
    centerarEnUsuario: () => {
      webviewRef.current?.injectJavaScript(`window.centerarEnUsuario && window.centerarEnUsuario(); true;`);
    },
  }));

  // Cuando el WebView termina de cargar, sincronizamos el estado actual
  function onLoad() {
    listaRef.current = true;

    // Vista inicial
    if (centro.lat && centro.lng) {
      webviewRef.current?.injectJavaScript(
        `window.moverVista && window.moverVista(${centro.lat}, ${centro.lng}, ${zoom}); true;`
      );
    }
    // Cerca actual
    const coords = JSON.stringify(cerca.map(p => [p.lat, p.lng]));
    webviewRef.current?.injectJavaScript(`window.actualizarCerca && window.actualizarCerca(${coords}); true;`);
    // Animales
    webviewRef.current?.injectJavaScript(
      `window.actualizarAnimales && window.actualizarAnimales(${JSON.stringify(animales)}); true;`
    );
    // Modo edición
    webviewRef.current?.injectJavaScript(`window.setEditando && window.setEditando(${editando}); true;`);
    // Ubicación usuario
    if (ubicacionUsuario) {
      webviewRef.current?.injectJavaScript(
        `window.actualizarUbicacionUsuario && window.actualizarUbicacionUsuario(${ubicacionUsuario.lat}, ${ubicacionUsuario.lng}); true;`
      );
    }
  }

  // Actualizaciones reactivas (solo después de que el mapa esté listo)
  React.useEffect(() => {
    if (!centro.lat || !centro.lng) return;
    webviewRef.current?.injectJavaScript(
      `window.moverVista && window.moverVista(${centro.lat}, ${centro.lng}, ${zoom}); true;`
    );
  }, [centro.lat, centro.lng]);

  React.useEffect(() => {
    if (editando) return; // WebView mantiene su propio estado durante la edición
    const coords = JSON.stringify(cerca.map(p => [p.lat, p.lng]));
    webviewRef.current?.injectJavaScript(`window.actualizarCerca && window.actualizarCerca(${coords}); true;`);
  }, [cerca, editando]);

  React.useEffect(() => {
    webviewRef.current?.injectJavaScript(
      `window.actualizarAnimales && window.actualizarAnimales(${JSON.stringify(animales)}); true;`
    );
  }, [animales]);

  React.useEffect(() => {
    webviewRef.current?.injectJavaScript(`window.setEditando && window.setEditando(${editando}); true;`);
  }, [editando]);

  React.useEffect(() => {
    if (!historialCollarId) {
      webviewRef.current?.injectJavaScript(`window.limpiarHistorial && window.limpiarHistorial(); true;`);
      return;
    }
    GpsAPI.historial(historialCollarId).then(({ data }) => {
      webviewRef.current?.injectJavaScript(
        `window.mostrarHistorial && window.mostrarHistorial(${JSON.stringify(data)}); true;`
      );
    }).catch(() => undefined);
  }, [historialCollarId]);

  React.useEffect(() => {
    if (!ubicacionUsuario) return;
    webviewRef.current?.injectJavaScript(
      `window.actualizarUbicacionUsuario && window.actualizarUbicacionUsuario(${ubicacionUsuario.lat}, ${ubicacionUsuario.lng}); true;`
    );
  }, [ubicacionUsuario]);

  function handleMessage(data: string) {
    try {
      const msg = JSON.parse(data);
      if (msg.tipo === "listo") {
        onLoad();
      } else if (msg.tipo === "animal_click") {
        onSeleccionarAnimal?.(msg.id);
      } else if (msg.tipo === "cerca_actualizada") {
        const pts: Coordenada[] = msg.puntos.map(([lat, lng]: [number, number]) => ({ lat, lng }));
        onGuardarCerca?.(pts);
      }
    } catch {
      onSeleccionarAnimal?.(data);
    }
  }

  function zoomIn()  { webviewRef.current?.injectJavaScript(`window.zoomIn(); true;`); }
  function zoomOut() { webviewRef.current?.injectJavaScript(`window.zoomOut(); true;`); }
  function centrar() { webviewRef.current?.injectJavaScript(`window.centerarEnUsuario && window.centerarEnUsuario(); true;`); }

  // ── Web: usar iframe + postMessage ──────────────────────────────────────────
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const iframeReadyRef = React.useRef(false);

  // Refs que siempre apuntan al valor más reciente de cada prop.
  // Necesarios para que el listener (registrado una sola vez) no quede
  // con valores obsoletos del closure del primer render.
  const cercaRef       = React.useRef(cerca);
  const animalesRef    = React.useRef(animales);
  const editandoRef    = React.useRef(editando);
  const centroRef      = React.useRef(centro);
  const zoomRef        = React.useRef(zoom);
  const ubicacionRef   = React.useRef(ubicacionUsuario);
  const onAnimalRef    = React.useRef(onSeleccionarAnimal);
  const onGuardarRef   = React.useRef(onGuardarCerca);

  React.useEffect(() => { cercaRef.current = cerca; },             [cerca]);
  React.useEffect(() => { animalesRef.current = animales; },       [animales]);
  React.useEffect(() => { editandoRef.current = editando; },       [editando]);
  React.useEffect(() => { centroRef.current = centro; },           [centro]);
  React.useEffect(() => { zoomRef.current = zoom; },               [zoom]);
  React.useEffect(() => { ubicacionRef.current = ubicacionUsuario; }, [ubicacionUsuario]);
  React.useEffect(() => { onAnimalRef.current = onSeleccionarAnimal; }, [onSeleccionarAnimal]);
  React.useEffect(() => { onGuardarRef.current = onGuardarCerca; },     [onGuardarCerca]);

  function sendToIframe(cmd: object) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(cmd), "*");
  }

  // Empuja el estado completo actual al iframe.
  function initIframe() {
    const c = centroRef.current;
    if (c.lat && c.lng)
      sendToIframe({ tipo: "moverVista", lat: c.lat, lng: c.lng, zoom: zoomRef.current });
    sendToIframe({ tipo: "actualizarCerca", coords: cercaRef.current.map(p => [p.lat, p.lng]) });
    sendToIframe({ tipo: "actualizarAnimales", animales: animalesRef.current });
    sendToIframe({ tipo: "setEditando", valor: editandoRef.current });
    const u = ubicacionRef.current;
    if (u) sendToIframe({ tipo: "actualizarUbicacionUsuario", lat: u.lat, lng: u.lng });
  }

  // Listener registrado UNA sola vez para evitar la race condition donde el
  // mensaje "listo" llega durante el ciclo desregistrar/registrar del listener.
  React.useEffect(() => {
    if (Platform.OS !== "web") return;
    function onMsg(e: MessageEvent) {
      try {
        const msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (msg.tipo === "listo") {
          iframeReadyRef.current = true;
          initIframe();
        } else if (msg.tipo === "animal_click") {
          onAnimalRef.current?.(msg.id);
        } else if (msg.tipo === "cerca_actualizada") {
          const pts: Coordenada[] = msg.puntos.map(([lat, lng]: [number, number]) => ({ lat, lng }));
          onGuardarRef.current?.(pts);
        }
      } catch { /* ignorar mensajes externos */ }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizaciones reactivas para el iframe (una vez que ya está listo)
  React.useEffect(() => {
    if (Platform.OS !== "web" || !iframeReadyRef.current) return;
    if (editando) return; // iframe mantiene su propio estado durante la edición
    sendToIframe({ tipo: "actualizarCerca", coords: cerca.map(p => [p.lat, p.lng]) });
  }, [cerca, editando]);

  React.useEffect(() => {
    if (Platform.OS !== "web" || !iframeReadyRef.current) return;
    sendToIframe({ tipo: "actualizarAnimales", animales });
  }, [animales]);

  React.useEffect(() => {
    if (Platform.OS !== "web" || !iframeReadyRef.current) return;
    sendToIframe({ tipo: "setEditando", valor: editando });
  }, [editando]);

  React.useEffect(() => {
    if (Platform.OS !== "web" || !iframeReadyRef.current || !centro.lat || !centro.lng) return;
    sendToIframe({ tipo: "moverVista", lat: centro.lat, lng: centro.lng, zoom });
  }, [centro.lat, centro.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (Platform.OS !== "web" || !iframeReadyRef.current || !ubicacionUsuario) return;
    sendToIframe({ tipo: "actualizarUbicacionUsuario", lat: ubicacionUsuario.lat, lng: ubicacionUsuario.lng });
  }, [ubicacionUsuario]);

  if (Platform.OS === "web") {
    return (
      // @ts-ignore
      <iframe
        ref={iframeRef}
        src={MAP_HTML}
        style={{ width: "100%", height: "100%", border: "none" }}
        onLoad={() => {
          // onLoad dispara cuando el script del iframe ya se ejecutó y registró
          // su propio listener de mensajes. Enviamos siempre el estado completo
          // aquí como fallback por si el mensaje "listo" llegó antes de que
          // nuestro listener estuviera activo.
          iframeReadyRef.current = true;
          initIframe();
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={MAP_HTML}
        onMessage={(e) => handleMessage(e.nativeEvent.data)}
        onLoad={onLoad}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        style={{ flex: 1, backgroundColor: "#284a25" }}
      />

      {/* Controles de zoom (izquierda) */}
      <View style={s.zoomControls}>
        <TouchableOpacity style={s.zoomBtn} onPress={zoomIn}  activeOpacity={0.8}>
          <Text style={s.zoomTxt}>+</Text>
        </TouchableOpacity>
        <View style={s.zoomSep} />
        <TouchableOpacity style={s.zoomBtn} onPress={zoomOut} activeOpacity={0.8}>
          <Text style={s.zoomTxt}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Botón centrar en mi ubicación */}
      <TouchableOpacity style={s.centerBtn} onPress={centrar} activeOpacity={0.8}>
        <Text style={s.centerTxt}>⊙</Text>
      </TouchableOpacity>
    </View>
  );
});

export default MapaOSM;

const s = StyleSheet.create({
  zoomControls: {
    position: "absolute", top: 60, left: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 5,
  },
  zoomBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  zoomSep: { height: 1, backgroundColor: "#E5E7EB", marginHorizontal: 6 },
  zoomTxt: { fontSize: 22, fontWeight: "700", color: "#1F2937", lineHeight: 26 },
  centerBtn: {
    position: "absolute", top: 156, left: 14,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 5,
  },
  centerTxt: { fontSize: 20, color: "#1F2937" },
});
