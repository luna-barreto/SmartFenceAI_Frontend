import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
} from "react-native";
import {
  Bell,
  TriangleAlert,
  Info,
  CheckCircle2,
  Settings,
  ChevronRight,
  SlidersHorizontal,
  Menu,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useDrawer } from "@context/DrawerContext";
import { useAuth } from "@context/AuthContext";
import { useT } from "@context/ThemeContext";
import { Alerta } from "@/types";
import { tiempoRelativo } from "@/utils/format";
import { AlertasAPI } from "@services/api";

const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

type Tab = "todas" | "no_leidas" | "resueltas";

// Tipo local que normaliza el tipo de alerta a los valores de UI
type AlertaUI = Omit<Alerta, "tipo"> & {
  tipo: "critica" | "advertencia" | "informativa";
  sub?: string;
  descripcion?: string;
};

const TITULO_POR_TIPO: Record<string, string> = {
  ANIMAL_SALIO:       "Animal fuera de la cerca",
  ANIMAL_ENTRO:       "Animal volvió a la cerca",
  BATERIA_BAJA:       "Batería baja en dispositivo",
  COLLAR_DESCONECTADO:"Dispositivo desconectado",
  COLLAR_RETIRADO:    "Collar retirado del animal",
  INTRUSO_DETECTADO:  "Intruso detectado",
  VELOCIDAD_ANORMAL:  "Velocidad anormal detectada",
  TEMPERATURA_ANORMAL:"Temperatura anormal detectada",
};

function severidadAUiTipo(a: Alerta): "critica" | "advertencia" | "informativa" {
  if (a.tipoUI === "critica" || a.tipoUI === "advertencia" || a.tipoUI === "informativa") return a.tipoUI;
  if (a.severidad === "CRITICA") return "critica";
  if (a.severidad === "MEDIA")   return "advertencia";
  return "informativa";
}

function normalizarAlerta(a: Alerta): AlertaUI {
  const tipo = severidadAUiTipo(a);
  const titulo = a.titulo ?? TITULO_POR_TIPO[a.tipo] ?? a.mensaje;
  const sub = a.animal?.nombre ?? undefined;
  return {
    ...a,
    tipo,
    titulo,
    sub,
    leida: a.leida ?? false,
    resuelta: a.resuelta ?? (a.estado === "RESUELTA"),
  };
}

// ─── Tarjeta de stat ──────────────────────────────────────────────────────────
function StatMini({
  icon: Icon, valor, label, sub, color, bg, T,
}: {
  icon: React.ComponentType<any>;
  valor: number | string;
  label: string;
  sub: string;
  color: string;
  bg: string;
  T: ReturnType<typeof useT>;
}) {
  return (
    <View style={[st.statCard, { flex: 1, backgroundColor: T.card, borderColor: T.borde, shadowColor: "#000" }]}>
      <View style={[st.statIcon, { backgroundColor: bg }]}>
        <Icon size={18} color={color} strokeWidth={1.8} />
      </View>
      <Text style={[st.statValor, { color }]}>{valor}</Text>
      <Text style={[st.statLabel, { color: T.txtMain }]}>{label}</Text>
      <Text style={[st.statSub, { color }]}>{sub}</Text>
    </View>
  );
}

