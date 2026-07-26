import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, Modal, TextInput,
  KeyboardAvoidingView, Alert, ActivityIndicator,
} from "react-native";
import {
  BatteryLow, Battery, Cpu, Menu, Bell, Plus,
  X, Check, Wifi, Radio,
} from "lucide-react-native";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useAuth } from "@context/AuthContext";
import { tiempoRelativo } from "@utils/format";
import { Animal } from "@/types";
import { useDrawer } from "@context/DrawerContext";
import { useT } from "@context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { CollaresAPI } from "@services/api";

const STATUS_BAR_H    = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

// ─── Modal registrar dispositivo ─────────────────────────────────────────────
function RegistrarDispositivoModal({ visible, onCerrar, onRegistrado }: { visible: boolean; onCerrar: () => void; onRegistrado?: () => void }) {
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
              value={id} onChangeText={(t) => setId(t.toUpperCase())}
              placeholder="Ej. SF-0001, SF-0002..." placeholderTextColor={T.txtSec}
              autoFocus autoCapitalize="characters"
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
  handle:   { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  header:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titulo:   { fontSize: 17, fontWeight: "800" },
  closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label:    { fontSize: 12, fontWeight: "700", marginTop: 2 },
  chips:    { flexDirection: "row", gap: 8 },
  chip:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
  chipTxt:  { fontSize: 13, fontWeight: "700" },
  inputWrap:{ borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14 },
  input:    { fontSize: 15, paddingVertical: 11 },
  btnGuardar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 16, paddingVertical: 15, marginTop: 4,
  },
  btnTxt: { fontSize: 15, fontWeight: "800", color: "#fff" },
});

