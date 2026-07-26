import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform, StatusBar, Image,
  Modal, TextInput, KeyboardAvoidingView,
  Alert, ActivityIndicator,
} from "react-native";
import {
  Menu, Bell, Pencil, MapPin, Mail, Calendar,
  ShieldCheck, Clock, Cpu, ChevronRight, LogOut,
  HelpCircle, User, Phone, Lock, Home, Navigation2,
  X, Check, Eye, EyeOff, Camera,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@context/AuthContext";
import { useDrawer } from "@context/DrawerContext";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useT } from "@context/ThemeContext";

const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

// ─── Modal de edición de campo ────────────────────────────────────────────────
interface EditModalProps {
  visible: boolean;
  titulo: string;
  valor: string;
  placeholder?: string;
  esContrasena?: boolean;
  multiline?: boolean;
  onGuardar: (v: string) => Promise<void>;
  onCerrar: () => void;
}

function EditModal({
  visible, titulo, valor, placeholder, esContrasena = false,
  multiline = false, onGuardar, onCerrar,
}: EditModalProps) {
  const T = useT();
  const [texto, setTexto] = useState(valor);
  const [confirmar, setConfirmar] = useState("");
  const [verPwd, setVerPwd] = useState(false);
  const [verConf, setVerConf] = useState(false);
  const [guardando, setGuardando] = useState(false);

  React.useEffect(() => {
    if (visible) { setTexto(valor); setConfirmar(""); }
  }, [visible]);

  async function handleGuardar() {
    if (!texto.trim()) {
      Alert.alert("Campo vacío", "Este campo no puede estar vacío.");
      return;
    }
    if (esContrasena && texto !== confirmar) {
      Alert.alert("No coinciden", "Las contraseñas no coinciden.");
      return;
    }
    if (esContrasena && texto.length < 6) {
      Alert.alert("Muy corta", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setGuardando(true);
    try {
      await onGuardar(texto.trim());
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        style={em.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          style={[em.backdrop, { backgroundColor: "rgba(0,0,0,0.45)" }]}
          activeOpacity={1}
          onPress={onCerrar}
        />
        <View style={[em.sheet, { backgroundColor: T.card }]}>
          {/* Handle */}
          <View style={[em.handle, { backgroundColor: T.borde }]} />

          {/* Cabecera */}
          <View style={em.sheetHeader}>
            <Text style={[em.sheetTitulo, { color: T.txtMain }]}>{titulo}</Text>
            <TouchableOpacity
              style={[em.sheetClose, { backgroundColor: T.cardElevada }]}
              onPress={onCerrar}
              activeOpacity={0.7}
            >
              <X size={18} color={T.txtSec} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Input principal */}
          <View style={[em.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput
              style={[em.input, multiline && em.inputMulti, { color: T.txtMain }]}
              value={texto}
              onChangeText={setTexto}
              placeholder={placeholder ?? `Ingresa ${titulo.toLowerCase()}`}
              placeholderTextColor={T.txtSec}
              secureTextEntry={esContrasena && !verPwd}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              autoFocus
            />
            {esContrasena && (
              <TouchableOpacity style={em.eyeBtn} onPress={() => setVerPwd((v) => !v)}>
                {verPwd
                  ? <EyeOff size={18} color={T.txtSec} strokeWidth={1.8} />
                  : <Eye    size={18} color={T.txtSec} strokeWidth={1.8} />}
              </TouchableOpacity>
            )}
          </View>

          {/* Input confirmación contraseña */}
          {esContrasena && (
            <View style={[em.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <TextInput
                style={[em.input, { color: T.txtMain }]}
                value={confirmar}
                onChangeText={setConfirmar}
                placeholder="Confirmar nueva contraseña"
                placeholderTextColor={T.txtSec}
                secureTextEntry={!verConf}
              />
              <TouchableOpacity style={em.eyeBtn} onPress={() => setVerConf((v) => !v)}>
                {verConf
                  ? <EyeOff size={18} color={T.txtSec} strokeWidth={1.8} />
                  : <Eye    size={18} color={T.txtSec} strokeWidth={1.8} />}
              </TouchableOpacity>
            </View>
          )}

          {/* Botón guardar */}
          <TouchableOpacity
            style={[em.btnGuardar, { backgroundColor: T.verdeOscuro }, guardando && { opacity: 0.7 }]}
            onPress={handleGuardar}
            activeOpacity={0.85}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Check size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={[em.btnTxt, { color: "#fff" }]}>Guardar cambios</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const em = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 36,
    paddingTop: 12, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 12,
  },
  handle:      { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitulo: { fontSize: 17, fontWeight: "800" },
  sheetClose:  { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 14,
  },
  input:      { flex: 1, fontSize: 15, paddingVertical: 13 },
  inputMulti: { height: 80, textAlignVertical: "top" },
  eyeBtn:     { paddingLeft: 8, paddingVertical: 12 },
  btnGuardar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 16, paddingVertical: 15, marginTop: 4,
  },
  btnTxt: { fontSize: 15, fontWeight: "800" },
});

// ─── Stat de cuenta ───────────────────────────────────────────────────────────
function CuentaStat({
  icon: Icon, label, valor, valorColor,
}: {
  icon: React.ComponentType<any>; label: string;
  valor: string; valorColor?: string;
}) {
  const T = useT();
  return (
    <View style={cs.item}>
      <View style={[cs.iconBox, { backgroundColor: T.verdeLuz }]}>
        <Icon size={20} color={T.verde} strokeWidth={1.6} />
      </View>
      <Text style={[cs.label, { color: T.txtSec }]}>{label}</Text>
      <Text style={[cs.valor, { color: valorColor ?? T.txtMain }]}>{valor}</Text>
    </View>
  );
}
const cs = StyleSheet.create({
  item:    { flex: 1, alignItems: "center", gap: 4 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label:   { fontSize: 10, textAlign: "center" },
  valor:   { fontSize: 12, fontWeight: "800", textAlign: "center" },
});

// ─── Fila de dato editable ────────────────────────────────────────────────────
function CampoRow({
  icon: Icon, titulo, valor, onEditar, last,
}: {
  icon: React.ComponentType<any>; titulo: string;
  valor: string; onEditar: () => void; last?: boolean;
}) {
  const T = useT();
  return (
    <TouchableOpacity
      style={[cr.row, !last && [cr.rowBorder, { borderBottomColor: T.borde }]]}
      onPress={onEditar}
      activeOpacity={0.72}
    >
      <View style={[cr.iconBox, { backgroundColor: T.verdeLuz }]}>
        <Icon size={18} color={T.verde} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[cr.label, { color: T.txtSec }]}>{titulo}</Text>
        <Text style={[cr.valor, { color: T.txtMain }]} numberOfLines={1}>{valor || "—"}</Text>
      </View>
      <View style={[cr.editChip, { backgroundColor: T.verdeAlfa }]}>
        <Pencil size={11} color={T.verdeBrillo} strokeWidth={2.2} />
        <Text style={[cr.editTxt, { color: T.verdeBrillo }]}>Editar</Text>
      </View>
    </TouchableOpacity>
  );
}

const cr = StyleSheet.create({
  row:      { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder:{ borderBottomWidth: 1 },
  iconBox:  { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  label:    { fontSize: 10.5, fontWeight: "500" },
  valor:    { fontSize: 13.5, fontWeight: "700", marginTop: 1 },
  editChip: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  editTxt:  { fontSize: 10, fontWeight: "700" },
});

// ─── Fila de navegación ───────────────────────────────────────────────────────
function NavRow({
  icon: Icon, titulo, sub, color, bg,
  onPress, last,
}: {
  icon: React.ComponentType<any>; titulo: string; sub: string;
  color?: string; bg?: string; onPress?: () => void; last?: boolean;
}) {
  const T = useT();
  return (
    <TouchableOpacity
      style={[nr.row, !last && [nr.rowBorder, { borderBottomColor: T.borde }]]}
      onPress={onPress} activeOpacity={0.72}
    >
      <View style={[nr.iconBox, { backgroundColor: bg }]}>
        <Icon size={20} color={color} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[nr.titulo, { color }]}>{titulo}</Text>
        <Text style={[nr.sub, { color: T.txtSec }]}>{sub}</Text>
      </View>
      <ChevronRight size={16} color={T.txtSec} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}
const nr = StyleSheet.create({
  row:      { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder:{ borderBottomWidth: 1 },
  iconBox:  { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  titulo:   { fontSize: 14, fontWeight: "700" },
  sub:      { fontSize: 12, marginTop: 1 },
});

// ─── ProfileScreen ────────────────────────────────────────────────────────────
type CampoActivo =
  | "nombre" | "correo" | "telefono"
  | "finca"  | "direccion" | "departamento"
  | "contrasena" | null;

export default function ProfileScreen() {
  const T = useT();
  const { usuario, cerrarSesion, actualizarUsuario } = useAuth();
  const { openDrawer } = useDrawer();
  const { conectado } = useAnimalsCtx();
  const navigation = useNavigation<any>();

  const [campoActivo, setCampoActivo] = useState<CampoActivo>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  async function seleccionarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para cambiar la foto de perfil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
    }
  }

  const iniciales = usuario?.nombre
    ?.split(" ").slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join("") ?? "U";

  const hora = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit", minute: "2-digit",
  });

  // Mapeo campo → config del modal
  const configCampo: Record<
    Exclude<CampoActivo, null>,
    { titulo: string; valor: string; esContrasena?: boolean; multiline?: boolean }
  > = {
    nombre:       { titulo: "Nombre completo",      valor: usuario?.nombre      ?? "" },
    correo:       { titulo: "Correo electrónico",    valor: usuario?.correo      ?? "" },
    telefono:     { titulo: "Teléfono",              valor: usuario?.telefono    ?? "" },
    finca:        { titulo: "Nombre de la finca",    valor: usuario?.finca       ?? "" },
    direccion:    { titulo: "Dirección / Ubicación", valor: usuario?.direccion   ?? "", multiline: true },
    departamento: { titulo: "Departamento",          valor: usuario?.departamento ?? "" },
    contrasena:   { titulo: "Nueva contraseña",      valor: "",                    esContrasena: true },
  };

  async function guardar(campo: Exclude<CampoActivo, null>, valor: string): Promise<void> {
    await actualizarUsuario({ [campo]: valor });
    setCampoActivo(null);
    Alert.alert("✓ Guardado", "Los cambios se han guardado correctamente.");
  }

  const cfg = campoActivo ? configCampo[campoActivo] : null;

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>

      {/* ── Header ── */}
      <View style={[st.header, { backgroundColor: T.header, borderBottomColor: T.borde }]}>
        <TouchableOpacity
          style={[st.headerBtn, { backgroundColor: T.headerBtn }]}
          onPress={openDrawer}
          activeOpacity={0.7}
        >
          <Menu size={20} color={T.txtMain} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={st.headerCenter}>
          <Image source={require("../../assets/logotipo.png")} style={st.headerLogo} resizeMode="contain" />
          <Text style={st.headerBrand}>
            <Text style={{ color: T.txtMain,     fontWeight: "700" }}>SMART</Text>
            <Text style={{ color: T.verdeOscuro, fontWeight: "900" }}>FENCE</Text>
            <Text style={{ color: T.verde,       fontWeight: "900" }}> AI</Text>
          </Text>
        </View>
        <View style={st.headerRight}>
          <View style={[st.conectadoBadge, { backgroundColor: T.verdeLuz, borderColor: T.verde }]}>
            <View style={[st.dot, { backgroundColor: conectado ? T.verde : T.rojo }]} />
            <Text style={[st.conectadoTxt, { color: conectado ? T.verdeBrillo : T.rojo }]}>
              {conectado ? "Conectado" : "Sin señal"}
            </Text>
          </View>
          <TouchableOpacity
            style={[st.headerBtn, { backgroundColor: T.headerBtn }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Alerts")}
          >
            <Bell size={20} color={T.txtMain} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        contentContainerStyle={st.scroll}>

        {/* ── Tarjeta avatar ── */}
        <View style={[st.perfilCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <View style={st.perfilRow}>
            <View style={st.avatarWrap}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={st.avatarImg} />
              ) : (
                <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
                  <Text style={[st.avatarTxt, { color: "#fff" }]}>{iniciales}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[st.editBtn, { backgroundColor: T.verde, borderColor: T.fondo }]}
                onPress={seleccionarFoto}
                activeOpacity={0.8}
              >
                <Camera size={12} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <View style={st.perfilInfo}>
              <Text style={[st.perfilNombre, { color: T.txtMain }]}>{usuario?.nombre ?? "Usuario"}</Text>
              <View style={[st.rolBadge, { backgroundColor: T.verdeAlfa, borderColor: T.verdeOscuro }]}>
                <ShieldCheck size={11} color={T.verde} strokeWidth={2} />
                <Text style={[st.rolTxt, { color: T.verdeBrillo }]}>Administrador</Text>
              </View>
              <View style={st.metaRow}>
                <MapPin size={12} color={T.txtSec} strokeWidth={1.8} />
                <Text style={[st.metaTxt, { color: T.txtSec }]}>{usuario?.finca ?? "Sin finca"}</Text>
              </View>
              <View style={st.metaRow}>
                <Mail size={12} color={T.txtSec} strokeWidth={1.8} />
                <Text style={[st.metaTxt, { color: T.txtSec }]} numberOfLines={1}>{usuario?.correo ?? "—"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={[st.statsCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <CuentaStat icon={Calendar}    label="Miembro desde" valor="Mar 2024" />
          <View style={[st.sep, { backgroundColor: T.borde }]} />
          <CuentaStat icon={ShieldCheck} label="Cuenta" valor="Verificada" valorColor={T.verde} />
          <View style={[st.sep, { backgroundColor: T.borde }]} />
          <CuentaStat icon={Clock}       label="Último acceso" valor={`Hoy, ${hora}`} />
        </View>

        {/* ── Información personal ── */}
        <Text style={[st.secLabel, { color: T.txtSec }]}>Información personal</Text>
        <View style={[st.listaCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <CampoRow icon={User}  titulo="Nombre completo"
            valor={usuario?.nombre   ?? ""}  onEditar={() => setCampoActivo("nombre")} />
          <CampoRow icon={Mail}  titulo="Correo electrónico"
            valor={usuario?.correo   ?? ""}  onEditar={() => setCampoActivo("correo")} />
          <CampoRow icon={Phone} titulo="Teléfono"
            valor={usuario?.telefono ?? ""}  onEditar={() => setCampoActivo("telefono")} last />
        </View>

        {/* ── Datos de la finca ── */}
        <Text style={[st.secLabel, { color: T.txtSec }]}>Datos de la finca</Text>
        <View style={[st.listaCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <CampoRow icon={Home}        titulo="Nombre de la finca"
            valor={usuario?.finca       ?? ""} onEditar={() => setCampoActivo("finca")} />
          <CampoRow icon={MapPin}      titulo="Dirección / Ubicación"
            valor={usuario?.direccion   ?? ""} onEditar={() => setCampoActivo("direccion")} />
          <CampoRow icon={Navigation2} titulo="Departamento"
            valor={usuario?.departamento ?? ""} onEditar={() => setCampoActivo("departamento")} last />
        </View>

        {/* ── Seguridad ── */}
        <Text style={[st.secLabel, { color: T.txtSec }]}>Seguridad</Text>
        <View style={[st.listaCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <CampoRow icon={Lock} titulo="Contraseña"
            valor={usuario?.contrasena ? "••••••••" : "Sin contraseña guardada"}
            onEditar={() => setCampoActivo("contrasena")} />
          <NavRow icon={Cpu} titulo="Dispositivos vinculados"
            sub="Gestiona tus collares y gateways"
            bg={T.verdeAlfa} color={T.verde}
            onPress={() => navigation.navigate("Devices")} last />
        </View>

        {/* ── Soporte ── */}
        <Text style={[st.secLabel, { color: T.txtSec }]}>Soporte</Text>
        <View style={[st.listaCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <NavRow icon={HelpCircle} titulo="Ayuda y soporte"
            sub="Centro de ayuda y contacto con soporte"
            bg={T.verdeAlfa} color={T.verde} last />
        </View>

        {/* ── Cerrar sesión ── */}
        <View style={[st.listaCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <NavRow
            icon={LogOut} titulo="Cerrar sesión"
            sub="Salir de tu cuenta de SmartFence AI."
            color={T.rojo} bg={T.rojoBg}
            onPress={cerrarSesion} last
          />
        </View>

        <Text style={[st.version, { color: T.txtTer }]}>SmartFence AI · v1.0 MVP</Text>
        <View style={{ height: 28 }} />
      </ScrollView>

      {/* ── Modal de edición ── */}
      {cfg && (
        <EditModal
          visible={!!campoActivo}
          titulo={cfg.titulo}
          valor={cfg.valor}
          esContrasena={cfg.esContrasena}
          multiline={cfg.multiline}
          onGuardar={(v) => guardar(campoActivo!, v)}
          onCerrar={() => setCampoActivo(null)}
        />
      )}
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
  headerBtn:     { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerCenter:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogo:    { width: 30, height: 30, borderRadius: 8 },
  headerBrand:   { fontSize: 13, letterSpacing: 0.4 },
  headerRight:   { flexDirection: "row", alignItems: "center", gap: 8 },
  conectadoBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  dot:          { width: 7, height: 7, borderRadius: 4 },
  conectadoTxt: { fontSize: 11, fontWeight: "700" },

  scroll: { padding: 16, gap: 14 },

  // Avatar card
  perfilCard: {
    borderRadius: 24, borderWidth: 1,
    padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 2,
  },
  perfilRow:   { flexDirection: "row", alignItems: "flex-start", gap: 18 },
  avatarWrap:  { position: "relative", alignSelf: "flex-start" },
  avatar:      { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  avatarImg:   { width: 80, height: 80, borderRadius: 40 },
  avatarTxt:   { fontSize: 28, fontWeight: "900" },
  editBtn: {
    position: "absolute", bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  perfilInfo:   { flex: 1, gap: 6, paddingTop: 4 },
  perfilNombre: { fontSize: 20, fontWeight: "900" },
  rolBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
  },
  rolTxt:  { fontSize: 11, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaTxt: { fontSize: 12, flex: 1 },

  // Stats
  statsCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 20, borderWidth: 1,
    paddingVertical: 16, paddingHorizontal: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sep: { width: 1, height: 40 },

  secLabel: {
    fontSize: 11, fontWeight: "700",
    letterSpacing: 0.6, textTransform: "uppercase", paddingHorizontal: 4,
    marginTop: 2,
  },

  listaCard: {
    borderRadius: 20, borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 2,
  },

  version: {
    textAlign: "center", fontSize: 11,
    marginTop: 4,
  },
});
