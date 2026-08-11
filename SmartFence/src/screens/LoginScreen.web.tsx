import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ScrollView, useWindowDimensions,
} from "react-native";
import { Mail, Lock, Eye, EyeOff, LogIn, CheckCircle, Shield, BarChart2 } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "@context/AuthContext";

const C = {
  green:   "#4F9E2C",
  border:  "#E8EDEA",
  text:    "#111827",
  textSec: "#6B7280",
  bg:      "#F4FAF0",
} as const;

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 814 1000">
      <Path fill="#1A1A1A" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.4-150.9-116.2C82.1 790.4 48 703 48 619.2c0-207.6 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49.2 191.3-49.2zm-3-181.6c-34.9 41.5-92.7 73.3-143.7 73.3-5.8 0-11.6-.3-17.4-1-1.9-51.2 17.7-104.4 50.9-140.8 37.4-41.5 94.5-72.9 152.5-75.2 1.6 6.5 2.6 13 2.6 20 0 48.5-19.4 99.4-44.9 123.7z"/>
    </Svg>
  );
}

export default function LoginScreen() {
  const { iniciarSesion } = useAuth();
  const { width } = useWindowDimensions();

  const [correo,        setCorreo]    = useState("");
  const [contraseña,    setContraseña] = useState("");
  const [verContraseña, setVer]       = useState(false);
  const [cargando,      setCargando]  = useState(false);
  const [errorMsg,      setErrorMsg]  = useState<string | null>(null);

  // Breakpoints
  const isDesktop = width >= 960;
  const isMedium  = isDesktop && width < 1280;

  // Panel izquierdo — escala según breakpoint
  const leftPad          = isMedium ? 36 : 64;
  const heroSize         = isMedium ? 22 : 30;
  const brandFontSize    = isMedium ? 16 : 20;
  const heroSubSize      = isMedium ? 12 : 14;
  const featureTitleSize = isMedium ? 13 : 14;
  const featureSubSize   = isMedium ? 11 : 12;

  async function handleLogin() {
    setErrorMsg(null);
    setCargando(true);
    try {
      await iniciarSesion(correo, contraseña);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  async function loginConProveedor(proveedor: string) {
    setErrorMsg(null);
    setCargando(true);
    try {
      await iniciarSesion(correo || `Demo ${proveedor}`, "");
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={[s.root, { flexDirection: isDesktop ? "row" : "column" }]}>

      {/* ══════════════════ PANEL IZQUIERDO (solo desktop) ══════════════════ */}
      {isDesktop && (
        <View style={s.left}>
          <View style={[s.leftTop, { paddingLeft: leftPad, paddingRight: isMedium ? 24 : 40 }]}>
            <View style={[s.logoRow, { marginBottom: isMedium ? 16 : 24 }]}>
              <Image
                source={require("../../assets/logotipo.png")}
                style={[s.logoImg, isMedium && { width: 48, height: 48 }]}
                resizeMode="contain"
              />
              <View>
                <Text style={[s.brandName, { fontSize: brandFontSize }]}>
                  <Text style={{ color: C.text, fontWeight: "700" }}>Smart</Text>
                  <Text style={{ color: C.green, fontWeight: "900" }}>fence</Text>
                </Text>
              </View>
            </View>

            <Text style={[s.heroLine1, { fontSize: heroSize, lineHeight: heroSize * 1.28, marginBottom: isMedium ? 8 : 12 }]}>
              {"Inteligencia que cuida\ntu ganado, "}
              <Text style={s.heroGreen}>siempre.</Text>
            </Text>
            <Text style={[s.heroSub, { fontSize: heroSubSize, marginBottom: isMedium ? 16 : 22 }]}>
              {isMedium
                ? "Monitorea ubicación, salud y actividad\nde tu ganado en tiempo real."
                : "Monitorea en tiempo real la ubicación, salud y actividad\nde tu ganado desde cualquier lugar."}
            </Text>

            <View style={[s.features, { gap: isMedium ? 10 : 14 }]}>
              {([
                { Icon: Shield,      title: "Monitoreo en tiempo real",  sub: "Conoce dónde está tu ganado en todo momento." },
                { Icon: CheckCircle, title: "Alertas inteligentes",       sub: "Recibe notificaciones ante cualquier evento importante." },
                { Icon: BarChart2,   title: "Reportes y análisis",        sub: "Toma mejores decisiones con datos precisos y actualizados." },
              ] as const).map(({ Icon, title, sub }) => (
                <View key={title} style={s.featureRow}>
                  <View style={[s.featureIconBox, isMedium && { width: 34, height: 34 }]}>
                    <Icon size={isMedium ? 14 : 17} color={C.green} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.featureTitle, { fontSize: featureTitleSize }]}>{title}</Text>
                    <Text style={[s.featureSub, { fontSize: featureSubSize }]}>{sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={s.imageWrap}>
            <Image
              source={require("../../assets/ilustra.png")}
              style={s.vacasImg}
              resizeMode="cover"
            />
          </View>
        </View>
      )}

      {/* ══════════════════ PANEL DERECHO / FORMULARIO ══════════════════ */}
      <View style={[s.right, !isDesktop && s.rightFull]}>
        <ScrollView
          contentContainerStyle={[
            s.rightScroll,
            !isDesktop && { paddingHorizontal: 20, paddingVertical: 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo compacto visible solo cuando el panel izquierdo está oculto */}
          {!isDesktop && (
            <View style={s.mobileHeader}>
              <Image
                source={require("../../assets/logotipo.png")}
                style={s.mobileLogoImg}
                resizeMode="contain"
              />
              <Text style={s.mobileBrandName}>
                <Text style={{ color: C.text, fontWeight: "700" }}>Smart</Text>
                <Text style={{ color: C.green, fontWeight: "900" }}>fence</Text>
              </Text>
            </View>
          )}

          <View style={[s.formCard, !isDesktop && s.formCardMobile]}>
            <View style={s.lockCircle}>
              <Lock size={24} color={C.green} strokeWidth={2} />
            </View>

            <Text style={s.cardTitle}>
              <Text style={{ color: C.text }}>Iniciar </Text>
              <Text style={{ color: C.green }}>sesión</Text>
            </Text>
            <Text style={s.cardSub}>Ingresa para acceder a tu panel de control</Text>

            <Text style={s.fieldLabel}>Nombre o correo</Text>
            <View style={s.inputBox}>
              <Mail size={18} color={C.green} strokeWidth={1.8} />
              <TextInput
                value={correo}
                onChangeText={setCorreo}
                placeholder="Tu nombre o correo electrónico"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                style={s.inputField}
              />
            </View>

            <Text style={[s.fieldLabel, { marginTop: 16 }]}>Contraseña</Text>
            <View style={s.inputBox}>
              <Lock size={18} color={C.green} strokeWidth={1.8} />
              <TextInput
                value={contraseña}
                onChangeText={setContraseña}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!verContraseña}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                style={s.inputField}
              />
              <TouchableOpacity onPress={() => setVer(v => !v)} activeOpacity={0.7}>
                {verContraseña
                  ? <EyeOff size={18} color="#9CA3AF" strokeWidth={1.8} />
                  : <Eye    size={18} color="#9CA3AF" strokeWidth={1.8} />
                }
              </TouchableOpacity>
            </View>

            <View style={s.rememberRow}>
              <View style={s.checkbox} />
              <Text style={s.rememberTxt}>Recordarme</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={s.forgotTxt}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.loginBtn, cargando && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={cargando}
              activeOpacity={0.85}
            >
              <LogIn size={20} color="#fff" strokeWidth={2} />
              <Text style={s.loginBtnTxt}>
                {cargando ? "Ingresando..." : "Iniciar sesión"}
              </Text>
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerTxt}>o continúa con</Text>
              <View style={s.dividerLine} />
            </View>

            {errorMsg && (
              <View style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 10, padding: 10, marginBottom: 10 }}>
                <Text style={{ color: "#DC2626", fontSize: 13 }}>⚠ {errorMsg}</Text>
              </View>
            )}

            <View style={s.socialRow}>
              <TouchableOpacity
                style={s.socialBtn}
                activeOpacity={0.75}
                onPress={() => loginConProveedor("Google")}
                disabled={cargando}
              >
                <GoogleIcon />
                <Text style={s.socialTxt}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.socialBtn}
                activeOpacity={0.75}
                onPress={() => loginConProveedor("Apple")}
                disabled={cargando}
              >
                <AppleIcon />
                <Text style={s.socialTxt}>Apple</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.footerTxt}>
              <Text style={{ color: C.textSec }}>¿No tienes una cuenta? </Text>
              <Text style={{ color: C.green, fontWeight: "700" }}>Contacta a tu administrador</Text>
            </Text>
          </View>

          <View style={s.copyright}>
            <Text style={s.copyrightTxt}>© 2024 SmartFence AI. Todos los derechos reservados.</Text>
            <Text style={s.copyrightTxt}>v2.4.0</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  // ── Panel izquierdo — desktop only ──────────────────────────────────────────
  left: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: "column",
    overflow: "hidden",
  },
  leftTop: {
    paddingTop: 28,
    paddingBottom: 16,
  },
  logoRow:      { flexDirection: "row", alignItems: "center", gap: 12 },
  logoImg:      { width: 56, height: 56, borderRadius: 12 },
  brandName:    { letterSpacing: 0.3 },
  brandTagline: { color: "#9CA3AF", fontSize: 8, letterSpacing: 1.5, marginTop: 2 },

  heroLine1: { fontWeight: "900", color: C.text },
  heroGreen: { color: C.green },
  heroSub:   { color: C.textSec, lineHeight: 20 },

  features:       {},
  featureRow:     { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featureIconBox: {
    width: 40, height: 40,
    backgroundColor: "rgba(79,158,44,0.09)",
    borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  featureTitle: { fontWeight: "700", color: C.text },
  featureSub:   { color: C.textSec, marginTop: 2, lineHeight: 16 },

  imageWrap: { flex: 1, minHeight: 160, overflow: "hidden" },
  vacasImg:  { flex: 1, width: "100%" },

  // ── Panel derecho / formulario ───────────────────────────────────────────────
  right: {
    flex: 1,
    backgroundColor: C.bg,
    borderLeftWidth: 1,
    borderLeftColor: "#DDE8DA",
  },
  rightFull: { borderLeftWidth: 0 },
  rightScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
  },

  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  mobileLogoImg:   { width: 44, height: 44, borderRadius: 10 },
  mobileBrandName: { fontSize: 20, letterSpacing: 0.3 },

  formCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 36,
    borderWidth: 1,
    borderColor: "#E4EDDF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
  },
  formCardMobile: { padding: 24, borderRadius: 16 },

  lockCircle: {
    width: 52, height: 52,
    backgroundColor: "#EDF7E8",
    borderRadius: 26,
    alignItems: "center", justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  cardTitle: { fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 4 },
  cardSub:   { color: C.textSec, fontSize: 13, textAlign: "center", marginBottom: 24 },

  fieldLabel: { fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 6 },
  inputBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, height: 48,
    backgroundColor: "#FAFCF8",
  },
  inputField: { flex: 1, fontSize: 14, color: C.text },

  rememberRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 },
  checkbox:    { width: 16, height: 16, borderWidth: 1.5, borderRadius: 4, borderColor: C.border },
  rememberTxt: { fontSize: 13, color: C.textSec },
  forgotTxt:   { fontSize: 13, fontWeight: "700", color: C.green },

  loginBtn: {
    marginTop: 20,
    backgroundColor: C.green,
    borderRadius: 12, height: 50,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10,
  },
  loginBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },

  dividerRow: {
    flexDirection: "row", alignItems: "center",
    marginVertical: 18, gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerTxt:  { fontSize: 12, color: "#9CA3AF" },

  socialRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1, height: 44,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#fff",
  },
  socialTxt: { fontSize: 12, fontWeight: "600", color: C.text },

  footerTxt: { marginTop: 20, textAlign: "center", fontSize: 13 },

  copyright: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 20, width: "100%", maxWidth: 420,
  },
  copyrightTxt: { color: "#9CA3AF", fontSize: 11 },
});
