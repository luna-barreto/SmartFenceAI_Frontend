import React, { useEffect, useRef } from "react";
import {
  View, Text, Animated, Easing, StyleSheet, useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PilaRaiz } from "@navigation/types";
import CirculoProgreso from "@components/CirculoProgreso";
import { useAuth } from "@context/AuthContext";

type Props = NativeStackScreenProps<PilaRaiz, "Splash">;

// ─── Olas inferiores ───────────────────────────────────────────────────────────
function OlasInferiores({ tx, W }: { tx: Animated.Value; W: number }) {
  const x = tx.interpolate({ inputRange: [-1, 1], outputRange: [8, -8] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: x }] }]}
    >
      <Svg
        width={W + 20}
        height={120}
        viewBox={`0 0 ${W + 20} 120`}
        style={{ position: "absolute", bottom: -4, left: -10 }}
      >
        <Path
          d={`M0,70 C${W*0.2},110 ${W*0.4},30 ${W*0.6},70 C${W*0.8},110 ${W},50 ${W+20},70 L${W+20},120 L0,120 Z`}
          fill="#C8DFB0" opacity={0.5}
        />
        <Path
          d={`M0,82 C${W*0.18},56 ${W*0.38},108 ${W*0.58},78 C${W*0.76},52 ${W*0.92},100 ${W+20},82 L${W+20},120 L0,120 Z`}
          fill="#A8CB88" opacity={0.55}
        />
        <Path
          d={`M0,94 C${W*0.22},70 ${W*0.42},114 ${W*0.62},90 C${W*0.8},68 ${W*0.94},108 ${W+20},94 L${W+20},120 L0,120 Z`}
          fill="#7FB05A" opacity={0.6}
        />
        <Path
          d={`M0,106 C${W*0.25},84 ${W*0.45},118 ${W*0.65},100 C${W*0.82},86 ${W*0.96},114 ${W+20},106 L${W+20},120 L0,120 Z`}
          fill="#5A9040" opacity={0.7}
        />
      </Svg>
    </Animated.View>
  );
}

