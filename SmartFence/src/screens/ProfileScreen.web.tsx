import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, useWindowDimensions, Alert, TextInput, ActivityIndicator,
} from "react-native";
import {
  ShieldCheck, Clock, Calendar, User,
  Settings as SettingsIcon, Shield, Bell,
  HelpCircle, LogOut, MapPin, Mail, ChevronRight, Camera,
  Pencil, Check, X, Lock, Eye, EyeOff, Building2,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@context/AuthContext";
import { useT } from "@context/ThemeContext";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import { navigateTo } from "@navigation/navigationRef";

// ─── StatChip ─────────────────────────────────────────────────────────────────
function StatChip({
  icon: Icon, label, valor, valorColor,
}: {
  icon: React.ComponentType<any>; label: string; valor: string; valorColor?: string;
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
  item:    { flex: 1, alignItems: "center", gap: 5, paddingVertical: 8, minWidth: 70 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label:   { fontSize: 11, textAlign: "center" },
  valor:   { fontSize: 13, fontWeight: "800", textAlign: "center" },
});

// ─── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({
  icon: Icon, titulo, sub, color, bg, onPress, last,
}: {
  icon: React.ComponentType<any>; titulo: string; sub: string;
  color?: string; bg?: string; onPress?: () => void; last?: boolean;
}) {
  const T = useT();
  return (
    <TouchableOpacity
      style={[nl.row, !last && [nl.border, { borderBottomColor: T.borde }]]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View style={[nl.iconBox, { backgroundColor: bg ?? T.verdeLuz }]}>
        <Icon size={20} color={color ?? T.verde} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[nl.titulo, { color: T.txtMain }]}>{titulo}</Text>
        <Text style={[nl.sub, { color: T.txtSec }]}>{sub}</Text>
      </View>
      <ChevronRight size={16} color={T.txtSec} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}
const nl = StyleSheet.create({
  row:    { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 18 },
  border: { borderBottomWidth: 1 },
  iconBox:{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  titulo: { fontSize: 14, fontWeight: "700" },
  sub:    { fontSize: 12, marginTop: 1 },
});

// ─── InfoField ────────────────────────────────────────────────────────────────
function InfoField({
  label, value, editando, inputValue, onChangeText,
  placeholder, readonly, secure, showToggle,
}: {
  label: string; value: string; editando: boolean;
  inputValue?: string; onChangeText?: (v: string) => void;
  placeholder?: string; readonly?: boolean; secure?: boolean; showToggle?: boolean;
}) {
  const T = useT();
  const [visible, setVisible] = useState(false);

  return (
    <View style={fi.wrap}>
      <Text style={[fi.label, { color: T.txtSec }]}>{label}</Text>
      {editando && !readonly ? (
        <View style={[fi.inputRow, { borderColor: T.borde, backgroundColor: T.fondo }]}>
          <TextInput
            style={[fi.input, { color: T.txtMain }] as any}
            value={inputValue}
            onChangeText={onChangeText}
            placeholder={placeholder ?? label}
            placeholderTextColor={T.txtTer}
            secureTextEntry={secure && !visible}
          />
          {showToggle && (
            <TouchableOpacity onPress={() => setVisible(v => !v)} activeOpacity={0.7}>
              {visible
                ? <EyeOff size={16} color={T.txtSec} strokeWidth={1.8} />
                : <Eye    size={16} color={T.txtSec} strokeWidth={1.8} />}
            </TouchableOpacity>
          )}
        </View>
      ) : readonly && editando ? (
        <View style={[fi.readonlyBox, { borderColor: T.borde, backgroundColor: T.verdeMuy }]}>
          <Text style={[fi.readonlyTxt, { color: T.txtTer }]} numberOfLines={1}>{value}</Text>
          <Text style={[fi.readonlyHint, { color: T.txtTer }]}>Solo lectura</Text>
        </View>
      ) : (
        <Text style={[fi.value, { color: value ? T.txtMain : T.txtTer }]} numberOfLines={1}>
          {value || "—"}
        </Text>
      )}
    </View>
  );
}
const fi = StyleSheet.create({
  wrap:        { flex: 1, minWidth: 150, gap: 5 },
  label:       { fontSize: 12, fontWeight: "600" },
  value:       { fontSize: 14, fontWeight: "500" },
  inputRow:    {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  input:       { flex: 1, fontSize: 14, outlineStyle: "none" } as any,
  readonlyBox: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  readonlyTxt:  { fontSize: 14, flex: 1 },
  readonlyHint: { fontSize: 10, fontStyle: "italic" },
});

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const T = useT();
  const { usuario, cerrarSesion, actualizarUsuario } = useAuth();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 960;
  const isTablet  = width >= 640;

  // Avatar
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  // Info edit
  const [editandoInfo,   setEditandoInfo]   = useState(false);
  const [guardandoInfo,  setGuardandoInfo]  = useState(false);
  const [editNombre,     setEditNombre]     = useState("");
  const [editApellido,   setEditApellido]   = useState("");
  const [editFinca,      setEditFinca]      = useState("");

  // Password edit
  const [editandoPass,  setEditandoPass]  = useState(false);
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [passActual,    setPassActual]    = useState("");
  const [passNueva,     setPassNueva]     = useState("");
  const [passConfirm,   setPassConfirm]   = useState("");

  async function seleccionarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para cambiar la foto de perfil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setFotoUri(result.assets[0].uri);
  }

  function abrirEdicionInfo() {
    const nombreCompleto = usuario?.nombre ?? "";
    const partes = nombreCompleto.split(" ");
    setEditNombre(partes[0] ?? "");
    setEditApellido(partes.slice(1).join(" "));
    setEditFinca(usuario?.finca ?? "");
    setEditandoInfo(true);
  }

  async function guardarInfo() {
    setGuardandoInfo(true);
    try {
      const nombreCompleto = [editNombre.trim(), editApellido.trim()]
        .filter(Boolean).join(" ");
      await actualizarUsuario({
        nombre: nombreCompleto || usuario?.nombre || "Usuario",
        finca: editFinca.trim() || usuario?.finca,
      });
      setEditandoInfo(false);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo guardar el perfil");
    } finally {
      setGuardandoInfo(false);
    }
  }

  async function guardarContraseña() {
    if (!passNueva.trim()) {
      Alert.alert("Validación", "Ingresa una contraseña nueva.");
      return;
    }
    if (passNueva !== passConfirm) {
      Alert.alert("Validación", "Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passNueva.length < 8) {
      Alert.alert("Validación", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setGuardandoPass(true);
    try {
      await new Promise<void>((r) => setTimeout(r, 600));
      setEditandoPass(false);
      setPassActual(""); setPassNueva(""); setPassConfirm("");
      Alert.alert("Éxito", "Contraseña actualizada correctamente.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo cambiar la contraseña");
    } finally {
      setGuardandoPass(false);
    }
  }

  const iniciales = (usuario?.nombre ?? "U")
    .split(" ").slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join("");

  const hora = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  // Nombre completo desde estado de edición vs datos reales
  const nombreMostrado = usuario?.nombre ?? "Usuario";
  const apellidoMostrado = (() => {
    const partes = nombreMostrado.split(" ");
    return partes.slice(1).join(" ");
  })();
  const primerNombre = nombreMostrado.split(" ")[0] ?? "";

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Profile" />

      <View style={st.main}>
        <WebTopBar
          titulo="Perfil"
          sub="Gestiona tu información personal y configuración de cuenta."
        />

        <ScrollView
          style={st.scroll}
          contentContainerStyle={[
            st.scrollContent,
            isDesktop ? st.scrollPadDesktop : isTablet ? st.scrollPadTablet : st.scrollPadMobile,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[st.twoCol, !isDesktop && st.twoColSingle]}>

            {/* ── Columna izquierda ── */}
            <View style={[st.leftCol, !isDesktop && st.colFull]}>

              {/* Card avatar + stats */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <View style={[st.avatarRow, !isTablet && st.avatarRowMobile]}>
                  <View style={st.avatarWrap}>
                    {fotoUri ? (
                      <Image source={{ uri: fotoUri }} style={st.avatarImg} />
                    ) : (
                      <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
                        <Text style={st.avatarTxt}>{iniciales}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[st.cameraBtn, { backgroundColor: T.verde, borderColor: T.card }]}
                      onPress={seleccionarFoto}
                      activeOpacity={0.8}
                    >
                      <Camera size={12} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>

                  <View style={st.infoCol}>
                    <Text style={[st.nombre, { color: T.txtMain }]} numberOfLines={2}>
                      {nombreMostrado}
                    </Text>
                    <View style={[st.rolBadge, { backgroundColor: T.verdeAlfa, borderColor: T.verdeOscuro }]}>
                      <ShieldCheck size={11} color={T.verde} strokeWidth={2} />
                      <Text style={[st.rolTxt, { color: T.verdeBrillo }]}>
                        {usuario?.rol ?? "Ganadero"}
                      </Text>
                    </View>
                    <View style={st.metaRow}>
                      <MapPin size={13} color={T.txtSec} strokeWidth={1.8} />
                      <Text style={[st.metaTxt, { color: T.txtSec }]} numberOfLines={1}>
                        {usuario?.finca ?? "Sin finca"}
                      </Text>
                    </View>
                    <View style={st.metaRow}>
                      <Mail size={13} color={T.txtSec} strokeWidth={1.8} />
                      <Text style={[st.metaTxt, { color: T.txtSec }]} numberOfLines={1}>
                        {usuario?.correo ?? "—"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[st.divider, { backgroundColor: T.borde }]} />

                <View style={st.statsRow}>
                  <StatChip icon={Calendar}    label="Miembro desde" valor="Marzo 2024" />
                  <View style={[st.statSep, { backgroundColor: T.borde }]} />
                  <StatChip icon={ShieldCheck} label="Cuenta"        valor="Verificada" valorColor={T.verde} />
                  <View style={[st.statSep, { backgroundColor: T.borde }]} />
                  <StatChip icon={User}        label="Rol"            valor={usuario?.rol ?? "Ganadero"} />
                  <View style={[st.statSep, { backgroundColor: T.borde }]} />
                  <StatChip icon={Clock}       label="Último acceso"  valor={`Hoy, ${hora}`} />
                </View>
              </View>

              {/* ── Card información del administrador ── */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <View style={st.cardHeader}>
                  <View style={[st.cardIconBox, { backgroundColor: T.verdeLuz }]}>
                    <User size={18} color={T.verde} strokeWidth={1.8} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.cardTitle, { color: T.txtMain }]}>Información del administrador</Text>
                    <Text style={[st.cardSub, { color: T.txtSec }]}>Datos personales y de la finca</Text>
                  </View>
                  {!editandoInfo && (
                    <TouchableOpacity
                      style={[st.editBtn, { backgroundColor: T.verdeLuz, borderColor: T.borde }]}
                      onPress={abrirEdicionInfo}
                      activeOpacity={0.75}
                    >
                      <Pencil size={14} color={T.verde} strokeWidth={2} />
                      <Text style={[st.editBtnTxt, { color: T.verde }]}>Editar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[st.divider, { backgroundColor: T.borde }]} />

                <View style={[st.fieldsGrid, !isTablet && st.fieldsGridSingle]}>
                  <InfoField
                    label="Nombre"
                    value={primerNombre}
                    editando={editandoInfo}
                    inputValue={editNombre}
                    onChangeText={setEditNombre}
                    placeholder="Nombre"
                  />
                  <InfoField
                    label="Apellido"
                    value={apellidoMostrado}
                    editando={editandoInfo}
                    inputValue={editApellido}
                    onChangeText={setEditApellido}
                    placeholder="Apellido"
                  />
                  <View style={[{ flex: 1, minWidth: 150 }, isTablet && st.fieldFull]}>
                    <InfoField
                      label="Nombre de la finca"
                      value={usuario?.finca ?? ""}
                      editando={editandoInfo}
                      inputValue={editFinca}
                      onChangeText={setEditFinca}
                      placeholder="Finca El Paraíso"
                    />
                  </View>
                  <View style={[{ flex: 1, minWidth: 150 }, isTablet && st.fieldFull]}>
                    <InfoField
                      label="Correo electrónico"
                      value={usuario?.correo ?? ""}
                      editando={editandoInfo}
                      readonly
                    />
                  </View>
                </View>

                {editandoInfo && (
                  <View style={[st.editActions, { borderTopColor: T.borde }]}>
                    <TouchableOpacity
                      style={[st.btnCancel, { borderColor: T.borde, backgroundColor: T.card }]}
                      onPress={() => setEditandoInfo(false)}
                      disabled={guardandoInfo}
                      activeOpacity={0.75}
                    >
                      <X size={15} color={T.txtSec} strokeWidth={2} />
                      <Text style={[st.btnCancelTxt, { color: T.txtSec }]}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[st.btnSave, { backgroundColor: guardandoInfo ? T.verdeOscuro : T.verde }]}
                      onPress={guardarInfo}
                      disabled={guardandoInfo}
                      activeOpacity={0.8}
                    >
                      {guardandoInfo ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Check size={15} color="#fff" strokeWidth={2.5} />
                          <Text style={st.btnSaveTxt}>Guardar cambios</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* ── Card seguridad / contraseña ── */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <View style={st.cardHeader}>
                  <View style={[st.cardIconBox, { backgroundColor: T.verdeLuz }]}>
                    <Lock size={18} color={T.verde} strokeWidth={1.8} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.cardTitle, { color: T.txtMain }]}>Seguridad</Text>
                    <Text style={[st.cardSub, { color: T.txtSec }]}>Contraseña y acceso a la cuenta</Text>
                  </View>
                  {!editandoPass && (
                    <TouchableOpacity
                      style={[st.editBtn, { backgroundColor: T.verdeLuz, borderColor: T.borde }]}
                      onPress={() => setEditandoPass(true)}
                      activeOpacity={0.75}
                    >
                      <Pencil size={14} color={T.verde} strokeWidth={2} />
                      <Text style={[st.editBtnTxt, { color: T.verde }]}>Cambiar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[st.divider, { backgroundColor: T.borde }]} />

                {!editandoPass ? (
                  <View style={st.passDisplay}>
                    <View style={st.metaRow}>
                      <Lock size={14} color={T.txtSec} strokeWidth={1.8} />
                      <Text style={[st.metaTxt, { color: T.txtSec }]}>Contraseña: ••••••••••••</Text>
                    </View>
                    <Text style={[st.passHint, { color: T.txtTer }]}>
                      Haz clic en "Cambiar" para actualizar tu contraseña.
                    </Text>
                  </View>
                ) : (
                  <View style={[st.fieldsGrid, !isTablet && st.fieldsGridSingle]}>
                    <View style={[{ flex: 1, minWidth: 150 }, isTablet && st.fieldFull]}>
                      <InfoField
                        label="Contraseña actual"
                        value=""
                        editando
                        inputValue={passActual}
                        onChangeText={setPassActual}
                        placeholder="••••••••"
                        secure
                        showToggle
                      />
                    </View>
                    <InfoField
                      label="Nueva contraseña"
                      value=""
                      editando
                      inputValue={passNueva}
                      onChangeText={setPassNueva}
                      placeholder="Mínimo 8 caracteres"
                      secure
                      showToggle
                    />
                    <InfoField
                      label="Confirmar contraseña"
                      value=""
                      editando
                      inputValue={passConfirm}
                      onChangeText={setPassConfirm}
                      placeholder="Repite la nueva contraseña"
                      secure
                      showToggle
                    />
                  </View>
                )}

                {editandoPass && (
                  <View style={[st.editActions, { borderTopColor: T.borde }]}>
                    <TouchableOpacity
                      style={[st.btnCancel, { borderColor: T.borde, backgroundColor: T.card }]}
                      onPress={() => {
                        setEditandoPass(false);
                        setPassActual(""); setPassNueva(""); setPassConfirm("");
                      }}
                      disabled={guardandoPass}
                      activeOpacity={0.75}
                    >
                      <X size={15} color={T.txtSec} strokeWidth={2} />
                      <Text style={[st.btnCancelTxt, { color: T.txtSec }]}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[st.btnSave, { backgroundColor: guardandoPass ? T.verdeOscuro : T.verde }]}
                      onPress={guardarContraseña}
                      disabled={guardandoPass}
                      activeOpacity={0.8}
                    >
                      {guardandoPass ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Check size={15} color="#fff" strokeWidth={2.5} />
                          <Text style={st.btnSaveTxt}>Actualizar contraseña</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Lista de accesos rápidos */}
              <View style={[st.listCard, { backgroundColor: T.card, borderColor: T.borde }]}>
                <NavLink
                  icon={SettingsIcon} titulo="Configuración"
                  sub="Personaliza tu experiencia en la aplicación."
                  onPress={() => navigateTo("Settings")}
                />
                <NavLink
                  icon={Shield}       titulo="Cercas virtuales"
                  sub="Administra tus cercas y zonas seguras."
                  onPress={() => navigateTo("Map")}
                />
                <NavLink
                  icon={Bell}         titulo="Notificaciones"
                  sub="Configura tus alertas y preferencias."
                  onPress={() => navigateTo("Alerts")}
                />
                <NavLink
                  icon={HelpCircle}   titulo="Ayuda y soporte"
                  sub="Centro de ayuda y contacto con soporte."
                  last
                />
              </View>
            </View>

            {/* ── Columna derecha ── */}
            <View style={[st.rightCol, !isDesktop && st.colFull]}>

              {/* Resumen de la finca */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                <View style={st.cardHeader}>
                  <View style={[st.cardIconBox, { backgroundColor: T.verdeLuz }]}>
                    <Building2 size={18} color={T.verde} strokeWidth={1.8} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.cardTitle, { color: T.txtMain }]}>Tu finca</Text>
                    <Text style={[st.cardSub, { color: T.txtSec }]}>Información de la propiedad</Text>
                  </View>
                </View>
                <View style={[st.divider, { backgroundColor: T.borde }]} />
                <View style={{ gap: 10 }}>
                  <View style={st.fincaRow}>
                    <Text style={[st.fincaLabel, { color: T.txtSec }]}>Nombre</Text>
                    <Text style={[st.fincaValue, { color: T.txtMain }]} numberOfLines={1}>
                      {usuario?.finca ?? "Sin asignar"}
                    </Text>
                  </View>
                  <View style={[st.fincaSep, { backgroundColor: T.borde }]} />
                  <View style={st.fincaRow}>
                    <Text style={[st.fincaLabel, { color: T.txtSec }]}>Administrador</Text>
                    <Text style={[st.fincaValue, { color: T.txtMain }]} numberOfLines={1}>
                      {nombreMostrado}
                    </Text>
                  </View>
                  <View style={[st.fincaSep, { backgroundColor: T.borde }]} />
                  <View style={st.fincaRow}>
                    <Text style={[st.fincaLabel, { color: T.txtSec }]}>Rol</Text>
                    <Text style={[st.fincaValue, { color: T.verde }]} numberOfLines={1}>
                      {usuario?.rol ?? "Ganadero"}
                    </Text>
                  </View>
                  <View style={[st.fincaSep, { backgroundColor: T.borde }]} />
                  <View style={st.fincaRow}>
                    <Text style={[st.fincaLabel, { color: T.txtSec }]}>Correo</Text>
                    <Text style={[st.fincaValue, { color: T.txtMain }]} numberOfLines={1}>
                      {usuario?.correo ?? "—"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Tarjeta ilustración */}
              <View style={[st.illustrationCard, { backgroundColor: T.verdeLuz, borderColor: T.borde }]}>
                <Image
                  source={require("../../assets/ilustra.png")}
                  style={[st.illustrationImg, isTablet && st.illustrationImgTablet]}
                  resizeMode="contain"
                />
                <Text style={[st.illustrationTitle, { color: T.verdeOscuro }]}>
                  Tecnología que cuida tu ganado
                </Text>
                <Text style={[st.illustrationSub, { color: T.txtSec }]}>
                  SmartFence AI trabaja 24/7 para mantener tus animales seguros.
                </Text>
              </View>

              {/* Cerrar sesión */}
              <TouchableOpacity
                style={[st.logoutCard, { backgroundColor: T.card, borderColor: T.borde }]}
                onPress={cerrarSesion}
                activeOpacity={0.8}
              >
                <View style={[st.logoutIconBox, { backgroundColor: T.rojoBg }]}>
                  <LogOut size={22} color={T.rojo} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[st.logoutTitulo, { color: T.rojo }]}>Cerrar sesión</Text>
                  <Text style={[st.logoutSub, { color: T.txtSec }]}>Salir de tu cuenta de SmartFence AI.</Text>
                </View>
                <ChevronRight size={18} color={T.rojo} strokeWidth={2} />
              </TouchableOpacity>

              <Text style={[st.footer, { color: T.txtTer }]}>SmartFence AI • v1.0 MVP</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  main: { flex: 1, flexDirection: "column" },
  scroll: { flex: 1 },
  scrollContent:        { paddingBottom: 80, gap: 16 },
  scrollPadDesktop:     { padding: 28 },
  scrollPadTablet:      { padding: 18 },
  scrollPadMobile:      { padding: 12 },

  twoCol:       { flexDirection: "row", gap: 20, alignItems: "flex-start" },
  twoColSingle: { flexDirection: "column" },
  leftCol:      { flex: 1, gap: 16 },
  rightCol:     { width: 284, gap: 16 },
  colFull:      { width: "100%" },

  card: {
    borderRadius: 20, borderWidth: 1,
    padding: 20, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    gap: 16,
  },
  listCard: {
    borderRadius: 20, borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },

  // Card header
  cardHeader:  { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle:   { fontSize: 15, fontWeight: "800" },
  cardSub:     { fontSize: 12, marginTop: 1 },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7, flexShrink: 0,
  },
  editBtnTxt: { fontSize: 13, fontWeight: "700" },

  // Fields grid
  fieldsGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  fieldsGridSingle: { flexDirection: "column" },
  fieldFull:        { flexBasis: "100%", flex: 0 },

  // Avatar
  avatarRow:       { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  avatarRowMobile: { flexDirection: "column", alignItems: "center", gap: 12 },
  avatarWrap:      { position: "relative", alignSelf: "flex-start" },
  avatar:          { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  avatarImg:       { width: 88, height: 88, borderRadius: 44 },
  avatarTxt:       { fontSize: 30, fontWeight: "900", color: "#fff" },
  cameraBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },

  // Info
  infoCol:   { flex: 1, gap: 7, paddingTop: 4, minWidth: 0 },
  nombre:    { fontSize: 22, fontWeight: "900" },
  rolBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1,
  },
  rolTxt:  { fontSize: 12, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  metaTxt: { fontSize: 13, flex: 1 },

  // Password display
  passDisplay: { gap: 8 },
  passHint:    { fontSize: 12, fontStyle: "italic" },

  // Edit actions
  editActions: {
    flexDirection: "row", gap: 10, justifyContent: "flex-end",
    flexWrap: "wrap", borderTopWidth: 1, paddingTop: 14,
  },
  btnCancel: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 9,
  },
  btnCancelTxt: { fontSize: 14, fontWeight: "600" },
  btnSave: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9,
    minWidth: 160, justifyContent: "center",
  },
  btnSaveTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Divisor
  divider: { height: 1, marginHorizontal: -20, marginTop: -4 },

  // Stats
  statsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  statSep:  { width: 1, height: 44 },

  // Finca card
  fincaRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  fincaLabel: { fontSize: 12, fontWeight: "600" },
  fincaValue: { fontSize: 13, fontWeight: "500", flex: 1, textAlign: "right" },
  fincaSep:   { height: 1 },

  // Illustration
  illustrationCard: {
    borderRadius: 20, borderWidth: 1,
    padding: 20, alignItems: "center", gap: 12, overflow: "hidden",
  },
  illustrationImg:       { width: "100%", height: 140 },
  illustrationImgTablet: { height: 180 },
  illustrationTitle: { fontSize: 15, fontWeight: "800", textAlign: "center", lineHeight: 21 },
  illustrationSub:   { fontSize: 12, textAlign: "center", lineHeight: 17 },

  // Logout
  logoutCard: {
    borderRadius: 20, borderWidth: 1,
    padding: 16, flexDirection: "row", alignItems: "center", gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  logoutIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoutTitulo:  { fontSize: 15, fontWeight: "800" },
  logoutSub:     { fontSize: 12, marginTop: 2 },

  footer: { textAlign: "center", fontSize: 11, paddingTop: 8 },
});
