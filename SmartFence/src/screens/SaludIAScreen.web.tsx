import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions,
} from "react-native";
import {
  Brain, ThermometerSun, Activity, Utensils,
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  CheckCircle2, ChevronRight, RefreshCw, Zap,
  Droplets, Footprints, HeartPulse, Moon, MapPin,
} from "lucide-react-native";
import Svg, {
  Polyline, Circle as SvgCircle, Line, Rect,
  Text as SvgText, Path,
} from "react-native-svg";
import { useT } from "@context/ThemeContext";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import { ANIMALES_DEMO, type AnimalDemo } from "@/demo/demoData";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type DiagIA = "sano" | "atencion" | "critico";
type EstadoComida = "alta" | "normal" | "reducida" | "sin_comer";

interface Dia7 { dia: string; temp: number; act: number; }

interface MetricaAnimal {
  id: string; nombre: string; raza: string; collarId: string; peso: number;
  // Temperatura
  tempActual: number; tempMin: number; tempMax: number;
  tempHist: number[];       // 24 puntos = 24 h
  horasFiebre: number;      // horas continuas ≥ 39.5°C
  tempPostComidaDelta: number; // cuánto sube temp al comer
  anomaliaPostComida: boolean;
  // Actividad
  actActual: number; actHist: number[]; // 24 h
  distanciaKm: number;
  tiempoQuietoPct: number;  // % del día sin movimiento
  posibleLesion: boolean;
  enAislamiento: boolean;   // lejos del grupo
  distanciaGrupoM: number;
  // Alimentación
  estadoComida: EstadoComida;
  apetitoHoy: number;       // horas comiendo hoy
  apetitoNormal: number;    // promedio normal (horas/día)
  ultimaComida: string;
  // Ambiente
  tempAmbiente: number;     // °C
  riesgoCalor: boolean;
  riesgoDeshidratacion: boolean;
  // Recuperación
  hist7d: Dia7[];
  enRecuperacion: boolean;
  // Índice compuesto 0-100
  indice: number;
  indiceLbl: "Excelente" | "Buena" | "Requiere observación" | "Alto riesgo";
  // Diagnóstico global
  diag: DiagIA;
  confianza: number;
  recomendacion: string;
}

