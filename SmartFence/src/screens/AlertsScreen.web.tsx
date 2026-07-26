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
} from "lucide-react-native";
import Svg, { Polyline } from "react-native-svg";
import { useT } from "@context/ThemeContext";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import { navigateTo } from "@navigation/navigationRef";

// ─── Types ────────────────────────────────────────────────────────────────────
type AlertTipo = "critica" | "advertencia" | "informativa";

interface Alerta {
  id: string;
  tipo: AlertTipo;
  titulo: string;
  sub: string;
  desc: string;
  fecha: string;
  leida: boolean;
  resuelta: boolean;
}

// ─── Utils ────────────────────────────────────────────────────────────────────
function tiempoRelativo(fecha: string): string {
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  return `hace ${Math.floor(diff / 3600)}h`;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
const SPARKLINE_WAVY = "0,20 10,12 20,22 30,10 40,18 50,7 60,16 70,5 80,13";
const SPARKLINE_FLAT = "0,14 20,14 40,14 60,14 80,14";
const SPARKLINE_UP   = "0,26 20,20 40,13 60,7 80,2";

function Sparkline({ points, color }: { points: string; color: string }) {
  return (
    <Svg width="100%" height={28} viewBox="0 0 80 28" style={{ marginTop: 8 }}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.65}
      />
    </Svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  valor,
  label,
  sub,
  color,
  bg,
  sparkline,
  T,
}: {
  icon: React.ComponentType<any>;
  valor: number;
  label: string;
  sub: string;
  color: string;
  bg: string;
  sparkline: string;
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
function AlertRow({ alerta, T }: { alerta: Alerta; T: ReturnType<typeof useT> }) {
  const cfg: Record<AlertTipo, { bg: string; color: string; Icon: React.ComponentType<any> }> = {
    critica:     { bg: T.rojoBg,    color: T.rojo,    Icon: Bell          },
    advertencia: { bg: T.naranjaBg, color: T.naranja, Icon: TriangleAlert },
    informativa: { bg: T.azulBg,    color: T.azul,    Icon: Info          },
  };
  const { bg, color, Icon } = cfg[alerta.tipo];
  const tiempo = tiempoRelativo(alerta.fecha);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        st.alertRow,
        { backgroundColor: T.card, borderBottomColor: T.borde },
        !alerta.leida && { borderLeftWidth: 3, borderLeftColor: color },
      ]}
    >
      {/* Icon box */}
      <View style={[st.alertIconBox, { backgroundColor: bg }]}>
        <Icon size={18} color={color} strokeWidth={1.8} />
      </View>

      {/* Middle content */}
      <View style={{ flex: 1 }}>
        <Text style={[st.alertTitle, { color: T.txtMain }]} numberOfLines={1}>
          {alerta.titulo}
        </Text>
        <Text style={[st.alertSub, { color: T.txtSec }]} numberOfLines={1}>
          {alerta.sub}
        </Text>
        <Text style={[st.alertDesc, { color: T.txtTer }]} numberOfLines={1}>
          {alerta.desc}
        </Text>
      </View>

      {/* Right: badge + unread dot */}
      <View style={st.alertRight}>
        <View style={[st.tiempoBadge, { backgroundColor: bg }]}>
          <Text style={[st.tiempoTxt, { color }]}>{tiempo}</Text>
        </View>
        <View
          style={[
            st.unreadDot,
            { backgroundColor: !alerta.leida ? T.verde : "transparent" },
          ]}
        />
      </View>

      {/* Chevron */}
      <ChevronRight size={16} color={T.txtTer} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
function Dropdown({ label, T }: { label: string; T: ReturnType<typeof useT> }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[st.dropdown, { backgroundColor: T.cardElevada, borderColor: T.borde }]}
    >
      <Text style={[st.dropdownTxt, { color: T.txtMain }]}>{label}</Text>
      <ChevronDown size={14} color={T.txtTer} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}