// ─── Ítem de alerta ───────────────────────────────────────────────────────────
function AlertRow({
  alerta,
  onResolver,
  T,
}: {
  alerta: AlertaUI;
  onResolver?: (id: string) => void;
  T: ReturnType<typeof useT>;
}) {
  const TIPO_CONFIG: Record<
    AlertaUI["tipo"],
    { bg: string; color: string; Icon: React.ComponentType<any>; label: string }
  > = {
    critica:     { bg: T.rojoBg,    color: T.rojo,    Icon: Bell,          label: "Crítica"     },
    advertencia: { bg: T.naranjaBg, color: T.naranja,  Icon: TriangleAlert, label: "Advertencia" },
    informativa: { bg: T.azulBg,    color: T.azul,    Icon: Info,          label: "Informativa" },
  };

  const cfg = TIPO_CONFIG[alerta.tipo];
  const Icon = cfg.Icon;
  const tiempo = tiempoRelativo(alerta.fecha);
  const tiempoColor =
    alerta.tipo === "critica" ? T.rojo :
    alerta.tipo === "advertencia" ? T.naranja : T.azul;

  return (
    <TouchableOpacity
      style={st.alertRow}
      activeOpacity={0.75}
      onPress={() => onResolver && !alerta.resuelta && onResolver(alerta.id)}
    >
      {/* Icono */}
      <View style={[st.alertIconBox, { backgroundColor: cfg.bg }]}>
        <Icon size={22} color={cfg.color} strokeWidth={1.8} />
      </View>

      {/* Contenido */}
      <View style={{ flex: 1 }}>
        <Text style={[st.alertTitulo, { color: T.txtMain }]} numberOfLines={1}>{alerta.titulo}</Text>
        {alerta.sub && (
          <Text style={[st.alertSub, { color: T.txtSec }]} numberOfLines={1}>{alerta.sub}</Text>
        )}
        {alerta.descripcion && (
          <Text style={[st.alertDesc, { color: T.txtSec }]} numberOfLines={2}>{alerta.descripcion}</Text>
        )}
      </View>

      {/* Tiempo + chevron */}
      <View style={st.alertRight}>
        <View style={[st.tiempoBadge, { backgroundColor: alerta.resuelta ? T.verdeLuz : cfg.bg }]}>
          <Text style={[st.tiempoTxt, { color: alerta.resuelta ? T.verdeOscuro : tiempoColor }]}>
            {tiempo}
          </Text>
        </View>
        {alerta.resuelta
          ? <CheckCircle2 size={16} color={T.verde} strokeWidth={1.8} style={{ marginTop: 6 }} />
          : <ChevronRight size={16} color={T.txtSec} strokeWidth={1.8} style={{ marginTop: 6 }} />
        }
      </View>
    </TouchableOpacity>
  );
}