// ─── TarjetaCollar ────────────────────────────────────────────────────────────
function TarjetaCollar({ animal }: { animal: Animal }) {
  const T = useT();
  const bajo          = (animal.collar?.bateria ?? 0) < 25;
  const bateriaColor  = bajo ? T.rojo : (animal.collar?.bateria ?? 0) < 50 ? T.naranja : T.verdeBrillo;
  const estadoColor   = animal.dentroDeCerca ? T.verdeBrillo : T.rojo;
  const estadoBg      = animal.dentroDeCerca ? T.verdeLuz : T.rojoBg;

  return (
    <View style={[st.collarCard, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={st.collarTop}>
        <View style={[st.collarIconBox, { backgroundColor: T.verdeLuz }]}>
          <Cpu size={20} color={T.verde} strokeWidth={1.6} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[st.collarId, { color: T.txtMain }]}>{animal.collar?.id ?? "—"}</Text>
          <Text style={[st.collarAnimal, { color: T.txtSec }]}>{animal.nombre}</Text>
        </View>
        <View style={[st.estadoBadge, { backgroundColor: estadoBg }]}>
          <View style={[st.estadoDot, { backgroundColor: estadoColor }]} />
          <Text style={[st.estadoTxt, { color: estadoColor }]}>
            {animal.dentroDeCerca ? "En línea" : "Fuera"}
          </Text>
        </View>
      </View>

      <View style={st.bateriaRow}>
        {bajo
          ? <BatteryLow size={14} color={T.rojo} strokeWidth={1.8} />
          : <Battery    size={14} color={bateriaColor} strokeWidth={1.8} />}
        <View style={[st.bateriaTrack, { backgroundColor: T.borde }]}>
          <View style={[st.bateriaFill, { width: `${animal.collar?.bateria ?? 0}%` as any, backgroundColor: bateriaColor }]} />
        </View>
        <Text style={[st.bateriaPct, { color: bateriaColor }]}>{animal.collar?.bateria ?? 0}%</Text>
      </View>

      <View style={st.collarMeta}>
        <Text style={[st.metaTxt, { color: T.txtSec }]}>Señal: <Text style={[st.metaVal, { color: T.txtMain }]}>{animal.collar?.señal ?? "—"}</Text></Text>
        <Text style={[st.metaTxt, { color: T.txtSec }]}>Protocolo: <Text style={[st.metaVal, { color: T.txtMain }]}>{animal.collar?.protocolo ?? "LoRa"}</Text></Text>
        <Text style={[st.metaTxt, { color: T.txtSec }]}>Última tx: <Text style={[st.metaVal, { color: T.txtMain }]}>{animal.collar?.ultimaConexion ? tiempoRelativo(animal.collar.ultimaConexion) : "—"}</Text></Text>
      </View>
    </View>
  );
}

// ─── DevicesScreen ────────────────────────────────────────────────────────────
export default function DevicesScreen() {
  const T = useT();
  const { animales, conectado, recargar } = useAnimalsCtx();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<any>();
  const [modalDispositivo, setModalDispositivo] = useState(false);

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
          <View style={[st.conectadoBadge, { backgroundColor: conectado ? T.verdeLuz : T.rojoBg }]}>
            <View style={[st.dot, { backgroundColor: conectado ? T.verde : T.rojo }]} />
            <Text style={[st.conectadoTxt, { color: conectado ? T.verdeBrillo : T.rojo }]}>
              {conectado ? "Conectado" : "Sin señal"}
            </Text>
          </View>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={() => navigation.navigate("Alerts")} activeOpacity={0.7}>
            <Bell size={20} color={T.txtMain} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Título + Registrar ── */}
      <View style={st.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[st.pageTitle, { color: T.txtMain }]}>Dispositivos</Text>
          <Text style={[st.pageSub, { color: T.txtSec }]}>Gestiona los collares y gateways de tu finca</Text>
        </View>
        <TouchableOpacity style={[st.registerBtn, { backgroundColor: T.verdeOscuro }]} onPress={() => setModalDispositivo(true)} activeOpacity={0.85}>
          <Plus size={15} color="#fff" strokeWidth={2.5} />
          <Text style={st.registerTxt}>Registrar</Text>
        </TouchableOpacity>
      </View>

      {/* ── Banner red LoRa ── */}
      <View style={[st.bannerRed, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={[st.bannerIconBox, { backgroundColor: T.verdeLuz }]}>
          <Wifi size={22} color={T.verde} strokeWidth={1.6} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[st.bannerTitulo, { color: T.txtMain }]}>Red de collares LoRa</Text>
          <Text style={[st.bannerSub, { color: T.txtSec }]}>
            Cada ESP32 + GPS NEO-6M transmite posición cada 4s al gateway.
          </Text>
        </View>
        <View style={[st.redBadge, { backgroundColor: conectado ? T.verdeLuz : T.rojoBg }]}>
          <Radio size={14} color={conectado ? T.verde : T.rojo} strokeWidth={1.8} />
          <Text style={[st.redBadgeTxt, { color: conectado ? T.verdeBrillo : T.rojo }]}>
            {animales.length} activos
          </Text>
        </View>
      </View>

      {/* ── Lista collares ── */}
      <FlatList
        data={animales}
        keyExtractor={(a) => a.id}
        contentContainerStyle={st.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <TarjetaCollar animal={item} />}
      />

      <RegistrarDispositivoModal visible={modalDispositivo} onCerrar={() => setModalDispositivo(false)} onRegistrado={recargar} />
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
  conectadoBadge:{ flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  dot:           { width: 7, height: 7, borderRadius: 4 },
  conectadoTxt:  { fontSize: 11, fontWeight: "700" },

  titleRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 12,
    flexWrap: "wrap",
  },
  pageTitle:   { fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
  pageSub:     { fontSize: 12.5, marginTop: 2 },
  registerBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: "#4F9E2C", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  registerTxt: { fontSize: 12.5, fontWeight: "700", color: "#fff" },

  bannerRed: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 18, borderWidth: 1,
    padding: 14, marginHorizontal: 16, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 2,
  },
  bannerIconBox: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  bannerTitulo: { fontSize: 13.5, fontWeight: "800" },
  bannerSub:    { fontSize: 11, marginTop: 2, lineHeight: 15 },
  redBadge:     { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  redBadgeTxt:  { fontSize: 11, fontWeight: "700" },

  lista: { paddingHorizontal: 16, paddingBottom: 28, gap: 10 },

  collarCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 14, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 2,
  },
  collarTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  collarIconBox: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  collarId:     { fontSize: 13.5, fontWeight: "800" },
  collarAnimal: { fontSize: 11.5, marginTop: 1 },
  estadoBadge:  { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  estadoDot:    { width: 6, height: 6, borderRadius: 3 },
  estadoTxt:    { fontSize: 10.5, fontWeight: "700" },

  bateriaRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  bateriaTrack: {
    flex: 1, height: 6, borderRadius: 3,
    overflow: "hidden",
  },
  bateriaFill: { height: "100%", borderRadius: 3 },
  bateriaPct:  { fontSize: 11.5, fontWeight: "700", minWidth: 36, textAlign: "right" },

  collarMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaTxt:    { fontSize: 10.5 },
  metaVal:    { fontWeight: "700" },
});
