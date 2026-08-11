import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Props {
  tamaño: number;
  grosor: number;
  duracionMs: number;
  colorFondo: string;
  colorProgreso: string;
  onCompletar: () => void;
}

export default function CirculoProgreso({
  tamaño, grosor, duracionMs, colorFondo, colorProgreso, onCompletar,
}: Props) {
  const radio   = (tamaño - grosor) / 2;
  const circunf = 2 * Math.PI * radio;
  const cx      = tamaño / 2;
  const cy      = tamaño / 2;

  const [progreso, setProgreso] = useState(0);
  const completado = useRef(false);
  const startRef   = useRef<number | null>(null);
  const rafRef     = useRef<number>(0);

  useEffect(() => {
    // Resetear en cada ejecución del efecto (soporta React Strict Mode)
    startRef.current   = null;
    completado.current = false;

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duracionMs);
      setProgreso(p);
      if (p >= 1) {
        if (!completado.current) {
          completado.current = true;
          onCompletar();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const pct    = Math.round(progreso * 100);
  const offset = circunf * (1 - progreso);

  return (
    <View style={{ width: tamaño, height: tamaño, alignItems: "center", justifyContent: "center" }}>
      <Svg width={tamaño} height={tamaño} style={StyleSheet.absoluteFill}>
        <Circle cx={cx} cy={cy} r={radio} stroke={colorFondo} strokeWidth={grosor} fill="none" />
        <Circle
          cx={cx} cy={cy} r={radio}
          stroke={colorProgreso} strokeWidth={grosor} fill="none"
          strokeDasharray={`${circunf}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          rotation={-90}
          originX={cx}
          originY={cy}
        />
      </Svg>
      <Text style={[s.pct, { color: colorProgreso }]}>
        {pct}<Text style={[s.sym, { color: colorProgreso }]}>%</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  pct: { fontSize: 34, fontWeight: "800", lineHeight: 40 },
  sym: { fontSize: 18, fontWeight: "700" },
});