// ─── AlertsScreen ─────────────────────────────────────────────────────────────
export default function AlertsScreen() {
  const { width: SW } = useWindowDimensions();
  const T = useT();
  const navigation = useNavigation<any>();
  const { openDrawer } = useDrawer();
  const { usuario } = useAuth();

  const [alertas, setAlertas] = useState<(AlertaUI)[]>([]);
  const [tab, setTab] = useState<Tab>("todas");

  const { conectado, alertas: alertasNuevas } = useAnimalsCtx();

  // Carga inicial desde el backend
  const cargarAlertas = useCallback(async () => {
    if (!usuario?.fincaId) return;
    try {
      const { data } = await AlertasAPI.listar(usuario.fincaId);
      setAlertas(data.map(normalizarAlerta));
    } catch { /* sin backend: queda la lista vacía hasta que lleguen por socket */ }
  }, [usuario?.fincaId]);

  useEffect(() => { cargarAlertas(); }, [cargarAlertas]);

  // Sincronizar alertas en tiempo real (socket / simulación)
  useEffect(() => {
    if (!alertasNuevas.length) return;
    setAlertas((prev) => {
      const ids = new Set(prev.map((a) => a.id));
      const nuevas = alertasNuevas
        .filter((a) => !ids.has(a.id))
        .map(normalizarAlerta);
      return nuevas.length > 0 ? [...nuevas, ...prev].slice(0, 100) : prev;
    });
  }, [alertasNuevas]);

  async function marcarResuelta(id: string) {
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resuelta: true, leida: true, estado: "RESUELTA" } : a))
    );
    await AlertasAPI.marcarResuelta(id).catch(() => {});
  }

  const criticas     = alertas.filter((a) => a.tipo === "critica"     && !a.resuelta).length;
  const advertencias = alertas.filter((a) => a.tipo === "advertencia" && !a.resuelta).length;
  const informativas = alertas.filter((a) => a.tipo === "informativa").length;
  const resueltas    = alertas.filter((a) => a.resuelta).length;
  const noLeidas     = alertas.filter((a) => !a.leida).length;

  const filtradas = alertas.filter((a) => {
    if (tab === "no_leidas") return !a.leida;
    if (tab === "resueltas") return a.resuelta;
    return true;
  });

  // Agrupar por día
  const hoy = filtradas.filter((a) => {
    const diff = Date.now() - new Date(a.fecha).getTime();
    return diff < 1000 * 60 * 60 * 24;
  });
  const ayer = filtradas.filter((a) => {
    const diff = Date.now() - new Date(a.fecha).getTime();
    return diff >= 1000 * 60 * 60 * 24 && diff < 1000 * 60 * 60 * 48;
  });

  const nombreUsuario = usuario?.nombre?.split(" ")[0] ?? "Ganadero";

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      {/* ── Header ── */}
      <View style={[st.header, { backgroundColor: T.header, borderBottomColor: T.borde, shadowColor: "#000" }]}>
        <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={openDrawer} activeOpacity={0.7}>
          <Menu size={20} color={T.txtMain} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={st.headerLeft}>
          <Image
            source={require("../../assets/logotipo.png")}
            style={st.headerLogo}
            resizeMode="contain"
          />
          <Text style={st.headerBrand}>
            <Text style={{ color: T.txtMain, fontWeight: "700" }}>SMART</Text>
            <Text style={{ color: T.verdeOscuro, fontWeight: "900" }}>FENCE</Text>
            <Text style={{ color: T.verde, fontWeight: "900" }}> AI</Text>
          </Text>
        </View>
        <View style={st.headerRight}>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={() => {}} activeOpacity={0.7}>
            <Bell size={20} color={T.txtMain} strokeWidth={1.8} />
            {noLeidas > 0 && (
              <View style={[st.headerBadge, { backgroundColor: T.rojo }]}>
                <Text style={[st.headerBadgeTxt, { color: "#fff" }]}>{noLeidas}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={[st.avatar, { backgroundColor: T.verde }]}>
            <Text style={[st.avatarTxt, { color: "#fff" }]}>{nombreUsuario.charAt(0).toUpperCase()}</Text>
            <View style={[st.avatarDot, { backgroundColor: conectado ? T.verde : T.rojo }]} />
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Título + Configuración ── */}
        <View style={st.titleRow}>
          <View>
            <Text style={[st.pageTitle, { color: T.txtMain }]}>Alertas</Text>
            <Text style={[st.pageSub, { color: T.txtSec }]}>Monitorea lo que sucede en tu finca en tiempo real</Text>
          </View>
          <TouchableOpacity style={[st.configBtn, { backgroundColor: T.card, borderColor: T.borde, shadowColor: "#000" }]} activeOpacity={0.75}>
            <Settings size={15} color={T.txtMain} strokeWidth={1.8} />
            <Text style={[st.configTxt, { color: T.txtMain }]}>Configuración</Text>
          </TouchableOpacity>
        </View>

        {/* ── 4 stat cards ── */}
        <View style={[st.statsRow, SW < 400 && st.statsRowWrap]}>
          <StatMini T={T} icon={Bell}         valor={criticas}     label="Críticas"      sub="Requieren atención"   color={T.rojo}    bg={T.rojoBg}    />
          <StatMini T={T} icon={TriangleAlert} valor={advertencias} label="Advertencias"  sub="Atención necesaria"   color={T.naranja} bg={T.naranjaBg} />
          <StatMini T={T} icon={Info}          valor={informativas} label="Informativas"  sub="Para tu conocimiento" color={T.azul}    bg={T.azulBg}    />
          <StatMini T={T} icon={CheckCircle2}  valor={resueltas}    label="Resueltas hoy" sub="Sin novedad"           color={T.verde}   bg={T.verdeLuz}  />
        </View>

        {/* ── Tabs + Filtrar ── */}
        <View style={st.tabRow}>
          <View style={st.tabs}>
            {(["todas", "no_leidas", "resueltas"] as Tab[]).map((t) => {
              const labels: Record<Tab, string> = { todas: "Todas", no_leidas: "No leídas", resueltas: "Resueltas" };
              const counts: Record<Tab, number> = {
                todas: alertas.length,
                no_leidas: noLeidas,
                resueltas: resueltas,
              };
              const activo = tab === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  style={[
                    st.tabBtn,
                    { backgroundColor: T.card, borderColor: T.borde },
                    activo && { backgroundColor: T.verdeAlfa, borderColor: T.verde },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text style={[st.tabTxt, { color: T.txtSec }, activo && { color: T.verdeBrillo }]}>{labels[t]}</Text>
                  {counts[t] > 0 && (
                    <View style={[st.tabBadge, { backgroundColor: activo ? T.verde : T.borde }]}>
                      <Text style={[st.tabBadgeTxt, { color: activo ? "#fff" : T.txtSec }]}>
                        {counts[t]}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={[st.filtrarBtn, { backgroundColor: T.card, borderColor: T.borde }]} activeOpacity={0.75}>
            <SlidersHorizontal size={14} color={T.txtMain} strokeWidth={1.8} />
            <Text style={[st.filtrarTxt, { color: T.txtMain }]}>Filtrar</Text>
          </TouchableOpacity>
        </View>

        {/* ── Lista agrupada ── */}
        {filtradas.length === 0 && (
          <View style={[st.emptyBox, { backgroundColor: T.card, borderColor: T.borde }]}>
            <CheckCircle2 size={32} color={T.verde} strokeWidth={1.5} />
            <Text style={[st.emptyTxt, { color: T.txtSec }]}>No hay alertas en esta categoría.</Text>
          </View>
        )}

        {hoy.length > 0 && (
          <View style={st.grupo}>
            <Text style={[st.grupoLabel, { color: T.txtMain }]}>Hoy</Text>
            <View style={[st.grupoCard, { backgroundColor: T.card, borderColor: T.borde, shadowColor: "#000" }]}>
              {hoy.map((a, i) => (
                <View key={a.id}>
                  <AlertRow T={T} alerta={a} onResolver={marcarResuelta} />
                  {i < hoy.length - 1 && <View style={[st.separador, { backgroundColor: T.borde }]} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {ayer.length > 0 && (
          <View style={st.grupo}>
            <Text style={[st.grupoLabel, { color: T.txtMain }]}>Ayer</Text>
            <View style={[st.grupoCard, { backgroundColor: T.card, borderColor: T.borde, shadowColor: "#000" }]}>
              {ayer.map((a, i) => (
                <View key={a.id}>
                  <AlertRow T={T} alerta={a} onResolver={marcarResuelta} />
                  {i < ayer.length - 1 && <View style={[st.separador, { backgroundColor: T.borde }]} />}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: STATUS_BAR_H + HEADER_EXTRA_PT,
    paddingBottom: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogo: { width: 30, height: 30, borderRadius: 8 },
  headerBrand: { fontSize: 13, letterSpacing: 0.4 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  headerBadge: {
    position: "absolute", top: -2, right: -2,
    borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },
  headerBadgeTxt: { fontSize: 9, fontWeight: "800" },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  avatarTxt: { fontSize: 14, fontWeight: "800" },
  avatarDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 1.5, borderColor: "#fff",
  },

  scroll: { padding: 16, gap: 16 },

  // Título
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  pageTitle: { fontSize: 26, fontWeight: "900", letterSpacing: -0.3 },
  pageSub: { fontSize: 13, marginTop: 2 },
  configBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 2,
  },
  configTxt: { fontSize: 12.5, fontWeight: "600" },

  // Stats
  statsRow:     { flexDirection: "row", gap: 8 },
  statsRowWrap: { flexWrap: "wrap" },
  statCard: {
    flex: 1,
    minWidth: 70,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    marginBottom: 6,
  },
  statValor: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 10.5, fontWeight: "600" },
  statSub:   { fontSize: 9.5, marginTop: 1 },

  // Tabs
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  tabs: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tabBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabBtnActivo: {},
  tabTxt: { fontSize: 12, fontWeight: "600" },
  tabTxtActivo: {},
  tabBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeTxt: { fontSize: 9.5, fontWeight: "800" },
  filtrarBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filtrarTxt: { fontSize: 12, fontWeight: "600" },

  // Grupos
  grupo: { gap: 8 },
  grupoLabel: { fontSize: 15, fontWeight: "800" },
  grupoCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  separador: {
    height: 1,
    marginLeft: 68,
  },

  // Alert row
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
  },
  alertIconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  alertTitulo: { fontSize: 13.5, fontWeight: "700" },
  alertSub: { fontSize: 11.5, marginTop: 2 },
  alertDesc: { fontSize: 11.5, marginTop: 4, lineHeight: 16 },
  alertRight: { alignItems: "flex-end", gap: 2, flexShrink: 0 },
  tiempoBadge: {
    borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  tiempoTxt: { fontSize: 10.5, fontWeight: "700" },

  // Empty
  emptyBox: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 48, gap: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyTxt: { fontSize: 13 },
});
