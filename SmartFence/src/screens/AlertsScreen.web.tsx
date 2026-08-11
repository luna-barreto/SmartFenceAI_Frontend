import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import {
  Bell,
  BellRing,
  TriangleAlert,
  Info,
  CheckCircle2,
  Settings,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Search,
  Calendar,
  Filter,
  Scissors,
  UserX,
  Droplets,
} from "lucide-react-native";
import Svg, { Polyline, Circle as SvgCircle } from "react-native-svg";
import { useT } from "@context/ThemeContext";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import { useDemoSim } from "@context/DemoSimContext";
import { navigateTo } from "@navigation/navigationRef";
import {
  tiempoRelativo,
  type AlertaDemo,
  type AlertaTipo,
} from "@/demo/demoData";

// ─── Sparkline ────────────────────────────────────────────────────────────────
const SPARKLINE_WAVY = "0,20 10,12 20,22 30,10 40,18 50,7 60,16 70,5 80,13";
const SPARKLINE_FLAT = "0,14 20,14 40,14 60,14 80,14";
const SPARKLINE_UP   = "0,26 20,20 40,13 60,7 80,2";

function Sparkline({ points, color }: { points: string; color: string }) {
  return (
    <Svg width="100%" height={28} viewBox="0 0 80 28" style={{ marginTop: 8 }}>
      <Polyline points={points} fill="none" stroke={color}
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.65} />
    </Svg>
  );
}

// ─── Sensor calor dot ─────────────────────────────────────────────────────────
function SensorColorDot({ r, g, b, size = 10 }: { r: number; g: number; b: number; size?: number }) {
  return (
    <SvgCircle cx={size / 2} cy={size / 2} r={size / 2}
      fill={`rgb(${r},${g},${b})`} />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, valor, label, sub, color, bg, sparkline, T,
}: {
  icon: React.ComponentType<any>;
  valor: number; label: string; sub: string;
  color: string; bg: string; sparkline: string;
  T: ReturnType<typeof useT>;
}) {
  return (
    <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={[st.statIconBox, { backgroundColor: bg }]}>
        <Icon size={20} color={color} strokeWidth={1.8} />
      </View>
      <Text style={[st.statNumber, { color }]}>{valor}</Text>
      <Text style={[st.statLabel, { color: T.txtMain }]}>{label}</Text>
      <Text style={[st.statSub, { color }]}>{sub}</Text>
      <Sparkline points={sparkline} color={color} />
    </View>
  );
}

// ─── Alert Row ────────────────────────────────────────────────────────────────
function AlertRow({
  alerta, T, esNueva,
}: {
  alerta: AlertaDemo; T: ReturnType<typeof useT>; esNueva?: boolean;
}) {
  const cfg: Record<AlertaTipo, { bg: string; color: string; Icon: React.ComponentType<any> }> = {
    critica:     { bg: T.rojoBg,    color: T.rojo,    Icon: BellRing      },
    advertencia: { bg: T.naranjaBg, color: T.naranja, Icon: TriangleAlert },
    informativa: { bg: T.azulBg,    color: T.azul,    Icon: Info          },
    intruso:     { bg: "rgba(147,51,234,0.12)", color: "#9333ea", Icon: UserX },
  };
  const { bg, color, Icon } = cfg[alerta.tipo];

  let OverrideIcon: React.ComponentType<any> | null = null;
  if (alerta.scenarioTag === "corte_correo") OverrideIcon = Scissors;
  if (alerta.scenarioTag === "sensor_color") OverrideIcon = Droplets;
  const FinalIcon = OverrideIcon ?? Icon;

  const tiempo = tiempoRelativo(alerta.fecha);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        st.alertRow,
        { backgroundColor: T.card, borderBottomColor: T.borde },
        !alerta.leida && { borderLeftWidth: 3, borderLeftColor: color },
        esNueva && { backgroundColor: `${color}0D` },
      ]}
    >
      <View style={[st.alertIconBox, { backgroundColor: bg }]}>
        <FinalIcon size={18} color={color} strokeWidth={1.8} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={st.alertTitleRow}>
          <Text style={[st.alertTitle, { color: T.txtMain, flex: 1 }]} numberOfLines={1}>
            {alerta.titulo}
          </Text>
          {esNueva && (
            <View style={[st.nuevoBadge, { backgroundColor: color }]}>
              <Text style={st.nuevoBadgeTxt}>NUEVO</Text>
            </View>
          )}
        </View>
        <Text style={[st.alertSub, { color: T.txtSec }]} numberOfLines={1}>
          {alerta.sub}
        </Text>
        <Text style={[st.alertDesc, { color: T.txtTer }]} numberOfLines={2}>
          {alerta.desc}
        </Text>
      </View>

      <View style={st.alertRight}>
        <View style={[st.tiempoBadge, { backgroundColor: bg }]}>
          <Text style={[st.tiempoTxt, { color }]}>{tiempo}</Text>
        </View>
        <View style={[st.unreadDot, { backgroundColor: !alerta.leida ? T.verde : "transparent" }]} />
      </View>
      <ChevronRight size={16} color={T.txtTer} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