// ─── Generador demo ───────────────────────────────────────────────────────────
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function gen(a: AnimalDemo): MetricaAnimal {
  const s = a.salud.sensor;
  const rng = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

  // Temperatura 24h
  const tBase = s === "verde" ? 38.5 : s === "amarillo" ? 39.3 : 40.2;
  const tempHist = Array.from({ length: 24 }, (_, i) => {
    const pico = [4, 10, 16, 21].some((h) => Math.abs(i - h) <= 1) ? 0.35 : 0;
    const reducePico = s === "rojo" ? 0.2 : 1;
    return parseFloat((tBase + pico * reducePico + rng(-0.25, 0.25)).toFixed(1));
  });
  const horasFiebre = s === "verde" ? 0 : s === "amarillo" ? Math.round(rng(1, 3)) : Math.round(rng(4, 8));
  const tempPostComidaDelta = s === "verde" ? parseFloat(rng(0.15, 0.35).toFixed(2))
    : s === "amarillo" ? parseFloat(rng(0.6, 1.1).toFixed(2))
    : parseFloat(rng(1.3, 1.9).toFixed(2));
  const anomaliaPostComida = tempPostComidaDelta > 0.8;

  // Actividad 24h
  const actBase = s === "verde" ? 65 : s === "amarillo" ? 38 : 14;
  const actHist = Array.from({ length: 24 }, (_, i) => {
    const ciclo = Math.sin((i / 24) * Math.PI * 2) * 18;
    return Math.max(0, Math.min(100, Math.round(actBase + ciclo + rng(-12, 12))));
  });
  const distanciaKm = s === "verde" ? parseFloat(rng(3.5, 6.5).toFixed(1))
    : s === "amarillo" ? parseFloat(rng(1.2, 3.0).toFixed(1))
    : parseFloat(rng(0.2, 1.0).toFixed(1));
  const tiempoQuietoPct = s === "verde" ? Math.round(rng(20, 35))
    : s === "amarillo" ? Math.round(rng(45, 65)) : Math.round(rng(70, 90));
  const posibleLesion = s !== "verde" && tiempoQuietoPct > 60 && tempHist[23] < 39.0;
  const enAislamiento = s === "rojo" || (s === "amarillo" && Math.random() > 0.5);
  const distanciaGrupoM = enAislamiento ? Math.round(rng(80, 250)) : Math.round(rng(10, 40));

  // Alimentación
  const apetitoHoy    = s === "verde" ? parseFloat(rng(4.5, 6.0).toFixed(1))
    : s === "amarillo" ? parseFloat(rng(2.0, 3.5).toFixed(1))
    : parseFloat(rng(0.2, 1.2).toFixed(1));
  const apetitoNormal = parseFloat(rng(4.5, 5.5).toFixed(1));
  const estadoComida: EstadoComida =
    apetitoHoy >= 4.0 ? "alta" : apetitoHoy >= 2.5 ? "normal"
    : apetitoHoy >= 1.0 ? "reducida" : "sin_comer";
  const h = Math.floor(s === "verde" ? 0.5 : s === "amarillo" ? 2.5 : 5);
  const m = Math.round(((s === "verde" ? 0.5 : s === "amarillo" ? 2.5 : 5) - h) * 60);
  const ultimaComida = h > 0 ? `Hace ${h}h ${m}min` : `Hace ${m}min`;

  // Ambiente
  const tempAmbiente = Math.round(rng(24, 36));
  const riesgoCalor = tempHist[23] >= 39.2 && tempAmbiente >= 32 && actActualOf(actHist) < 30;
  const riesgoDeshidratacion = tempHist[23] >= 39.5 && distanciaKm < 1.5 && apetitoHoy < 1.5;

  // 7 días historial
  const hist7d: Dia7[] = DIAS.map((dia, i) => {
    const offset = (6 - i);
    const recovering = s === "amarillo" && a.id === "d-03";
    const tOff = recovering ? (-(offset * 0.18)) : 0;
    return {
      dia,
      temp: parseFloat((tBase - offset * 0.05 + tOff + rng(-0.15, 0.15)).toFixed(1)),
      act:  Math.max(0, Math.min(100, Math.round(actBase + offset * 2 + rng(-8, 8)))),
    };
  });
  const enRecuperacion = hist7d[6].temp < hist7d[0].temp - 0.4
    && hist7d[6].act > hist7d[0].act + 8;

  // Índice 0-100
  const scoreTemp  = Math.max(0, 100 - Math.max(0, (tempHist[23] - 38.5) / 1.5) * 100);
  const scoreAct   = actActualOf(actHist);
  const scoreAlim  = Math.min(100, (apetitoHoy / apetitoNormal) * 100);
  const scoreRep   = Math.max(0, 100 - tiempoQuietoPct);
  const scoreLoc   = enAislamiento ? 40 : 100;
  const indice = Math.round(
    scoreTemp * 0.35 + scoreAct * 0.25 + scoreAlim * 0.20 + scoreRep * 0.10 + scoreLoc * 0.10
  );
  const indiceLbl =
    indice >= 85 ? "Excelente"
    : indice >= 65 ? "Buena"
    : indice >= 40 ? "Requiere observación"
    : "Alto riesgo";

  const diag: DiagIA = indice >= 65 ? "sano" : indice >= 40 ? "atencion" : "critico";
  const confianza = diag === "sano" ? Math.round(rng(88, 97))
    : diag === "atencion" ? Math.round(rng(82, 92)) : Math.round(rng(91, 98));

  const recoMap: Record<DiagIA, string> = {
    sano:     "Continuar monitoreo rutinario. Sin acción necesaria.",
    atencion: "Observar durante 6h. Verificar agua y sombra. Consultar veterinario si no mejora.",
    critico:  "Intervención veterinaria inmediata. Aislar el animal. Revisar temperatura rectal y mucosas.",
  };

  return {
    id: a.id, nombre: a.displayNombre, raza: a.raza, collarId: a.collarId, peso: a.peso,
    tempActual: tempHist[23], tempMin: Math.min(...tempHist), tempMax: Math.max(...tempHist),
    tempHist, horasFiebre, tempPostComidaDelta, anomaliaPostComida,
    actActual: actActualOf(actHist), actHist, distanciaKm, tiempoQuietoPct,
    posibleLesion, enAislamiento, distanciaGrupoM,
    estadoComida, apetitoHoy, apetitoNormal, ultimaComida,
    tempAmbiente, riesgoCalor, riesgoDeshidratacion,
    hist7d, enRecuperacion,
    indice, indiceLbl, diag, confianza, recomendacion: recoMap[diag],
  };
}
function actActualOf(h: number[]) { return h[h.length - 1]; }

// ─── Colores diagnóstico ──────────────────────────────────────────────────────
function useDiagColor(diag: DiagIA, T: ReturnType<typeof useT>) {
  return diag === "sano" ? T.verde : diag === "atencion" ? T.naranja : T.rojo;
}
function useDiagBg(diag: DiagIA, T: ReturnType<typeof useT>) {
  return diag === "sano" ? T.verdeAlfa : diag === "atencion" ? T.naranjaBg : T.rojoBg;
}

// ─── Mini sparkline ───────────────────────────────────────────────────────────
function Spark({ data, color, w = 70, h = 24 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (data.length < 2) return null;
  const lo = Math.min(...data), hi = Math.max(...data), range = hi - lo || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - lo) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <Svg width={w} height={h}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Gráfica de líneas 24h con zona referencia ────────────────────────────────
function LineChart({
  data, color, refLo, refHi, labelY, T,
}: {
  data: number[]; color: string;
  refLo?: number; refHi?: number;
  labelY?: string; T: ReturnType<typeof useT>;
}) {
  const W = 320, H = 72;
  const lo = Math.min(...data, refLo ?? 9999) - 0.3;
  const hi = Math.max(...data, refHi ?? -9999) + 0.3;
  const range = hi - lo || 1;
  const nx = (i: number) => ((i / (data.length - 1)) * W);
  const ny = (v: number) => H - ((v - lo) / range) * (H - 8) - 4;
  const pts = data.map((v, i) => `${nx(i).toFixed(1)},${ny(v).toFixed(1)}`).join(" ");
  const tickX = [0, 6, 12, 18, 23];
  return (
    <Svg width="100%" height={H + 18} viewBox={`0 0 ${W} ${H + 18}`}>
      {refLo !== undefined && refHi !== undefined && (
        <Rect x={0} y={ny(refHi)} width={W} height={ny(refLo) - ny(refHi)}
          fill={T.verdeAlfa} opacity={0.5} />
      )}
      {refHi !== undefined && (
        <Line x1={0} y1={ny(refHi)} x2={W} y2={ny(refHi)}
          stroke={T.rojo} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
      )}
      <Polyline points={pts} fill="none" stroke={color}
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <SvgCircle key={i} cx={nx(i)} cy={ny(v)} r={2} fill={color} />
      ))}
      {tickX.map((i) => (
        <SvgText key={i} x={nx(i)} y={H + 14} fontSize={8}
          fill={T.txtTer} textAnchor="middle">{i}h</SvgText>
      ))}
    </Svg>
  );
}

