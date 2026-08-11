import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, KeyboardAvoidingView, ActivityIndicator,
  Alert, Platform, useWindowDimensions,
} from "react-native";
import {
  Plus, Cpu, Wifi, Radio, BatteryMedium,
  Search, X, Check, ShieldCheck, TriangleAlert,
  MapPin, ChevronDown,
} from "lucide-react-native";
import Svg, { Rect } from "react-native-svg";
import { useT } from "@context/ThemeContext";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useAuth } from "@context/AuthContext";
import { tiempoRelativo } from "@utils/format";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import { CollaresAPI } from "@services/api";
import { Animal } from "@/types";
import { navigateTo } from "@navigation/navigationRef";

// ─── Signal bars ──────────────────────────────────────────────────────────────
function SignalBars({ señal, color }: { señal: string; color: string }) {
  const bars = señal === "Excelente" ? 3 : señal === "Buena" ? 2 : 1;
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14">
      <Rect x={0} y={10} width={4} height={4} rx={1} fill={bars >= 1 ? color : "#d1d5db"} />
      <Rect x={6} y={6} width={4} height={8} rx={1} fill={bars >= 2 ? color : "#d1d5db"} />
      <Rect x={12} y={2} width={4} height={12} rx={1} fill={bars >= 3 ? color : "#d1d5db"} />
    </Svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, valor, label, color, bg, progressPct, progressColor,
}: {
  icon: React.ComponentType<any>;
  valor: number | string;
  label: string;
  color: string;
  bg: string;
  progressPct?: number;
  progressColor?: string;
}) {
  const T = useT();
  return (
    <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={st.statCardTop}>
        <View style={[st.statIconBox, { backgroundColor: bg }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={[st.statValor, { color }]}>{valor}</Text>
      </View>
      <Text style={[st.statLabel, { color: T.txtSec }]}>{label}</Text>
      <View style={st.statProgressWrap}>
        <View style={[st.statProgressBg, { backgroundColor: T.borde }]}>
          <View
            style={[
              st.statProgressFill,
              { width: `${Math.min(progressPct ?? 0, 100)}%` as any, backgroundColor: progressColor ?? color },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Table header cell ────────────────────────────────────────────────────────
function TH({ label, flex, width }: { label: string; flex?: number; width?: number }) {
  const T = useT();
  return (
    <Text
      style={[
        st.thCell,
        { color: T.txtSec },
        flex !== undefined ? { flex } : undefined,
        width !== undefined ? { width } : undefined,
      ]}
    >
      {label}
    </Text>
  );
}

// ─── Device table row ─────────────────────────────────────────────────────────
function DeviceTableRow({ animal, isLast, T }: { animal: Animal; isLast: boolean; T: ReturnType<typeof useT> }) {
  const collar = animal.collar!;
  const enLinea = collar.estado === "en_linea";
  const statusColor = enLinea ? T.verde : T.rojo;
  const statusBg    = enLinea ? T.verdeLuz : T.rojoBg;
  const bateria     = collar.bateria ?? 0;
  const bateriaColor = bateria >= 60 ? T.verde : bateria >= 30 ? T.naranja : T.rojo;
  const señal        = collar.señal ?? "—";
  const señalColor   = señal === "Excelente" ? T.verde : señal === "Buena" ? T.naranja : T.rojo;
  const ultimaTx     = collar.ultimaConexion ? tiempoRelativo(collar.ultimaConexion) : "—";
  const animalId     = `ANM-${animal.id.replace(/\D/g, "").padStart(3, "0")}`;

  return (
    <TouchableOpacity
      style={[
        st.tableRow,
        { backgroundColor: T.card, borderBottomColor: T.borde },
        isLast && { borderBottomWidth: 0 },
      ]}
      activeOpacity={0.75}
      onPress={() => navigateTo("AnimalDetail", { animalId: animal.id })}
    >
      {/* Dispositivo */}
      <View style={[st.tdDevice, { flex: 2 }]}>
        <View style={[st.deviceIconBox, { backgroundColor: T.verdeLuz }]}>
          <Cpu size={18} color={T.verde} strokeWidth={1.6} />
        </View>
        <View style={{ gap: 3 }}>
          <Text style={[st.deviceSerial, { color: T.txtMain }]}>{collar.serial ?? collar.id}</Text>
          <View style={[st.protocoloBadge, { backgroundColor: T.verdeMuy }]}>
            <Text style={[st.protocoloBadgeTxt, { color: T.verdeOscuro }]}>{collar.protocolo ?? "LoRa"}</Text>
          </View>
        </View>
      </View>

      {/* Animal */}
      <View style={{ flex: 1.5 }}>
        <Text style={[st.tdTxt, { color: T.txtMain }]} numberOfLines={1}>{animal.nombre}</Text>
        <Text style={[st.tdSubTxt, { color: T.txtSec }]}>{animalId}</Text>
      </View>

      {/* Estado */}
      <View style={{ width: 100, alignItems: "flex-start" }}>
        <View style={[st.estadoBadge, { backgroundColor: statusBg }]}>
          <View style={[st.estadoDot, { backgroundColor: statusColor }]} />
          <Text style={[st.estadoBadgeTxt, { color: statusColor }]}>
            {enLinea ? "En línea" : "Sin señal"}
          </Text>
        </View>
      </View>

      {/* Batería */}
      <View style={{ width: 100 }}>
        <View style={[st.batBarBg, { backgroundColor: T.cardElevada }]}>
          <View style={[st.batBarFill, { width: `${bateria}%` as any, backgroundColor: bateriaColor }]} />
        </View>
        <Text style={[st.tdTxt, { color: bateriaColor, marginTop: 3 }]}>{bateria}%</Text>
      </View>

      {/* Señal */}
      <View style={{ width: 80, gap: 3 }}>
        <SignalBars señal={señal} color={señalColor} />
        <Text style={[st.tdSubTxt, { color: T.txtSec }]}>{señal}</Text>
      </View>

      {/* Protocolo */}
      <View style={{ width: 90, alignItems: "flex-start" }}>
        <View style={[st.protocoloBadge, { backgroundColor: T.azulBg }]}>
          <Radio size={11} color={T.azul} strokeWidth={1.8} />
          <Text style={[st.protocoloBadgeTxt, { color: T.azul }]}>{collar.protocolo ?? "LoRa"}</Text>
        </View>
      </View>

      {/* Última TX */}
      <View style={{ flex: 1 }}>
        <Text style={[st.tdTxt, { color: T.txtMain }]}>{ultimaTx}</Text>
        {collar.ultimaConexion && (
          <Text style={[st.tdSubTxt, { color: T.txtSec }]}>
            {new Date(collar.ultimaConexion).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        )}
      </View>

      {/* Acciones */}
      <View style={[st.actionsCell, { width: 70 }]}>
        <TouchableOpacity
          style={[st.actionBtn, { backgroundColor: T.cardElevada }]}
          activeOpacity={0.75}
          onPress={(e) => { e.stopPropagation(); navigateTo("Map"); }}
        >
          <MapPin size={13} color={T.txtSec} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[st.actionBtn, { backgroundColor: T.cardElevada }]}
          activeOpacity={0.75}
          onPress={(e) => { e.stopPropagation(); navigateTo("AnimalDetail", { animalId: animal.id }); }}
        >
          <Cpu size={13} color={T.txtSec} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Register modal ───────────────────────────────────────────────────────────
function RegistrarDispositivoModal({ visible, onCerrar, onRegistrado }: {
  visible: boolean;
  onCerrar: () => void;
  onRegistrado?: () => void;
}) {
  const T = useT();
  const { usuario } = useAuth();
  const [tipo,      setTipo]      = useState<"Collar" | "Gateway">("Collar");
  const [id,        setId]        = useState("");
  const [guardando, setGuardando] = useState(false);

  function limpiar() { setId(""); setTipo("Collar"); }

  async function guardar() {
    if (!id.trim()) { Alert.alert("Campo requerido", "El serial del collar es obligatorio."); return; }
    setGuardando(true);
    try {
      await CollaresAPI.registrar({ serial: id.trim().toUpperCase(), fincaId: usuario?.fincaId });
      limpiar();
      onRegistrado?.();
      onCerrar();
      Alert.alert("✓ Collar registrado", `El collar "${id.trim().toUpperCase()}" fue agregado al sistema.`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Verifica que el serial no esté duplicado.";
      Alert.alert("Error al registrar", msg);
    } finally {
      setGuardando(false);
    }
  }

  function cerrar() { limpiar(); onCerrar(); }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={cerrar}>
      <KeyboardAvoidingView style={dm.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={dm.backdrop} activeOpacity={1} onPress={cerrar} />
        <View style={[dm.sheet, { backgroundColor: T.card }]}>
          <View style={[dm.handle, { backgroundColor: T.borde }]} />
          <View style={dm.header}>
            <Text style={[dm.titulo, { color: T.txtMain }]}>Registrar dispositivo</Text>
            <TouchableOpacity style={[dm.closeBtn, { backgroundColor: T.cardElevada }]} onPress={cerrar} activeOpacity={0.7}>
              <X size={18} color={T.txtSec} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={[dm.label, { color: T.txtSec }]}>Tipo de dispositivo</Text>
          <View style={dm.chips}>
            {(["Collar", "Gateway"] as const).map((op) => (
              <TouchableOpacity
                key={op}
                style={[
                  dm.chip,
                  { backgroundColor: T.cardElevada, borderColor: T.borde },
                  tipo === op && { backgroundColor: T.verdeOscuro, borderColor: T.verdeOscuro },
                ]}
                onPress={() => setTipo(op)} activeOpacity={0.8}
              >
                <Text style={[dm.chipTxt, { color: T.txtSec }, tipo === op && { color: "#fff" }]}>
                  {op} GPS LoRa
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[dm.label, { color: T.txtSec }]}>Serial del collar *</Text>
          <View style={[dm.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput
              style={[dm.input, { color: T.txtMain }]}
              value={id}
              onChangeText={(t) => setId(t.toUpperCase())}
              placeholder="Ej. SF-0001, SF-0002..."
              placeholderTextColor={T.txtSec}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity
            style={[dm.btnGuardar, { backgroundColor: T.verdeOscuro }, guardando && { opacity: 0.7 }]}
            onPress={guardar} activeOpacity={0.85} disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Check size={16} color="#fff" strokeWidth={2.5} /><Text style={dm.btnTxt}>Registrar dispositivo</Text></>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const dm = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.60)" },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, gap: 10,
  },
  handle:    { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  header:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titulo:    { fontSize: 17, fontWeight: "800" },
  closeBtn:  { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label:     { fontSize: 12, fontWeight: "700", marginTop: 2 },
  chips:     { flexDirection: "row", gap: 8 },
  chip:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
  chipTxt:   { fontSize: 13, fontWeight: "700" },
  inputWrap: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14 },
  input:     { fontSize: 15, paddingVertical: 11 },
  btnGuardar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 16, paddingVertical: 15, marginTop: 4,
  },
  btnTxt: { fontSize: 15, fontWeight: "800", color: "#fff" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function DevicesScreen() {
  const T = useT();
  const { animales, conectado, recargar } = useAnimalsCtx();
  const [busqueda,      setBusqueda]      = useState("");
  const [modalVisible,  setModalVisible]  = useState(false);
  const { width } = useWindowDimensions();
  const isMd = width < 1100;
  const isSm = width < 768;

  const conCollar   = animales.filter((a) => a.collar);
  const enLinea     = conCollar.filter((a) => a.collar?.estado === "en_linea").length;
  const sinSenal    = conCollar.length - enLinea;
  const bateriaProm = conCollar.length > 0
    ? Math.round(conCollar.reduce((s, a) => s + (a.collar?.bateria ?? 0), 0) / conCollar.length)
    : 0;

  const filtrados = busqueda.trim()
    ? conCollar.filter((a) =>
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (a.collar?.serial ?? a.collar?.id ?? "").toLowerCase().includes(busqueda.toLowerCase())
      )
    : conCollar;

  const bateriaColor = bateriaProm >= 60 ? T.verde : bateriaProm >= 30 ? T.naranja : T.rojo;
  const bateriaBg    = bateriaProm >= 60 ? T.verdeLuz : bateriaProm >= 30 ? T.naranjaBg : T.rojoBg;

  const registerButton = (
    <TouchableOpacity
      style={[st.registerBtn, { backgroundColor: T.verdeOscuro }]}
      activeOpacity={0.85}
      onPress={() => setModalVisible(true)}
    >
      <Plus size={14} color="#fff" strokeWidth={2.5} />
      <Text style={st.registerBtnTxt}>Registrar dispositivo</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Devices" />

      <View style={st.main}>
        <WebTopBar
          titulo="Dispositivos"
          sub="Collares GPS y gateways LoRa"
          rightContent={registerButton}
        />

        <ScrollView
          style={st.scroll}
          contentContainerStyle={st.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Stat cards ── */}
          <View style={[st.statCardsRow, isMd && { flexWrap: "wrap" }]}>
            <StatCard
              icon={Cpu}
              valor={conCollar.length || 0}
              label="Total dispositivos"
              color={T.verde}
              bg={T.verdeLuz}
              progressPct={100}
              progressColor={T.verde}
            />
            <StatCard
              icon={ShieldCheck}
              valor={enLinea}
              label="En línea"
              color={T.verde}
              bg={T.verdeLuz}
              progressPct={conCollar.length > 0 ? (enLinea / conCollar.length) * 100 : 0}
              progressColor={T.verde}
            />
            <StatCard
              icon={TriangleAlert}
              valor={sinSenal}
              label="Sin señal"
              color={T.rojo}
              bg={T.rojoBg}
              progressPct={conCollar.length > 0 ? (sinSenal / conCollar.length) * 100 : 0}
              progressColor={T.rojo}
            />
            <StatCard
              icon={BatteryMedium}
              valor={`${bateriaProm}%`}
              label="Batería promedio"
              color={bateriaColor}
              bg={bateriaBg}
              progressPct={bateriaProm}
              progressColor={bateriaColor}
            />
          </View>

          {/* ── Toolbar ── */}
          <View style={[st.toolbarRow, isMd && { flexWrap: "wrap", rowGap: 8 }]}>
            <View style={[st.searchWrap, { backgroundColor: T.card, borderColor: T.borde }]}>
              <Search size={14} color={T.txtTer} strokeWidth={1.8} />
              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar dispositivo o animal..."
                placeholderTextColor={T.txtTer}
                style={[st.searchInput, { color: T.txtMain }]}
              />
            </View>
            <View style={[st.filterPill, { backgroundColor: T.card, borderColor: T.borde }]}>
              <Text style={[st.filterPillTxt, { color: T.txtSec }]}>Estado: Todos</Text>
              <ChevronDown size={14} color={T.txtTer} strokeWidth={1.8} />
            </View>
            <View style={[st.filterPill, { backgroundColor: T.card, borderColor: T.borde }]}>
              <Text style={[st.filterPillTxt, { color: T.txtSec }]}>Protocolo: Todos</Text>
              <ChevronDown size={14} color={T.txtTer} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }} />
            <View style={[st.networkBadge, { backgroundColor: conectado ? T.verdeLuz : T.rojoBg }]}>
              <Wifi size={13} color={conectado ? T.verde : T.rojo} strokeWidth={1.8} />
              <Text style={[st.networkBadgeTxt, { color: conectado ? T.verdeOscuro : T.rojo }]}>
                Red {conectado ? "activa" : "inactiva"}
              </Text>
            </View>
          </View>

          {/* ── Table ── */}
          <ScrollView horizontal={isSm} showsHorizontalScrollIndicator={isSm}>
            <View style={[st.table, isSm && { minWidth: 720 }, { backgroundColor: T.card, borderColor: T.borde }]}>
              {/* Header */}
              <View style={[st.tableHeader, { backgroundColor: T.cardElevada, borderBottomColor: T.borde }]}>
                <TH label="DISPOSITIVO"  flex={2}    />
                <TH label="ANIMAL"       flex={1.5}  />
                <TH label="ESTADO"       width={100} />
                <TH label="BATERÍA"      width={100} />
                <TH label="SEÑAL"        width={80}  />
                <TH label="PROTOCOLO"    width={90}  />
                <TH label="ÚLTIMA TX"    flex={1}    />
                <TH label="ACCIONES"     width={70}  />
              </View>

              {/* Rows */}
              {filtrados.length === 0 ? (
                <View style={[st.emptyRow, { borderColor: T.borde }]}>
                  <Cpu size={32} color={T.txtTer} strokeWidth={1.4} />
                  <Text style={[st.emptyTxt, { color: T.txtSec }]}>
                    {busqueda ? "No se encontraron dispositivos." : "No hay dispositivos registrados."}
                  </Text>
                </View>
              ) : (
                filtrados.map((animal, idx) => (
                  <DeviceTableRow
                    key={animal.id}
                    animal={animal}
                    isLast={idx === filtrados.length - 1}
                    T={T}
                  />
                ))
              )}

              {/* Footer info */}
              <View style={[st.tableFooter, { borderTopColor: T.borde }]}>
                <Text style={[st.footerTxt, { color: T.txtSec }]}>
                  {filtrados.length} dispositivo{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
                </Text>
                <View style={[st.networkBadge, { backgroundColor: conectado ? T.verdeLuz : T.rojoBg }]}>
                  <Radio size={12} color={conectado ? T.verde : T.rojo} strokeWidth={1.8} />
                  <Text style={[st.networkBadgeTxt, { color: conectado ? T.verdeOscuro : T.rojo }]}>
                    {enLinea} activos · Red LoRa
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      <RegistrarDispositivoModal
        visible={modalVisible}
        onCerrar={() => setModalVisible(false)}
        onRegistrado={recargar}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  main: { flex: 1, flexDirection: "column" },

  scroll:  { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 80, gap: 0 },

  registerBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9,
  },
  registerBtnTxt: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // Stat cards
  statCardsRow: { flexDirection: "row", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, minWidth: 130 },
  statCardTop: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 4,
  },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValor:   { fontSize: 28, fontWeight: "900" },
  statLabel:   { fontSize: 11, marginBottom: 8 },
  statProgressWrap: { marginTop: 2 },
  statProgressBg:   { height: 5, borderRadius: 3, overflow: "hidden" as any },
  statProgressFill: { height: 5, borderRadius: 3 },

  // Toolbar
  toolbarRow: {
    flexDirection: "row", gap: 10, marginBottom: 16, alignItems: "center",
  },
  searchWrap: {
    flex: 1, minWidth: 120,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 38,
  },
  searchInput: {
    flex: 1, fontSize: 13, padding: 0,
    outlineStyle: "none" as any,
  },
  filterPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  filterPillTxt: { fontSize: 12 },
  networkBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  networkBadgeTxt: { fontSize: 11, fontWeight: "600" },

  // Table
  table: { borderRadius: 16, borderWidth: 1, overflow: "hidden" as any, marginBottom: 0 },
  tableHeader: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  thCell: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  tableRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, gap: 8,
  },
  tdDevice: { flexDirection: "row", alignItems: "center", gap: 10 },
  deviceIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  deviceSerial:  { fontSize: 13, fontWeight: "700" },
  protocoloBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    alignSelf: "flex-start",
  },
  protocoloBadgeTxt: { fontSize: 10, fontWeight: "700" },
  tdTxt:    { fontSize: 12 },
  tdSubTxt: { fontSize: 11 },
  estadoBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  estadoDot:     { width: 6, height: 6, borderRadius: 3 },
  estadoBadgeTxt: { fontSize: 11, fontWeight: "700" },
  batBarBg:  { height: 5, borderRadius: 3, overflow: "hidden" as any, width: 70 },
  batBarFill: { height: 5, borderRadius: 3 },
  actionsCell: { flexDirection: "row", gap: 4, alignItems: "center" },
  actionBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },

  // Empty
  emptyRow: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 48, gap: 10, borderBottomWidth: 1,
  },
  emptyTxt: { fontSize: 13 },

  // Footer
  tableFooter: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1,
  },
  footerTxt: { fontSize: 12 },
});
