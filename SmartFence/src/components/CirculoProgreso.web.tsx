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
  const cx = tamaño / 2;
  const cy = tamaño / 2;

  const [pct, setPct]      = useState(0);
  const completado         = useRef(false);
  const intervalRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    completado.current = false;
    let n = 0;
    // 100 pasos uniformes durante duracionMs (mínimo 16 ms/paso para no saturar)
    const paso = Math.max(16, Math.floor(duracionMs / 100));

    intervalRef.current = setInterval(() => {
      n = Math.min(100, n + 1);
      setPct(n);
      if (n >= 100 && !completado.current) {
        completado.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        onCompletar();
      }
    }, paso);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const offset = circunf * (1 - pct / 100);

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
