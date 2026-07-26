import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, Modal, TextInput,
  KeyboardAvoidingView, Alert, ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import {
  Menu, Users, Building2, Plus, Pencil, Trash2,
  X, Check, ChevronRight, ShieldCheck, User,
  RefreshCw, Eye, EyeOff,
} from "lucide-react-native";
import { useDrawer } from "@context/DrawerContext";
import { useAuth } from "@context/AuthContext";
import { useT } from "@context/ThemeContext";
import { AdminAPI, FincaAdmin, UsuarioAdmin } from "@services/api";

const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

const ROLES = ["GANADERO", "VETERINARIO", "OPERARIO", "ADMINISTRADOR"] as const;
type Rol = typeof ROLES[number];
const ROL_LABEL: Record<Rol, string> = {
  GANADERO: "Ganadero", VETERINARIO: "Veterinario",
  OPERARIO: "Operario", ADMINISTRADOR: "Administrador",
};
const ROL_COLOR: Record<Rol, string> = {
  GANADERO: "#43A047", VETERINARIO: "#1E88E5",
  OPERARIO: "#FB8C00", ADMINISTRADOR: "#8E24AA",
};

// ─── Badge de rol ─────────────────────────────────────────────────────────────
function RolBadge({ rol }: { rol: string }) {
  const r = (rol?.toUpperCase() ?? "GANADERO") as Rol;
  const color = ROL_COLOR[r] ?? "#607D8B";
  return (
    <View style={[b.badge, { backgroundColor: color + "22", borderColor: color + "55" }]}>
      <Text style={[b.txt, { color }]}>{ROL_LABEL[r] ?? rol}</Text>
    </View>
  );
}
const b = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  txt:   { fontSize: 10.5, fontWeight: "700" },
});