// ─── AlertsScreen ─────────────────────────────────────────────────────────────
export default function AlertsScreen() {
  const T = useT();
  const [tab, setTab] = useState("todas");

  const [alertas] = useState<Alerta[]>([
    {
      id: "1",
      tipo: "informativa",
      titulo: "Animal regresó al perímetro",
      sub: "Vaca 19 • Potrero Norte",
      desc: "El animal ingresó nuevamente al área segura.",
      fecha: new Date(Date.now() - 1000 * 12).toISOString(),
      leida: false,
      resuelta: false,
    },
    {
      id: "2",
      tipo: "informativa",
      titulo: "Animal regresó al perímetro",
      sub: "Toro 05 • Potrero Sur",
      desc: "El animal ingresó nuevamente al área segura.",
      fecha: new Date(Date.now() - 1000 * 28).toISOString(),
      leida: false,
      resuelta: false,
    },
    {
      id: "3",
      tipo: "informativa",
      titulo: "Animal regresó al perímetro",
      sub: "Vaca 32 • Potrero Este",
      desc: "El animal ingresó nuevamente al área segura.",
      fecha: new Date(Date.now() - 1000 * 45).toISOString(),
      leida: false,
      resuelta: false,
    },
    {
      id: "4",
      tipo: "critica",
      titulo: "Animal fuera de la cerca",
      sub: "Vaca 12 • Potrero Sur",
      desc: "El animal salió del perímetro virtual.",
      fecha: new Date(Date.now() - 1000 * 60).toISOString(),
      leida: false,
      resuelta: false,
    },
    {
      id: "5",
      tipo: "critica",
      titulo: "Animal fuera de la cerca",
      sub: "Toro 18 • Potrero Oeste",
      desc: "El animal salió del perímetro virtual.",
      fecha: new Date(Date.now() - 1000 * 120).toISOString(),
      leida: false,
      resuelta: false,
    },
    {
      id: "6",
      tipo: "advertencia",
      titulo: "Batería del collar baja",
      sub: "Vaca 19 • Collar COL-1002",
      desc: "La batería del collar está por debajo del 20%.",
      fecha: new Date(Date.now() - 1000 * 300).toISOString(),
      leida: false,
      resuelta: false,
    },
    {
      id: "7",
      tipo: "advertencia",
      titulo: "Señal LoRa débil",
      sub: "Gateway GW-01 • Potrero Norte",
      desc: "La señal LoRa del gateway está por debajo del nivel óptimo.",
      fecha: new Date(Date.now() - 1000 * 480).toISOString(),
      leida: true,
      resuelta: false,
    },
  ]);

  const criticas     = alertas.filter((a) => a.tipo === "critica"     && !a.resuelta).length;
  const advertencias = alertas.filter((a) => a.tipo === "advertencia" && !a.resuelta).length;
  const informativas = alertas.filter((a) => a.tipo === "informativa").length;
  const resueltas    = alertas.filter((a) => a.resuelta).length;
  const noLeidas     = alertas.filter((a) => !a.leida).length;

  const alertasFiltradas = alertas.filter((a) => {
    if (tab === "no_leidas") return !a.leida;
    if (tab === "resueltas") return a.resuelta;
    return true;
  });

  // Right content for WebTopBar
  const topBarRight = (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[st.configBtn, { backgroundColor: T.cardElevada, borderColor: T.borde }]}
    >
      <Settings size={14} color={T.txtMain} strokeWidth={1.8} />
      <Text style={[st.configTxt, { color: T.txtMain }]}>Configuración de alertas</Text>
    </TouchableOpacity>
  );

  const { width } = useWindowDimensions();
  const isMd = width < 1100;
  const isSm = width < 768;

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      {/* ── Sidebar ── */}
      <WebSidebar activeRoute="Alerts" />

      {/* ── Main column ── */}
      <View style={st.main}>
        {/* Top bar */}
        <WebTopBar
          titulo="Alertas"
          sub="Monitorea lo que sucede en tu finca en tiempo real"
          rightContent={topBarRight}
        />

        {/* Content row */}
        <View style={st.contentRow}>

          {/* ── LEFT MAIN ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={st.leftContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 4 stat cards */}
            <View style={[st.statsRow, isMd && { flexWrap: "wrap" }]}>
              <StatCard
                T={T}
                icon={Bell}
                valor={criticas}
                label="Críticas"
                sub="Requieren atención"
                color={T.rojo}
                bg={T.rojoBg}
                sparkline={SPARKLINE_WAVY}
              />
              <StatCard
                T={T}
                icon={TriangleAlert}
                valor={advertencias}
                label="Advertencias"
                sub="Atención necesaria"
                color={T.naranja}
                bg={T.naranjaBg}
                sparkline={SPARKLINE_WAVY}
              />
              <StatCard
                T={T}
                icon={Info}
                valor={informativas}
                label="Informativas"
                sub="Para tu conocimiento"
                color={T.azul}
                bg={T.azulBg}
                sparkline={SPARKLINE_FLAT}
              />
              <StatCard
                T={T}
                icon={CheckCircle2}
                valor={resueltas}
                label="Resueltas hoy"
                sub="Sin novedad"
                color={T.verde}
                bg={T.verdeAlfa}
                sparkline={SPARKLINE_UP}
              />
            </View>

            {/* Tabs row */}
            <View style={st.tabRow}>
              {[
                { key: "todas",     label: `Todas ${alertas.length}`  },
                { key: "no_leidas", label: `No leídas ${noLeidas}`    },
                { key: "resueltas", label: `Resueltas ${resueltas}`   },
              ].map(({ key, label }) => {
                const active = tab === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setTab(key)}
                    activeOpacity={0.75}
                    style={[
                      st.tabPill,
                      active
                        ? { backgroundColor: T.verdeOscuro }
                        : { backgroundColor: T.card, borderWidth: 1, borderColor: T.borde },
                    ]}
                  >
                    <Text style={[st.tabPillTxt, { color: active ? "#FFFFFF" : T.txtSec }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                activeOpacity={0.75}
                style={[st.filtrarBtn, { backgroundColor: T.card, borderColor: T.borde }]}
              >
                <SlidersHorizontal size={14} color={T.txtMain} strokeWidth={1.8} />
                <Text style={[st.filtrarTxt, { color: T.txtMain }]}>Filtrar</Text>
              </TouchableOpacity>
            </View>

            {/* Alert list */}
            <View style={[st.alertList, { backgroundColor: T.card, borderColor: T.borde }]}>
              {/* Section header */}
              <View style={[st.sectionHeader, { backgroundColor: T.cardElevada }]}>
                <Text style={[st.sectionHeaderTxt, { color: T.txtSec }]}>HOY</Text>
              </View>

              {/* Alert rows */}
              {alertasFiltradas.map((alerta) => (
                <AlertRow key={alerta.id} alerta={alerta} T={T} />
              ))}

              {/* Cargar más */}
              <TouchableOpacity
                activeOpacity={0.75}
                style={[st.loadMoreBtn, { backgroundColor: T.cardElevada, borderTopColor: T.borde }]}
              >
                <Text style={[st.loadMoreTxt, { color: T.txtSec }]}>Cargar más</Text>
                <ChevronDown size={14} color={T.txtSec} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* ── RIGHT PANEL ── */}
          <View style={[st.rightPanel, { backgroundColor: T.card, borderLeftColor: T.borde }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={st.rightPanelContent}
            >
              {/* Header */}
              <View style={st.filterHeader}>
                <Text style={[st.filterTitle, { color: T.txtMain }]}>Filtros</Text>
                <TouchableOpacity activeOpacity={0.75}>
                  <Text style={[st.filterClear, { color: T.verde }]}>Limpiar</Text>
                </TouchableOpacity>
              </View>

              {/* Tipo de alerta */}
              <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>TIPO DE ALERTA</Text>
              <Dropdown label="Todas" T={T} />

              {/* Estado */}
              <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>ESTADO</Text>
              <Dropdown label="Todas" T={T} />

              {/* Potrero */}
              <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>POTRERO</Text>
              <Dropdown label="Todos" T={T} />

              {/* Animal */}
              <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>ANIMAL</Text>
              <View style={[st.searchBox, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                <Search size={14} color={T.txtTer} strokeWidth={1.8} />
                <TextInput
                  placeholder="Buscar animal..."
                  placeholderTextColor={T.txtTer}
                  style={[st.searchInput, { color: T.txtMain }]}
                />
              </View>

              {/* Dispositivo */}
              <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>DISPOSITIVO</Text>
              <Dropdown label="Todos" T={T} />

              {/* Rango de fecha */}
              <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>RANGO DE FECHA</Text>
              <TouchableOpacity
                activeOpacity={0.75}
                style={[st.datePill, { backgroundColor: T.verdeAlfa }]}
              >
                <Calendar size={14} color={T.verde} strokeWidth={1.8} />
                <Text style={[st.datePillTxt, { color: T.verde }]}>Hoy</Text>
              </TouchableOpacity>

              {/* Prioridad */}
              <Text style={[st.filterGroupLabel, { color: T.txtSec }]}>PRIORIDAD</Text>
              <Dropdown label="Todas" T={T} />

              {/* Apply button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[st.applyBtn, { backgroundColor: T.verdeOscuro }]}
              >
                <Filter size={15} color="#FFFFFF" strokeWidth={1.8} />
                <Text style={st.applyBtnTxt}>Aplicar filtros</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

        </View>
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
  contentRow: {
    flex: 1,
    flexDirection: "row",
  },

  // Left content
  leftContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // Stat cards
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  statSub: {
    fontSize: 11,
    marginTop: 2,
  },

  // Tabs row
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabPillTxt: {
    fontSize: 13,
    fontWeight: "700",
  },
  filtrarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filtrarTxt: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Alert list card
  alertList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sectionHeaderTxt: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  // Alert row
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  alertSub: {
    fontSize: 11,
    marginTop: 2,
  },
  alertDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  alertRight: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  tiempoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tiempoTxt: {
    fontSize: 10,
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Load more
  loadMoreBtn: {
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderTopWidth: 1,
  },
  loadMoreTxt: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Right panel
  rightPanel: {
    width: 260,
    borderLeftWidth: 1,
  },
  rightPanelContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  filterClear: {
    fontSize: 13,
    fontWeight: "600",
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.4,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownTxt: {
    fontSize: 13,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  datePillTxt: {
    fontSize: 13,
    fontWeight: "600",
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
  },
  applyBtnTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Config button in top bar
  configBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  configTxt: {
    fontSize: 12,
    fontWeight: "600",
  },
});
