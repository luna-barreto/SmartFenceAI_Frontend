import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, useWindowDimensions,
} from "react-native";
import {
  TriangleAlert, ShieldCheck, BatteryMedium, MapPinned,
  Bell, BellRing, Route, ChevronRight,
  FileText, Cpu, type LucideIcon,
} from "lucide-react-native";
import Svg, { Path, Polyline, Circle as SvgCircle } from "react-native-svg";
import { useAnimals } from "@hooks/useAnimals";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useAuth } from "@context/AuthContext";
import { useT } from "@context/ThemeContext";
import { Alerta } from "@/types";
import { AlertasAPI } from "@/services/api";
import { suscribirAlertas } from "@/services/socket";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import MapaOSM, { MapaOSMHandle } from "@components/MapaOSM";
import { navigateTo } from "@navigation/navigationRef";
import { centroDe } from "@utils/geo";
import {
  STATS_DEMO, ALERTAS_DEMO, CENTRO_DEMO, CERCA_DEMO, ANIMALES_DEMO,
  tiempoRelativoCorto as demoTiempoCorto,
} from "@/demo/demoData";

type IconComp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

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

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ color, up }: { color: string; up: boolean }) {
  const pts = up ? "2,14 8,10 14,7 20,5 28,3" : "2,3 8,7 14,9 20,10 28,12";
  return (
    <Svg width="100%" height={18} viewBox="0 0 32 18" preserveAspectRatio="none">
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  icono: Icon, valor, etiqueta, color, fondo, sub,
  sparkline, sparklineUp = true, bateriaPct, badge, T,
}: {
  icono: IconComp | LucideIcon;
  valor: string | number; etiqueta: string;
  color: string; fondo: string; sub?: string;
  sparkline?: boolean; sparklineUp?: boolean;
  bateriaPct?: number; badge?: string;
  T: ReturnType<typeof useT>;
}) {
  return (
    <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={st.statTop}>
        <View style={[st.statIconBox, { backgroundColor: fondo }]}>
          <Icon size={20} color={color} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[st.statValor, { color }]}>{valor}</Text>
          <Text style={[st.statEtiqueta, { color: T.txtSec }]}>{etiqueta}</Text>
        </View>
      </View>
      {sparkline && (
        <View style={st.statBottom}>
          <View style={{ flex: 1 }}><Sparkline color={color} up={sparklineUp} /></View>
          {sub && <Text style={[st.statSub, { color }]}>{sub}</Text>}
        </View>
      )}
      {badge !== undefined && (
        <View style={[st.statBadge, { backgroundColor: fondo }]}>
          <Text style={[st.statBadgeTxt, { color }]}>{badge}</Text>
        </View>
      )}
      {bateriaPct !== undefined && (
        <View style={[st.statBottom, { justifyContent: "flex-end" }]}>
          <Svg width={34} height={34} viewBox="0 0 40 40">
            <SvgCircle cx={20} cy={20} r={16} fill="none" stroke={T.borde} strokeWidth={3.5} />
            <SvgCircle cx={20} cy={20} r={16} fill="none" stroke={color} strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - bateriaPct / 100)}`}
              rotation="-90" origin="20,20"
            />
          </Svg>
        </View>
      )}
    </View>
  );
}

// ─── ModuloCard ───────────────────────────────────────────────────────────────
function ModuloCard({ icono: Icon, label, color, fondo, onPress, T }: {
  icono: IconComp; label: string; color: string; fondo: string;
  onPress: () => void; T: ReturnType<typeof useT>;
}) {
  return (
    <TouchableOpacity
      style={[st.moduloCard, { backgroundColor: T.card, borderColor: T.borde }]}
      onPress={onPress} activeOpacity={0.75}
    >
      <View style={[st.moduloIconBox, { backgroundColor: fondo }]}>
        <Icon size={18} color={color} strokeWidth={2} />
      </View>
      <Text style={[st.moduloLabel, { color: T.txtMain }]}>{label}</Text>
      <ChevronRight size={12} color={T.verde} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

// ─── ActividadRow ─────────────────────────────────────────────────────────────
type ActItem = {
  icono: LucideIcon; titulo: string; sub: string;
  tiempo: string; tiempoColor: string; fondo: string; color: string;
};

function ActividadRow({ item, T }: { item: ActItem; T: ReturnType<typeof useT> }) {
  const Ico = item.icono;
  return (
    <TouchableOpacity
      style={[st.actRow, { borderBottomColor: T.borde }]}
      activeOpacity={0.75}
      onPress={() => navigateTo("Alerts")}
    >
      <View style={[st.actIconBox, { backgroundColor: item.fondo }]}>
        <Ico size={13} color={item.color} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.actTitulo, { color: T.txtMain }]} numberOfLines={1}>{item.titulo}</Text>
        <Text style={[st.actSub, { color: T.txtSec }]} numberOfLines={1}>{item.sub}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 3 }}>
        <Text style={[st.actTiempo, { color: item.tiempoColor }]}>{item.tiempo}</Text>
        <ChevronRight size={11} color={T.txtTer} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

// ─── ResumenRow ───────────────────────────────────────────────────────────────
function ResumenRow({ icono: Ico, label, valor, color, T }: {
  icono: IconComp | LucideIcon; label: string; valor: string;
  color: string; T: ReturnType<typeof useT>;
}) {
  return (
    <TouchableOpacity
      style={[st.resRow, { borderBottomColor: T.borde }]}
      activeOpacity={0.75}
    >
      <View style={[st.resIconBox, { backgroundColor: T.verdeAlfa }]}>
        <Ico size={13} color={color} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.resLabel, { color: T.txtSec }]}>{label}</Text>
        <Text style={[st.resValor, { color: T.txtMain }]}>{valor}</Text>
      </View>
      <ChevronRight size={12} color={T.txtTer} strokeWidth={2} />
    </TouchableOpacity>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function tiempoRelativoCorto(fecha: string): string {
  const diff = (Date.now() - new Date(fecha).getTime()) / 1000;
  if (diff < 60) return "Ahora";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}

function alertaAActItem(a: Alerta, T: ReturnType<typeof useT>): ActItem {
  const esCritica = a.severidad === "CRITICA";
  const esMedia = a.severidad === "MEDIA";
  const icono = esCritica ? BellRing : esMedia ? BatteryMedium : MapPinned;
  const color = esCritica ? T.rojo : esMedia ? T.naranja : T.verde;
  const fondo = esCritica ? T.rojoBg : esMedia ? T.naranjaBg : T.verdeAlfa;
  const sub = a.animal?.nombre
    ? `${a.animal.nombre}${a.animal.finca ? " • " + a.animal.finca.nombre : ""}`
    : a.mensaje;
  return { icono, titulo: a.mensaje, sub, tiempo: tiempoRelativoCorto(a.fecha), tiempoColor: color, fondo, color };
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { animales, conectado } = useAnimals();
  const { cerca: cercaBackend } = useAnimalsCtx();
  const { usuario } = useAuth();
  const T = useT();
  const mapaRef = useRef<MapaOSMHandle>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const { width } = useWindowDimensions();
  const isLg  = width >= 1200;
  const isMd  = width < 1200;
  const isSm  = width < 640;

  const cargarAlertas = useCallback(async (fincaId: string) => {
    try {
      const { data } = await AlertasAPI.listar(fincaId);
      setAlertas(data.map((a) => ({ ...a, leida: a.estado !== "PENDIENTE", resuelta: a.estado === "RESUELTA" })));
    } catch { }
  }, []);

  useEffect(() => {
    if (usuario?.fincaId && usuario.fincaId !== "demo") cargarAlertas(usuario.fincaId);
  }, [usuario?.fincaId, cargarAlertas]);

  useEffect(() => {
    const cancelar = suscribirAlertas((alerta) => {
      setAlertas((prev) => [{ ...alerta, leida: false, resuelta: false }, ...prev.slice(0, 49)]);
    });
    return () => { cancelar?.(); };
  }, []);

  const activas      = alertas.filter((a) => !a.resuelta);
  const bateriaProm  = animales.length
    ? Math.round(animales.reduce((s, a) => s + (a.collar?.bateria ?? 0), 0) / animales.length)
    : STATS_DEMO.bateriaProm;
  const dentroCount  = animales.filter((a) => a.dentroDeCerca).length || STATS_DEMO.dentroCount;
  const fueraCount   = animales.filter((a) => !a.dentroDeCerca).length || STATS_DEMO.fueraCount;

  const cerca  = cercaBackend?.coordenadas?.length ? cercaBackend.coordenadas : CERCA_DEMO;
  const centro = cercaBackend?.coordenadas?.length ? centroDe(cerca) : CENTRO_DEMO;

  const nombre = (usuario?.nombre ?? "").split(" ")[0] || "Usuario";

  // ── Demo activity: use real alerts when connected, otherwise demo dataset ──
  const DEMO_ACTIVITY: ActItem[] = ALERTAS_DEMO.slice(0, 4).map((a) => {
    const esCritica = a.tipo === "critica" || a.tipo === "intruso";
    const esMedia   = a.tipo === "advertencia";
    const icono = esCritica ? BellRing : esMedia ? BatteryMedium : MapPinned;
    const color = esCritica ? T.rojo : esMedia ? T.naranja : T.verde;
    const fondo = esCritica ? T.rojoBg : esMedia ? T.naranjaBg : T.verdeAlfa;
    return { icono, titulo: a.titulo, sub: a.sub, tiempo: demoTiempoCorto(a.fecha), tiempoColor: color, fondo, color };
  });
  const activityItems: ActItem[] = alertas.length > 0
    ? alertas.slice(0, 4).map((a) => alertaAActItem(a, T))
    : DEMO_ACTIVITY;

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Home" />

      <View style={st.main}>
        <WebTopBar
          titulo={`Hola, ${nombre} 👋`}
          sub="Bienvenido a SmartFence AI. Aquí tienes el resumen de tu finca hoy."
          conectado={conectado}
          alertasCount={activas.length}
        />

        <ScrollView style={st.scroll} contentContainerStyle={st.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* ── Hero banner ── */}
          <View style={[st.heroBanner, { height: isLg ? 245 : isSm ? 155 : 200 }]}>
            <Image
              source={require("../../assets/vaca 32.png")}
              style={st.heroImg}
              resizeMode="cover"
            />
            <View style={st.heroOverlay} />
            <View style={[st.heroContent, { padding: isLg ? 22 : 14, gap: 6 }]}>
              <Text style={[
                st.heroTitle,
                { fontSize: isLg ? 28 : isSm ? 18 : 23, lineHeight: isLg ? 36 : isSm ? 24 : 30 },
              ]}>
                Monitorea. Protege. Optimiza.
              </Text>
              <Text style={[
                st.heroSub,
                { fontSize: isLg ? 15 : isSm ? 12 : 13 },
              ]}>
                Inteligencia que cuida tu ganado en tiempo real.
              </Text>
              <View style={[
                st.conectadoBadge,
                {
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderColor: "rgba(255,255,255,0.4)",
                  marginTop: 2,
                },
              ]}>
                <View style={[st.conectadoDot, {
                  backgroundColor: conectado ? "#76C043" : "#EF4444",
                }]} />
                <Text style={[st.conectadoTxt, { color: "#fff" }]}>
                  {conectado ? "Conectado" : "Sin conexión"}
                </Text>
              </View>
            </View>
          </View>

          {/* ── 4 Stat cards ── */}
          <View style={st.statsRow}>
            <StatCard T={T} icono={CowIcon as IconComp}
              valor={animales.length || STATS_DEMO.totalAnimales} etiqueta="Ganado activo"
              color={T.verde} fondo={T.verdeAlfa} sparkline sparklineUp sub="↑ 12% vs. ayer" />
            <StatCard T={T} icono={TriangleAlert}
              valor={activas.length || (STATS_DEMO.alertasCriticas + STATS_DEMO.alertasIntruso)} etiqueta="Alertas críticas"
              color={T.rojo} fondo={T.rojoBg} sparkline sparklineUp={false} sub={`${STATS_DEMO.alertasIntruso} intruso(s)`} />
            <StatCard T={T} icono={ShieldCheck}
              valor={`${fueraCount === 0 ? "Seguro" : `${fueraCount} fuera`}`} etiqueta="Cerca virtual"
              color={fueraCount === 0 ? T.verde : T.rojo}
              fondo={fueraCount === 0 ? T.verdeAlfa : T.rojoBg}
              badge={fueraCount === 0 ? "Perímetro seguro" : "Verificar ahora"} />
            <StatCard T={T} icono={BatteryMedium}
              valor={`${bateriaProm}%`} etiqueta="Batería promedio"
              color={T.naranja} fondo={T.naranjaBg} bateriaPct={bateriaProm} />
          </View>

          {/* ── Main content grid ── */}
          <View style={[st.contentGrid, !isLg && { flexDirection: "column" }]}>

            {/* ── LEFT: módulos + actividad reciente ── */}
            <View style={[st.leftCol, !isLg && { width: "100%" }]}>

              {/* Módulos principales */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <Text style={[st.sectionTitle, { color: T.txtMain, marginBottom: 14 }]}>
                  Módulos principales
                </Text>
                <View style={st.modulosGrid}>
                  <ModuloCard T={T} icono={CowIcon as IconComp} label="Animales"
                    color={T.verde} fondo={T.verdeAlfa} onPress={() => navigateTo("Animals")} />
                  <ModuloCard T={T} icono={MapPinned} label="Mapa / Cerca virtual"
                    color={T.verde} fondo={T.verdeAlfa} onPress={() => navigateTo("Map")} />
                  <ModuloCard T={T} icono={Bell} label="Alertas"
                    color={T.rojo} fondo={T.rojoBg} onPress={() => navigateTo("Alerts")} />
                  <ModuloCard T={T} icono={Cpu} label="Dispositivos"
                    color={T.azul} fondo={T.azulBg} onPress={() => navigateTo("Devices")} />
                </View>
              </View>

              {/* Actividad reciente */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <View style={st.cardHeader}>
                  <Text style={[st.sectionTitle, { color: T.txtMain }]}>Actividad reciente</Text>
                  <TouchableOpacity onPress={() => navigateTo("Alerts")} activeOpacity={0.75}>
                    <Text style={[st.verTodas, { color: T.verde }]}>Ver todas</Text>
                  </TouchableOpacity>
                </View>
                {activityItems.map((item, i) => (
                  <ActividadRow key={i} item={item} T={T} />
                ))}
              </View>
            </View>

            {/* ── CENTER: Mapa de la finca ── */}
            <View style={[st.centerCol, !isLg && { width: "100%" }]}>
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde, flex: 1 }]}>
                <View style={st.cardHeader}>
                  <Text style={[st.sectionTitle, { color: T.txtMain }]}>Mapa de la finca</Text>
                  <TouchableOpacity onPress={() => navigateTo("Map")} activeOpacity={0.75}>
                    <Text style={[st.verTodas, { color: T.verde }]}>Ver mapa completo</Text>
                  </TouchableOpacity>
                </View>

                {/* Map container */}
                <View style={st.mapContainer}>
                  <MapaOSM
                    ref={mapaRef}
                    animales={(animales.length > 0 ? animales : ANIMALES_DEMO.map((a) => ({
                      id: a.id,
                      codigo: a.identificacion,
                      nombre: a.displayNombre,
                      raza: a.raza,
                      fincaId: "demo",
                      ubicacion: a.ubicacion,
                      dentroDeCerca: a.dentroDeCerca,
                      peso: a.peso,
                      saludLabel: a.salud.label,
                      saludR: a.salud.r,
                      saludG: a.salud.g,
                      saludB: a.salud.b,
                      collar: {
                        id: a.collarId,
                        serial: a.collarId,
                        fincaId: "demo",
                        activo: a.estadoCollar !== "cortado" && a.estadoCollar !== "retirado",
                        bateria: a.bateria,
                        bateriaPorcentaje: a.bateria,
                        estado: (
                          a.estadoCollar === "en_linea" || a.estadoCollar === "bateria_baja"
                            ? "en_linea"
                            : a.estadoCollar === "sin_señal"
                            ? "sin_señal"
                            : "fuera_de_rango"
                        ) as "en_linea" | "sin_señal" | "fuera_de_rango",
                      },
                    }))) as any}
                    cerca={cerca}
                    centro={centro}
                    editando={false}
                    onGuardarCerca={() => {}}
                    ubicacionUsuario={null}
                  />
                </View>

                {/* Map legend */}
                <View style={[st.mapLegend, { borderTopColor: T.borde }]}>
                  <View style={st.legendItem}>
                    <View style={[st.legendDot, { backgroundColor: T.verde }]} />
                    <Text style={[st.legendTxt, { color: T.txtSec }]}>Dentro ({dentroCount})</Text>
                  </View>
                  <View style={st.legendItem}>
                    <View style={[st.legendDot, { backgroundColor: T.rojo }]} />
                    <Text style={[st.legendTxt, { color: T.txtSec }]}>Fuera ({fueraCount})</Text>
                  </View>
                  <View style={st.legendItem}>
                    <View style={[st.legendDot, { backgroundColor: T.azul }]} />
                    <Text style={[st.legendTxt, { color: T.txtSec }]}>Dispositivo</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── RIGHT: Resumen de hoy ── */}
            <View style={[st.rightCol, !isLg && { width: "100%" }]}>

              {/* Resumen */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <Text style={[st.sectionTitle, { color: T.txtMain, marginBottom: 10 }]}>
                  Resumen de hoy
                </Text>
                <ResumenRow T={T} icono={Route}            label="Distancia recorrida" valor="2.4 km"                    color={T.verde}  />
                <ResumenRow T={T} icono={CowIcon as IconComp} label="Animales activos" valor={String(animales.length || 10)} color={T.verde}  />
                <ResumenRow T={T} icono={BatteryMedium}    label="Batería promedio"    valor={`${bateriaProm}%`}          color={T.naranja} />
                <ResumenRow T={T} icono={TriangleAlert}    label="Alertas activas"     valor={String(activas.length)}    color={T.rojo}   />
              </View>

              {/* Ver reporte diario */}
              <TouchableOpacity
                style={[st.reporteBtn, { backgroundColor: T.verdeOscuro }]}
                onPress={() => navigateTo("Alerts")}
                activeOpacity={0.75}
              >
                <FileText size={18} color="#fff" strokeWidth={2} />
                <Text style={st.reporteBtnTxt}>Ver reporte diario</Text>
              </TouchableOpacity>

            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:          { flex: 1, flexDirection: "row" },
  main:          { flex: 1, flexDirection: "column" },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 80, gap: 16 },

  // Hero
  heroBanner:  { height: 150, borderRadius: 14, overflow: "hidden" },
  heroImg:     { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  heroOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.25)" },
  heroContent: { position: "absolute", bottom: 0, left: 0, padding: 14, gap: 4 },
  heroTitle:   { fontSize: 20, fontWeight: "900", color: "#fff", lineHeight: 26 },
  heroSub:     { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  conectadoBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: "flex-start", marginTop: 4,
  },
  conectadoDot: { width: 7, height: 7, borderRadius: 4 },
  conectadoTxt: { fontSize: 12, fontWeight: "700" },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  statCard: { flex: 1, borderRadius: 16, padding: 12, borderWidth: 1, minWidth: 130 },
  statTop:  { flexDirection: "row", alignItems: "center", gap: 10 },
  statIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statValor:    { fontSize: 20, fontWeight: "900", lineHeight: 24 },
  statEtiqueta: { fontSize: 10.5, fontWeight: "500", marginTop: 2 },
  statBottom:   { flexDirection: "row", alignItems: "center", marginTop: 8, overflow: "hidden" },
  statSub:      { fontSize: 10.5, fontWeight: "700", flexShrink: 0, paddingLeft: 6 },
  statBadge:    { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, marginTop: 8 },
  statBadgeTxt: { fontSize: 10, fontWeight: "700" },

  // Content grid — 3 columns
  contentGrid: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  leftCol:   { flex: 1.4, gap: 16, minWidth: 240 },
  centerCol: { flex: 1.8, gap: 16, minWidth: 280 },
  rightCol:  { width: 272, gap: 14, flexShrink: 0 },

  // Generic card
  card:       { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  verTodas:     { fontSize: 12, fontWeight: "700" },

  // Módulos
  modulosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  moduloCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, borderWidth: 1, padding: 11,
    flexBasis: "45%", flexGrow: 1,
  },
  moduloIconBox: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  moduloLabel:   { flex: 1, fontSize: 12, fontWeight: "600" },

  // Actividad
  actRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    paddingVertical: 9, borderBottomWidth: 1,
  },
  actIconBox: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  actTitulo:  { fontSize: 12.5, fontWeight: "700" },
  actSub:     { fontSize: 11, marginTop: 1 },
  actTiempo:  { fontSize: 10.5, fontWeight: "600", flexShrink: 0 },

  // Map
  mapContainer: { borderRadius: 12, overflow: "hidden", height: 290 },
  mapLegend: {
    flexDirection: "row", gap: 16, paddingTop: 10,
    borderTopWidth: 1, marginTop: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:  { width: 9, height: 9, borderRadius: 5 },
  legendTxt:  { fontSize: 11, fontWeight: "600" },

  // Resumen
  resRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 8, borderBottomWidth: 1,
  },
  resIconBox: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  resLabel:   { fontSize: 10.5 },
  resValor:   { fontSize: 13.5, fontWeight: "800" },

  // Report button
  reporteBtn: {
    borderRadius: 13, padding: 14, flexDirection: "row",
    gap: 8, justifyContent: "center", alignItems: "center",
  },
  reporteBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