// ─── Gráfica barras ───────────────────────────────────────────────────────────
function BarChart({ data, color, T, labelFn }: {
  data: number[]; color: string | ((v: number) => string);
  T: ReturnType<typeof useT>; labelFn?: (i: number) => string;
}) {
  const W = 320, H = 60;
  const bW = W / data.length - 2;
  return (
    <Svg width="100%" height={H + 18} viewBox={`0 0 ${W} ${H + 18}`}>
      {data.map((v, i) => {
        const h = (v / 100) * H;
        const x = i * (W / data.length) + 1;
        const fill = typeof color === "function" ? color(v) : color;
        return <Rect key={i} x={x} y={H - h} width={bW} height={h}
          fill={fill} rx={2} opacity={0.85} />;
      })}
      {labelFn && data.map((_, i) => (
        <SvgText key={i} x={i * (W / data.length) + bW / 2 + 1}
          y={H + 14} fontSize={7} fill={T.txtTer} textAnchor="middle">
          {labelFn(i)}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─── Gauge índice 0-100 ───────────────────────────────────────────────────────
function IndiceGauge({ indice, color, T }: { indice: number; color: string; T: ReturnType<typeof useT> }) {
  const r = 34, circ = 2 * Math.PI * r;
  const dash = circ * (indice / 100);
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={90} height={90} viewBox="0 0 90 90">
        <SvgCircle cx={45} cy={45} r={r} fill="none" stroke={T.borde} strokeWidth={7} />
        <SvgCircle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${circ - dash}`}
          rotation="-90" origin="45,45" />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color }}>{indice}</Text>
        <Text style={{ fontSize: 8, color, marginTop: -2 }}>/100</Text>
      </View>
    </View>
  );
}

// ─── Badge diagnóstico ────────────────────────────────────────────────────────
function DiagBadge({ diag, T }: { diag: DiagIA; T: ReturnType<typeof useT> }) {
  const label = diag === "sano" ? "Sano" : diag === "atencion" ? "Atención" : "Crítico";
  const color = useDiagColor(diag, T);
  const bg    = useDiagBg(diag, T);
  return (
    <View style={[db.wrap, { backgroundColor: bg }]}>
      <Text style={[db.txt, { color }]}>{label}</Text>
    </View>
  );
}
const db = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  txt:  { fontSize: 10, fontWeight: "800" },
});

// ─── Tarjeta de escenario ─────────────────────────────────────────────────────
function ScenarioCard({
  icon: Icon, title, value, sub, alerta, color, bg, children, T,
}: {
  icon: React.ComponentType<any>; title: string;
  value: string; sub: string; alerta: boolean;
  color: string; bg: string;
  children?: React.ReactNode; T: ReturnType<typeof useT>;
}) {
  return (
    <View style={[sc.card, { backgroundColor: T.card, borderColor: alerta ? color : T.borde,
      borderLeftWidth: alerta ? 3 : 1 }]}>
      <View style={sc.header}>
        <View style={[sc.iconBox, { backgroundColor: bg }]}>
          <Icon size={14} color={color} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[sc.title, { color: T.txtSec }]}>{title}</Text>
          <Text style={[sc.value, { color }]}>{value}</Text>
        </View>
        {alerta && (
          <View style={[sc.alertBadge, { backgroundColor: bg }]}>
            <AlertTriangle size={10} color={color} strokeWidth={2} />
            <Text style={[sc.alertTxt, { color }]}>Alerta</Text>
          </View>
        )}
      </View>
      {sub !== "" && <Text style={[sc.sub, { color: T.txtTer }]}>{sub}</Text>}
      {children}
    </View>
  );
}
const sc = StyleSheet.create({
  card:       { borderRadius: 12, borderWidth: 1, padding: 12, gap: 6 },
  header:     { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  iconBox:    { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.2 },
  value:      { fontSize: 15, fontWeight: "900" },
  sub:        { fontSize: 10, lineHeight: 14 },
  alertBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  alertTxt:   { fontSize: 9, fontWeight: "800" },
});

// ─── Tabla 7 días ─────────────────────────────────────────────────────────────
function Tabla7d({ hist, T }: { hist: Dia7[]; T: ReturnType<typeof useT> }) {
  return (
    <View style={{ marginTop: 6, gap: 2 }}>
      {hist.map((d, i) => {
        const tempColor = d.temp >= 39.8 ? T.rojo : d.temp >= 39.2 ? T.naranja : T.verde;
        const actColor  = d.act < 25 ? T.rojo : d.act < 50 ? T.naranja : T.azul;
        return (
          <View key={i} style={[td.row, { borderBottomColor: T.borde }]}>
            <Text style={[td.dia, { color: T.txtTer }]}>{d.dia}</Text>
            <View style={[td.pill, { backgroundColor: T.rojoBg }]}>
              <Text style={[td.val, { color: tempColor }]}>{d.temp.toFixed(1)}°C</Text>
            </View>
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: T.borde, overflow: "hidden" }}>
              <View style={{ width: `${d.act}%` as any, height: "100%", borderRadius: 3, backgroundColor: actColor }} />
            </View>
            <Text style={[td.actPct, { color: actColor }]}>{d.act}%</Text>
          </View>
        );
      })}
    </View>
  );
}
const td = StyleSheet.create({
  row:    { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3, borderBottomWidth: 1 },
  dia:    { width: 26, fontSize: 9, fontWeight: "600" },
  pill:   { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 },
  val:    { fontSize: 9, fontWeight: "700" },
  actPct: { fontSize: 9, fontWeight: "700", width: 28, textAlign: "right" },
});

// ─── Comparativa apetito ──────────────────────────────────────────────────────
function ApetitoComp({ hoy, normal, color, T }: {
  hoy: number; normal: number; color: string; T: ReturnType<typeof useT>;
}) {
  const pct = Math.min(100, (hoy / normal) * 100);
  return (
    <View style={{ gap: 4, marginTop: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 9, color: T.txtTer }}>Hoy: {hoy}h</Text>
        <Text style={{ fontSize: 9, color: T.txtTer }}>Normal: {normal}h</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: T.borde, overflow: "hidden" }}>
          <View style={{ width: `${pct}%` as any, height: "100%", borderRadius: 4, backgroundColor: color }} />
        </View>
        <Text style={{ fontSize: 10, fontWeight: "800", color, minWidth: 32 }}>{Math.round(pct)}%</Text>
      </View>
    </View>
  );
}

// ─── Detalle completo de un animal ────────────────────────────────────────────
function AnimalDetail({ m, T }: { m: MetricaAnimal; T: ReturnType<typeof useT> }) {
  const color = useDiagColor(m.diag, T);
  const bg    = useDiagBg(m.diag, T);

  // Colores dinámicos por actividad
  const actColor = (v: number) =>
    v < 25 ? T.rojo : v < 50 ? T.naranja : T.azul;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ padding: 16, gap: 14 }}>

        {/* ── Header ── */}
        <View style={[hd.card, { backgroundColor: T.card, borderColor: T.borde }]}>
          <View style={{ flex: 1 }}>
            <Text style={[hd.nombre, { color: T.txtMain }]}>{m.nombre}</Text>
            <Text style={[hd.sub, { color: T.txtSec }]}>{m.raza} · {m.peso} kg · {m.collarId}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <DiagBadge diag={m.diag} T={T} />
              <View style={[hd.confBadge, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                <Brain size={10} color={"#9333ea"} strokeWidth={2} />
                <Text style={[hd.confTxt, { color: "#9333ea" }]}>IA {m.confianza}% confianza</Text>
              </View>
            </View>
          </View>
          <IndiceGauge indice={m.indice} color={color} T={T} />
        </View>

        {/* ── Índice de salud descompuesto ── */}
        <View style={[hd.idxCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <HeartPulse size={13} color={"#9333ea"} strokeWidth={2} />
            <Text style={[hd.sectionTitle, { color: T.txtMain }]}>Índice de salud — {m.indiceLbl}</Text>
          </View>
          {[
            { label: "Temperatura", pct: Math.max(0, Math.round(100 - Math.max(0, (m.tempActual - 38.5) / 1.5) * 100)), peso: "35%" },
            { label: "Movimiento",  pct: m.actActual, peso: "25%" },
            { label: "Alimentación",pct: Math.min(100, Math.round((m.apetitoHoy / m.apetitoNormal) * 100)), peso: "20%" },
            { label: "Descanso",    pct: Math.max(0, 100 - m.tiempoQuietoPct), peso: "10%" },
            { label: "Ubicación",   pct: m.enAislamiento ? 40 : 100, peso: "10%" },
          ].map(({ label, pct, peso }) => {
            const c = pct >= 70 ? T.verde : pct >= 45 ? T.naranja : T.rojo;
            return (
              <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <Text style={[hd.idxLabel, { color: T.txtSec }]}>{label}</Text>
                <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: T.borde, overflow: "hidden" }}>
                  <View style={{ width: `${pct}%` as any, height: "100%", borderRadius: 3, backgroundColor: c }} />
                </View>
                <Text style={[hd.idxPct, { color: c }]}>{pct}%</Text>
                <Text style={[hd.idxPeso, { color: T.txtTer }]}>{peso}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Sección gráficas 24h ── */}
        <Text style={[hd.sectionTitle, { color: T.txtMain }]}>Señales del collar — últimas 24 horas</Text>

        {/* 1. Fiebre */}
        <ScenarioCard
          icon={ThermometerSun}
          title="TEMPERATURA CORPORAL"
          value={`${m.tempActual.toFixed(1)}°C`}
          sub={m.horasFiebre > 0
            ? `⚠ Temperatura elevada durante ${m.horasFiebre}h continuas. Rango normal: 38.0–39.5°C`
            : "Temperatura dentro del rango normal bovino (38.0–39.5°C)"}
          alerta={m.horasFiebre >= 3}
          color={m.tempActual >= 39.5 ? T.rojo : m.tempActual >= 39.0 ? T.naranja : T.verde}
          bg={m.tempActual >= 39.5 ? T.rojoBg : m.tempActual >= 39.0 ? T.naranjaBg : T.verdeAlfa}
          T={T}
        >
          <LineChart data={m.tempHist} color={T.rojo} refLo={38.0} refHi={39.5} T={T} />
          <View style={{ flexDirection: "row", gap: 14 }}>
            <Text style={{ fontSize: 9, color: T.txtTer }}>Min: {m.tempMin.toFixed(1)}°C</Text>
            <Text style={{ fontSize: 9, color: T.txtTer }}>Máx: {m.tempMax.toFixed(1)}°C</Text>
            {m.horasFiebre > 0 && <Text style={{ fontSize: 9, color: T.rojo, fontWeight: "700" }}>Fiebre: {m.horasFiebre}h</Text>}
          </View>
        </ScenarioCard>

        {/* 2. Actividad / Movimiento */}
        <ScenarioCard
          icon={Activity}
          title="ACTIVIDAD DE MOVIMIENTO"
          value={`${m.actActual}%`}
          sub={`${m.distanciaKm} km recorridos hoy · Tiempo quieto: ${m.tiempoQuietoPct}%`}
          alerta={m.actActual < 25 || m.tiempoQuietoPct > 65}
          color={actColor(m.actActual)}
          bg={m.actActual < 25 ? T.rojoBg : m.actActual < 50 ? T.naranjaBg : T.azulBg}
          T={T}
        >
          <BarChart
            data={m.actHist}
            color={(v) => actColor(v)}
            T={T}
            labelFn={(i) => i % 6 === 0 ? `${i}h` : ""}
          />
        </ScenarioCard>

        {/* 3. Pérdida de apetito */}
        <ScenarioCard
          icon={Utensils}
          title="ALIMENTACIÓN"
          value={m.estadoComida === "sin_comer" ? "Sin comer"
            : m.estadoComida === "reducida" ? "Reducida"
            : m.estadoComida === "normal" ? "Normal" : "Activa"}
          sub={`Última comida: ${m.ultimaComida}`}
          alerta={m.estadoComida === "sin_comer" || m.estadoComida === "reducida"}
          color={m.estadoComida === "sin_comer" ? T.rojo : m.estadoComida === "reducida" ? T.naranja : T.verde}
          bg={m.estadoComida === "sin_comer" ? T.rojoBg : m.estadoComida === "reducida" ? T.naranjaBg : T.verdeAlfa}
          T={T}
        >
          <ApetitoComp hoy={m.apetitoHoy} normal={m.apetitoNormal}
            color={m.estadoComida === "sin_comer" ? T.rojo : m.estadoComida === "reducida" ? T.naranja : T.verde}
            T={T} />
          <Text style={{ fontSize: 9, color: T.txtTer, marginTop: 2 }}>
            Una vaca sana come 4.5–6h/día. Pastoreo activo = temperatura sube 0.2–0.4°C temporalmente.
          </Text>
        </ScenarioCard>

        {/* 4. Estrés por calor */}
        <ScenarioCard
          icon={ThermometerSun}
          title="ESTRÉS POR CALOR"
          value={m.riesgoCalor ? "Riesgo detectado" : "Sin riesgo"}
          sub={`Temp. corporal: ${m.tempActual.toFixed(1)}°C · Temp. ambiente: ${m.tempAmbiente}°C · Actividad: ${m.actActual}%`}
          alerta={m.riesgoCalor}
          color={m.riesgoCalor ? T.rojo : T.verde}
          bg={m.riesgoCalor ? T.rojoBg : T.verdeAlfa}
          T={T}
        >
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            {[
              { label: "Temp. corporal", val: `${m.tempActual.toFixed(1)}°C`, alert: m.tempActual >= 39.2 },
              { label: "Temp. ambiente", val: `${m.tempAmbiente}°C`,          alert: m.tempAmbiente >= 32  },
              { label: "Actividad",      val: `${m.actActual}%`,              alert: m.actActual < 30      },
            ].map(({ label, val, alert }) => (
              <View key={label} style={[{ flex: 1, borderRadius: 8, padding: 7, alignItems: "center" },
                { backgroundColor: alert ? T.rojoBg : T.cardElevada }]}>
                <Text style={{ fontSize: 9, color: T.txtTer }}>{label}</Text>
                <Text style={{ fontSize: 12, fontWeight: "800", color: alert ? T.rojo : T.txtMain }}>{val}</Text>
              </View>
            ))}
          </View>
        </ScenarioCard>

        {/* 5. Posible lesión */}
        <ScenarioCard
          icon={Footprints}
          title="LESIÓN / COJERA"
          value={m.posibleLesion ? "Posible lesión" : "Sin indicios"}
          sub={`Tiempo quieto: ${m.tiempoQuietoPct}% · Distancia: ${m.distanciaKm} km · Temp: ${m.tempActual.toFixed(1)}°C (normal)`}
          alerta={m.posibleLesion}
          color={m.posibleLesion ? T.naranja : T.verde}
          bg={m.posibleLesion ? T.naranjaBg : T.verdeAlfa}
          T={T}
        >
          <Text style={{ fontSize: 9, color: T.txtTer, marginTop: 2 }}>
            Señal: poco movimiento + temperatura normal. Si tuviese infección, la temperatura subiría.
            La combinación quietud+temp.normal sugiere lesión física.
          </Text>
        </ScenarioCard>

        {/* 6. Deshidratación */}
        <ScenarioCard
          icon={Droplets}
          title="DESHIDRATACIÓN"
          value={m.riesgoDeshidratacion ? "Riesgo alto" : "Sin riesgo"}
          sub={`Temp. elevada + baja actividad + poco consumo estimado`}
          alerta={m.riesgoDeshidratacion}
          color={m.riesgoDeshidratacion ? T.rojo : T.azul}
          bg={m.riesgoDeshidratacion ? T.rojoBg : T.azulBg}
          T={T}
        />

        {/* 7. Aislamiento */}
        <ScenarioCard
          icon={MapPin}
          title="AISLAMIENTO DEL GRUPO"
          value={m.enAislamiento ? `${m.distanciaGrupoM} m del grupo` : "Integrado al grupo"}
          sub={m.enAislamiento
            ? "Animal detectado lejos del centroide del rebaño. Comportamiento asociado a enfermedad o estrés."
            : `Distancia media al grupo: ${m.distanciaGrupoM} m. Comportamiento normal.`}
          alerta={m.enAislamiento}
          color={m.enAislamiento ? T.naranja : T.verde}
          bg={m.enAislamiento ? T.naranjaBg : T.verdeAlfa}
          T={T}
        />

        {/* 8. Anomalía post-comida */}
        <ScenarioCard
          icon={Zap}
          title="PATRÓN POST-COMIDA"
          value={`+${m.tempPostComidaDelta.toFixed(2)}°C al comer`}
          sub={m.anomaliaPostComida
            ? "La temperatura sube más de lo esperado después de alimentarse y no baja. Posible proceso inflamatorio."
            : "Patrón normal: temperatura sube levemente (+0.2–0.4°C) y regresa al punto base en 30–60 min."}
          alerta={m.anomaliaPostComida}
          color={m.anomaliaPostComida ? T.rojo : T.verde}
          bg={m.anomaliaPostComida ? T.rojoBg : T.verdeAlfa}
          T={T}
        >
          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            <View style={[{ flex: 1, borderRadius: 8, padding: 7, backgroundColor: T.verdeAlfa }]}>
              <Text style={{ fontSize: 9, color: T.txtTer }}>Normal</Text>
              <Text style={{ fontSize: 11, fontWeight: "800", color: T.verde }}>+0.15–0.40°C</Text>
              <Text style={{ fontSize: 8, color: T.txtTer }}>Baja en 30–60 min</Text>
            </View>
            <View style={[{ flex: 1, borderRadius: 8, padding: 7,
              backgroundColor: m.anomaliaPostComida ? T.rojoBg : T.verdeAlfa }]}>
              <Text style={{ fontSize: 9, color: T.txtTer }}>Este animal</Text>
              <Text style={[{ fontSize: 11, fontWeight: "800" },
                { color: m.anomaliaPostComida ? T.rojo : T.verde }]}>
                +{m.tempPostComidaDelta.toFixed(2)}°C
              </Text>
              <Text style={{ fontSize: 8, color: T.txtTer }}>
                {m.anomaliaPostComida ? "No baja — alerta" : "Regresa normal"}
              </Text>
            </View>
          </View>
        </ScenarioCard>

        {/* 9. Recuperación 7 días */}
        <ScenarioCard
          icon={TrendingUp}
          title="TENDENCIA 7 DÍAS"
          value={m.enRecuperacion ? "Recuperación progresiva" : m.diag === "sano" ? "Estable y sano" : "Sin mejoría"}
          sub=""
          alerta={false}
          color={m.enRecuperacion ? T.verde : m.diag === "sano" ? T.verde : T.naranja}
          bg={m.diag === "sano" || m.enRecuperacion ? T.verdeAlfa : T.naranjaBg}
          T={T}
        >
          <Tabla7d hist={m.hist7d} T={T} />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
              <View style={{ width: 16, height: 3, backgroundColor: T.rojo, borderRadius: 2 }} />
              <Text style={{ fontSize: 8, color: T.txtTer }}>Temperatura</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
              <View style={{ width: 16, height: 3, backgroundColor: T.azul, borderRadius: 2 }} />
              <Text style={{ fontSize: 8, color: T.txtTer }}>Actividad</Text>
            </View>
          </View>
        </ScenarioCard>

        {/* 10. Recomendación final */}
        <View style={[hd.recoCard, {
          backgroundColor: m.diag === "critico" ? T.rojoBg : m.diag === "atencion" ? T.naranjaBg : T.verdeAlfa,
          borderColor: color,
        }]}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            {m.diag === "critico"
              ? <AlertTriangle size={16} color={T.rojo} strokeWidth={2} />
              : m.diag === "atencion"
              ? <Zap size={16} color={T.naranja} strokeWidth={2} />
              : <CheckCircle2 size={16} color={T.verde} strokeWidth={2} />}
            <View style={{ flex: 1 }}>
              <Text style={[hd.recoTitle, { color }]}>Recomendación IA</Text>
              <Text style={[hd.recoTxt, { color: T.txtSec }]}>{m.recomendacion}</Text>
            </View>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
const hd = StyleSheet.create({
  card:       { flexDirection: "row", borderRadius: 16, borderWidth: 1, padding: 14, gap: 10, alignItems: "flex-start" },
  nombre:     { fontSize: 15, fontWeight: "900" },
  sub:        { fontSize: 10, marginTop: 2 },
  confBadge:  { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  confTxt:    { fontSize: 9, fontWeight: "700" },
  idxCard:    { borderRadius: 14, borderWidth: 1, padding: 12 },
  idxLabel:   { width: 85, fontSize: 10 },
  idxPct:     { fontSize: 10, fontWeight: "800", width: 30, textAlign: "right" },
  idxPeso:    { fontSize: 9, width: 26, textAlign: "right" },
  sectionTitle: { fontSize: 12, fontWeight: "700" },
  recoCard:   { borderRadius: 12, borderWidth: 1, padding: 12 },
  recoTitle:  { fontSize: 11, fontWeight: "800", marginBottom: 3 },
  recoTxt:    { fontSize: 11, lineHeight: 16 },
});

// ─── Fila de lista izquierda ──────────────────────────────────────────────────
function AnimalRow({ m, active, onPress, T }: {
  m: MetricaAnimal; active: boolean; onPress: () => void; T: ReturnType<typeof useT>;
}) {
  const color = useDiagColor(m.diag, T);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={[lr.row, { borderBottomColor: T.borde },
        active && { backgroundColor: T.verdeLuz }]}>
      <View style={[lr.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[lr.nombre, { color: T.txtMain }]} numberOfLines={1}>{m.nombre}</Text>
          <DiagBadge diag={m.diag} T={T} />
        </View>
        <Text style={[lr.sub, { color: T.txtSec }]}>{m.raza} · {m.collarId}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 3 }}>
          <Text style={[lr.mini, { color: T.txtTer }]}>🌡 {m.tempActual.toFixed(1)}°C</Text>
          <Text style={[lr.mini, { color: T.txtTer }]}>⚡ {m.actActual}%</Text>
          <Text style={[lr.mini, { color: T.txtTer }]}>❤ {m.indice}/100</Text>
        </View>
      </View>
      <Spark data={m.tempHist.filter((_, i) => i % 2 === 0)} color={color} w={42} h={20} />
      <ChevronRight size={12} color={T.txtTer} strokeWidth={2} />
    </TouchableOpacity>
  );
}
const lr = StyleSheet.create({
  row:    { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1 },
  dot:    { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  nombre: { fontSize: 11.5, fontWeight: "700" },
  sub:    { fontSize: 9.5, marginTop: 1 },
  mini:   { fontSize: 9.5 },
});

// ─── Resumen IA global ────────────────────────────────────────────────────────
function ResumenGlobal({ ms, T }: { ms: MetricaAnimal[]; T: ReturnType<typeof useT> }) {
  const sanos    = ms.filter((m) => m.diag === "sano").length;
  const atencion = ms.filter((m) => m.diag === "atencion").length;
  const criticos = ms.filter((m) => m.diag === "critico").length;
  const avgIdx   = Math.round(ms.reduce((s, m) => s + m.indice, 0) / ms.length);
  const avgTemp  = (ms.reduce((s, m) => s + m.tempActual, 0) / ms.length).toFixed(1);
  return (
    <View style={[rg.card, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <View style={[rg.iconBox, { backgroundColor: "rgba(147,51,234,0.12)" }]}>
          <Brain size={15} color="#9333ea" strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[rg.titulo, { color: T.txtMain }]}>Motor de análisis conductual IA</Text>
          <Text style={[rg.sub, { color: T.txtSec }]}>Temperatura · Movimiento · Alimentación · Ubicación</Text>
        </View>
      </View>
      <View style={rg.row}>
        {[
          { n: sanos,    lbl: "Sanos",    color: T.verde,  bg: T.verdeAlfa },
          { n: atencion, lbl: "Atención", color: T.naranja,bg: T.naranjaBg },
          { n: criticos, lbl: "Críticos", color: T.rojo,   bg: T.rojoBg    },
          { n: avgIdx,   lbl: "Índice medio", color: avgIdx >= 65 ? T.verde : T.naranja, bg: T.cardElevada },
          { n: `${avgTemp}°`, lbl: "Temp. media", color: T.rojo, bg: T.cardElevada },
        ].map(({ n, lbl, color, bg }) => (
          <View key={lbl} style={[rg.stat, { backgroundColor: bg }]}>
            <Text style={[rg.statN, { color }]}>{n}</Text>
            <Text style={[rg.statL, { color }]}>{lbl}</Text>
          </View>
        ))}
      </View>
      <View style={[rg.howBox, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
        <Text style={[rg.howTxt, { color: T.txtSec }]}>
          <Text style={{ fontWeight: "700", color: T.txtMain }}>Cómo funciona: </Text>
          Una vaca sana come 4–6h/día → su temperatura sube 0.2–0.4°C al alimentarse y regresa. Si la temperatura
          se mantiene alta sin pico de alimentación → posible fiebre. Si la actividad cae más del 40% y no come →
          alerta temprana de enfermedad. El índice combina 5 variables ponderadas (temp 35%, movimiento 25%,
          alimentación 20%, descanso 10%, ubicación 10%).
        </Text>
      </View>
    </View>
  );
}
const rg = StyleSheet.create({
  card:    { borderRadius: 14, borderWidth: 1, padding: 14 },
  iconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  titulo:  { fontSize: 12, fontWeight: "700" },
  sub:     { fontSize: 9, marginTop: 1 },
  row:     { flexDirection: "row", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  stat:    { flex: 1, minWidth: 56, borderRadius: 9, padding: 8, alignItems: "center" },
  statN:   { fontSize: 16, fontWeight: "900" },
  statL:   { fontSize: 8, fontWeight: "700", marginTop: 1, textAlign: "center" },
  howBox:  { borderRadius: 9, borderWidth: 1, padding: 9 },
  howTxt:  { fontSize: 10, lineHeight: 15 },
});

// ─── Screen principal ─────────────────────────────────────────────────────────
export default function SaludIAScreen() {
  const T = useT();
  const { width } = useWindowDimensions();
  const isSm = width < 768;

  const [metricas, setMetricas] = useState<MetricaAnimal[]>(() => ANIMALES_DEMO.map(gen));
  const [selId, setSelId]       = useState(metricas[0].id);
  const [filtro, setFiltro]     = useState<DiagIA | "todos">("todos");
  const [cargando, setCargando] = useState(false);

  const animal = metricas.find((m) => m.id === selId) ?? metricas[0];

  function refrescar() {
    setCargando(true);
    setTimeout(() => { setMetricas(ANIMALES_DEMO.map(gen)); setCargando(false); }, 900);
  }

  const lista = filtro === "todos" ? metricas : metricas.filter((m) => m.diag === filtro);

  const topRight = (
    <TouchableOpacity onPress={refrescar} activeOpacity={0.75}
      style={[st.refreshBtn, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
      <RefreshCw size={12} color={cargando ? T.verde : T.txtMain} strokeWidth={2} />
      <Text style={[st.refreshTxt, { color: T.txtMain }]}>
        {cargando ? "Analizando…" : "Actualizar"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="SaludIA" />
      <View style={st.main}>
        <WebTopBar
          titulo="Salud IA — Análisis conductual"
          sub="Temperatura · Movimiento · Alimentación · Patrón post-comida · Recuperación"
          rightContent={topRight}
        />
        <View style={st.body}>

          {/* Lista izquierda */}
          {!isSm && (
            <View style={[st.leftCol, { backgroundColor: T.card, borderRightColor: T.borde }]}>
              <View style={[st.filterRow, { borderBottomColor: T.borde }]}>
                {(["todos", "sano", "atencion", "critico"] as const).map((f) => {
                  const active = filtro === f;
                  const c = f === "sano" ? T.verde : f === "atencion" ? T.naranja : f === "critico" ? T.rojo : T.txtSec;
                  const bg = f === "sano" ? T.verdeAlfa : f === "atencion" ? T.naranjaBg : f === "critico" ? T.rojoBg : T.cardElevada;
                  const lbl = f === "todos" ? "Todos" : f === "sano" ? "Sanos" : f === "atencion" ? "Atención" : "Críticos";
                  return (
                    <TouchableOpacity key={f} onPress={() => setFiltro(f)} activeOpacity={0.75}
                      style={[st.pill, active ? { backgroundColor: bg } : {}]}>
                      <Text style={[st.pillTxt, { color: active ? c : T.txtTer }]}>{lbl}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {lista.map((m) => (
                  <AnimalRow key={m.id} m={m} active={m.id === selId}
                    onPress={() => setSelId(m.id)} T={T} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Detalle derecho */}
          <View style={st.rightCol}>
            {/* Resumen global sticky */}
            <View style={{ padding: 14, paddingBottom: 0 }}>
              <ResumenGlobal ms={metricas} T={T} />
            </View>
            {/* Selector horizontal en mobile */}
            {isSm && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                contentContainerStyle={{ gap: 6 }}>
                {metricas.map((m) => {
                  const c = useDiagColor(m.diag, T);
                  const active = m.id === selId;
                  return (
                    <TouchableOpacity key={m.id} onPress={() => setSelId(m.id)} activeOpacity={0.75}
                      style={[st.smPill, { borderColor: c, backgroundColor: active ? c : "transparent" }]}>
                      <Text style={[st.smPillTxt, { color: active ? "#fff" : c }]}>{m.nombre}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <AnimalDetail m={animal} T={T} />
          </View>

        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root:       { flex: 1, flexDirection: "row" },
  main:       { flex: 1, flexDirection: "column" },
  body:       { flex: 1, flexDirection: "row", overflow: "hidden" },
  leftCol:    { width: 290, flexDirection: "column", borderRightWidth: 1 },
  rightCol:   { flex: 1, flexDirection: "column" },
  filterRow:  { flexDirection: "row", gap: 4, padding: 8, borderBottomWidth: 1, flexWrap: "wrap" },
  pill:       { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  pillTxt:    { fontSize: 10.5, fontWeight: "700" },
  refreshBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  refreshTxt: { fontSize: 11, fontWeight: "600" },
  smPill:     { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999, borderWidth: 1.5 },
  smPillTxt:  { fontSize: 10.5, fontWeight: "700" },
});
