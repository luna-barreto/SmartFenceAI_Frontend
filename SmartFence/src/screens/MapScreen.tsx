import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, ScrollView,
  Modal, TextInput, KeyboardAvoidingView, Alert, ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import {
  Menu, Bell, Search, SlidersHorizontal,
  Pencil, Plus, ChevronDown, ShieldCheck, X, Check, MapPin,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { CERCA_DEMO } from "@hooks/useAnimals";
import { useDrawer } from "@context/DrawerContext";
import { useT } from "@context/ThemeContext";
import { centroDe, generarPoligonoCentrado, translatePolygon } from "@utils/geo";
import { Coordenada } from "@/types";
import MapaOSM, { MapaOSMHandle } from "@components/MapaOSM";
import { CercasAPI } from "@services/api";
import { useAuth } from "@context/AuthContext";

const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

// ─── CowIcon ──────────────────────────────────────────────────────────────────
function CowIcon({ size = 22, color = "#76C043" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M6.27335 12.5175875c0 0.22014375 -0.17846875 0.3986 -0.3986125 0.3986125H4.81178125c-0.30685625 -0.0000125 -0.4986375 -0.3322 -0.3452 -0.59793125 0.07120625 -0.12331875 0.2028 -0.1992875 0.3452 -0.19929375h1.06295625c0.22014375 0.0000125 0.3986125 0.178475 0.3986125 0.3986125Zm4.9162 -0.3986125h-1.0629625c-0.30685 0.00001875 -0.49863125 0.3322 -0.34519375 0.59793125 0.0712 0.12331875 0.2028 0.1992875 0.34519375 0.19929375h1.0629625c0.30685 -0.0000125 0.4986375 -0.3322 0.3452 -0.59793125 -0.07120625 -0.12331875 -0.2028 -0.1992875 -0.3452 -0.19929375Zm-5.04906875 -4.783325c-0.51141875 0 -0.83105625 0.553625 -0.57534375 0.996525 0.25570625 0.4429 0.89498125 0.4429 1.1506875 0 0.0583125 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.2974375 -0.66435 -0.66435 -0.66435Zm3.72036875 0c-0.51141875 0 -0.83105625 0.553625 -0.57535 0.996525 0.2557125 0.4429 0.89498125 0.4429 1.15069375 0 0.05830625 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.29744375 -0.66435 -0.66435 -0.66435Zm5.7698875 0.45508125c-0.17666875 0.21655 -0.44134375 0.34218125 -0.72081875 0.3421375H12.651125v2.32855c1.5828375 1.12755625 1.3515 3.54575 -0.41640625 4.35275 -0.32810625 0.149775 -0.68449375 0.2275 -1.04516875 0.22795625H4.81178125c-1.9433875 -0.0024375 -3.15536875 -2.10773125 -2.18156875 -3.7895375 0.180725 -0.312125 0.4262375 -0.58190625 0.71999375 -0.79116875v-2.32855H1.0914125c-0.2799375 0.00044375 -0.5451875 -0.125225 -0.72215 -0.3421375 -0.17531875 -0.21299375 -0.245575 -0.493525 -0.19133125 -0.76400625 0.3399375 -1.6740625 1.8108375 -2.87783125 3.51906875 -2.8799625h0.4577375c-0.84463125 -0.68 -1.33585625 -1.70593125 -1.3360125 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.123325 0.07120625 0.1993 0.20279375 0.1993 0.34520625 0 1.541025 1.24925 2.790275 2.790275 2.790275h3.1888875c1.540975 -0.00006875 2.790275 -1.2493 2.790275 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.12333125 0.07120625 0.1993 0.20279375 0.1993 0.34520625 -0.00015625 1.08434375 -0.49138125 2.110275 -1.33600625 2.790275h0.4577375c1.707725 0.0027625 3.1779 1.2063875 3.5177375 2.8799625 0.0542375 0.27048125 -0.0160125 0.5510125 -0.19133125 0.76400625Zm-12.28053125 -0.45508125v-0.66435c-0.00028125 -0.642175 0.24500625 -1.26014375 0.6856125 -1.72731875h-0.338825c-1.328925 0.00055 -2.47380625 0.93655625 -2.73845 2.23886875 -0.007425 0.03658125 0.002375 0.07455 0.02656875 0.102975 0.02578125 0.03220625 0.06505 0.05061875 0.1063 0.049825Zm9.56665625 5.1819375c0 -0.954 -0.7733125 -1.72735625 -1.7273125 -1.7273125H4.81178125c-1.3296875 0 -2.16074375 1.439425 -1.4959 2.59096875 0.30855625 0.53443125 0.8787875 0.86365625 1.4959 0.86365625h6.37776875c0.954 0.00004375 1.7273125 -0.7733125 1.7273125 -1.7273125Zm-1.0629625 -2.4355125v-3.410775c0 -0.95396875 -0.77334375 -1.72731875 -1.7273125 -1.72731875H5.8747375c-0.95396875 0 -1.7273125 0.77335 -1.7273125 1.72731875v3.410775c0.21650625 -0.05911875 0.439925 -0.08905625 0.66435625 -0.08901875h6.37776875c0.224425 -0.0000375 0.44785 0.0299 0.66435 0.08901875Zm3.1888875 -2.899225c-0.26465 -1.3023125 -1.409525 -2.23831875 -2.73845625 -2.23886875h-0.33881875c0.44060625 0.467175 0.68589375 1.08514375 0.6856125 1.72731875v0.66435h2.25879375c0.04078125 0.00038125 0.07948125 -0.0179875 0.10496875 -0.049825 0.02466875 -0.02819375 0.0349625 -0.0661875 0.0279 -0.102975Z"
        fill={color} strokeWidth={0.0625}
      />
    </Svg>
  );
}

// ─── Stat card del mapa ───────────────────────────────────────────────────────
function MapStat({
  icon: Icon, label, valor, sub, subColor,
}: {
  icon: React.ComponentType<any>;
  label: string;
  valor: string | number;
  sub: string;
  subColor: string;
}) {
  const T = useT();
  return (
    <View style={[st.mapStat, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={st.mapStatIcon}>
        <Icon size={20} color={subColor} />
      </View>
      <Text style={[st.mapStatLabel, { color: T.txtSec }]}>{label}</Text>
      <Text style={[st.mapStatValor, { color: subColor === T.txtSec ? T.txtMain : subColor }]}>{valor}</Text>
      <Text style={[st.mapStatSub, { color: subColor }]}>{sub}</Text>
    </View>
  );
}

// ─── Modal nueva geocerca ────────────────────────────────────────────────────
function NuevaGeocercaModal({
  visible, onCerrar, onGuardado, fincaId, cercaActual, ubicacionUsuario,
}: {
  visible: boolean;
  onCerrar: () => void;
  onGuardado?: () => void;
  fincaId?: string;
  cercaActual: Coordenada[];
  ubicacionUsuario: Coordenada | null;
}) {
  const T = useT();
  const [nombre,    setNombre]    = useState("");
  const [potrero,   setPotrero]   = useState("");
  const [guardando, setGuardando] = useState(false);

  function limpiar() { setNombre(""); setPotrero(""); }

  async function guardar() {
    if (!nombre.trim()) { Alert.alert("Campo requerido", "El nombre de la geocerca es obligatorio."); return; }
    setGuardando(true);
    try {
      await CercasAPI.crear({
        fincaId: fincaId,
        nombre: nombre.trim(),
        coordenadas: cercaActual,
        latitudDispositivo: ubicacionUsuario?.lat,
        longitudDispositivo: ubicacionUsuario?.lng,
      });
      limpiar();
      onGuardado?.();
      onCerrar();
      Alert.alert("✓ Geocerca creada", `"${nombre.trim()}" ha sido guardada en el servidor.`);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Error desconocido";
      Alert.alert("Error al guardar", msg);
    } finally {
      setGuardando(false);
    }
  }

  function cerrar() { limpiar(); onCerrar(); }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={cerrar}>
      <KeyboardAvoidingView style={gm.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={gm.backdrop} activeOpacity={1} onPress={cerrar} />
        <View style={[gm.sheet, { backgroundColor: T.card, borderTopColor: T.borde }]}>
          <View style={[gm.handle, { backgroundColor: T.borde }]} />
          <View style={gm.header}>
            <Text style={[gm.titulo, { color: T.txtMain }]}>Nueva geocerca</Text>
            <TouchableOpacity style={[gm.closeBtn, { backgroundColor: T.cardElevada }]} onPress={cerrar} activeOpacity={0.7}>
              <X size={18} color={T.txtSec} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={[gm.desc, { color: T.txtSec }]}>
            Define el nombre y el potrero. Luego podrás dibujar el perímetro en el mapa.
          </Text>

          <Text style={[gm.label, { color: T.txtSec }]}>Nombre de la geocerca *</Text>
          <View style={[gm.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput
              style={[gm.input, { color: T.txtMain }]}
              value={nombre} onChangeText={setNombre}
              placeholder="Ej. Potrero Norte, Zona A..." placeholderTextColor={T.txtSec} autoFocus
            />
          </View>

          <Text style={[gm.label, { color: T.txtSec }]}>Potrero asociado</Text>
          <View style={[gm.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput
              style={[gm.input, { color: T.txtMain }]}
              value={potrero} onChangeText={setPotrero}
              placeholder="Ej. Potrero Norte..." placeholderTextColor={T.txtSec}
            />
          </View>

          <TouchableOpacity
            style={[gm.btnGuardar, { backgroundColor: T.verdeOscuro }, guardando && { opacity: 0.7 }]}
            onPress={guardar} activeOpacity={0.85} disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Check size={16} color="#fff" strokeWidth={2.5} /><Text style={gm.btnTxt}>Crear geocerca</Text></>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const gm = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, gap: 10,
    borderTopWidth: 1,
  },
  handle:   { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  header:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titulo:   { fontSize: 17, fontWeight: "800" },
  closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  desc:     { fontSize: 12.5, lineHeight: 18 },
  label:    { fontSize: 12, fontWeight: "700", marginTop: 2 },
  inputWrap:{ borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14 },
  input:    { fontSize: 15, paddingVertical: 11 },
  btnGuardar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 16, paddingVertical: 15, marginTop: 4,
  },
  btnTxt: { fontSize: 15, fontWeight: "800", color: "#fff" },
});

// ─── MapScreen ────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const { width: SW } = useWindowDimensions();
  const MAP_H = SW * 0.88;
  const { openDrawer } = useDrawer();
  const T = useT();
  const { usuario } = useAuth();
  const nombreFinca = usuario?.finca ?? "Mi finca";

  const { animales, cerca: cercaBackend, cargandoCerca, recargar: recargarContexto } = useAnimalsCtx();

  // Usa la geocerca real del backend; CERCA_DEMO solo si no hay backend todavía
  const hayGeocercaReal = !!cercaBackend?.coordenadas?.length;
  const nombreGeocerca = cercaBackend?.nombre ?? (hayGeocercaReal ? "Geocerca activa" : "Sin geocerca");
  // Inicializar desde el contexto directamente para que al volver a la pantalla
  // no se muestre CERCA_DEMO mientras llega el primer render del useEffect.
  const [cerca, setCerca] = useState<Coordenada[]>(
    () => cercaBackend?.coordenadas?.length ? cercaBackend.coordenadas : CERCA_DEMO
  );
  const cercaRecentradaRef = useRef(false);
  useEffect(() => {
    if (!hayGeocercaReal) return;
    if (bloqueandoSyncRef.current) return; // no pisar edición local
    setCerca(cercaBackend!.coordenadas);
  }, [hayGeocercaReal, cercaBackend]);

  const cercaIdRef = useRef<string | undefined>(cercaBackend?.id);
  useEffect(() => { cercaIdRef.current = cercaBackend?.id; }, [cercaBackend]);

  // true mientras el usuario está en modo edición o justo acaba de guardar,
  // para que el efecto de sincronización del backend no pise los coords locales.
  const bloqueandoSyncRef = useRef(false);

  const mapaRef = useRef<MapaOSMHandle>(null);

  const [editando, setEditando]           = useState(false);
  const [guardandoCerca, setGuardandoCerca] = useState(false);
  const [modalGeocerca, setModalGeocerca] = useState(false);
  const modalGuardadoRef = useRef(false);
  // snapshot de coords al entrar en edición — para restaurar si se cancela
  const cercaSnapshotRef = useRef<Coordenada[]>([]);

  // GPS del dispositivo — siempre activo.
  // · Muestra el punto azul del usuario en el mapa.
  // · Centra el mapa en el usuario si aún no hay geocerca real guardada.
  // · Genera el polígono inicial al crear una nueva geocerca.
  const [ubicacionUsuario, setUbicacionUsuario] = useState<Coordenada | null>(null);

  // Cuando llega el GPS por primera vez y no hay geocerca real, recentrar la
  // cerca demo en la ubicación actual para que sea visible en el mapa.
  // Espera a que la carga del backend termine antes de generar el cuadrado,
  // para no sobreescribir una geocerca real que todavía está en vuelo.
  useEffect(() => {
    if (cargandoCerca) return;                 // esperar a que el backend responda
    if (hayGeocercaReal) return;               // ya hay geocerca del backend
    if (cercaRecentradaRef.current) return;    // ya se recentró antes
    if (!ubicacionUsuario) return;
    cercaRecentradaRef.current = true;
    setCerca(generarPoligonoCentrado(ubicacionUsuario, 300));
  }, [ubicacionUsuario, hayGeocercaReal, cargandoCerca]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      try {
        const Location = await import("expo-location").catch(() => null);
        if (!Location) return;
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUbicacionUsuario({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 5 },
          (l) => setUbicacionUsuario({ lat: l.coords.latitude, lng: l.coords.longitude })
        );
        unsub = () => sub.remove();
      } catch { /* GPS no disponible en este entorno */ }
    })();
    return () => { unsub?.(); };
  }, []);

  // Centro del mapa:
  // - Sin geocerca real → sigue al GPS del usuario en tiempo real.
  // - Con geocerca real → usa el centroide de la geocerca (fijo).
  const centroFallback: Coordenada = ubicacionUsuario ?? { lat: 6.2, lng: -75.59 };
  const centro: Coordenada = hayGeocercaReal && cerca.length
    ? centroDe(cerca)
    : centroFallback;
  const fueraCount  = animales.filter((a) => !a.dentroDeCerca).length;
  const dentroCount = animales.length - fueraCount;
  const alertasAct  = fueraCount;

  const areaHa = useCallback(() => {
    const pts = cerca;
    if (pts.length < 3) return 0;
    let area = 0;
    const R = 6371000;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const xi = pts[i].lng * (Math.PI / 180) * R * Math.cos(pts[i].lat * Math.PI / 180);
      const yi = pts[i].lat * (Math.PI / 180) * R;
      const xj = pts[j].lng * (Math.PI / 180) * R * Math.cos(pts[j].lat * Math.PI / 180);
      const yj = pts[j].lat * (Math.PI / 180) * R;
      area += xi * yj - xj * yi;
    }
    return Math.abs(area / 2) / 10000;
  }, [cerca]);

  const perimetroKm = useCallback(() => {
    let d = 0;
    for (let i = 0; i < cerca.length; i++) {
      const j = (i + 1) % cerca.length;
      const R = 6371;
      const dLat = (cerca[j].lat - cerca[i].lat) * Math.PI / 180;
      const dLng = (cerca[j].lng - cerca[i].lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(cerca[i].lat * Math.PI / 180) *
        Math.cos(cerca[j].lat * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
      d += 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return d;
  }, [cerca]);

  // Solo actualiza estado local mientras el usuario arrastra vértices.
  function guardarCerca(nuevaPuntos: Coordenada[]) {
    setCerca(nuevaPuntos);
  }

  function iniciarEdicion() {
    cercaSnapshotRef.current = cerca;
    bloqueandoSyncRef.current = true;
    setEditando(true);
  }

  function cancelarEdicion() {
    bloqueandoSyncRef.current = false;
    setCerca(cercaSnapshotRef.current);
    setEditando(false);
  }

  async function confirmarGuardado() {
    const fincaId = usuario?.fincaId;
    if (!fincaId || fincaId === "demo") {
      setEditando(false);
      return;
    }
    setGuardandoCerca(true);
    try {
      const id = cercaIdRef.current;
      if (!id) {
        const { data } = await CercasAPI.crear({
          fincaId,
          nombre: "Geocerca principal",
          coordenadas: cerca,
          latitudDispositivo: ubicacionUsuario?.lat,
          longitudDispositivo: ubicacionUsuario?.lng,
        });
        cercaIdRef.current = data.id;
      } else {
        await CercasAPI.actualizar(id, { coordenadas: cerca });
      }
      setEditando(false);
      bloqueandoSyncRef.current = false;
      recargarContexto();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Error desconocido";
      Alert.alert("Error al guardar", msg);
    } finally {
      setGuardandoCerca(false);
    }
  }

  async function moverCercaAMiUbicacion() {
    if (!ubicacionUsuario) {
      Alert.alert("Sin GPS", "Esperando señal GPS. Inténtalo de nuevo en unos segundos.");
      return;
    }
    const fincaId = usuario?.fincaId;
    if (!fincaId || fincaId === "demo") return;
    const oldCenter = centroDe(cerca);
    const nuevaCerca = translatePolygon(cerca, oldCenter, ubicacionUsuario);
    setCerca(nuevaCerca);
    setGuardandoCerca(true);
    try {
      const id = cercaIdRef.current;
      if (id) {
        await CercasAPI.actualizar(id, { coordenadas: nuevaCerca });
      } else {
        const { data } = await CercasAPI.crear({
          fincaId,
          nombre: "Geocerca principal",
          coordenadas: nuevaCerca,
          latitudDispositivo: ubicacionUsuario.lat,
          longitudDispositivo: ubicacionUsuario.lng,
        });
        cercaIdRef.current = data.id;
      }
      recargarContexto();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? e?.message ?? "Error desconocido");
    } finally {
      setGuardandoCerca(false);
    }
  }

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>

      {/* ── Header ── */}
      <View style={[st.header, { backgroundColor: T.header, borderBottomColor: T.borde }]}>
        <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={openDrawer} activeOpacity={0.7}>
          <Menu size={20} color={T.txtMain} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={st.headerLogo}>
          <Image source={require("../../assets/logotipo.png")} style={st.headerLogoImg} resizeMode="contain" />
          <Text style={st.headerBrand}>
            <Text style={{ color: T.txtMain, fontWeight: "700" }}>SMART</Text>
            <Text style={{ color: T.verde, fontWeight: "900" }}>FENCE</Text>
            <Text style={{ color: T.verdeBrillo, fontWeight: "900" }}> AI</Text>
          </Text>
        </View>
        <View style={st.headerRight}>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} activeOpacity={0.7}>
            <Search size={20} color={T.txtMain} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} activeOpacity={0.7}>
            <SlidersHorizontal size={20} color={T.txtMain} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Título ── */}
        <Text style={[st.pageTitle, { color: T.txtMain }]}>Cerca virtual</Text>

        {/* ── 4 stats ── */}
        <View style={st.statsRow}>
          <MapStat
            icon={CowIcon}    label="Animales"       valor={animales.length}
            sub="Total"        subColor={T.verde}
          />
          <MapStat
            icon={CowIcon}    label="Fuera de la cerca" valor={fueraCount}
            sub={fueraCount > 0 ? "En este momento" : "Todos dentro"}
            subColor={fueraCount > 0 ? T.rojo : T.verde}
          />
          <MapStat
            icon={Bell}       label="Alertas"        valor={alertasAct}
            sub={alertasAct > 0 ? "Activas" : "Sin alertas"}
            subColor={alertasAct > 0 ? T.naranja : T.txtSec}
          />
          <MapStat
            icon={ShieldCheck} label="Estado"        valor="Activa"
            sub="Perímetro seguro" subColor={T.verde}
          />
        </View>

        {/* ── Contenedor del mapa ── */}
        <View style={[st.mapContainer, { borderColor: T.borde, height: MAP_H }]}>
          <MapaOSM
            ref={mapaRef}
            animales={animales}
            cerca={cerca}
            centro={centro}
            editando={editando}
            onGuardarCerca={guardarCerca}
            ubicacionUsuario={ubicacionUsuario}
          />

          {/* Botones flotantes inferiores */}
          {!editando && (
            <View style={st.mapActions}>
              {ubicacionUsuario && hayGeocercaReal && (
                <TouchableOpacity
                  style={[st.btnMover, { backgroundColor: T.card, borderColor: T.borde }]}
                  onPress={moverCercaAMiUbicacion}
                  activeOpacity={0.85}
                  disabled={guardandoCerca}
                >
                  <MapPin size={15} color={T.verde} strokeWidth={2} />
                  <Text style={[st.btnMoverTxt, { color: T.verde }]}>Mover cerca a mi ubicación</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[st.btnEditar, { backgroundColor: T.card, borderColor: T.borde }]}
                onPress={iniciarEdicion}
                activeOpacity={0.85}
              >
                <Pencil size={15} color={T.txtMain} strokeWidth={2} />
                <Text style={[st.btnEditarTxt, { color: T.txtMain }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.btnNueva, { backgroundColor: T.verdeOscuro }]}
                activeOpacity={0.85}
                onPress={() => {
                  const origen = ubicacionUsuario ?? (cerca.length ? centroDe(cerca) : centroFallback);
                  const nuevasCoordenadas = generarPoligonoCentrado(origen, 150);
                  cercaSnapshotRef.current = cerca;
                  setCerca(nuevasCoordenadas);
                  if (ubicacionUsuario) {
                    mapaRef.current?.centerarEnUsuario();
                  }
                  setModalGeocerca(true);
                }}
              >
                <Plus size={15} color="#fff" strokeWidth={2.5} />
                <Text style={st.btnNuevaTxt}>Nueva geocerca</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Leyenda */}
          {!editando && (
            <View style={[st.leyenda, { backgroundColor: T.card, borderColor: T.borde }]}>
              <View style={st.leyendaRow}>
                <View style={[st.leyendaDot, { backgroundColor: T.verde }]} />
                <Text style={[st.leyendaTxt, { color: T.txtMain }]}>Dentro de la cerca</Text>
              </View>
              <View style={st.leyendaRow}>
                <View style={[st.leyendaDot, { backgroundColor: T.rojo }]} />
                <Text style={[st.leyendaTxt, { color: T.txtMain }]}>Fuera de la cerca</Text>
              </View>
              <View style={st.leyendaRow}>
                <View style={[st.leyendaDot, { backgroundColor: T.azul }]} />
                <Text style={[st.leyendaTxt, { color: T.txtMain }]}>Tu ubicación</Text>
              </View>
              <View style={st.leyendaRow}>
                <View style={[st.leyendaLine, { backgroundColor: T.verde }]} />
                <Text style={[st.leyendaTxt, { color: T.txtMain }]}>Geocerca</Text>
              </View>
              <View style={st.leyendaRow}>
                <View style={[st.leyendaLineDash, { borderColor: T.rojo }]} />
                <Text style={[st.leyendaTxt, { color: T.txtMain }]}>Ruptura de cerca</Text>
              </View>
            </View>
          )}

          {/* Banner modo edición */}
          {editando && (
            <View style={[st.editBanner, { backgroundColor: T.verdeOscuro }]}>
              <Text style={st.editBannerTxt}>Arrastra los puntos para editar</Text>
              <TouchableOpacity style={st.editCancelBtn} onPress={cancelarEdicion} activeOpacity={0.8} disabled={guardandoCerca}>
                <Text style={st.editCancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.editSaveBtn, guardandoCerca && { opacity: 0.6 }]}
                onPress={confirmarGuardado}
                activeOpacity={0.8}
                disabled={guardandoCerca}
              >
                {guardandoCerca
                  ? <ActivityIndicator size="small" color={T.verdeOscuro} />
                  : <><Check size={13} color={T.verdeOscuro} strokeWidth={3} /><Text style={[st.editSaveTxt, { color: T.verdeOscuro }]}>Guardar</Text></>
                }
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* ── Panel inferior: info de finca ── */}
        <View style={[st.fincaPanel, { backgroundColor: T.card, borderColor: T.borde }]}>
          {/* Finca selector */}
          <View style={st.fincaHeader}>
            <View style={[st.fincaIconBox, { backgroundColor: T.verdeLuz }]}>
              <CowIcon size={26} color={T.verde} />
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={st.fincaNameRow} activeOpacity={0.75}>
                <Text style={[st.fincaNombre, { color: T.txtMain }]}>{nombreFinca}</Text>
                <ChevronDown size={14} color={T.txtMain} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={[st.fincaPotrero, { color: T.txtSec }]}>{nombreGeocerca}</Text>
            </View>
          </View>

          {/* Métricas */}
          <View style={st.metricasRow}>
            <View style={st.metricaItem}>
              <Svg width={20} height={20} viewBox="0 0 20 20">
                <Path d="M2 2h6M2 2v6M18 2h-6M18 2v6M2 18h6M2 18v-6M18 18h-6M18 18v-6"
                  fill="none" stroke={T.verde} strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
              <View>
                <Text style={[st.metricaLabel, { color: T.txtSec }]}>Área total</Text>
                <Text style={[st.metricaValor, { color: T.txtMain }]}>{areaHa().toFixed(1)} ha</Text>
              </View>
            </View>
            <View style={st.metricaItem}>
              <Svg width={20} height={20} viewBox="0 0 20 20">
                <Path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2z"
                  fill="none" stroke={T.verde} strokeWidth={1.8} />
              </Svg>
              <View>
                <Text style={[st.metricaLabel, { color: T.txtSec }]}>Perímetro</Text>
                <Text style={[st.metricaValor, { color: T.txtMain }]}>{perimetroKm().toFixed(2)} km</Text>
              </View>
            </View>
            <View style={st.metricaItem}>
              <CowIcon size={20} color={T.verde} />
              <View>
                <Text style={[st.metricaLabel, { color: T.txtSec }]}>Animales dentro</Text>
                <Text style={[st.metricaValor, { color: T.txtMain }]}>{dentroCount}</Text>
              </View>
            </View>
            <View style={st.metricaItem}>
              <CowIcon size={20} color={T.rojo} />
              <View>
                <Text style={[st.metricaLabel, { color: T.txtSec }]}>Animales fuera</Text>
                <Text style={[st.metricaValor, { color: fueraCount > 0 ? T.rojo : T.txtMain }]}>
                  {fueraCount}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <NuevaGeocercaModal
        visible={modalGeocerca}
        onGuardado={() => {
          modalGuardadoRef.current = true;
          recargarContexto();
        }}
        onCerrar={() => {
          setModalGeocerca(false);
          if (!modalGuardadoRef.current) {
            setCerca(cercaSnapshotRef.current);
          }
          modalGuardadoRef.current = false;
        }}
        fincaId={usuario?.fincaId}
        cercaActual={cerca}
        ubicacionUsuario={ubicacionUsuario}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: STATUS_BAR_H + HEADER_EXTRA_PT,
    paddingBottom: 12, paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  headerLogo:    { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogoImg: { width: 30, height: 30, borderRadius: 8 },
  headerBrand:   { fontSize: 13, letterSpacing: 0.4 },
  headerRight:   { flexDirection: "row", alignItems: "center", gap: 8 },

  scroll: { padding: 16, gap: 14 },

  pageTitle: { fontSize: 26, fontWeight: "900", letterSpacing: -0.3 },

  // Stats
  statsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  mapStat: {
    flex: 1,
    minWidth: 68,
    borderRadius: 18, borderWidth: 1,
    padding: 10, gap: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  mapStatIcon:  { marginBottom: 4 },
  mapStatLabel: { fontSize: 9.5, fontWeight: "500" },
  mapStatValor: { fontSize: 18, fontWeight: "900" },
  mapStatSub:   { fontSize: 9, fontWeight: "600", marginTop: 1 },

  // Mapa
  mapContainer: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },

  // Acciones flotantes
  mapActions: {
    position: "absolute", bottom: 16, right: 14,
    gap: 10, alignItems: "flex-end",
  },
  btnMover: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  btnMoverTxt: { fontSize: 13, fontWeight: "700" },
  btnEditar: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  btnEditarTxt: { fontSize: 13, fontWeight: "700" },
  btnNueva: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: "#4F9E2C", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  btnNuevaTxt: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // Leyenda
  leyenda: {
    position: "absolute", bottom: 110, right: 14,
    borderRadius: 14, padding: 10, gap: 5,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  leyendaRow:     { flexDirection: "row", alignItems: "center", gap: 7 },
  leyendaDot:     { width: 10, height: 10, borderRadius: 5 },
  leyendaLine:    { width: 18, height: 3, borderRadius: 2 },
  leyendaLineDash: {
    width: 18, height: 0,
    borderWidth: 1.5, borderStyle: "dashed",
  },
  leyendaTxt: { fontSize: 10.5, fontWeight: "500" },

  // Banner edición
  editBanner: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10,
  },
  editBannerTxt: { fontSize: 12, color: "#fff", fontWeight: "600", flex: 1 },
  editCancelBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
  },
  editCancelTxt: { fontSize: 12, color: "#fff", fontWeight: "700" },
  editSaveBtn: {
    backgroundColor: "#fff",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
    flexDirection: "row", alignItems: "center", gap: 4, marginLeft: 6,
  },
  editSaveTxt: { fontSize: 12, fontWeight: "800" },

  savingBanner: {
    position: "absolute", bottom: 60, left: 14,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  savingTxt: { fontSize: 12, fontWeight: "600" },

  // Panel finca
  fincaPanel: {
    borderRadius: 24, borderWidth: 1,
    padding: 16, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 3,
  },
  fincaHeader:  { flexDirection: "row", alignItems: "center", gap: 12 },
  fincaIconBox: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  fincaNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  fincaNombre:  { fontSize: 16, fontWeight: "800" },
  fincaPotrero: { fontSize: 12, marginTop: 2 },

  metricasRow: { flexDirection: "row", justifyContent: "space-between" },
  metricaItem: { alignItems: "center", gap: 4 },
  metricaLabel: { fontSize: 9.5, textAlign: "center" },
  metricaValor: { fontSize: 14, fontWeight: "800", textAlign: "center" },
});
