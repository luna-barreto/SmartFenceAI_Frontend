import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import {
  TriangleAlert,
  ShieldCheck,
  BatteryMedium,
  MapPinned,
  Bell,
  BellRing,
  Route,
  ChevronRight,
  HeartPulse,
  FileText,
  type LucideIcon,
} from "lucide-react-native";
import Svg, { Path, Polyline, Circle as SvgCircle } from "react-native-svg";
import { useAnimals } from "@hooks/useAnimals";
import { useAuth } from "@context/AuthContext";
import { useT } from "@context/ThemeContext";
import { Alerta } from "@/types";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import { navigateTo } from "@navigation/navigationRef";

type IconComp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

// ─── CowIcon ──────────────────────────────────────────────────────────────────
function CowIcon({ size = 22, color = "#76C043" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M6.27335 12.5175875c0 0.22014375 -0.17846875 0.3986 -0.3986125 0.3986125H4.81178125c-0.30685625 -0.0000125 -0.4986375 -0.3322 -0.3452 -0.59793125 0.07120625 -0.12331875 0.2028 -0.1992875 0.3452 -0.19929375h1.06295625c0.22014375 0.0000125 0.3986125 0.178475 0.3986125 0.3986125Zm4.9162 -0.3986125h-1.0629625c-0.30685 0.00001875 -0.49863125 0.3322 -0.34519375 0.59793125 0.0712 0.12331875 0.2028 0.1992875 0.34519375 0.19929375h1.0629625c0.30685 -0.0000125 0.4986375 -0.3322 0.3452 -0.59793125 -0.07120625 -0.12331875 -0.2028 -0.1992875 -0.3452 -0.19929375Zm-5.04906875 -4.783325c-0.51141875 0 -0.83105625 0.553625 -0.57534375 0.996525 0.25570625 0.4429 0.89498125 0.4429 1.1506875 0 0.0583125 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.2974375 -0.66435 -0.66435 -0.66435Zm3.72036875 0c-0.51141875 0 -0.83105625 0.553625 -0.57535 0.996525 0.2557125 0.4429 0.89498125 0.4429 1.15069375 0 0.05830625 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.29744375 -0.66435 -0.66435 -0.66435Zm5.7698875 0.45508125c-0.17666875 0.21655 -0.44134375 0.34218125 -0.72081875 0.3421375H12.651125v2.32855c1.5828375 1.12755625 1.3515 3.54575 -0.41640625 4.35275 -0.32810625 0.149775 -0.68449375 0.2275 -1.04516875 0.22795625H4.81178125c-1.9433875 -0.0024375 -3.15536875 -2.10773125 -2.18156875 -3.7895375 0.180725 -0.312125 0.4262375 -0.58190625 0.71999375 -0.79116875v-2.32855H1.0914125c-0.2799375 0.00044375 -0.5451875 -0.125225 -0.72215 -0.3421375 -0.17531875 -0.21299375 -0.245575 -0.493525 -0.19133125 -0.76400625 0.3399375 -1.6740625 1.8108375 -2.87783125 3.51906875 -2.8799625h0.4577375c-0.84463125 -0.68 -1.33585625 -1.70593125 -1.3360125 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.123325 0.07120625 0.1993 0.20279375 0.1993 0.34520625 0 1.541025 1.24925 2.790275 2.790275 2.790275h3.1888875c1.540975 -0.00006875 2.790275 -1.2493 2.790275 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.12333125 0.07120625 0.1993 0.20279375 0.1993 0.34520625 -0.00015625 1.08434375 -0.49138125 2.110275 -1.33600625 2.790275h0.4577375c1.707725 0.0027625 3.1779 1.2063875 3.5177375 2.8799625 0.0542375 0.27048125 -0.0160125 0.5510125 -0.19133125 0.76400625Zm-12.28053125 -0.45508125v-0.66435c-0.00028125 -0.642175 0.24500625 -1.26014375 0.6856125 -1.72731875h-0.338825c-1.328925 0.00055 -2.47380625 0.93655625 -2.73845 2.23886875 -0.007425 0.03658125 0.002375 0.07455 0.02656875 0.102975 0.02578125 0.03220625 0.06505 0.05061875 0.1063 0.049825Zm9.56665625 5.1819375c0 -0.954 -0.7733125 -1.72735625 -1.7273125 -1.7273125H4.81178125c-1.3296875 0 -2.16074375 1.439425 -1.4959 2.59096875 0.30855625 0.53443125 0.8787875 0.86365625 1.4959 0.86365625h6.37776875c0.954 0.00004375 1.7273125 -0.7733125 1.7273125 -1.7273125Zm-1.0629625 -2.4355125v-3.410775c0 -0.95396875 -0.77334375 -1.72731875 -1.7273125 -1.72731875H5.8747375c-0.95396875 0 -1.7273125 0.77335 -1.7273125 1.72731875v3.410775c0.21650625 -0.05911875 0.439925 -0.08905625 0.66435625 -0.08901875h6.37776875c0.224425 -0.0000375 0.44785 0.0299 0.66435 0.08901875Zm3.1888875 -2.899225c-0.26465 -1.3023125 -1.409525 -2.23831875 -2.73845625 -2.23886875h-0.33881875c0.44060625 0.467175 0.68589375 1.08514375 0.6856125 1.72731875v0.66435h2.25879375c0.04078125 0.00038125 0.07948125 -0.0179875 0.10496875 -0.049825 0.02466875 -0.02819375 0.0349625 -0.0661875 0.0279 -0.102975Z"
        fill={color}
        strokeWidth={0.0625}
      />
    </Svg>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ color, up }: { color: string; up: boolean }) {
  const pts = up ? "2,14 8,10 14,7 20,5 28,3" : "2,3 8,7 14,9 20,10 28,12";
  return (
    <Svg width="100%" height={18} viewBox="0 0 32 18" preserveAspectRatio="none">
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  icono: Icon,
  valor,
  etiqueta,
  color,
  fondo,
  sub,
  sparkline,
  sparklineUp = true,
  bateriaPct,
  badge,
  T,
}: {
  icono: IconComp | LucideIcon;
  valor: string | number;
  etiqueta: string;
  color: string;
  fondo: string;
  sub?: string;
  sparkline?: boolean;
  sparklineUp?: boolean;
  bateriaPct?: number;
  badge?: string;
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
          <View style={{ flex: 1 }}>
            <Sparkline color={color} up={sparklineUp} />
          </View>
          {sub && (
            <Text style={[st.statSub, { color }]}>{sub}</Text>
          )}
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
            <SvgCircle
              cx={20} cy={20} r={16}
              fill="none"
              stroke={T.borde}
              strokeWidth={3.5}
            />
            <SvgCircle
              cx={20} cy={20} r={16}
              fill="none"
              stroke={color}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - bateriaPct / 100)}`}
              rotation="-90"
              origin="20,20"
            />
          </Svg>
        </View>
      )}
    </View>
  );
}

// ─── ModuloCard ───────────────────────────────────────────────────────────────
function ModuloCard({
  icono: Icon,
  label,
  color,
  fondo,
  onPress,
  T,
}: {
  icono: IconComp;
  label: string;
  color: string;
  fondo: string;
  onPress: () => void;
  T: ReturnType<typeof useT>;
}) {
  return (
    <TouchableOpacity
      style={[st.moduloCard, { backgroundColor: T.card, borderColor: T.borde }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[st.moduloIconBox, { backgroundColor: fondo }]}>
        <Icon size={20} color={color} strokeWidth={2} />
      </View>
      <Text style={[st.moduloLabel, { color: T.txtMain }]}>{label}</Text>
      <ChevronRight size={13} color={T.verde} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

// ─── ActividadRow ─────────────────────────────────────────────────────────────
type ActItem = {
  icono: LucideIcon;
  titulo: string;
  sub: string;
  tiempo: string;
  tiempoColor: string;
  fondo: string;
  color: string;
};

function ActividadRow({ item, T }: { item: ActItem; T: ReturnType<typeof useT> }) {
  const Ico = item.icono;
  return (
    <View style={[st.actRow, { borderBottomColor: T.borde }]}>
      <View style={[st.actIconBox, { backgroundColor: item.fondo }]}>
        <Ico size={14} color={item.color} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.actTitulo, { color: T.txtMain }]} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={[st.actSub, { color: T.txtSec }]} numberOfLines={1}>
          {item.sub}
        </Text>
      </View>
      <Text style={[st.actTiempo, { color: item.tiempoColor }]}>{item.tiempo}</Text>
    </View>
  );
}

// ─── ResumenRow ───────────────────────────────────────────────────────────────
function ResumenRow({
  icono: Ico,
  label,
  valor,
  color,
  T,
}: {
  icono: IconComp | LucideIcon;
  label: string;
  valor: string;
  color: string;
  T: ReturnType<typeof useT>;
}) {
  return (
    <View style={[st.resRow, { borderBottomColor: T.borde }]}>
      <View style={[st.resIconBox, { backgroundColor: T.verdeAlfa }]}>
        <Ico size={13} color={color} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.resLabel, { color: T.txtSec }]}>{label}</Text>
        <Text style={[st.resValor, { color: T.txtMain }]}>{valor}</Text>
      </View>
    </View>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  useWindowDimensions(); // kept per import spec
  const { animales, conectado } = useAnimals();
  const { usuario } = useAuth();
  const T = useT();
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const activas = alertas.filter((a) => !a.resuelta);
  const bateriaProm = animales.length
    ? Math.round(animales.reduce((s, a) => s + (a.collar?.bateria ?? 0), 0) / animales.length)
    : 69;
  const nombre = usuario?.nombre?.split(" ")[0] ?? "Ganadero";

  const actividadDemo: ActItem[] = [
    {
      icono: BellRing,
      titulo: "Animal fuera de la cerca",
      sub: "Vaca 19 • Potrero Norte",
      tiempo: "Hace 2 min",
      tiempoColor: T.rojo,
      fondo: T.rojoBg,
      color: T.rojo,
    },
    {
      icono: BatteryMedium,
      titulo: "Batería baja",
      sub: "Lucero #100 • 68%",
      tiempo: "Hace 15 min",
      tiempoColor: T.naranja,
      fondo: T.naranjaBg,
      color: T.naranja,
    },
    {
      icono: MapPinned,
      titulo: "Entrada a la zona segura",
      sub: "Toro 7 • Potrero Central",
      tiempo: "Hace 35 min",
      tiempoColor: T.verde,
      fondo: T.verdeAlfa,
      color: T.verde,
    },
  ];

  const { width } = useWindowDimensions();
  const isMd = width < 1100;
  const isSm = width < 768;

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>

      {/* ── Sidebar ── */}
      <WebSidebar activeRoute="Home" />

      {/* ── Main area ── */}
      <View style={st.main}>

        {/* ── Top bar ── */}
        <WebTopBar
          titulo="Inicio"
          sub="Resumen de tu finca hoy"
          conectado={conectado}
          alertasCount={activas.length}
        />

        {/* ── Scrollable content ── */}
        <ScrollView
          style={st.scroll}
          contentContainerStyle={st.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Hero banner ── */}
          <View style={st.heroBanner}>
            <Image
              source={require("../../assets/vaca 3.png")}
              style={st.heroImg}
              resizeMode="cover"
            />
            <View style={st.heroOverlay} />
            <View style={st.heroContent}>
              <Text style={st.heroTitle}>Monitorea. Protege. Optimiza.</Text>
              <Text style={st.heroSub}>
                Inteligencia que cuida tu ganado en tiempo real.
              </Text>
              <View
                style={[
                  st.conectadoBadge,
                  {
                    backgroundColor: conectado
                      ? "rgba(118,192,67,0.18)"
                      : "rgba(255,87,87,0.18)",
                    borderColor: conectado ? T.verde : T.rojo,
                  },
                ]}
              >
                <View
                  style={[
                    st.conectadoDot,
                    { backgroundColor: conectado ? T.verde : T.rojo },
                  ]}
                />
                <Text
                  style={[
                    st.conectadoTxt,
                    { color: conectado ? T.verdeBrillo : T.rojo },
                  ]}
                >
                  {conectado ? "Conectado" : "Sin señal"}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Stats row ── */}
          <View style={[st.statsRow, isMd && { flexWrap: "wrap" }]}>
            <StatCard
              T={T}
              icono={CowIcon as IconComp}
              valor={animales.length || 10}
              etiqueta="Ganado activo"
              color={T.verde}
              fondo={T.verdeAlfa}
              sparkline
              sparklineUp
              sub="↑ 12% vs. ayer"
            />
            <StatCard
              T={T}
              icono={TriangleAlert}
              valor={activas.length}
              etiqueta="Alertas activas"
              color={T.rojo}
              fondo={T.rojoBg}
              sparkline
              sparklineUp={false}
              sub="↓ 0% vs. ayer"
            />
            <StatCard
              T={T}
              icono={ShieldCheck}
              valor="Activa"
              etiqueta="Cerca virtual"
              color={T.verde}
              fondo={T.verdeAlfa}
              badge="Perímetro seguro"
            />
            <StatCard
              T={T}
              icono={BatteryMedium}
              valor={`${bateriaProm}%`}
              etiqueta="Batería promedio"
              color={T.naranja}
              fondo={T.naranjaBg}
              bateriaPct={bateriaProm}
            />
          </View>

          {/* ── Content grid ── */}
          <View style={[st.contentGrid, isMd && { flexDirection: "column" }]}>

            {/* Left column */}
            <View style={st.leftCol}>

              {/* Módulos principales */}
              <View>
                <Text style={[st.sectionTitle, { color: T.txtMain, marginBottom: 12 }]}>
                  Módulos principales
                </Text>
                <View style={st.modulosGrid}>
                  <ModuloCard
                    T={T}
                    icono={CowIcon}
                    label="Registro de animales"
                    color={T.verde}
                    fondo={T.verdeAlfa}
                    onPress={() => navigateTo("Animals")}
                  />
                  <ModuloCard
                    T={T}
                    icono={MapPinned}
                    label="Cerca virtual"
                    color={T.verde}
                    fondo={T.verdeAlfa}
                    onPress={() => navigateTo("Map")}
                  />
                  <ModuloCard
                    T={T}
                    icono={Bell}
                    label="Alertas en tiempo real"
                    color={T.rojo}
                    fondo={T.rojoBg}
                    onPress={() => navigateTo("Alerts")}
                  />
                  <ModuloCard
                    T={T}
                    icono={Route}
                    label="Historial de movimientos"
                    color={T.azul}
                    fondo={T.azulBg}
                    onPress={() => navigateTo("Map")}
                  />
                  <ModuloCard
                    T={T}
                    icono={HeartPulse}
                    label="Gestión de salud animal"
                    color={T.verde}
                    fondo={T.verdeAlfa}
                    onPress={() => navigateTo("Animals")}
                  />
                </View>
              </View>

              {/* Actividad reciente */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <View style={st.cardHeader}>
                  <Text style={[st.sectionTitle, { color: T.txtMain }]}>
                    Actividad reciente
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigateTo("Alerts")}
                    activeOpacity={0.75}
                  >
                    <Text style={[st.verTodas, { color: T.verde }]}>Ver todas</Text>
                  </TouchableOpacity>
                </View>
                {actividadDemo.map((item, i) => (
                  <ActividadRow key={i} item={item} T={T} />
                ))}
              </View>
            </View>

            {/* Right column */}
            <View style={st.rightCol}>

              {/* Resumen de hoy */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <Text style={[st.sectionTitle, { color: T.txtMain, marginBottom: 10 }]}>
                  Resumen de hoy
                </Text>
                <ResumenRow
                  T={T}
                  icono={Route}
                  label="Distancia recorrida"
                  valor="2.4 km"
                  color={T.verde}
                />
                <ResumenRow
                  T={T}
                  icono={CowIcon as IconComp}
                  label="Animales activos"
                  valor={String(animales.length || 10)}
                  color={T.verde}
                />
                <ResumenRow
                  T={T}
                  icono={BatteryMedium}
                  label="Batería promedio"
                  valor={`${bateriaProm}%`}
                  color={T.naranja}
                />
                <ResumenRow
                  T={T}
                  icono={TriangleAlert}
                  label="Alertas activas"
                  valor={String(activas.length)}
                  color={T.rojo}
                />
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
  // Root layout
  root: {
    flex: 1,
    flexDirection: "row",
  },
  main: {
    flex: 1,
    flexDirection: "column",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },

  // ── Hero banner ──
  heroBanner: {
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
  },
  heroImg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    padding: 24,
    gap: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 34,
  },
  heroSub: {
    fontSize: 14,
    color: "#fff",
  },
  conectadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  conectadoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  conectadoTxt: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Stats row ──
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    minWidth: 160,
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValor: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
  },
  statEtiqueta: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  statBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    overflow: "hidden",
  },
  statSub: {
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 0,
    paddingLeft: 6,
  },
  statBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  statBadgeTxt: {
    fontSize: 10.5,
    fontWeight: "700",
  },

  // ── Content grid ──
  contentGrid: {
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start",
  },
  leftCol: {
    flex: 1.6,
    gap: 20,
  },
  rightCol: {
    width: 300,
    gap: 16,
  },

  // ── Section title ──
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  // ── Módulos grid ──
  modulosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  moduloCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexBasis: "30%",
    flexGrow: 1,
  },
  moduloIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  moduloLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Card ──
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  verTodas: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Actividad rows ──
  actRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  actIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actTitulo: {
    fontSize: 13,
    fontWeight: "700",
  },
  actSub: {
    fontSize: 11,
    marginTop: 2,
  },
  actTiempo: {
    fontSize: 11,
    fontWeight: "600",
    flexShrink: 0,
  },

  // ── Resumen rows ──
  resRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  resIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resLabel: {
    fontSize: 11,
  },
  resValor: {
    fontSize: 14,
    fontWeight: "800",
  },

  // ── Reporte button ──
  reporteBtn: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  reporteBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
