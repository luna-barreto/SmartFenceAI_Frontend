import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PilaRaiz } from "@navigation/types";
import { useAuth } from "@context/AuthContext";

type Props = NativeStackScreenProps<PilaRaiz, "Splash">;

const DURATION_MS = 2400;
const SIZE   = 100;
const STROKE = 7;
const RADIO  = (SIZE - STROKE) / 2;
const CIRCUNF = 2 * Math.PI * RADIO;
const CX = SIZE / 2;
const CY = SIZE / 2;

export default function SplashScreen({ navigation }: Props) {
  const { usuario, cargando } = useAuth();
  const { width: W } = useWindowDimensions();

  const terminado  = useRef(false);
  const navegado   = useRef(false);
  const startRef   = useRef<number | null>(null);
  const rafRef     = useRef(0);

  // Refs al DOM — actualizados directamente, sin pasar por React state
  const pctRef = useRef<any>(null);
  const arcRef = useRef<any>(null);

  const logoSize = Math.min(W * 0.22, 140);

  function navegar() {
    if (navegado.current) return;
    navegado.current = true;
    navigation.replace(usuario ? "Main" : "Auth");
  }

  useEffect(() => {
    // Resetear en cada invocación (soporta StrictMode double-invoke)
    terminado.current = false;
    startRef.current  = null;

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const pct = Math.min(100, Math.round(((ts - startRef.current) / DURATION_MS) * 100));

      // ── Actualización directa al DOM ── sin React state, sin batching ──
      try {
        if (pctRef.current) pctRef.current.textContent = pct + "%";
      } catch (_) {}

      try {
        if (arcRef.current) {
          const offset = CIRCUNF * (1 - pct / 100);
          arcRef.current.setAttribute("stroke-dashoffset", String(offset));
        }
      } catch (_) {}

      if (pct >= 100) {
        if (!terminado.current) {
          terminado.current = true;
          if (!cargando) navegar();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, []);

  // Fallback si cargando cambia después de que la animación terminó
  useEffect(() => {
    if (terminado.current && !cargando) navegar();
  }, [cargando]);

  return (
    <View style={s.root}>
      <Image
        source={require("../../assets/logotipo.png")}
        style={[s.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />

      <Text style={s.nombre}>
        <Text style={s.nombreDark}>Smart</Text>
        <Text style={s.nombreGreen}>fence</Text>
      </Text>

      <View style={s.midZone}>
        <Text style={s.cargandoLabel}>Cargando...</Text>

        <View style={s.anilloCard}>
          <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>

            {/*
              SVG nativo HTML — no usa react-native-svg.
              El ref del <circle> apunta al elemento SVGCircleElement del DOM directamente,
              lo que nos permite actualizar stroke-dashoffset sin React state.
            */}
            {/* @ts-ignore — JSX SVG nativo dentro de React Native Web */}
            <svg
              width={SIZE}
              height={SIZE}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {/* @ts-ignore */}
              <circle
                cx={CX} cy={CY} r={RADIO}
                stroke="#DCF0C8"
                strokeWidth={STROKE}
                fill="none"
              />
              {/* @ts-ignore */}
              <circle
                ref={arcRef}
                cx={CX} cy={CY} r={RADIO}
                stroke="#3D8A3A"
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRCUNF}
                strokeDashoffset={CIRCUNF}
                strokeLinecap="round"
                transform={`rotate(-90 ${CX} ${CY})`}
              />
            </svg>

            {/*
              <Text> sin hijos en JSX → React no gestiona su textContent.
              El RAF escribe directamente: pctRef.current.textContent = "XX%"
            */}
            <Text
              // @ts-ignore
              ref={pctRef}
              style={s.pct}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F0F5EB",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  logo:        { borderRadius: 20 },
  nombre:      { fontSize: 38, fontWeight: "900", letterSpacing: 0.3 },
  nombreDark:  { color: "#152417" },
  nombreGreen: { color: "#3D8A3A" },
  midZone:     { alignItems: "center", gap: 14, marginTop: 8 },
  cargandoLabel: { fontSize: 14, fontWeight: "500", color: "#4A6B4A" },
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
  pct: {
    fontSize: 34,
    fontWeight: "800",
    color: "#3D8A3A",
    lineHeight: 40,
    minWidth: 70,
    textAlign: "center",
  },
});
