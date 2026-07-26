import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, useWindowDimensions, Alert,
} from "react-native";
import {
  ShieldCheck, Clock, Calendar, User,
  Cpu, Settings as SettingsIcon, Shield, Bell,
  HelpCircle, LogOut, MapPin, Mail, ChevronRight, Camera,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@context/AuthContext";
import { useAnimals } from "@hooks/useAnimals";
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
  item:    { flex: 1, alignItems: "center", gap: 5, paddingVertical: 8 },
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

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const T = useT();
  const { usuario, cerrarSesion } = useAuth();
  const { conectado } = useAnimals();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [fotoUri, setFotoUri] = useState<string | null>(null);

  async function seleccionarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para cambiar la foto de perfil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setFotoUri(result.assets[0].uri);
  }

  const iniciales = (usuario?.nombre ?? "U")
    .split(" ").slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join("");

  const hora = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Profile" />

      <View style={st.main}>
        <WebTopBar
          titulo="Perfil"
          sub="Gestiona tu información personal y configuración de cuenta."
          conectado={conectado}
        />

        <ScrollView
          style={st.scroll}
          contentContainerStyle={st.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[st.twoCol, !isDesktop && { flexDirection: "column" }]}>

            {/* ── Columna izquierda ── */}
            <View style={st.leftCol}>

              {/* Avatar + info + stats — todo en una card */}
              <View style={[st.card, { backgroundColor: T.card, borderColor: T.borde }]}>

                {/* Fila avatar */}
                <View style={st.avatarRow}>
                  <View style={st.avatarWrap}>
                    {fotoUri ? (
                      <Image source={{ uri: fotoUri }} style={st.avatarImg} />
                    ) : (
                      <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
                        <Text style={st.avatarTxt}>{iniciales}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[st.editBtn, { backgroundColor: T.verde, borderColor: T.card }]}
                      onPress={seleccionarFoto}
                      activeOpacity={0.8}
                    >
                      <Camera size={12} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>

                  <View style={st.infoCol}>
                    <Text style={[st.nombre, { color: T.txtMain }]}>{usuario?.nombre ?? "Usuario"}</Text>
                    <View style={[st.rolBadge, { backgroundColor: T.verdeAlfa, borderColor: T.verdeOscuro }]}>
                      <ShieldCheck size={11} color={T.verde} strokeWidth={2} />
                      <Text style={[st.rolTxt, { color: T.verdeBrillo }]}>Administrador</Text>
                    </View>
                    <View style={st.metaRow}>
                      <MapPin size={13} color={T.txtSec} strokeWidth={1.8} />
                      <Text style={[st.metaTxt, { color: T.txtSec }]}>{usuario?.finca ?? "Sin finca"}</Text>
                    </View>
                    <View style={st.metaRow}>
                      <Mail size={13} color={T.txtSec} strokeWidth={1.8} />
                      <Text style={[st.metaTxt, { color: T.txtSec }]} numberOfLines={1}>{usuario?.correo ?? "—"}</Text>
                    </View>
                    <View style={st.metaRow}>
                      <Calendar size={13} color={T.txtSec} strokeWidth={1.8} />
                      <Text style={[st.metaTxt, { color: T.txtSec }]}>Miembro desde 15 de marzo de 2024</Text>
                    </View>
                  </View>
                </View>

                {/* Divisor */}
                <View style={[st.divider, { backgroundColor: T.borde }]} />

                {/* Fila de stats */}
                <View style={st.statsRow}>
                  <StatChip icon={Calendar}    label="Miembro desde" valor="Marzo 2024" />
                  <View style={[st.statSep, { backgroundColor: T.borde }]} />
                  <StatChip icon={ShieldCheck} label="Cuenta"        valor="Verificada" valorColor={T.verde} />
                  <View style={[st.statSep, { backgroundColor: T.borde }]} />
                  <StatChip icon={User}        label="Rol"            valor="Administrador" />
                  <View style={[st.statSep, { backgroundColor: T.borde }]} />
                  <StatChip icon={Clock}       label="Último acceso"  valor={`Hoy, ${hora}`} />
                </View>
              </View>

              {/* Lista de accesos rápidos */}
              <View style={[st.listCard, { backgroundColor: T.card, borderColor: T.borde }]}>
                <NavLink
                  icon={Cpu}          titulo="Dispositivos"
                  sub="Gestiona tus collares, gateways y dispositivos."
                  onPress={() => navigateTo("Devices")}
                />
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
            <View style={[st.rightCol, !isDesktop && st.rightColFull]}>

              {/* Tarjeta ilustración */}
              <View style={[st.illustrationCard, { backgroundColor: T.verdeLuz, borderColor: T.borde }]}>
                <Image
                  source={require("../../assets/ilustra.png")}
                  style={st.illustrationImg}
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
            </View>
          </View>

          <Text style={[st.footer, { color: T.txtTer }]}>SmartFence AI • v1.0 MVP</Text>
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:  { flex: 1, flexDirection: "row" },
  main:  { flex: 1, flexDirection: "column" },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 32, gap: 20 },

  twoCol:      { flexDirection: "row", gap: 20, alignItems: "flex-start" },
  leftCol:     { flex: 1, gap: 16 },
  rightCol:    { width: 280, gap: 16 },
  rightColFull:{ width: "100%" },

  // Card con padding (avatar + stats)
  card: {
    borderRadius: 18, borderWidth: 1,
    padding: 20, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  // Card sin padding propio (NavLink maneja el suyo)
  listCard: {
    borderRadius: 18, borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },

  // Avatar
  avatarRow:  { flexDirection: "row", alignItems: "flex-start", gap: 20, marginBottom: 20 },
  avatarWrap: { position: "relative", alignSelf: "flex-start" },
  avatar:     { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  avatarImg:  { width: 88, height: 88, borderRadius: 44 },
  avatarTxt:  { fontSize: 30, fontWeight: "900", color: "#fff" },
  editBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },

  // Info
  infoCol:  { flex: 1, gap: 7, paddingTop: 4 },
  nombre:   { fontSize: 22, fontWeight: "900" },
  rolBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1,
  },
  rolTxt:  { fontSize: 12, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  metaTxt: { fontSize: 13, flex: 1 },

  // Divisor
  divider: { height: 1, marginHorizontal: -20, marginBottom: 16 },

  // Stats
  statsRow: { flexDirection: "row", alignItems: "center" },
  statSep:  { width: 1, height: 44 },

  // Illustration
  illustrationCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 20, alignItems: "center", gap: 12, overflow: "hidden",
  },
  illustrationImg:   { width: "100%", height: 160 },
  illustrationTitle: { fontSize: 16, fontWeight: "800", textAlign: "center", lineHeight: 22 },
  illustrationSub:   { fontSize: 12, textAlign: "center", lineHeight: 17 },

  // Logout
  logoutCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 16, flexDirection: "row", alignItems: "center", gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  logoutIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoutTitulo:  { fontSize: 15, fontWeight: "800" },
  logoutSub:     { fontSize: 12, marginTop: 2 },

  footer: { textAlign: "center", fontSize: 12, paddingTop: 4 },
});
