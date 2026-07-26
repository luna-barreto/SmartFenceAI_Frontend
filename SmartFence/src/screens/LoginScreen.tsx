import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, Image, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Animated, useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Mail, Lock, Eye, EyeOff, LogIn, CheckCircle } from "lucide-react-native";
import { useAuth } from "@context/AuthContext";

// ─── Ondas SVG ────────────────────────────────────────────────────────────────
function OndasBottom({ tx }: { tx: Animated.Value }) {
  const { width: W } = useWindowDimensions();
  const x = tx.interpolate({ inputRange: [-1, 1], outputRange: [10, -10] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", bottom: 0, left: -10, right: -10, height: 180 }, { transform: [{ translateX: x }] }]}
    >
      <Svg width={W + 20} height={180} viewBox={`0 0 ${W + 20} 180`}>
        <Path
          d={`M0,100 C${W*0.2},160 ${W*0.4},40 ${W*0.6},100 C${W*0.8},160 ${W},60 ${W+20},100 L${W+20},180 L0,180 Z`}
          fill="#DFF8CF"
          opacity={0.7}
        />
        <Path
          d={`M0,115 C${W*0.18},60 ${W*0.38},155 ${W*0.58},105 C${W*0.76},58 ${W*0.92},148 ${W+20},110 L${W+20},180 L0,180 Z`}
          fill="#C8F1B5"
          opacity={0.65}
        />
        <Path
          d={`M0,130 C${W*0.22},75 ${W*0.42},165 ${W*0.62},120 C${W*0.78},75 ${W*0.94},155 ${W+20},125 L${W+20},180 L0,180 Z`}
          fill="#A7E37B"
          opacity={0.55}
        />
        <Path
          d={`M0,148 C${W*0.25},95 ${W*0.45},175 ${W*0.65},138 C${W*0.82},100 ${W*0.95},165 ${W+20},145 L${W+20},180 L0,180 Z`}
          fill="#76C043"
          opacity={0.5}
        />
      </Svg>
    </Animated.View>
  );
}

// ─── Google / Apple SVG logos ─────────────────────────────────────────────────
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

// ─── LoginScreen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { iniciarSesion } = useAuth();
  const [correo, setCorreo]             = useState("ganadero@smartfence.ai");
  const [contraseña, setContraseña]     = useState("");
  const [verContraseña, setVer]         = useState(false);
  const [cargando, setCargando]         = useState(false);

  // ola breathing
  const waveAnim = useRef(new Animated.Value(-1)).current;
  // fade-in secuencia
  const fadeHeader  = useRef(new Animated.Value(0)).current;
  const fadeForm    = useRef(new Animated.Value(0)).current;
  const fadeBottom  = useRef(new Animated.Value(0)).current;
  const slideHeader = useRef(new Animated.Value(18)).current;
  const slideForm   = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    // olas breathing loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1,  duration: 5000, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 5000, useNativeDriver: true }),
      ])
    ).start();

    // secuencia de entrada
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeHeader,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideHeader, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(fadeForm,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideForm, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(80),
      Animated.timing(fadeBottom, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  async function manejarIngreso() {
    setCargando(true);
    try {
      await iniciarSesion(correo, contraseña);
      // RootRedirector detecta el cambio de usuario y navega a "Main"
    } finally {
      setCargando(false);
    }
  }

  const correoValido = correo.length > 0 && correo.includes("@");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={s.root}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header: logo + brand ── */}
        <Animated.View style={[s.header, { opacity: fadeHeader, transform: [{ translateY: slideHeader }] }]}>
          <Image
            source={require("../../assets/logotipo.png")}
            style={s.logoImg}
            resizeMode="contain"
          />

          <Text style={s.brandRow}>
            <Text style={s.brandDark}>SMART</Text>
            <Text style={s.brandGreen}>FENCE</Text>
          </Text>

          <View style={s.aiRow}>
            <View style={s.aiLine} />
            <View style={s.aiLine} />
          </View>

          <Text style={s.tagline}>MONITOREA  •  PROTEGE  •  OPTIMIZA</Text>
        </Animated.View>

        {/* ── Formulario ── */}
        <Animated.View style={[s.formWrap, { opacity: fadeForm, transform: [{ translateY: slideForm }] }]}>
          <View style={s.titleWrap}>
            <Text style={s.titleDark}>Bienvenido </Text>
            <Text style={s.titleGreen}>de nuevo</Text>
          </View>
          <Text style={s.subtitle}>Ingresa para monitorear tu finca en tiempo real</Text>

          {/* Correo */}
          <Text style={s.fieldLabel}>Correo electrónico</Text>
          <View style={s.inputBox}>
            <Mail size={18} color="#76C043" strokeWidth={1.8} />
            <TextInput
              value={correo}
              onChangeText={setCorreo}
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor="#B0BEB4"
              autoCapitalize="none"
              keyboardType="email-address"
              style={s.input}
            />
            {correoValido && <CheckCircle size={18} color="#76C043" strokeWidth={1.8} />}
          </View>

          {/* Contraseña */}
          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Contraseña</Text>
          <View style={s.inputBox}>
            <Lock size={18} color="#76C043" strokeWidth={1.8} />
            <TextInput
              value={contraseña}
              onChangeText={setContraseña}
              placeholder="••••••••"
              placeholderTextColor="#B0BEB4"
              secureTextEntry={!verContraseña}
              style={s.input}
            />
            <TouchableOpacity onPress={() => setVer(v => !v)}>
              {verContraseña
                ? <EyeOff size={18} color="#76C043" strokeWidth={1.8} />
                : <Eye    size={18} color="#76C043" strokeWidth={1.8} />
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.forgotWrap}>
            <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón ingresar */}
          <TouchableOpacity
            onPress={manejarIngreso}
            disabled={cargando}
            activeOpacity={0.88}
            style={s.btnIngresar}
          >
            <LogIn size={19} color="#fff" strokeWidth={2} />
            <Text style={s.btnText}>{cargando ? "Ingresando..." : "Ingresar"}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Bottom: social + demo ── */}
        <Animated.View style={[s.bottomWrap, { opacity: fadeBottom }]}>
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>o continúa con</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} onPress={manejarIngreso}>
              <GoogleIcon />
              <Text style={s.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} onPress={manejarIngreso}>
              <AppleIcon />
              <Text style={s.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.demoText}>
            Modo <Text style={s.demoBold}>demo</Text>: puedes ingresar sin backend activo.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Ondas bottom */}
      <OndasBottom tx={waveAnim} />
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#F8FDF4" },
  scroll: { paddingBottom: 160, paddingTop: 0 },

  // Header
  header: { alignItems: "center", paddingTop: 100, paddingBottom: 16 },
  logoImg: { width: 110, height: 110, borderRadius: 22, marginBottom: 10 },

  brandRow: { fontSize: 28, fontWeight: "900", letterSpacing: 1.5 },
  brandDark:  { color: "#152417" },
  brandGreen: { color: "#76C043" },

  aiRow:  { flexDirection: "row", alignItems: "center", width: 200, gap: 8, marginTop: 2, marginBottom: 6 },
  aiLine: { flex: 1, height: 1.5, backgroundColor: "#76C043" },
  aiLabel:{ fontSize: 16, fontWeight: "900", color: "#174D2A", letterSpacing: 6 },

  tagline: { fontSize: 9.5, color: "#6F8B72", letterSpacing: 1.5, textAlign: "center", fontWeight: "600" },

  // Form
  formWrap: { paddingHorizontal: 24, marginTop: 4 },

  titleWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  titleDark:  { fontSize: 25, fontWeight: "800", color: "#152417" },
  titleGreen: { fontSize: 25, fontWeight: "800", color: "#76C043" },

  subtitle: { fontSize: 14, color: "#6F8B72", marginBottom: 22 },

  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#76C043", marginBottom: 6 },

  inputBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14, borderWidth: 1.5, borderColor: "#E2EFD8",
    paddingHorizontal: 14, paddingVertical: 13,
    gap: 10,
    shadowColor: "#76C043", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
    elevation: 2,
  },
  input: { flex: 1, fontSize: 15, color: "#152417" },

  forgotWrap: { alignItems: "flex-end", marginTop: 10, marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: "600", color: "#76C043" },

  btnIngresar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#76C043",
    borderRadius: 16, paddingVertical: 16,
    shadowColor: "#76C043", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12,
    elevation: 8,
  },
  btnText: { fontSize: 17, fontWeight: "700", color: "#fff", letterSpacing: 0.3 },

  // Bottom
  bottomWrap: { paddingHorizontal: 24, marginTop: 24, alignItems: "center" },

  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2EFD8" },
  dividerText: { fontSize: 13, color: "#9CA89E" },

  socialRow: { flexDirection: "row", gap: 12, width: "100%", marginBottom: 22 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#fff", borderRadius: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: "#E2EFD8",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
    elevation: 2,
  },
  socialText: { fontSize: 15, fontWeight: "600", color: "#152417" },

  demoText: { fontSize: 12.5, color: "#9CA89E", textAlign: "center" },
  demoBold: { fontWeight: "700", color: "#6F8B72" },
});
