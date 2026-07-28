import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Platform, StatusBar, useWindowDimensions,
} from "react-native";
import {
  TriangleAlert, ShieldCheck, BatteryMedium,
  MapPinned, Bell, BellRing, Route, ChevronRight,
  Menu, HeartPulse, type LucideIcon,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Polyline, Circle as SvgCircle } from "react-native-svg";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useAuth } from "@context/AuthContext";
import { useDrawer } from "@context/DrawerContext";
import { useT } from "@context/ThemeContext";
import { AlertasAPI } from "@services/api";
import { tiempoRelativo } from "@utils/format";
import { Alerta } from "@/types";

const STATUS_BAR_H    = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

type IconComponent = React.ComponentType<any>;

// ─── CowIcon outline ───────────────────────────────────────────────────────────
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

// ─── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ color, up }: { color: string; up: boolean }) {
  const pts = up ? "2,14 8,10 14,7 20,5 28,3" : "2,3 8,7 14,9 20,10 28,12";
  return (
    <Svg width="100%" height={18} viewBox="0 0 32 18" preserveAspectRatio="none">
      <Polyline points={pts} fill="none" stroke={color}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── StatCard — layout horizontal (icono izq, valor+etiqueta der, sparkline abajo)
function StatCard({
  icono: Icon, valor, etiqueta, color, fondo, sub, subColor,
  sparkline, sparklineUp = true, bateriaPct, badge, T, width,
}: {
  icono: LucideIcon | IconComponent; valor: string | number; etiqueta: string;
  color: string; fondo: string; sub?: string; subColor?: string;
  sparkline?: boolean; sparklineUp?: boolean;
  bateriaPct?: number; badge?: string;
  T: ReturnType<typeof useT>;
  width?: number;
}) {
  return (
    <View style={[stc.statCard, { backgroundColor: T.card, borderColor: T.borde, width }]}>
      {/* Fila superior: icono + valor/etiqueta */}
      <View style={stc.statTop}>
        <View style={[stc.statIconBox, { backgroundColor: fondo }]}>
          <Icon size={20} color={color} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[stc.statValor, { color }]}>{valor}</Text>
          <Text style={[stc.statEtiqueta, { color: T.txtSec }]}>{etiqueta}</Text>
        </View>
      </View>

      {/* Sparkline + sub */}
      {sparkline && (
        <View style={stc.statBottom}>
          <View style={{ flex: 1 }}>
            <Sparkline color={color} up={sparklineUp} />
          </View>
          {sub && (
            <View style={{ alignItems: "flex-end", flexShrink: 0, paddingLeft: 6 }}>
              <Text style={[stc.statSub, { color: subColor ?? color }]}>{sub}</Text>
              <Text style={[stc.statVsAyer, { color: T.txtTer }]}>vs. ayer</Text>
            </View>
          )}
        </View>
      )}

      {/* Badge (cerca virtual) */}
      {badge && (
        <View style={[stc.statBadge, { backgroundColor: fondo }]}>
          <Text style={[stc.statBadgeTxt, { color }]}>{badge}</Text>
        </View>
      )}

      {/* Anillo batería */}
      {bateriaPct !== undefined && (
        <View style={stc.statBottom}>
          <View style={{ width: 36 }} />
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

// ─── ModuloCard — tarjeta con icono, texto y chevron ─────────────────────────
function ModuloCard({ icono: Icon, label, color, fondo, onPress, T }: {
  icono: IconComponent; label: string; color: string; fondo: string;
  onPress: () => void; T: ReturnType<typeof useT>;
}) {
  return (
    <TouchableOpacity
      style={[stc.moduloCard, { backgroundColor: T.card, borderColor: T.borde }]}
      onPress={onPress} activeOpacity={0.75}
    >
      <View style={[stc.moduloIconBox, { backgroundColor: fondo }]}>
        <Icon size={20} color={color} strokeWidth={2} />
      </View>
      <Text style={[stc.moduloLabel, { color: T.txtMain }]}>{label}</Text>
      <ChevronRight size={13} color={T.verde} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

// ─── ActividadRow ──────────────────────────────────────────────────────────────
type ActItem = {
  icono: LucideIcon; titulo: string; sub: string;
  tiempo: string; tiempoColor: string; fondo: string; color: string;
};
function ActividadRow({ item, T }: { item: ActItem; T: ReturnType<typeof useT> }) {
  const Ico = item.icono;
  return (
    <View style={[stc.actRow, { borderBottomColor: T.borde }]}>
      <View style={[stc.actIconBox, { backgroundColor: item.fondo }]}>
        <Ico size={14} color={item.color} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[stc.actTitulo, { color: T.txtMain }]} numberOfLines={1}>{item.titulo}</Text>
        <Text style={[stc.actSub, { color: T.txtSec }]} numberOfLines={1}>{item.sub}</Text>
      </View>
      <Text style={[stc.actTiempo, { color: item.tiempoColor }]}>{item.tiempo}</Text>
    </View>
  );
}

// ─── ResumenRow ────────────────────────────────────────────────────────────────
function ResumenRow({ icono: Ico, label, valor, color, T }: {
  icono: LucideIcon | IconComponent; label: string; valor: string;
  color: string; T: ReturnType<typeof useT>;
}) {
  return (
    <View style={[stc.resRow, { borderBottomColor: T.borde }]}>
      <View style={[stc.resIconBox, { backgroundColor: T.verdeAlfa }]}>
        <Ico size={13} color={color} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[stc.resLabel, { color: T.txtSec }]}>{label}</Text>
        <Text style={[stc.resValor, { color: T.txtMain }]}>{valor}</Text>
      </View>
      <ChevronRight size={12} color={T.txtTer} strokeWidth={2} />
    </View>
  );
}

// Convierte una alerta del backend en un ActItem para mostrar en la pantalla de inicio
function alertaAActItem(
  alerta: Alerta,
  T: ReturnType<typeof useT>
): ActItem {
  const tipoConfig: Record<string, { icono: LucideIcon; fondo: string; color: string }> = {
    ANIMAL_SALIO:         { icono: BellRing,      fondo: T.rojoBg,    color: T.rojo    },
    ANIMAL_ENTRO:         { icono: MapPinned,     fondo: T.verdeLuz,  color: T.verde   },
    BATERIA_BAJA:         { icono: BatteryMedium, fondo: T.naranjaBg, color: T.naranja },
    COLLAR_DESCONECTADO:  { icono: BellRing,      fondo: T.naranjaBg, color: T.naranja },
    COLLAR_RETIRADO:      { icono: TriangleAlert,  fondo: T.rojoBg,    color: T.rojo    },
    INTRUSO_DETECTADO:    { icono: TriangleAlert,  fondo: T.rojoBg,    color: T.rojo    },
    VELOCIDAD_ANORMAL:    { icono: Route,          fondo: T.naranjaBg, color: T.naranja },
    TEMPERATURA_ANORMAL:  { icono: HeartPulse,     fondo: T.naranjaBg, color: T.naranja },
  };
  const cfg = tipoConfig[alerta.tipo] ?? { icono: Bell, fondo: T.azulBg, color: T.azul };
  const tiempoColor =
    alerta.severidad === "CRITICA" ? T.rojo :
    alerta.severidad === "MEDIA"   ? T.naranja : T.verde;
  return {
    icono: cfg.icono,
    titulo: alerta.mensaje,
    sub: alerta.animal ? alerta.animal.nombre : "",
    tiempo: tiempoRelativo(alerta.fecha),
    tiempoColor,
    fondo: cfg.fondo,
    color: cfg.color,
  };
}

// ─── HomeScreen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { width: SW } = useWindowDimensions();
  const CARD_GAP = 12;
  const CARD_W   = (SW - 32 - CARD_GAP) / 2;
  const navigation     = useNavigation<any>();
  const { usuario }    = useAuth();
  const { openDrawer } = useDrawer();
  const T              = useT();
  const { animales, conectado, cerca, alertas: alertasSocket } = useAnimalsCtx();

  // Alertas recientes del backend (se refresca al montar y cuando llegan por socket)
  const [alertasRecientes, setAlertasRecientes] = useState<Alerta[]>([]);
  useEffect(() => {
    if (!usuario?.fincaId) return;
    AlertasAPI.listar(usuario.fincaId)
      .then(({ data }) => setAlertasRecientes(Array.isArray(data) ? data.slice(0, 10) : []))
      .catch(() => {});
  }, [usuario?.fincaId]);

  // Fusionar alertas que llegan en tiempo real por socket con las cargadas del API
  useEffect(() => {
    if (!Array.isArray(alertasSocket) || !alertasSocket.length) return;
    setAlertasRecientes((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const ids = new Set(base.map((a) => a.id));
      const nuevas = alertasSocket.filter((a) => !ids.has(a.id));
      return [...nuevas, ...base].slice(0, 10);
    });
  }, [alertasSocket]);

  const activas     = alertasRecientes.filter((a) => a.estado === "PENDIENTE");
  const bateriaProm = animales.length
    ? Math.round(
        animales.reduce((s, a) => s + (a.collar?.bateria ?? a.collar?.bateriaPorcentaje ?? 0), 0) /
        animales.length
      )
    : 0;
  const nombre = usuario?.nombre?.split(" ")[0] ?? "Ganadero";
  const inicial = nombre.charAt(0).toUpperCase();

  // Últimas 3 alertas reales como actividad reciente
  const actividadItems: ActItem[] = alertasRecientes
    .slice(0, 3)
    .map((a) => alertaAActItem(a, T));

  return (
    <View style={[stc.root, { backgroundColor: T.fondo }]}>

      {/* ── AppBar ── */}
      <View style={[stc.header, { backgroundColor: T.header, borderBottomColor: T.borde }]}>
        <TouchableOpacity style={[stc.headerBtn, { backgroundColor: T.headerBtn }]}
          onPress={openDrawer} activeOpacity={0.7}>
          <Menu size={19} color={T.txtMain} strokeWidth={2} />
        </TouchableOpacity>

        <View style={stc.headerLogo}>
          <Image source={require("../../assets/logotipo.png")} style={stc.headerLogoImg} resizeMode="contain" />
          <View>
            <Text style={[stc.headerBrand, { color: T.txtMain }]}>
              <Text style={{ fontWeight: "700" }}>SMART</Text>
              <Text style={{ color: T.verde, fontWeight: "900" }}>FENCE AI</Text>
            </Text>
            <Text style={[stc.headerSub, { color: T.txtTer }]}>GANADO INTELIGENTE</Text>
          </View>
        </View>

        <View style={stc.headerRight}>
          <TouchableOpacity style={[stc.headerBtn, { backgroundColor: T.headerBtn }]}
            onPress={() => navigation.navigate("Alerts")} activeOpacity={0.7}>
            <Bell size={19} color={T.txtMain} strokeWidth={2} />
            {activas.length > 0 && (
              <View style={[stc.notifBadge, { backgroundColor: T.verde }]}>
                <Text style={stc.notifTxt}>{activas.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={[stc.avatar, { backgroundColor: T.verde }]}>
            <Text style={stc.avatarTxt}>{inicial}</Text>
            <View style={[stc.avatarDot, { backgroundColor: conectado ? T.verde : T.rojo }]} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={stc.scroll}>

        {/* ── Banner hero ── */}
        <View style={stc.heroBanner}>
          <Image source={require("../../assets/vaca 1.png")} style={stc.heroImg} resizeMode="cover" />
          <View style={stc.heroOverlay} />
          <View style={stc.heroContent}>
            <Text style={stc.heroHola}>Hola, {nombre} 👋</Text>
            <Text style={stc.heroSub}>Bienvenido a SmartFence AI</Text>
            <View style={[stc.conectadoBadge,
              { backgroundColor: conectado ? "rgba(118,192,67,0.18)" : "rgba(255,87,87,0.18)",
                borderColor: conectado ? T.verde : T.rojo }]}>
              <View style={[stc.conectadoDot,
                { backgroundColor: conectado ? T.verde : T.rojo }]} />
              <Text style={[stc.conectadoTxt,
                { color: conectado ? T.verdeBrillo : T.rojo }]}>
                {conectado ? "Conectado" : "Sin conexión"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 4 stat cards ── */}
        <View style={stc.statsGrid}>
          <StatCard T={T} width={CARD_W}
            icono={CowIcon as any} valor={animales.length || 10}
            etiqueta="Ganado activo" color={T.verde} fondo={T.verdeAlfa}
            sparkline sparklineUp sub="↑ 12%" subColor={T.verde}
          />
          <StatCard T={T} width={CARD_W}
            icono={TriangleAlert} valor={activas.length}
            etiqueta="Alertas activas" color={T.rojo} fondo={T.rojoBg}
            sparkline sparklineUp={false} sub="↓ 0%" subColor={T.rojo}
          />
          <StatCard T={T} width={CARD_W}
            icono={ShieldCheck} valor={cerca ? "Activa" : "Sin cerca"}
            etiqueta="Cerca virtual" color={cerca ? T.verde : T.txtSec} fondo={cerca ? T.verdeAlfa : T.borde}
            badge={cerca ? "Perímetro seguro" : undefined}
          />
          <StatCard T={T} width={CARD_W}
            icono={BatteryMedium} valor={`${bateriaProm}%`}
            etiqueta="Batería promedio" color={T.naranja} fondo={T.naranjaBg}
            bateriaPct={bateriaProm}
          />
        </View>

        {/* ── Módulos principales ── */}
        <View style={stc.seccion}>
          <Text style={[stc.seccionTitulo, { color: T.txtMain }]}>Módulos principales</Text>
          <View style={stc.modulosGrid}>
            <ModuloCard T={T} icono={CowIcon}    label={"Registro de\nanimales"}     color={T.verde}   fondo={T.verdeAlfa} onPress={() => navigation.navigate("Animals")} />
            <ModuloCard T={T} icono={MapPinned}  label={"Cerca\nvirtual"}            color={T.verde}   fondo={T.verdeAlfa} onPress={() => navigation.navigate("Map")} />
            <ModuloCard T={T} icono={Bell}       label={"Alertas en\ntiempo real"}   color={T.rojo}    fondo={T.rojoBg}    onPress={() => navigation.navigate("Alerts")} />
            <ModuloCard T={T} icono={Route}      label={"Historial de\nmovimientos"} color={T.azul}    fondo={T.azulBg}    onPress={() => navigation.navigate("Map")} />
            <ModuloCard T={T} icono={HeartPulse} label={"Gestión de\nsalud animal"}  color={T.verde}   fondo={T.verdeAlfa} onPress={() => navigation.navigate("Animals")} />
          </View>
        </View>

        {/* ── Actividad reciente + Resumen de hoy ── */}
        <View style={[stc.bottomRow, SW < 420 && stc.bottomRowCol]}>

          <View style={[stc.card, SW >= 420 ? { flex: 1.35 } : { width: "100%" }, { backgroundColor: T.card, borderColor: T.borde }]}>
            <View style={stc.cardHeader}>
              <Text style={[stc.seccionTitulo, { color: T.txtMain }]}>Actividad reciente</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Alerts")} activeOpacity={0.7}>
                <Text style={[stc.verTodas, { color: T.verde }]}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {actividadItems.length > 0
              ? actividadItems.map((item, i) => <ActividadRow key={i} item={item} T={T} />)
              : <Text style={[stc.seccionTitulo, { color: T.txtSec, fontSize: 12, fontWeight: "400" }]}>Sin actividad reciente</Text>
            }
          </View>

          <View style={[stc.card, SW >= 420 ? { flex: 1 } : { width: "100%" }, { backgroundColor: T.card, borderColor: T.borde }]}>
            <Text style={[stc.seccionTitulo, { color: T.txtMain, marginBottom: 10 }]}>Resumen de hoy</Text>
            <ResumenRow T={T} icono={CowIcon as any} label="Animales activos"   valor={String(animales.length || "—")}  color={T.verde} />
            <ResumenRow T={T} icono={BatteryMedium}  label="Batería promedio"   valor={animales.length ? `${bateriaProm}%` : "—"} color={T.naranja} />
            <ResumenRow T={T} icono={TriangleAlert}  label="Alertas pendientes" valor={String(activas.length)}          color={activas.length > 0 ? T.rojo : T.verde} />
          </View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos estáticos (no dependen del tema) ──────────────────────────────────
const stc = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { gap: 14, paddingBottom: 12 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: STATUS_BAR_H + HEADER_EXTRA_PT,
    paddingBottom: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  headerLogo:     { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  headerLogoImg:  { width: 30, height: 30, borderRadius: 8 },
  headerBrand:    { fontSize: 13, letterSpacing: 0.3 },
  headerSub:      { fontSize: 8, letterSpacing: 1.2, marginTop: 1 },
  headerRight:    { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  avatarTxt:  { fontSize: 14, fontWeight: "800", color: "#fff" },
  avatarDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: "#fff",
    backgroundColor: "#fff",
  },
  notifBadge: {
    position: "absolute", top: -2, right: -2,
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  notifTxt: { fontSize: 9, color: "#fff", fontWeight: "800" },

  // Hero
  heroBanner: {
    marginHorizontal: 16, marginTop: 16,
    height: 200, borderRadius: 22, overflow: "hidden",
  },
  heroImg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  heroOverlay: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  heroContent: { position: "absolute", bottom: 0, left: 0, padding: 22, gap: 6 },
  heroHola:    { fontSize: 26, fontWeight: "900", color: "#fff", lineHeight: 31 },
  heroSub:     { fontSize: 13, color: "rgba(255,255,255,0.82)" },
  conectadoBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: "flex-start", marginTop: 4,
  },
  conectadoDot: { width: 7, height: 7, borderRadius: 4 },
  conectadoTxt: { fontSize: 12, fontWeight: "700" },

  // Stats 2×2
  statsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 12, paddingHorizontal: 16,
  },
  statCard: {
    borderRadius: 18, padding: 12,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statTop: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  statIconBox: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  statValor:    { fontSize: 22, fontWeight: "900", lineHeight: 26 },
  statEtiqueta: { fontSize: 10.5, fontWeight: "500", marginTop: 2 },
  statBottom: {
    flexDirection: "row", alignItems: "center",
    marginTop: 10, overflow: "hidden",
  },
  statSub:     { fontSize: 11, fontWeight: "700" },
  statVsAyer:  { fontSize: 9, marginTop: 1 },
  statBadge: {
    alignSelf: "flex-start", borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5, marginTop: 10,
  },
  statBadgeTxt: { fontSize: 10.5, fontWeight: "700" },

  // Sección
  seccion:       { gap: 10, paddingHorizontal: 16 },
  seccionTitulo: { fontSize: 14, fontWeight: "700" },

  // Módulos — grid mixto (como mockup)
  modulosGrid: { flexDirection: "column", gap: 8 },
  moduloCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 16, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  moduloIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  moduloLabel: {
    flex: 1, fontSize: 12.5, fontWeight: "600", lineHeight: 16,
  },

  // Bottom
  bottomRow:    { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingHorizontal: 16 },
  bottomRowCol: { flexDirection: "column" },
  card: {
    borderRadius: 18, borderWidth: 1, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  verTodas: { fontSize: 11.5, fontWeight: "700" },

  // Actividad
  actRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    paddingVertical: 7, borderBottomWidth: 1,
  },
  actIconBox: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  actTitulo: { fontSize: 11, fontWeight: "700" },
  actSub:    { fontSize: 10, marginTop: 1 },
  actTiempo: { fontSize: 10, fontWeight: "600", flexShrink: 0, paddingTop: 1 },

  // Resumen
  resRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 7, borderBottomWidth: 1,
  },
  resIconBox: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  resLabel: { fontSize: 10 },
  resValor: { fontSize: 13, fontWeight: "800" },
});