function Dropdown({ label, opciones, onSelect, T }: {
  label: string;
  opciones?: string[];
  onSelect?: (v: string) => void;
  T: ReturnType<typeof useT>;
}) {
  const [open, setOpen] = useState(false);
  const displayLabel = {
    "critica": "Crítica", "advertencia": "Advertencia",
    "informativa": "Informativa", "intruso": "Intruso",
    "no_leida": "No leída", "resuelta": "Resuelta",
  }[label] ?? label;

  return (
    <View>
      <TouchableOpacity activeOpacity={0.75}
        onPress={() => opciones && setOpen((o) => !o)}
        style={[st.dropdown, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
        <Text style={[st.dropdownTxt, { color: T.txtMain }]}>{displayLabel}</Text>
        <ChevronDown size={14} color={T.txtTer} strokeWidth={1.8} />
      </TouchableOpacity>
      {open && opciones && (
        <View style={[st.dropdownMenu, { backgroundColor: T.card, borderColor: T.borde }]}>
          {opciones.map((op) => {
            const opLabel = {
              "critica": "Crítica", "advertencia": "Advertencia",
              "informativa": "Informativa", "intruso": "Intruso",
              "no_leida": "No leída", "resuelta": "Resuelta",
            }[op] ?? op;
            return (
              <TouchableOpacity key={op} activeOpacity={0.75}
                onPress={() => { onSelect?.(op); setOpen(false); }}
                style={[st.dropdownItem, { borderBottomColor: T.borde }]}>
                <Text style={[st.dropdownTxt, { color: op === label ? T.verde : T.txtMain }]}>{opLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Scenario Legend ─────────────────────────────────────────────────────────
function ScenarioLegend({ T }: { T: ReturnType<typeof useT> }) {
  const items = [
    { Icon: UserX,      color: "#9333ea", bg: "rgba(147,51,234,0.12)", label: "Intruso" },
    { Icon: BellRing,   color: T.rojo,    bg: T.rojoBg,               label: "Animal fuera" },
    { Icon: Scissors,   color: T.rojo,    bg: T.rojoBg,               label: "Corte de correo" },
    { Icon: Droplets,   color: T.naranja, bg: T.naranjaBg,            label: "Sensor de calor" },
    { Icon: TriangleAlert, color: T.naranja, bg: T.naranjaBg,         label: "Advertencia" },
    { Icon: Info,       color: T.azul,    bg: T.azulBg,               label: "Informativa" },
  ];
  return (
    <View style={[st.legendCard, { backgroundColor: T.card, borderColor: T.borde }]}>
      <Text style={[st.legendTitle, { color: T.txtMain }]}>Tipos de alerta</Text>
      {items.map(({ Icon, color, bg, label }) => (
        <View key={label} style={st.legendRow}>
          <View style={[st.legendIconBox, { backgroundColor: bg }]}>
            <Icon size={13} color={color} strokeWidth={2} />
          </View>
          <Text style={[st.legendLabel, { color: T.txtSec }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── AlertsScreen ─────────────────────────────────────────────────────────────
export default function AlertsScreen() {
  const T = useT();
  const [tab, setTab] = useState("todas");
  const [filtroTipo, setFiltroTipo] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [filtroPotrero, setFiltroPotrero] = useState("Todos");
  const [filtroAnimal, setFiltroAnimal] = useState("");
  const [filtrosActivos, setFiltrosActivos] = useState(false);
  const { alertas, stats, nuevasIds } = useDemoSim();

  const criticas     = stats.alertasCriticas;
  const advertencias = stats.alertasAdvertencia;
  const informativas = stats.alertasInformativas;
  const intrusos     = stats.alertasIntruso;
  const resueltas    = stats.resueltas;
  const noLeidas     = alertas.filter((a) => !a.leida).length;

  function limpiarFiltros() {
    setFiltroTipo("Todas"); setFiltroEstado("Todas");
    setFiltroPotrero("Todos"); setFiltroAnimal("");
    setFiltrosActivos(false); setTab("todas");
  }

  function aplicarFiltros() {
    setFiltrosActivos(true);
    if (filtroTipo === "critica" || filtroTipo === "intruso") setTab("criticas");
    else if (filtroEstado === "no_leida") setTab("no_leidas");
    else if (filtroEstado === "resuelta") setTab("resueltas");
    else setTab("todas");
  }

  const alertasFiltradas = alertas.filter((a) => {
    if (tab === "no_leidas") return !a.leida;
    if (tab === "resueltas") return a.resuelta;
    if (tab === "criticas")  return a.tipo === "critica" || a.tipo === "intruso";
    return true;
  }).filter((a) => {
    if (filtrosActivos && filtroTipo !== "Todas" && a.tipo !== filtroTipo) return false;
    if (filtrosActivos && filtroAnimal && !a.sub.toLowerCase().includes(filtroAnimal.toLowerCase())) return false;
    return true;
  });

  const topBarRight = (
    <TouchableOpacity activeOpacity={0.75}
      onPress={() => navigateTo("Settings")}
      style={[st.configBtn, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
      <Settings size={14} color={T.txtMain} strokeWidth={1.8} />
      <Text style={[st.configTxt, { color: T.txtMain }]}>Configuración</Text>
    </TouchableOpacity>
  );

  const { width } = useWindowDimensions();
  const isMd = width < 1100;
  const isSm = width < 768;

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Alerts" />

      <View style={st.main}>
        <WebTopBar
          titulo="Alertas"
          sub="Monitorea intrusos, salud animal, correos y movimientos en tiempo real"
          alertasCount={noLeidas}
          rightContent={topBarRight}
        />

        <View style={st.contentRow}>
          {/* ── LEFT MAIN ── */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={st.leftContent}
            showsVerticalScrollIndicator={false}>

            {/* 5 stat cards */}
            <View style={[st.statsRow, isMd && { flexWrap: "wrap" }]}>
              <StatCard T={T} icon={UserX}    valor={intrusos}     label="Intrusos"     sub="Sin identificar"   color="#9333ea" bg="rgba(147,51,234,0.12)" sparkline={SPARKLINE_WAVY} />
              <StatCard T={T} icon={BellRing} valor={criticas}     label="Críticas"     sub="Requieren acción"  color={T.rojo}    bg={T.rojoBg}    sparkline={SPARKLINE_WAVY} />
              <StatCard T={T} icon={TriangleAlert} valor={advertencias} label="Advertencias" sub="Atención necesaria" color={T.naranja} bg={T.naranjaBg} sparkline={SPARKLINE_WAVY} />
              <StatCard T={T} icon={Info}     valor={informativas} label="Informativas" sub="Para tu conocimiento" color={T.azul}  bg={T.azulBg}    sparkline={SPARKLINE_FLAT} />
              <StatCard T={T} icon={CheckCircle2} valor={resueltas} label="Resueltas hoy" sub="Sin novedad"       color={T.verde}   bg={T.verdeAlfa} sparkline={SPARKLINE_UP} />
            </View>

            {/* Tabs row */}
            <View style={st.tabRow}>
              {[
                { key: "todas",     label: `Todas (${alertas.length})`  },
                { key: "criticas",  label: `Críticas (${criticas + intrusos})` },
                { key: "no_leidas", label: `No leídas (${noLeidas})`    },
                { key: "resueltas", label: `Resueltas (${resueltas})`   },
              ].map(({ key, label }) => {
                const active = tab === key;
                return (
                  <TouchableOpacity key={key} onPress={() => setTab(key)} activeOpacity={0.75}
                    style={[
                      st.tabPill,
                      active
                        ? { backgroundColor: T.verdeOscuro }
                        : { backgroundColor: T.card, borderWidth: 1, borderColor: T.borde },
                    ]}>
                    <Text style={[st.tabPillTxt, { color: active ? "#FFFFFF" : T.txtSec }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <View style={{ flex: 1 }} />
              <TouchableOpacity activeOpacity={0.75}
                onPress={() => filtrosActivos ? limpiarFiltros() : aplicarFiltros()}
                style={[st.filtrarBtn, { backgroundColor: filtrosActivos ? T.verdeOscuro : T.card, borderColor: filtrosActivos ? T.verdeOscuro : T.borde }]}>
                <SlidersHorizontal size={14} color={filtrosActivos ? "#fff" : T.txtMain} strokeWidth={1.8} />
                <Text style={[st.filtrarTxt, { color: filtrosActivos ? "#fff" : T.txtMain }]}>{filtrosActivos ? "Limpiar" : "Filtrar"}</Text>
              </TouchableOpacity>
            </View>

            {/* Alert list */}
            <View style={[st.alertList, { backgroundColor: T.card, borderColor: T.borde }]}>
              <View style={[st.sectionHeader, { backgroundColor: T.cardElevada }]}>
                <View style={st.sectionHeaderRow}>
                  <Text style={[st.sectionHeaderTxt, { color: T.txtSec }]}>TIEMPO REAL</Text>
                  <View style={[st.liveDot, { backgroundColor: T.verde }]} />
                </View>
              </View>

              {alertasFiltradas.map((alerta) => (
                <AlertRow
                  key={alerta.id}
                  alerta={alerta}
                  T={T}
                  esNueva={nuevasIds.has(alerta.id)}
                />
              ))}

              <TouchableOpacity activeOpacity={0.75}
                onPress={() => setTab("todas")}
                style={[st.loadMoreBtn, { backgroundColor: T.cardElevada, borderTopColor: T.borde }]}>
                <Text style={[st.loadMoreTxt, { color: T.txtSec }]}>
                  {tab === "todas" ? "Mostrando todas" : "Ver todas las alertas"}
                </Text>
                <ChevronDown size={14} color={T.txtSec} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* ── RIGHT PANEL ── */}
          {!isSm && (
            <View style={[st.rightPanel, isMd && st.rightPanelMd, { backgroundColor: T.card, borderLeftColor: T.borde }]}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.rightPanelContent}>
                <View style={st.filterHeader}>
                  <Text style={[st.filterTitle, { color: T.txtMain }]}>Filtros</Text>
                  <TouchableOpacity activeOpacity={0.75} onPress={limpiarFiltros}>
                    <Text style={[st.filterClear, { color: filtrosActivos ? T.rojo : T.verde }]}>Limpiar</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>TIPO DE ALERTA</Text>
                <Dropdown
                  label={filtroTipo}
                  opciones={["Todas", "critica", "advertencia", "informativa", "intruso"]}
                  onSelect={setFiltroTipo}
                  T={T}
                />
                <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>ESTADO</Text>
                <Dropdown
                  label={filtroEstado}
                  opciones={["Todas", "no_leida", "resuelta"]}
                  onSelect={setFiltroEstado}
                  T={T}
                />
                <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>POTRERO</Text>
                <Dropdown
                  label={filtroPotrero}
                  opciones={["Todos", "Potrero Norte", "Potrero Sur", "Potrero Este", "Potrero Oeste"]}
                  onSelect={setFiltroPotrero}
                  T={T}
                />
                <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>ANIMAL</Text>
                <View style={[st.searchBox, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                  <Search size={14} color={T.txtTer} strokeWidth={1.8} />
                  <TextInput
                    placeholder="Buscar animal..."
                    placeholderTextColor={T.txtTer}
                    value={filtroAnimal}
                    onChangeText={setFiltroAnimal}
                    style={[st.searchInput, { color: T.txtMain }] as any}
                  />
                </View>
                <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>RANGO DE FECHA</Text>
                <TouchableOpacity activeOpacity={0.75} style={[st.datePill, { backgroundColor: T.verdeAlfa }]}>
                  <Calendar size={14} color={T.verde} strokeWidth={1.8} />
                  <Text style={[st.datePillTxt, { color: T.verde }]}>Hoy</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={aplicarFiltros}
                  style={[st.applyBtn, { backgroundColor: T.verdeOscuro }]}>
                  <Filter size={15} color="#FFFFFF" strokeWidth={1.8} />
                  <Text style={st.applyBtnTxt}>Aplicar filtros</Text>
                </TouchableOpacity>

                {/* Scenario legend */}
                <ScenarioLegend T={T} />
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  main: { flex: 1, flexDirection: "column" },
  contentRow: { flex: 1, flexDirection: "row" },
  leftContent: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 80 },

  // Intruso banner
  intrusoBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16,
  },
  intrusoBannerTitle: { fontSize: 13, fontWeight: "800", marginBottom: 2 },
  intrusoBannerSub:   { fontSize: 12 },

  // Stat cards
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: 110, borderRadius: 14, borderWidth: 1, padding: 12 },
  statIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statNumber: { fontSize: 28, fontWeight: "900", lineHeight: 32 },
  statLabel:  { fontSize: 12, fontWeight: "700", marginTop: 2 },
  statSub:    { fontSize: 10, marginTop: 1 },

  // Tabs
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" },
  tabPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  tabPillTxt: { fontSize: 12, fontWeight: "700" },
  filtrarBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  filtrarTxt: { fontSize: 13, fontWeight: "600" },

  // Alert list
  alertList: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  sectionHeader: { paddingHorizontal: 18, paddingVertical: 10 },
  sectionHeaderTxt: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  alertRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
  alertIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  alertTitleRow: { flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" },
  alertTitle: { fontSize: 13, fontWeight: "700" },
  alertSub:   { fontSize: 11, marginTop: 2 },
  alertDesc:  { fontSize: 11, marginTop: 2, lineHeight: 16 },
  alertRight: { alignItems: "flex-end", gap: 5, flexShrink: 0 },
  tiempoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  tiempoTxt:   { fontSize: 10, fontWeight: "700" },
  unreadDot:   { width: 8, height: 8, borderRadius: 4 },
  nuevoBadge:  { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  nuevoBadgeTxt: { fontSize: 9, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  loadMoreBtn: { paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6, borderTopWidth: 1 },
  loadMoreTxt: { fontSize: 13, fontWeight: "600" },

  // Right panel
  rightPanel:   { width: 260, borderLeftWidth: 1 },
  rightPanelMd: { width: 220 },
  rightPanelContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 24 },
  filterHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  filterTitle:  { fontSize: 15, fontWeight: "700" },
  filterClear:  { fontSize: 13, fontWeight: "600" },
  filterGroupLabel: { fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 14, letterSpacing: 0.4 },
  dropdown:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  dropdownTxt:  { fontSize: 13 },
  dropdownMenu: { borderRadius: 10, borderWidth: 1, marginTop: 4, overflow: "hidden" as any, zIndex: 10 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox:    { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 36 },
  searchInput:  { flex: 1, fontSize: 12 },
  datePill:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignSelf: "flex-start" },
  datePillTxt:  { fontSize: 13, fontWeight: "600" },
  applyBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 12, marginTop: 20, marginBottom: 20 },
  applyBtnTxt:  { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

  // Config button
  configBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  configTxt:  { fontSize: 12, fontWeight: "600" },

  // Scenario legend
  legendCard:  { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  legendTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  legendRow:   { flexDirection: "row", alignItems: "center", gap: 10 },
  legendIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  legendLabel: { fontSize: 12 },
});