// ─── Modal genérico de confirmación ──────────────────────────────────────────
function ConfirmModal({ visible, titulo, mensaje, onConfirmar, onCancelar, cargando }: {
  visible: boolean; titulo: string; mensaje: string;
  onConfirmar: () => void; onCancelar: () => void; cargando?: boolean;
}) {
  const T = useT();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={[cm.overlay]}>
        <View style={[cm.box, { backgroundColor: T.card, borderColor: T.borde }]}>
          <Text style={[cm.titulo, { color: T.txtMain }]}>{titulo}</Text>
          <Text style={[cm.msg, { color: T.txtSec }]}>{mensaje}</Text>
          <View style={cm.btns}>
            <TouchableOpacity style={[cm.btn, { backgroundColor: T.cardElevada }]} onPress={onCancelar} activeOpacity={0.8}>
              <Text style={[cm.btnTxt, { color: T.txtMain }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[cm.btn, { backgroundColor: T.rojo }]} onPress={onConfirmar} disabled={cargando} activeOpacity={0.8}>
              {cargando
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={[cm.btnTxt, { color: "#fff" }]}>Eliminar</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 24 },
  box: { borderRadius: 24, padding: 24, width: "100%", maxWidth: 360, gap: 12, borderWidth: 1 },
  titulo: { fontSize: 17, fontWeight: "800" },
  msg: { fontSize: 13.5, lineHeight: 20 },
  btns: { flexDirection: "row", gap: 10, marginTop: 4 },
  btn: { flex: 1, borderRadius: 14, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  btnTxt: { fontSize: 14, fontWeight: "700" },
});

// ─── Modal de usuario ────────────────────────────────────────────────────────
function UsuarioModal({ visible, editar, fincas, onCerrar, onGuardado }: {
  visible: boolean;
  editar: UsuarioAdmin | null;
  fincas: FincaAdmin[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const T = useT();
  const [nombre,     setNombre]     = useState("");
  const [email,      setEmail]      = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verPass,    setVerPass]    = useState(false);
  const [rol,        setRol]        = useState<Rol>("GANADERO");
  const [fincaId,    setFincaId]    = useState<string>("");
  const [guardando,  setGuardando]  = useState(false);

  useEffect(() => {
    if (editar) {
      setNombre(editar.nombre);
      setEmail(editar.email);
      setContrasena("");
      setRol((editar.rol?.toUpperCase() as Rol) ?? "GANADERO");
      setFincaId(editar.fincas?.[0]?.id ?? "");
    } else {
      setNombre(""); setEmail(""); setContrasena(""); setRol("GANADERO"); setFincaId("");
    }
  }, [editar, visible]);

  async function guardar() {
    if (!nombre.trim()) { Alert.alert("Campo requerido", "El nombre es obligatorio."); return; }
    if (!editar && !email.trim()) { Alert.alert("Campo requerido", "El correo es obligatorio."); return; }
    if (!editar && contrasena.length < 6) { Alert.alert("Contraseña", "Mínimo 6 caracteres."); return; }
    setGuardando(true);
    try {
      if (editar) {
        await AdminAPI.actualizarUsuario(editar.id, {
          nombre: nombre.trim(),
          ...(email.trim() !== editar.email ? { email: email.trim() } : {}),
          ...(contrasena ? { contrasena } : {}),
          rol,
          fincaId: fincaId || null,
        });
      } else {
        await AdminAPI.crearUsuario({
          nombre: nombre.trim(), email: email.trim(),
          contrasena, rol,
          ...(fincaId ? { fincaId } : {}),
        });
      }
      onGuardado();
      onCerrar();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "No se pudo guardar el usuario.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView style={um.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={um.backdrop} activeOpacity={1} onPress={onCerrar} />
        <View style={[um.sheet, { backgroundColor: T.card, borderTopColor: T.borde }]}>
          <View style={[um.handle, { backgroundColor: T.borde }]} />
          <View style={um.header}>
            <Text style={[um.titulo, { color: T.txtMain }]}>
              {editar ? "Editar usuario" : "Nuevo usuario"}
            </Text>
            <TouchableOpacity style={[um.closeBtn, { backgroundColor: T.cardElevada }]} onPress={onCerrar} activeOpacity={0.7}>
              <X size={18} color={T.txtSec} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* Nombre */}
            <Text style={[um.label, { color: T.txtSec }]}>Nombre completo *</Text>
            <View style={[um.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <TextInput style={[um.input, { color: T.txtMain }]} value={nombre} onChangeText={setNombre}
                placeholder="Ej. Juan Pérez" placeholderTextColor={T.txtSec} autoFocus />
            </View>

            {/* Email */}
            <Text style={[um.label, { color: T.txtSec }]}>Correo electrónico *</Text>
            <View style={[um.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <TextInput style={[um.input, { color: T.txtMain }]} value={email} onChangeText={setEmail}
                placeholder="correo@ejemplo.com" placeholderTextColor={T.txtSec}
                keyboardType="email-address" autoCapitalize="none" />
            </View>

            {/* Contraseña */}
            <Text style={[um.label, { color: T.txtSec }]}>
              {editar ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
            </Text>
            <View style={[um.inputWrap, um.inputRow, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <TextInput style={[um.input, { flex: 1, color: T.txtMain }]} value={contrasena} onChangeText={setContrasena}
                placeholder="Mínimo 6 caracteres" placeholderTextColor={T.txtSec}
                secureTextEntry={!verPass} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setVerPass((v) => !v)} style={{ padding: 4 }}>
                {verPass
                  ? <EyeOff size={18} color={T.txtSec} />
                  : <Eye size={18} color={T.txtSec} />
                }
              </TouchableOpacity>
            </View>

            {/* Rol */}
            <Text style={[um.label, { color: T.txtSec }]}>Rol</Text>
            <View style={um.rolRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[um.rolChip,
                    { borderColor: rol === r ? ROL_COLOR[r] : T.borde },
                    rol === r && { backgroundColor: ROL_COLOR[r] + "22" },
                  ]}
                  onPress={() => setRol(r)}
                  activeOpacity={0.7}
                >
                  <Text style={[um.rolTxt, { color: rol === r ? ROL_COLOR[r] : T.txtSec }]}>
                    {ROL_LABEL[r]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Finca */}
            <Text style={[um.label, { color: T.txtSec }]}>Asignar finca (opcional)</Text>
            <View style={um.fincaList}>
              <TouchableOpacity
                style={[um.fincaChip, { borderColor: !fincaId ? T.verde : T.borde },
                  !fincaId && { backgroundColor: T.verdeAlfa }]}
                onPress={() => setFincaId("")} activeOpacity={0.7}
              >
                <Text style={[um.fincaTxt, { color: !fincaId ? T.verdeBrillo : T.txtSec }]}>Sin finca</Text>
              </TouchableOpacity>
              {fincas.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[um.fincaChip, { borderColor: fincaId === f.id ? T.verde : T.borde },
                    fincaId === f.id && { backgroundColor: T.verdeAlfa }]}
                  onPress={() => setFincaId(f.id)} activeOpacity={0.7}
                >
                  <Text style={[um.fincaTxt, { color: fincaId === f.id ? T.verdeBrillo : T.txtSec }]}>
                    {f.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[um.btnGuardar, { backgroundColor: T.verdeOscuro }, guardando && { opacity: 0.7 }]}
            onPress={guardar} disabled={guardando} activeOpacity={0.85}
          >
            {guardando
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Check size={16} color="#fff" /><Text style={um.btnTxt}>{editar ? "Guardar cambios" : "Crear usuario"}</Text></>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const um = StyleSheet.create({
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
  label:    { fontSize: 12, fontWeight: "700", marginTop: 8 },
  inputWrap:{ borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14 },
  inputRow: { flexDirection: "row", alignItems: "center" },
  input:    { fontSize: 15, paddingVertical: 11 },
  rolRow:   { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  rolChip: {
    borderWidth: 1.5, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  rolTxt:  { fontSize: 12.5, fontWeight: "600" },
  fincaList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  fincaChip: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  fincaTxt: { fontSize: 12.5, fontWeight: "600" },
  btnGuardar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 16, paddingVertical: 15, marginTop: 8,
  },
  btnTxt: { fontSize: 15, fontWeight: "800", color: "#fff" },
});

// ─── Modal de finca ───────────────────────────────────────────────────────────
function FincaModal({ visible, editar, usuarios, onCerrar, onGuardado }: {
  visible: boolean;
  editar: FincaAdmin | null;
  usuarios: UsuarioAdmin[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const T = useT();
  const [nombre,      setNombre]      = useState("");
  const [propietario, setPropietario] = useState("");
  const [guardando,   setGuardando]   = useState(false);

  useEffect(() => {
    if (editar) {
      setNombre(editar.nombre);
      setPropietario(editar.propietario?.id ?? "");
    } else {
      setNombre(""); setPropietario("");
    }
  }, [editar, visible]);

  async function guardar() {
    if (!nombre.trim()) { Alert.alert("Campo requerido", "El nombre de la finca es obligatorio."); return; }
    setGuardando(true);
    try {
      if (editar) {
        await AdminAPI.actualizarFinca(editar.id, {
          nombre: nombre.trim(),
          ...(propietario ? { propietarioId: propietario } : {}),
        });
      } else {
        await AdminAPI.crearFinca({
          nombre: nombre.trim(),
          ...(propietario ? { propietarioId: propietario } : {}),
        });
      }
      onGuardado();
      onCerrar();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "No se pudo guardar la finca.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView style={fm.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={fm.backdrop} activeOpacity={1} onPress={onCerrar} />
        <View style={[fm.sheet, { backgroundColor: T.card, borderTopColor: T.borde }]}>
          <View style={[fm.handle, { backgroundColor: T.borde }]} />
          <View style={fm.header}>
            <Text style={[fm.titulo, { color: T.txtMain }]}>
              {editar ? "Editar finca" : "Nueva finca"}
            </Text>
            <TouchableOpacity style={[fm.closeBtn, { backgroundColor: T.cardElevada }]} onPress={onCerrar} activeOpacity={0.7}>
              <X size={18} color={T.txtSec} />
            </TouchableOpacity>
          </View>

          {/* Nombre */}
          <Text style={[fm.label, { color: T.txtSec }]}>Nombre de la finca *</Text>
          <View style={[fm.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput style={[fm.input, { color: T.txtMain }]} value={nombre} onChangeText={setNombre}
              placeholder="Ej. Finca El Paraíso" placeholderTextColor={T.txtSec} autoFocus />
          </View>

          {/* Propietario */}
          <Text style={[fm.label, { color: T.txtSec }]}>Propietario (opcional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[fm.propChip, { borderColor: !propietario ? T.verde : T.borde },
                  !propietario && { backgroundColor: T.verdeAlfa }]}
                onPress={() => setPropietario("")} activeOpacity={0.7}
              >
                <Text style={[fm.propTxt, { color: !propietario ? T.verdeBrillo : T.txtSec }]}>Sin asignar</Text>
              </TouchableOpacity>
              {usuarios.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={[fm.propChip, { borderColor: propietario === u.id ? T.verde : T.borde },
                    propietario === u.id && { backgroundColor: T.verdeAlfa }]}
                  onPress={() => setPropietario(u.id)} activeOpacity={0.7}
                >
                  <Text style={[fm.propTxt, { color: propietario === u.id ? T.verdeBrillo : T.txtSec }]}>
                    {u.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[fm.btnGuardar, { backgroundColor: T.verdeOscuro }, guardando && { opacity: 0.7 }]}
            onPress={guardar} disabled={guardando} activeOpacity={0.85}
          >
            {guardando
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Check size={16} color="#fff" /><Text style={fm.btnTxt}>{editar ? "Guardar cambios" : "Crear finca"}</Text></>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const fm = StyleSheet.create({
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
  label:    { fontSize: 12, fontWeight: "700", marginTop: 6 },
  inputWrap:{ borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14 },
  input:    { fontSize: 15, paddingVertical: 11 },
  propChip: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  propTxt: { fontSize: 12.5, fontWeight: "600" },
  btnGuardar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 16, paddingVertical: 15, marginTop: 8,
  },
  btnTxt: { fontSize: 15, fontWeight: "800", color: "#fff" },
});

// ─── AdminScreen ──────────────────────────────────────────────────────────────
type Tab = "usuarios" | "fincas";

export default function AdminScreen() {
  const { openDrawer } = useDrawer();
  const { usuario } = useAuth();
  const T = useT();
  const { width: SW } = useWindowDimensions();

  const [tab, setTab] = useState<Tab>("usuarios");
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [fincas,   setFincas]   = useState<FincaAdmin[]>([]);
  const [cargando, setCargando] = useState(false);

  const [modalUsuario,   setModalUsuario]   = useState(false);
  const [editarUsuario,  setEditarUsuario]  = useState<UsuarioAdmin | null>(null);
  const [modalFinca,     setModalFinca]     = useState(false);
  const [editarFinca,    setEditarFinca]    = useState<FincaAdmin | null>(null);
  const [confirmDelete,  setConfirmDelete]  = useState<{ tipo: "usuario" | "finca"; id: string; nombre: string } | null>(null);
  const [eliminando,     setEliminando]     = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [resU, resF] = await Promise.all([
        AdminAPI.listarUsuarios(),
        AdminAPI.listarFincas(),
      ]);
      setUsuarios(resU.data);
      setFincas(resF.data);
    } catch {
      Alert.alert("Sin acceso", "No tienes permisos de administrador o el backend no responde.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function confirmarEliminar() {
    if (!confirmDelete) return;
    setEliminando(true);
    try {
      if (confirmDelete.tipo === "usuario") {
        await AdminAPI.eliminarUsuario(confirmDelete.id);
        setUsuarios((p) => p.filter((u) => u.id !== confirmDelete.id));
      } else {
        await AdminAPI.eliminarFinca(confirmDelete.id);
        setFincas((p) => p.filter((f) => f.id !== confirmDelete.id));
      }
      setConfirmDelete(null);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "No se pudo eliminar.");
    } finally {
      setEliminando(false);
    }
  }

  const esAdmin = usuario?.rol?.toUpperCase() === "ADMINISTRADOR";

  if (!esAdmin) {
    return (
      <View style={[st.root, { backgroundColor: T.fondo, alignItems: "center", justifyContent: "center", padding: 32 }]}>
        <ShieldCheck size={56} color={T.rojo} strokeWidth={1.4} />
        <Text style={[st.noAccesoTit, { color: T.txtMain }]}>Acceso restringido</Text>
        <Text style={[st.noAccesoSub, { color: T.txtSec }]}>
          Solo los administradores pueden acceder a este panel.
        </Text>
      </View>
    );
  }

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>

      {/* ── Header ── */}
      <View style={[st.header, { backgroundColor: T.header, borderBottomColor: T.borde }]}>
        <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={openDrawer} activeOpacity={0.7}>
          <Menu size={20} color={T.txtMain} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={st.headerCenter}>
          <Image source={require("../../assets/logotipo.png")} style={st.headerLogo} resizeMode="contain" />
          <Text style={st.headerBrand}>
            <Text style={{ color: T.txtMain, fontWeight: "700" }}>SMART</Text>
            <Text style={{ color: T.verdeOscuro, fontWeight: "900" }}>FENCE</Text>
            <Text style={{ color: T.verde, fontWeight: "900" }}> AI</Text>
          </Text>
        </View>
        <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={cargar} activeOpacity={0.7}>
          {cargando
            ? <ActivityIndicator size="small" color={T.verde} />
            : <RefreshCw size={18} color={T.txtMain} strokeWidth={1.8} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Título ── */}
        <View style={st.titleRow}>
          <View>
            <Text style={[st.pageTitle, { color: T.txtMain }]}>Panel Admin</Text>
            <Text style={[st.pageSub, { color: T.txtSec }]}>Gestiona usuarios y fincas de SmartFence</Text>
          </View>
          <View style={[st.adminBadge, { backgroundColor: "#8E24AA22", borderColor: "#8E24AA55" }]}>
            <ShieldCheck size={13} color="#8E24AA" strokeWidth={2} />
            <Text style={[st.adminBadgeTxt, { color: "#8E24AA" }]}>ADMIN</Text>
          </View>
        </View>

        {/* ── Stats rápidos ── */}
        <View style={st.statsRow}>
          <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
            <View style={[st.statIcon, { backgroundColor: T.verdeAlfa }]}>
              <Users size={20} color={T.verde} strokeWidth={1.8} />
            </View>
            <Text style={[st.statVal, { color: T.verde }]}>{usuarios.length}</Text>
            <Text style={[st.statLbl, { color: T.txtSec }]}>Usuarios</Text>
          </View>
          <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
            <View style={[st.statIcon, { backgroundColor: T.azulBg }]}>
              <Building2 size={20} color={T.azul} strokeWidth={1.8} />
            </View>
            <Text style={[st.statVal, { color: T.azul }]}>{fincas.length}</Text>
            <Text style={[st.statLbl, { color: T.txtSec }]}>Fincas</Text>
          </View>
          <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
            <View style={[st.statIcon, { backgroundColor: T.naranjaBg }]}>
              <User size={20} color={T.naranja} strokeWidth={1.8} />
            </View>
            <Text style={[st.statVal, { color: T.naranja }]}>
              {usuarios.filter((u) => u.rol?.toUpperCase() === "GANADERO").length}
            </Text>
            <Text style={[st.statLbl, { color: T.txtSec }]}>Ganaderos</Text>
          </View>
          <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
            <View style={[st.statIcon, { backgroundColor: "#8E24AA22" }]}>
              <ShieldCheck size={20} color="#8E24AA" strokeWidth={1.8} />
            </View>
            <Text style={[st.statVal, { color: "#8E24AA" }]}>
              {usuarios.filter((u) => u.rol?.toUpperCase() === "ADMINISTRADOR").length}
            </Text>
            <Text style={[st.statLbl, { color: T.txtSec }]}>Admins</Text>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={st.tabRow}>
          {(["usuarios", "fincas"] as Tab[]).map((t) => {
            const activo = tab === t;
            const Icon = t === "usuarios" ? Users : Building2;
            return (
              <TouchableOpacity
                key={t}
                style={[st.tabBtn, { backgroundColor: T.card, borderColor: T.borde },
                  activo && { backgroundColor: T.verdeAlfa, borderColor: T.verde }]}
                onPress={() => setTab(t)} activeOpacity={0.75}
              >
                <Icon size={16} color={activo ? T.verdeBrillo : T.txtSec} strokeWidth={activo ? 2.2 : 1.8} />
                <Text style={[st.tabTxt, { color: activo ? T.verdeBrillo : T.txtSec, fontWeight: activo ? "700" : "500" }]}>
                  {t === "usuarios" ? `Usuarios (${usuarios.length})` : `Fincas (${fincas.length})`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Lista ── */}
        {cargando && (
          <View style={st.loadingBox}>
            <ActivityIndicator size="large" color={T.verde} />
            <Text style={[st.loadingTxt, { color: T.txtSec }]}>Cargando datos…</Text>
          </View>
        )}

        {/* USUARIOS */}
        {!cargando && tab === "usuarios" && (
          <View style={st.listSection}>
            <TouchableOpacity
              style={[st.addBtn, { backgroundColor: T.verdeOscuro }]}
              onPress={() => { setEditarUsuario(null); setModalUsuario(true); }}
              activeOpacity={0.85}
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
              <Text style={st.addBtnTxt}>Nuevo usuario</Text>
            </TouchableOpacity>

            {usuarios.length === 0 ? (
              <View style={[st.emptyBox, { backgroundColor: T.card, borderColor: T.borde }]}>
                <Users size={32} color={T.txtSec} strokeWidth={1.4} />
                <Text style={[st.emptyTxt, { color: T.txtSec }]}>No hay usuarios registrados</Text>
              </View>
            ) : (
              <View style={[st.listCard, { backgroundColor: T.card, borderColor: T.borde }]}>
                {usuarios.map((u, i) => (
                  <View key={u.id}>
                    <View style={st.listRow}>
                      {/* Avatar */}
                      <View style={[st.avatar, { backgroundColor: (ROL_COLOR[u.rol?.toUpperCase() as Rol] ?? "#607D8B") + "33" }]}>
                        <Text style={[st.avatarTxt, { color: ROL_COLOR[u.rol?.toUpperCase() as Rol] ?? "#607D8B" }]}>
                          {u.nombre?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      {/* Info */}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <Text style={[st.rowName, { color: T.txtMain }]} numberOfLines={1}>{u.nombre}</Text>
                          <RolBadge rol={u.rol} />
                        </View>
                        <Text style={[st.rowSub, { color: T.txtSec }]} numberOfLines={1}>{u.email}</Text>
                        {u.fincas?.length > 0 && (
                          <Text style={[st.rowFinca, { color: T.verde }]} numberOfLines={1}>
                            {u.fincas.map((f) => f.nombre).join(", ")}
                          </Text>
                        )}
                      </View>
                      {/* Acciones */}
                      <View style={st.rowActions}>
                        <TouchableOpacity
                          style={[st.actionBtn, { backgroundColor: T.azulBg }]}
                          onPress={() => { setEditarUsuario(u); setModalUsuario(true); }}
                          activeOpacity={0.75}
                        >
                          <Pencil size={14} color={T.azul} strokeWidth={2} />
                        </TouchableOpacity>
                        {u.id !== usuario?.id && (
                          <TouchableOpacity
                            style={[st.actionBtn, { backgroundColor: T.rojoBg }]}
                            onPress={() => setConfirmDelete({ tipo: "usuario", id: u.id, nombre: u.nombre })}
                            activeOpacity={0.75}
                          >
                            <Trash2 size={14} color={T.rojo} strokeWidth={2} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {i < usuarios.length - 1 && <View style={[st.sep, { backgroundColor: T.borde }]} />}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* FINCAS */}
        {!cargando && tab === "fincas" && (
          <View style={st.listSection}>
            <TouchableOpacity
              style={[st.addBtn, { backgroundColor: T.verdeOscuro }]}
              onPress={() => { setEditarFinca(null); setModalFinca(true); }}
              activeOpacity={0.85}
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
              <Text style={st.addBtnTxt}>Nueva finca</Text>
            </TouchableOpacity>

            {fincas.length === 0 ? (
              <View style={[st.emptyBox, { backgroundColor: T.card, borderColor: T.borde }]}>
                <Building2 size={32} color={T.txtSec} strokeWidth={1.4} />
                <Text style={[st.emptyTxt, { color: T.txtSec }]}>No hay fincas registradas</Text>
              </View>
            ) : (
              <View style={[st.listCard, { backgroundColor: T.card, borderColor: T.borde }]}>
                {fincas.map((f, i) => (
                  <View key={f.id}>
                    <View style={st.listRow}>
                      {/* Icono */}
                      <View style={[st.fincaIcon, { backgroundColor: T.verdeAlfa }]}>
                        <Building2 size={22} color={T.verde} strokeWidth={1.8} />
                      </View>
                      {/* Info */}
                      <View style={{ flex: 1 }}>
                        <Text style={[st.rowName, { color: T.txtMain }]} numberOfLines={1}>{f.nombre}</Text>
                        <Text style={[st.rowSub, { color: T.txtSec }]} numberOfLines={1}>
                          {f.propietario?.nombre ?? "Sin propietario"}
                        </Text>
                        <View style={st.fincaCountRow}>
                          <Text style={[st.fincaCount, { color: T.verde }]}>
                            {f._count.animales} animales
                          </Text>
                          <Text style={[st.fincaCount, { color: T.azul }]}>
                            {f._count.collares} collares
                          </Text>
                          <Text style={[st.fincaCount, { color: T.naranja }]}>
                            {f._count.geocercas} cercas
                          </Text>
                        </View>
                      </View>
                      {/* Acciones */}
                      <View style={st.rowActions}>
                        <TouchableOpacity
                          style={[st.actionBtn, { backgroundColor: T.azulBg }]}
                          onPress={() => { setEditarFinca(f); setModalFinca(true); }}
                          activeOpacity={0.75}
                        >
                          <Pencil size={14} color={T.azul} strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[st.actionBtn, { backgroundColor: T.rojoBg }]}
                          onPress={() => setConfirmDelete({ tipo: "finca", id: f.id, nombre: f.nombre })}
                          activeOpacity={0.75}
                        >
                          <Trash2 size={14} color={T.rojo} strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {i < fincas.length - 1 && <View style={[st.sep, { backgroundColor: T.borde }]} />}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Modales ── */}
      <UsuarioModal
        visible={modalUsuario}
        editar={editarUsuario}
        fincas={fincas}
        onCerrar={() => setModalUsuario(false)}
        onGuardado={cargar}
      />
      <FincaModal
        visible={modalFinca}
        editar={editarFinca}
        usuarios={usuarios}
        onCerrar={() => setModalFinca(false)}
        onGuardado={cargar}
      />
      <ConfirmModal
        visible={!!confirmDelete}
        titulo={`Eliminar ${confirmDelete?.tipo === "usuario" ? "usuario" : "finca"}`}
        mensaje={`¿Eliminar "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setConfirmDelete(null)}
        cargando={eliminando}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: STATUS_BAR_H + HEADER_EXTRA_PT,
    paddingBottom: 12, paddingHorizontal: 14,
    borderBottomWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  headerBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogo: { width: 30, height: 30, borderRadius: 8 },
  headerBrand: { fontSize: 13, letterSpacing: 0.4 },

  scroll: { padding: 16, gap: 16 },

  noAccesoTit: { fontSize: 22, fontWeight: "800", marginTop: 16, textAlign: "center" },
  noAccesoSub: { fontSize: 14, textAlign: "center", marginTop: 6, lineHeight: 20 },

  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  pageTitle: { fontSize: 26, fontWeight: "900", letterSpacing: -0.3 },
  pageSub:   { fontSize: 13, marginTop: 2 },
  adminBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  adminBadgeTxt: { fontSize: 10.5, fontWeight: "800" },

  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1, borderRadius: 18, borderWidth: 1, padding: 12, gap: 4,
    alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statVal:  { fontSize: 20, fontWeight: "900" },
  statLbl:  { fontSize: 9.5, fontWeight: "600", textAlign: "center" },

  tabRow: { flexDirection: "row", gap: 10 },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: 16, borderWidth: 1,
    justifyContent: "center",
  },
  tabTxt: { fontSize: 13 },

  loadingBox: { alignItems: "center", paddingVertical: 48, gap: 12 },
  loadingTxt: { fontSize: 13 },

  listSection: { gap: 12 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 18, paddingVertical: 13,
    borderRadius: 16, alignSelf: "flex-end",
    shadowColor: "#4F9E2C", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  addBtnTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },

  emptyBox: {
    alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 48, borderRadius: 20, borderWidth: 1,
  },
  emptyTxt: { fontSize: 13 },

  listCard: {
    borderRadius: 20, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 3,
  },
  listRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, padding: 14,
  },
  sep: { height: 1, marginLeft: 72 },

  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  avatarTxt: { fontSize: 15, fontWeight: "800" },
  fincaIcon: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  rowName:  { fontSize: 13.5, fontWeight: "700" },
  rowSub:   { fontSize: 11.5, marginTop: 2 },
  rowFinca: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  fincaCountRow: { flexDirection: "row", gap: 8, marginTop: 3, flexWrap: "wrap" },
  fincaCount:    { fontSize: 10.5, fontWeight: "600" },

  rowActions: { flexDirection: "row", gap: 6, flexShrink: 0 },
  actionBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
});