// ─── Hoja flotante ─────────────────────────────────────────────────────────────
function HojaFlotante({ x, y, delay, rot, size = 20 }: {
  x: number; y: number; delay: number; rot: number; size?: number;
}) {
  const ty       = useRef(new Animated.Value(0)).current;
  const op       = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(rot)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(op, { toValue: 0.85, duration: 500, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ty,       { toValue: -18,      duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(rotation, { toValue: rot + 25, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(ty,       { toValue: 0,        duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(rotation, { toValue: rot - 10, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const rotateDeg = rotation.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", left: x, top: y, opacity: op,
        transform: [{ translateY: ty }, { rotate: rotateDeg }] }}
    >
      <Ionicons name="leaf" size={size} color="#6FAE3A" />
    </Animated.View>
  );
}

// ─── SplashScreen ──────────────────────────────────────────────────────────────
export default function SplashScreen({ navigation }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const { usuario, cargando } = useAuth();

  const logoScale  = useRef(new Animated.Value(0.7)).current;
  const logoOp     = useRef(new Animated.Value(0)).current;
  const brandOp    = useRef(new Animated.Value(0)).current;
  const brandTy    = useRef(new Animated.Value(18)).current;
  const ilustraOp  = useRef(new Animated.Value(0)).current;
  const ilustraTy  = useRef(new Animated.Value(22)).current;
  const midOp      = useRef(new Animated.Value(0)).current;
  const waveAnim   = useRef(new Animated.Value(-1)).current;

  const animMinDone = useRef(false);
  const cargandoRef = useRef(cargando);
  const usuarioRef  = useRef(usuario);
  useEffect(() => { cargandoRef.current = cargando; }, [cargando]);
  useEffect(() => { usuarioRef.current  = usuario;  }, [usuario]);

  function tryNavigate() {
    if (cargandoRef.current || !animMinDone.current) return;
    navigation.replace(usuarioRef.current ? "Main" : "Auth");
  }

  useEffect(() => {
    if (!cargando) {
      // pequeño delay para que el ref se actualice antes de navegar
      setTimeout(tryNavigate, 50);
    }
  }, [cargando]);

  useEffect(() => {
    // Olas breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1,  duration: 4000, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    // Logo
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      Animated.timing(logoOp,    { toValue: 1, duration: 550, useNativeDriver: true }),
    ]).start();

    // Brand
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(brandOp, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(brandTy, { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // Ilustración
    Animated.sequence([
      Animated.delay(450),
      Animated.parallel([
        Animated.timing(ilustraOp, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(ilustraTy, { toValue: 0, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // Zona media
    Animated.timing(midOp, { toValue: 1, duration: 450, delay: 650, useNativeDriver: true }).start();
  }, []);

  function alTerminarCarga() {
    animMinDone.current = true;
    setTimeout(tryNavigate, 50);
  }

  return (
    <View style={s.root}>

      {/* Hojas flotantes */}
      <HojaFlotante x={W*0.05}  y={H*0.08} delay={300}  rot={-20} size={22} />
      <HojaFlotante x={W*0.82}  y={H*0.07} delay={600}  rot={28}  size={20} />
      <HojaFlotante x={W*0.10}  y={H*0.22} delay={900}  rot={-35} size={18} />
      <HojaFlotante x={W*0.78}  y={H*0.20} delay={1100} rot={15}  size={16} />
      <HojaFlotante x={W*0.03}  y={H*0.42} delay={500}  rot={-10} size={15} />
      <HojaFlotante x={W*0.88}  y={H*0.38} delay={800}  rot={30}  size={17} />

      {/* ── Logo grande ── */}
      <Animated.Image
        source={require("../../assets/logotipo.png")}
        style={[s.logo, { width: W * 0.28, height: W * 0.28, marginTop: H * 0.07 }, { opacity: logoOp, transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />

      {/* ── Brand ── */}
      <Animated.View style={[s.brandWrap, { opacity: brandOp, transform: [{ translateY: brandTy }] }]}>
        {/* SMARTFENCE AI grande */}
        <Text style={s.bigBrand}>
          <Text style={s.bigDark}>SMART</Text>
          <Text style={s.bigGreen}>FENCE AI</Text>
        </Text>

        {/* Tagline con rayas */}
        <View style={s.tagRow}>
          <View style={s.tagLine} />
          <Ionicons name="leaf-outline" size={13} color="#6FAE3A" style={{ marginHorizontal: 4 }} />
          <Text style={s.tagline}>Inteligencia que protege tu ganado</Text>
          <Ionicons name="leaf-outline" size={13} color="#6FAE3A" style={{ marginHorizontal: 4 }} />
          <View style={s.tagLine} />
        </View>
      </Animated.View>

      {/* ── Ilustración con curva blanca ── */}
      <Animated.View style={[s.ilustraWrap, { width: W }, { opacity: ilustraOp, transform: [{ translateY: ilustraTy }] }]}>
        <Animated.Image
          source={require("../../assets/ilustra.png")}
          style={[s.ilustra, { width: W, height: H * 0.26 }]}
          resizeMode="cover"
        />
        {/* Curva blanca en la parte inferior de la ilustración */}
        <View style={s.curvaWrap} pointerEvents="none">
          <Svg width={W} height={60} viewBox={`0 0 ${W} 60`}>
            <Path
              d={`M0,60 L0,30 Q${W/2},0 ${W},30 L${W},60 Z`}
              fill="#F0F5EB"
            />
          </Svg>
        </View>
      </Animated.View>

      {/* ── Zona de carga ── */}
      <Animated.View style={[s.midZone, { opacity: midOp }]}>
        <Text style={s.cargandoLabel}>Cargando SmartFence AI...</Text>
        <View style={s.anilloCard}>
          <CirculoProgreso
            tamaño={100}
            grosor={7}
            duracionMs={2600}
            colorFondo="#DCF0C8"
            colorProgreso="#3D8A3A"
            onCompletar={alTerminarCarga}
          />
        </View>
      </Animated.View>

      {/* ── Olas inferiores ── */}
      <OlasInferiores tx={waveAnim} W={W} />

    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F0F5EB",
    alignItems: "center",
  },

  // Logo grande
  logo: {},

  // Brand
  brandWrap: {
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },

  // "SMARTFENCE" + línea
  sfWrap:  { alignItems: "center", gap: 3 },
  sfText:  { fontSize: 18, fontWeight: "800", letterSpacing: 3 },
  sfDark:  { color: "#2A4A2A" },
  sfGreen: { color: "#4A8A2A" },
  sfLine:  { width: 120, height: 2, backgroundColor: "#5A9A35", borderRadius: 2 },

  // "SMARTFENCE AI" grande
  bigBrand: { fontSize: 32, fontWeight: "900", letterSpacing: 1.5, marginTop: 4 },
  bigDark:  { color: "#152417" },
  bigGreen: { color: "#3D8A3A" },

  // Tagline
  tagRow:   { flexDirection: "row", alignItems: "center", marginTop: 2 },
  tagLine:  { flex: 1, height: 1, backgroundColor: "#6FAE3A", opacity: 0.5, maxWidth: 30 },
  tagline:  { fontSize: 13, color: "#5C7A5A", fontWeight: "400", marginHorizontal: 2 },

  // Ilustración
  ilustraWrap: {
    marginTop: 12,
    position: "relative",
  },
  ilustra: {},
  curvaWrap: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
  },

  // Zona media
  midZone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingBottom: 80,
  },
  cargandoLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4A6B4A",
  },
  anilloCard: {
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 12,
    shadowColor: "#3D8A3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
});
