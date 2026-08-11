import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions, Image,
} from "react-native";
import {
  Brain, ThermometerSun, Activity, Utensils,
  TrendingUp, AlertTriangle,
  CheckCircle2, ChevronRight, RefreshCw,
  Droplets, Footprints, HeartPulse, MapPin,
  Heart, Plus, Bell,
} from "lucide-react-native";
import Svg, {
  Polyline, Circle as SvgCircle,
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
  tempActual: number; tempMin: number; tempMax: number;
  tempHist: number[];
  horasFiebre: number;
  tempPostComidaDelta: number; anomaliaPostComida: boolean;
  actActual: number; actHist: number[];
  distanciaKm: number; tiempoQuietoPct: number;
  posibleLesion: boolean; enAislamiento: boolean; distanciaGrupoM: number;
  estadoComida: EstadoComida; apetitoHoy: number; apetitoNormal: number; ultimaComida: string;
  tempAmbiente: number; riesgoCalor: boolean; riesgoDeshidratacion: boolean;
  rumiaHorasEst: number; rumiaHist: number[];
  hist7d: Dia7[]; enRecuperacion: boolean;
  indice: number; indiceLbl: "Excelente" | "Buena" | "Requiere observación" | "Alto riesgo";
  diag: DiagIA; confianza: number; recomendacion: string;
}

// ─── Generador demo ───────────────────────────────────────────────────────────
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function gen(a: AnimalDemo): MetricaAnimal {
  const s = a.salud.sensor;
  const rng = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
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
  const apetitoHoy = s === "verde" ? parseFloat(rng(4.5, 6.0).toFixed(1))
    : s === "amarillo" ? parseFloat(rng(2.0, 3.5).toFixed(1))
    : parseFloat(rng(0.2, 1.2).toFixed(1));
  const apetitoNormal = parseFloat(rng(4.5, 5.5).toFixed(1));
  const estadoComida: EstadoComida = apetitoHoy >= 4.0 ? "alta" : apetitoHoy >= 2.5 ? "normal"
    : apetitoHoy >= 1.0 ? "reducida" : "sin_comer";
  const h = Math.floor(s === "verde" ? 0.5 : s === "amarillo" ? 2.5 : 5);
  const m2 = Math.round(((s === "verde" ? 0.5 : s === "amarillo" ? 2.5 : 5) - h) * 60);
  const ultimaComida = h > 0 ? `Hace ${h}h ${m2}min` : `Hace ${m2}min`;
  const tempAmbiente = Math.round(rng(24, 36));
  const actFinal = actHist[actHist.length - 1];
  const riesgoCalor = tempHist[23] >= 39.2 && tempAmbiente >= 32 && actFinal < 30;
  const riesgoDeshidratacion = tempHist[23] >= 39.5 && distanciaKm < 1.5 && apetitoHoy < 1.5;
  const hist7d: Dia7[] = DIAS.map((dia, i) => {
    const offset = (6 - i);
    const recovering = s === "amarillo" && a.id === "d-03";
    const tOff = recovering ? (-(offset * 0.18)) : 0;
    return {
      dia,
      temp: parseFloat((tBase - offset * 0.05 + tOff + rng(-0.15, 0.15)).toFixed(1)),
      act: Math.max(0, Math.min(100, Math.round(actBase + offset * 2 + rng(-8, 8)))),
    };
  });
  const rumiaBase = s === "verde" ? 7.1 : s === "amarillo" ? 5.2 : 3.0;
  const rumiaHorasEst = parseFloat((rumiaBase + rng(-0.4, 0.4)).toFixed(1));
  const rumiaHist = Array.from({ length: 24 }, (_, i) => {
    const night = (i < 6 || i > 20) ? 0.45 : 0.25;
    return parseFloat(Math.max(0, rumiaBase * night + rng(-0.15, 0.15)).toFixed(2));
  });
  const enRecuperacion = hist7d[6].temp < hist7d[0].temp - 0.4 && hist7d[6].act > hist7d[0].act + 8;
  const scoreTemp  = Math.max(0, 100 - Math.max(0, (tempHist[23] - 38.5) / 1.5) * 100);
  const scoreAct   = actFinal;
  const scoreAlim  = Math.min(100, (apetitoHoy / apetitoNormal) * 100);
  const scoreRep   = Math.max(0, 100 - tiempoQuietoPct);
  const scoreLoc   = enAislamiento ? 40 : 100;
  const indice = Math.round(scoreTemp * 0.35 + scoreAct * 0.25 + scoreAlim * 0.20 + scoreRep * 0.10 + scoreLoc * 0.10);
  const indiceLbl = indice >= 85 ? "Excelente" : indice >= 65 ? "Buena" : indice >= 40 ? "Requiere observación" : "Alto riesgo";
  const diag: DiagIA = indice >= 65 ? "sano" : indice >= 40 ? "atencion" : "critico";
  const confianza = diag === "sano" ? Math.round(rng(88, 97)) : diag === "atencion" ? Math.round(rng(82, 92)) : Math.round(rng(91, 98));
  const recoMap: Record<DiagIA, string> = {
    sano:     "Continuar monitoreo rutinario. Sin acción necesaria.",
    atencion: "Observar durante 6h. Verificar agua y sombra. Consultar veterinario si no mejora.",
    critico:  "Intervención veterinaria inmediata. Aislar el animal. Revisar temperatura rectal y mucosas.",
  };
  return {
    id: a.id, nombre: a.displayNombre, raza: a.raza, collarId: a.collarId, peso: a.peso,
    tempActual: tempHist[23], tempMin: Math.min(...tempHist), tempMax: Math.max(...tempHist),
    tempHist, horasFiebre, tempPostComidaDelta, anomaliaPostComida,
    actActual: actFinal, actHist, distanciaKm, tiempoQuietoPct,
    posibleLesion, enAislamiento, distanciaGrupoM,
    estadoComida, apetitoHoy, apetitoNormal, ultimaComida,
    tempAmbiente, riesgoCalor, riesgoDeshidratacion,
    rumiaHorasEst, rumiaHist,
    hist7d, enRecuperacion,
    indice, indiceLbl, diag, confianza, recomendacion: recoMap[diag],
  };
}

// ─── Helpers de color ─────────────────────────────────────────────────────────
function diagColor(diag: DiagIA, T: ReturnType<typeof useT>) {
  return diag === "sano" ? T.verde : diag === "atencion" ? T.naranja : T.rojo;
}
function diagBg(diag: DiagIA, T: ReturnType<typeof useT>) {
  return diag === "sano" ? T.verdeAlfa : diag === "atencion" ? T.naranjaBg : T.rojoBg;
}

// ─── Badge diagnóstico ────────────────────────────────────────────────────────
function DiagBadge({ diag, T }: { diag: DiagIA; T: ReturnType<typeof useT> }) {
  const label = diag === "sano" ? "Sano" : diag === "atencion" ? "Atención" : "Crítico";
  const color = diagColor(diag, T);
  const bg    = diagBg(diag, T);
  return (
    <View style={[dg.wrap, { backgroundColor: bg }]}>
      <Text style={[dg.txt, { color }]}>{label}</Text>
    </View>
  );
}
const dg = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  txt:  { fontSize: 10, fontWeight: "800" },
});

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Spark({ data, color, w = 42, h = 20 }: { data: number[]; color: string; w?: number; h?: number }) {
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

// ─── Animal avatar (iniciales) ────────────────────────────────────────────────
function AnimalAvatar({ nombre, diag, T }: { nombre: string; diag: DiagIA; T: ReturnType<typeof useT> }) {
  const initials = nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const bg = diagBg(diag, T);
  const color = diagColor(diag, T);
  return (
    <View style={[av.circle, { backgroundColor: bg }]}>
      <Text style={[av.txt, { color }]}>{initials}</Text>
    </View>
  );
}
const av = StyleSheet.create({
  circle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  txt:    { fontSize: 13, fontWeight: "800" },
});

// ─── Fila de lista ────────────────────────────────────────────────────────────
function AnimalRow({ m, active, onPress, T }: {
  m: MetricaAnimal; active: boolean; onPress: () => void; T: ReturnType<typeof useT>;
}) {
  const color = diagColor(m.diag, T);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={[lr.row, { borderBottomColor: T.borde }, active && { backgroundColor: T.verdeLuz }]}>
      <AnimalAvatar nombre={m.nombre} diag={m.diag} T={T} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Text style={[lr.nombre, { color: T.txtMain }]} numberOfLines={1}>{m.nombre}</Text>
          <DiagBadge diag={m.diag} T={T} />
        </View>
        <Text style={[lr.sub, { color: T.txtSec }]} numberOfLines={1}>{m.raza} · {m.collarId}</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 3 }}>
          <View style={lr.miniItem}>
            <ThermometerSun size={10} color={T.txtTer} strokeWidth={1.8} />
            <Text style={[lr.mini, { color: T.txtTer }]}>{m.tempActual.toFixed(1)}°C</Text>
          </View>
          <View style={lr.miniItem}>
            <Activity size={10} color={T.txtTer} strokeWidth={1.8} />
            <Text style={[lr.mini, { color: T.txtTer }]}>{m.actActual}%</Text>
          </View>
          <View style={lr.miniItem}>
            <HeartPulse size={10} color={T.txtTer} strokeWidth={1.8} />
            <Text style={[lr.mini, { color: T.txtTer }]}>{m.indice}/100</Text>
          </View>
        </View>
      </View>
      <Spark data={m.tempHist.filter((_, i) => i % 2 === 0)} color={color} />
      <ChevronRight size={12} color={T.txtTer} strokeWidth={2} />
    </TouchableOpacity>
  );
}
const lr = StyleSheet.create({
  row:      { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1 },
  nombre:   { fontSize: 12, fontWeight: "700" },
  sub:      { fontSize: 10, marginTop: 1 },
  miniItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  mini:     { fontSize: 9.5 },
});

// ─── Stat tile (fila superior) ────────────────────────────────────────────────
function StatTile({ icon: Icon, value, label, color, bg, T }: {
  icon: React.ComponentType<any>; value: string | number;
  label: string; color: string; bg: string;
  T: ReturnType<typeof useT>;
}) {
  return (
    <View style={[st2.tile, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={[st2.iconBox, { backgroundColor: bg }]}>
        <Icon size={18} color={color} strokeWidth={1.8} />
      </View>
      <Text style={[st2.value, { color }]}>{value}</Text>
      <Text style={[st2.label, { color: T.txtSec }]}>{label}</Text>
      <View style={[st2.bar, { backgroundColor: color }]} />
    </View>
  );
}
const st2 = StyleSheet.create({
  tile:    { flex: 1, minWidth: 110, borderRadius: 16, padding: 14, borderWidth: 1, gap: 6, overflow: "hidden" },
  iconBox: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  value:   { fontSize: 30, fontWeight: "900", lineHeight: 34 },
  label:   { fontSize: 10.5, fontWeight: "600" },
  bar:     { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },
});

// ─── Mini mapa sketch ─────────────────────────────────────────────────────────
function MiniMapSketch({ T }: { T: ReturnType<typeof useT> }) {
  const dots: [number, number][] = [[42,28],[55,38],[50,32],[66,42],[60,55],[48,50],[72,30],[38,48]];
  return (
    <Svg width={110} height={88} viewBox="0 0 110 88">
      <Path
        d="M 38 8 L 88 12 L 102 42 L 92 76 L 52 84 L 14 70 L 8 36 Z"
        fill="none"
        stroke={T.verde}
        strokeWidth={1.2}
        strokeDasharray="4 3"
        opacity={0.55}
      />
      {dots.map(([x, y], i) => (
        <SvgCircle key={i} cx={x} cy={y} r={2.5} fill={T.verde} opacity={0.7} />
      ))}
    </Svg>
  );
}

// ─── Tarjeta Motor IA ─────────────────────────────────────────────────────────
function MotorIACard({ T }: { T: ReturnType<typeof useT> }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 900;
  return (
    <View style={[mg.card, { backgroundColor: T.card, borderColor: T.borde, overflow: "hidden" }]}>
      <View style={[mg.inner, isCompact && mg.innerCompact]}>
        {/* Texto */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <View style={[mg.iconCircle, { backgroundColor: "rgba(147,51,234,0.12)" }]}>
              <Brain size={18} color="#9333ea" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[mg.titulo, { color: T.txtMain }]}>Motor de análisis conductual IA</Text>
              <Text style={[mg.sub, { color: T.txtSec }]}>Temperatura · Movimiento · Alimentación · Ubicación</Text>
            </View>
          </View>
          <Text style={[mg.body, { color: T.txtSec }]}>
            <Text style={{ fontWeight: "700", color: T.txtMain }}>Cómo funciona: </Text>
            {"Una vaca sana entre 4–6h/día → su temperatura sube 0.2–0.4°C al alimentarse y regresa.\n"}
            {"El índice combina 5 variables ponderadas (temp. 35%, mov. 25%, alimentación 20%,\ndescanso 10%, ubicación 10%)."}
          </Text>
        </View>
        {/* Ilustración */}
        {!isCompact && (
          <View style={mg.imgWrap}>
            <Image
              source={require("../../assets/analisis vaca.png")}
              style={mg.img}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
      {/* Imagen en modo compacto debajo, recortada */}
      {isCompact && (
        <View style={mg.imgWrapCompact}>
          <Image
            source={require("../../assets/analisis vaca.png")}
            style={mg.imgCompact}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}
const mg = StyleSheet.create({
  card:           { borderRadius: 16, borderWidth: 1, padding: 16 },
  inner:          { flexDirection: "row", gap: 16, alignItems: "center" },
  innerCompact:   { flexDirection: "column" },
  iconCircle:     { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  titulo:         { fontSize: 13, fontWeight: "700" },
  sub:            { fontSize: 10, marginTop: 2 },
  body:           { fontSize: 11, lineHeight: 17 },
  imgWrap:        { width: 180, height: 110, flexShrink: 0, borderRadius: 10, overflow: "hidden" },
  img:            { width: "100%", height: "100%" },
  imgWrapCompact: { width: "100%", height: 90, marginTop: 12, borderRadius: 10, overflow: "hidden" },
  imgCompact:     { width: "100%", height: "100%" },
});

// ─── Scenario tile (2×2 grid) ─────────────────────────────────────────────────
interface TileData {
  icon: React.ComponentType<any>;
  iconBg: string; iconColor: string;
  title: string;
  status: string; statusColor: string;
  rows: { label: string; value?: string }[];
  bottomLabel: string; bottomColor: string;
}

function ScenarioTile({ data, T }: { data: TileData; T: ReturnType<typeof useT> }) {
  const { icon: Icon, iconBg, iconColor, title, status, statusColor, rows, bottomLabel, bottomColor } = data;
  return (
    <View style={[tl.card, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <View style={[tl.iconCircle, { backgroundColor: iconBg }]}>
          <Icon size={18} color={iconColor} strokeWidth={1.8} />
        </View>
        <Text style={[tl.title, { color: T.txtTer }]}>{title}</Text>
      </View>
      <Text style={[tl.status, { color: statusColor }]}>{status}</Text>
      <View style={{ flex: 1, gap: 6, marginTop: 10 }}>
        {rows.map((r, i) => (
          <View key={i}>
            <Text style={[tl.rowLabel, { color: T.txtTer }]}>{r.label}</Text>
            {r.value !== undefined && (
              <Text style={[tl.rowValue, { color: T.txtMain }]}>{r.value}</Text>
            )}
          </View>
        ))}
      </View>
      <View style={[tl.bottom, { borderTopColor: T.borde }]}>
        <View style={[tl.dot, { backgroundColor: bottomColor }]} />
        <Text style={[tl.bottomTxt, { color: bottomColor }]}>{bottomLabel}</Text>
      </View>
    </View>
  );
}
const tl = StyleSheet.create({
  card:       { flex: 1, minWidth: 180, borderRadius: 16, borderWidth: 1, padding: 14, gap: 0 },
  iconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.3, flex: 1, flexWrap: "wrap" },
  status:     { fontSize: 16, fontWeight: "900", lineHeight: 20 },
  rowLabel:   { fontSize: 10.5 },
  rowValue:   { fontSize: 14, fontWeight: "800", marginTop: 1 },
  bottom:     { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  dot:        { width: 7, height: 7, borderRadius: 4 },
  bottomTxt:  { fontSize: 10.5, fontWeight: "700" },
});

// ─── Grilla 2×2 de escenarios ─────────────────────────────────────────────────
function ScenarioGrid({ m, T }: { m: MetricaAnimal; T: ReturnType<typeof useT> }) {
  const tiles: TileData[] = [
    {
      icon: ThermometerSun,
      iconBg: m.riesgoCalor ? T.rojoBg : T.verdeAlfa,
      iconColor: m.riesgoCalor ? T.rojo : T.verde,
      title: "ESTRÉS POR CALOR",
      status: m.riesgoCalor ? "Riesgo detectado" : "Sin riesgo",
      statusColor: m.riesgoCalor ? T.rojo : T.verde,
      rows: [
        { label: "Temp. corporal", value: `${m.tempActual.toFixed(1)} °C` },
        { label: "Temp. ambiente", value: `${m.tempAmbiente} °C` },
      ],
      bottomLabel: m.riesgoCalor ? "ALERTA" : "ÓPTIMO",
      bottomColor: m.riesgoCalor ? T.rojo : T.verde,
    },
    {
      icon: Footprints,
      iconBg: m.posibleLesion ? T.naranjaBg : T.verdeAlfa,
      iconColor: m.posibleLesion ? T.naranja : T.verde,
      title: "LESIÓN / COJERA",
      status: m.posibleLesion ? "Posible lesión" : "Sin indicios",
      statusColor: m.posibleLesion ? T.naranja : T.verde,
      rows: [
        { label: "Tiempo quieto", value: `${m.tiempoQuietoPct}%` },
        { label: "Distancia", value: `${m.distanciaKm} km` },
      ],
      bottomLabel: m.posibleLesion ? "ATENCIÓN" : "ÓPTIMO",
      bottomColor: m.posibleLesion ? T.naranja : T.verde,
    },
    {
      icon: Droplets,
      iconBg: m.riesgoDeshidratacion ? T.rojoBg : "rgba(59,130,246,0.10)",
      iconColor: m.riesgoDeshidratacion ? T.rojo : T.azul,
      title: "DESHIDRATACIÓN",
      status: m.riesgoDeshidratacion ? "Riesgo alto" : "Sin riesgo",
      statusColor: m.riesgoDeshidratacion ? T.rojo : T.azul,
      rows: [
        { label: "Temp. elevada" },
        { label: "+ baja actividad" },
        { label: "+ poco consumo estimado" },
      ],
      bottomLabel: m.riesgoDeshidratacion ? "ALERTA" : "ÓPTIMA",
      bottomColor: m.riesgoDeshidratacion ? T.rojo : T.azul,
    },
    {
      icon: MapPin,
      iconBg: m.enAislamiento ? T.naranjaBg : T.verdeAlfa,
      iconColor: m.enAislamiento ? T.naranja : T.verde,
      title: "AISLAMIENTO DEL GRUPO",
      status: m.enAislamiento ? `${m.distanciaGrupoM} m del grupo` : "Integrado al grupo",
      statusColor: m.enAislamiento ? T.naranja : T.verde,
      rows: [
        { label: "Distancia media", value: `${m.distanciaGrupoM} m` },
      ],
      bottomLabel: m.enAislamiento ? "ATENCIÓN" : "ÓPTIMA",
      bottomColor: m.enAislamiento ? T.naranja : T.verde,
    },
  ];

  return (
    <View style={sg.grid}>
      {tiles.map((tile, i) => (
        <ScenarioTile key={i} data={tile} T={T} />
      ))}
    </View>
  );
}
const sg = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});

// ─── Gráfica multi-línea 24h ──────────────────────────────────────────────────
function MultiLineChart({ actHist, tempHist, rumiaHist, T }: {
  actHist: number[]; tempHist: number[]; rumiaHist: number[]; T: ReturnType<typeof useT>;
}) {
  const W = 520; const H = 160; const PL = 36; const PR = 36; const PT = 10; const PB = 24;
  const chartW = W - PL - PR; const chartH = H - PT - PB;

  function toPoints(data: number[], lo: number, hi: number) {
    const range = hi - lo || 1;
    return data.map((v, i) => {
      const x = PL + (i / (data.length - 1)) * chartW;
      const y = PT + chartH - ((v - lo) / range) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }

  const actPts  = toPoints(actHist,  0,   100);
  const tempPts = toPoints(tempHist, 36.5, 41);
  const rumiaPts= toPoints(rumiaHist, 0,  0.7);

  const hours = [0, 4, 8, 12, 16, 20, 24];

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = PT + chartH * (1 - f);
        return <Polyline key={i} points={`${PL},${y.toFixed(1)} ${PL + chartW},${y.toFixed(1)}`}
          fill="none" stroke={T.borde} strokeWidth={0.7} />;
      })}
      {/* Hour labels */}
      {hours.map((h) => {
        const x = PL + (h / 24) * chartW;
        return <SvgText key={h} x={x} y={H - 4} fontSize={9} fill={T.txtTer}
          textAnchor="middle">{`${String(h).padStart(2,"0")}:00`}</SvgText>;
      })}
      {/* Left axis — Actividad */}
      {[0, 50, 100].map((v) => {
        const y = PT + chartH - (v / 100) * chartH;
        return <SvgText key={v} x={PL - 4} y={y + 3} fontSize={8} fill={T.verde}
          textAnchor="end">{v}</SvgText>;
      })}
      {/* Right axis — Temp */}
      {[37, 38, 39, 40].map((v) => {
        const y = PT + chartH - ((v - 36.5) / 4.5) * chartH;
        return <SvgText key={v} x={PL + chartW + 4} y={y + 3} fontSize={8} fill={T.rojo}
          textAnchor="start">{v}</SvgText>;
      })}
      {/* Lines */}
      <Polyline points={rumiaPts} fill="none" stroke="#f59e0b" strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      <Polyline points={tempPts}  fill="none" stroke={T.rojo}  strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points={actPts}   fill="none" stroke={T.verde} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Banner Estado General IA ─────────────────────────────────────────────────
function EstadoGeneralBanner({ m, T }: { m: MetricaAnimal; T: ReturnType<typeof useT> }) {
  const { width } = useWindowDimensions();
  const showCow = width >= 760;
  const color  = diagColor(m.diag, T);
  const bgCard = m.diag === "sano" ? T.verdeAlfa : m.diag === "atencion" ? T.naranjaBg : T.rojoBg;
  const label  = m.diag === "sano" ? "ESTABLE" : m.diag === "atencion" ? "ATENCIÓN" : "CRÍTICO";
  const desc   = m.diag === "sano"
    ? "No se detectan cambios relevantes\nen su comportamiento."
    : m.diag === "atencion"
    ? `Se detectó una disminución de actividad del ${Math.abs(100 - m.actActual)}% respecto a su patrón habitual.`
    : "Se detectaron múltiples anomalías. Se recomienda intervención inmediata.";
  const nivelLabel = m.diag === "sano" ? "Bajo" : m.diag === "atencion" ? "Medio" : "Alto";

  return (
    <View style={[eb.card, { backgroundColor: bgCard, borderColor: color + "35" }]}>
      <View style={eb.inner}>

        {/* Izquierda: icono */}
        <View style={[eb.cowCircle, { borderColor: color, backgroundColor: T.fondo + "cc" }]}>
          <HeartPulse size={32} color={color} strokeWidth={1.8} />
          <View style={[eb.checkBadge, { backgroundColor: color }]}>
            <CheckCircle2 size={12} color="#fff" strokeWidth={3} />
          </View>
        </View>

        {/* Centro: texto */}
        <View style={eb.center}>
          <Text style={[eb.sectionLabel, { color }]}>ESTADO GENERAL IA</Text>
          <Text style={[eb.bigLabel, { color }]}>{label}</Text>
          <Text style={[eb.desc, { color: T.txtSec }]}>{desc}</Text>
          <View style={[eb.nivelBadge, { backgroundColor: T.fondo + "cc" }]}>
            <View style={[eb.dot, { backgroundColor: color }]} />
            <Text style={[eb.nivelTxt, { color: T.txtSec }]}>
              Nivel de atención: <Text style={{ color, fontWeight: "700" }}>{nivelLabel}</Text>
            </Text>
          </View>
        </View>

        {/* Ilustración vaca */}
        {showCow && (
          <Image
            source={require("../../assets/estado vaca.png")}
            style={eb.cowImg}
            resizeMode="contain"
          />
        )}

      </View>
    </View>
  );
}
const eb = StyleSheet.create({
  card:        { borderRadius: 16, borderWidth: 1, padding: 20, overflow: "hidden" },
  inner:       { flexDirection: "row", alignItems: "center", gap: 20 },
  cowCircle:   { width: 88, height: 88, borderRadius: 44, borderWidth: 2.5, alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 },
  checkBadge:  { position: "absolute", bottom: 2, right: 2, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  center:      { flex: 1, gap: 8, minWidth: 0 },
  sectionLabel:{ fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  bigLabel:    { fontSize: 40, fontWeight: "900", letterSpacing: -1, lineHeight: 44 },
  desc:        { fontSize: 12, lineHeight: 18 },
  nivelBadge:  { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  nivelTxt:    { fontSize: 11, fontWeight: "500" },
  dot:         { width: 7, height: 7, borderRadius: 4 },
  cowImg:      { width: 260, height: 170, flexShrink: 0 },
});

// ─── 4 tarjetas métricas (Temp · Actividad · Movilidad · Alimentación/Rumia) ──
function MetricCards({ m, T }: { m: MetricaAnimal; T: ReturnType<typeof useT> }) {
  const tempOk  = m.tempActual < 39.2;
  const actOk   = m.actActual >= 50;
  const movOk   = !m.posibleLesion;
  const alimentOk = m.estadoComida !== "sin_comer" && m.estadoComida !== "reducida";
  const tempDelta = (m.tempActual - 38.5).toFixed(1);
  const actDelta  = m.actActual - 76;
  const alimentLabel = m.estadoComida === "alta" ? "Normal" : m.estadoComida === "normal" ? "Normal"
    : m.estadoComida === "reducida" ? "Reducida" : "Sin comer";

  return (
    <View style={mc.row}>
      {/* Temperatura */}
      <View style={[mc.card, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={mc.cardHeader}>
          <View style={[mc.iconCircle, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
            <ThermometerSun size={16} color={T.rojo} strokeWidth={1.8} />
          </View>
          <Text style={[mc.cardTitle, { color: T.txtTer }]}>TEMPERATURA CORPORAL</Text>
        </View>
        <Text style={[mc.bigValue, { color: T.txtMain }]}>{m.tempActual.toFixed(1)} °C</Text>
        <View style={[mc.statusBadge, { backgroundColor: tempOk ? T.verdeAlfa : T.rojoBg }]}>
          <View style={[mc.dot, { backgroundColor: tempOk ? T.verde : T.rojo }]} />
          <Text style={[mc.statusTxt, { color: tempOk ? T.verde : T.rojo }]}>
            {tempOk ? "Dentro de su patrón" : "Temperatura elevada"}
          </Text>
        </View>
        <Text style={[mc.delta, { color: T.txtTer }]}>{Number(tempDelta) >= 0 ? "+" : ""}{tempDelta} °C vs. promedio</Text>
        <Spark data={m.tempHist.filter((_, i) => i % 1 === 0)} color={T.rojo} w={120} h={40} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={[mc.axisLabel, { color: T.txtTer }]}>00:00</Text>
          <Text style={[mc.axisLabel, { color: T.txtTer }]}>12:00</Text>
          <Text style={[mc.axisLabel, { color: T.txtTer }]}>24:00</Text>
        </View>
      </View>

      {/* Actividad */}
      <View style={[mc.card, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={mc.cardHeader}>
          <View style={[mc.iconCircle, { backgroundColor: T.verdeAlfa }]}>
            <Activity size={16} color={T.verde} strokeWidth={1.8} />
          </View>
          <Text style={[mc.cardTitle, { color: T.txtTer }]}>ACTIVIDAD</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Text style={[mc.bigValue, { color: T.txtMain }]}>{m.actActual}%</Text>
          <RingGauge value={m.actActual} color={actOk ? T.verde : T.naranja} T={T} />
        </View>
        <View style={[mc.statusBadge, { backgroundColor: actOk ? T.verdeAlfa : T.naranjaBg }]}>
          <View style={[mc.dot, { backgroundColor: actOk ? T.verde : T.naranja }]} />
          <Text style={[mc.statusTxt, { color: actOk ? T.verde : T.naranja }]}>
            {actOk ? "Normal" : "Baja"}
          </Text>
        </View>
        <Text style={[mc.delta, { color: T.txtTer }]}>{actDelta >= 0 ? "+" : ""}{actDelta}% vs. promedio</Text>
        <View style={{ gap: 5, marginTop: 8 }}>
          {[
            { label: "Movimiento", ok: !m.posibleLesion },
            { label: "Reposo",     ok: m.tiempoQuietoPct < 60 },
            { label: "Inactividad prolongada", ok: m.tiempoQuietoPct < 70, invert: true },
          ].map(({ label, ok, invert }) => (
            <View key={label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[mc.rowLabel, { color: T.txtTer }]}>{label}</Text>
              <Text style={{ fontSize: 11, fontWeight: "700", color: invert ? (ok ? T.verde : T.rojo) : (ok ? T.verde : T.naranja) }}>
                {label === "Inactividad prolongada" ? (ok ? "No" : "Sí") : (ok ? "Normal" : "Reducido")}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Movilidad */}
      <View style={[mc.card, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={mc.cardHeader}>
          <View style={[mc.iconCircle, { backgroundColor: movOk ? T.verdeAlfa : T.naranjaBg }]}>
            <Footprints size={16} color={movOk ? T.verde : T.naranja} strokeWidth={1.8} />
          </View>
          <Text style={[mc.cardTitle, { color: T.txtTer }]}>MOVILIDAD</Text>
        </View>
        <Text style={[mc.bigValue, { color: movOk ? T.verde : T.naranja }]}>
          {movOk ? "Normal" : "Alterada"}
        </Text>
        <View style={[mc.statusBadge, { backgroundColor: movOk ? T.verdeAlfa : T.naranjaBg }]}>
          <View style={[mc.dot, { backgroundColor: movOk ? T.verde : T.naranja }]} />
          <Text style={[mc.statusTxt, { color: movOk ? T.verde : T.naranja }]}>
            {movOk ? "Patrón de movimiento estable." : "Cambio de movilidad detectado."}
          </Text>
        </View>
        <View style={mc.cowSketch}>
          <CowSketch ok={movOk} T={T} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={[mc.rowLabel, { color: T.txtTer }]}>Cambios respecto al promedio</Text>
          <Text style={{ fontSize: 12, fontWeight: "800", color: movOk ? T.verde : T.naranja }}>
            {movOk ? "0%" : `${m.tiempoQuietoPct - 30}%`}
          </Text>
        </View>
      </View>

      {/* Alimentación y Rumia */}
      <View style={[mc.card, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={mc.cardHeader}>
          <View style={[mc.iconCircle, { backgroundColor: "rgba(245,158,11,0.12)" }]}>
            <Utensils size={16} color="#f59e0b" strokeWidth={1.8} />
          </View>
          <Text style={[mc.cardTitle, { color: T.txtTer }]}>ALIMENTACIÓN Y RUMIA</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          {/* Alimentación */}
          <View style={{ flex: 1 }}>
            <Text style={[mc.subLabel, { color: T.txtSec }]}>Alimentación</Text>
            <Text style={[mc.midValue, { color: alimentOk ? "#f59e0b" : T.naranja }]}>{alimentLabel}</Text>
            <View style={[mc.statusBadge, { backgroundColor: "rgba(245,158,11,0.12)", alignSelf: "flex-start" }]}>
              <View style={[mc.dot, { backgroundColor: "#f59e0b" }]} />
              <Text style={[mc.statusTxt, { color: "#f59e0b" }]}>{m.apetitoHoy} episodios detectados</Text>
            </View>
            <Text style={[mc.delta, { color: T.txtTer }]}>
              {((m.apetitoHoy - m.apetitoNormal) / m.apetitoNormal * 100).toFixed(0)}% vs. promedio
            </Text>
            <Spark data={m.actHist.filter((_, i) => i % 2 === 0)} color="#f59e0b" w={60} h={36} />
          </View>
          {/* Rumia */}
          <View style={{ flex: 1 }}>
            <Text style={[mc.subLabel, { color: T.txtSec }]}>Rumia</Text>
            <Text style={[mc.midValue, { color: "#f59e0b" }]}>{m.rumiaHorasEst} h</Text>
            <View style={[mc.statusBadge, { backgroundColor: "rgba(245,158,11,0.12)", alignSelf: "flex-start" }]}>
              <View style={[mc.dot, { backgroundColor: "#f59e0b" }]} />
              <Text style={[mc.statusTxt, { color: "#f59e0b" }]}>Tiempo estimado</Text>
            </View>
            <Text style={[mc.delta, { color: T.txtTer }]}>+0.3 h vs. promedio</Text>
            <Spark data={m.rumiaHist.filter((_, i) => i % 2 === 0)} color="#f59e0b" w={60} h={36} />
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={[mc.axisLabel, { color: T.txtTer }]}>0h</Text>
          <Text style={[mc.axisLabel, { color: T.txtTer }]}>5h</Text>
          <Text style={[mc.axisLabel, { color: T.txtTer }]}>10h</Text>
        </View>
      </View>
    </View>
  );
}
const mc = StyleSheet.create({
  row:        { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card:       { flex: 1, minWidth: 200, borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  iconCircle: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle:  { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, flex: 1, flexWrap: "wrap" },
  bigValue:   { fontSize: 28, fontWeight: "900", lineHeight: 32 },
  midValue:   { fontSize: 22, fontWeight: "900" },
  subLabel:   { fontSize: 10, fontWeight: "600", marginBottom: 2 },
  statusBadge:{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusTxt:  { fontSize: 10, fontWeight: "700" },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  delta:      { fontSize: 10, marginTop: 2 },
  rowLabel:   { fontSize: 10.5 },
  axisLabel:  { fontSize: 9 },
  cowSketch:  { alignItems: "center", marginVertical: 4 },
});

// ─── Ring gauge (actividad) ───────────────────────────────────────────────────
function RingGauge({ value, color, T }: { value: number; color: string; T: ReturnType<typeof useT> }) {
  const R = 22; const stroke = 5;
  const circ = 2 * Math.PI * R;
  const filled = (value / 100) * circ;
  const pts = `${35},${35 - R} A ${R} ${R} 0 ${value > 50 ? 1 : 0} 1 ${(35 + R * Math.sin((value / 100) * 2 * Math.PI)).toFixed(2)},${(35 - R * Math.cos((value / 100) * 2 * Math.PI)).toFixed(2)}`;
  return (
    <Svg width={70} height={70} viewBox="0 0 70 70">
      <SvgCircle cx={35} cy={35} r={R} fill="none" stroke={color + "25"} strokeWidth={stroke} />
      <SvgCircle cx={35} cy={35} r={R} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled.toFixed(2)} ${(circ - filled).toFixed(2)}`}
        strokeLinecap="round"
        transform="rotate(-90 35 35)" />
    </Svg>
  );
}

// ─── Cow sketch (movilidad) ───────────────────────────────────────────────────
function CowSketch({ ok, T }: { ok: boolean; T: ReturnType<typeof useT> }) {
  return (
    <Image
      source={require("../../assets/movilidad.png")}
      style={{ width: 180, height: 140, opacity: ok ? 1 : 0.65 }}
      resizeMode="contain"
    />
  );
}

// ─── Gráfica comportamiento 24h + Recomendación IA ───────────────────────────
function BehaviorChartSection({ m, T }: { m: MetricaAnimal; T: ReturnType<typeof useT> }) {
  const color = diagColor(m.diag, T);
  const recoIcon = m.diag === "sano" ? CheckCircle2 : AlertTriangle;
  const RecoIcon = recoIcon;
  const recoTitle = m.diag === "sano" ? "Sin acciones\nnecesarias." : m.diag === "atencion" ? "Requiere\nobservación." : "Intervención\ninmediata.";
  const recoSub = m.diag === "sano" ? "Continuar monitoreo." : m.recomendacion;

  return (
    <View style={bh.row}>
      {/* Chart */}
      <View style={[bh.chartCard, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <View style={[bh.iconCircle, { backgroundColor: T.verdeAlfa }]}>
            <TrendingUp size={16} color={T.verde} strokeWidth={2} />
          </View>
          <Text style={[bh.title, { color: T.txtTer }]}>COMPORTAMIENTO — ÚLTIMAS 24 HORAS</Text>
        </View>
        {/* Legend */}
        <View style={{ flexDirection: "row", gap: 14, marginBottom: 8 }}>
          {[
            { color: T.verde,    label: "Actividad (%)" },
            { color: T.rojo,     label: "Temperatura (°C)" },
            { color: "#f59e0b",  label: "Rumia (h)" },
          ].map(({ color: c, label }) => (
            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 20, height: 2.5, backgroundColor: c, borderRadius: 2 }} />
              <Text style={[bh.legendTxt, { color: T.txtSec }]}>{label}</Text>
            </View>
          ))}
        </View>
        <MultiLineChart actHist={m.actHist} tempHist={m.tempHist} rumiaHist={m.rumiaHist} T={T} />
      </View>

      {/* Recomendación IA */}
      <View style={[bh.recoCard, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={[bh.recoIconWrap, { backgroundColor: "rgba(96,165,250,0.12)" }]}>
          <Brain size={28} color="#60a5fa" strokeWidth={1.6} />
        </View>
        <Text style={[bh.recoLabel, { color: T.txtTer }]}>RECOMENDACIÓN IA</Text>
        <Text style={[bh.recoTitle, { color: T.txtMain }]}>{recoTitle}</Text>
        <Text style={[bh.recoSub, { color: T.txtSec }]}>{recoSub}</Text>
        <View style={[bh.shieldWrap, { backgroundColor: color + "15" }]}>
          <RecoIcon size={40} color={color} strokeWidth={1.4} />
        </View>
      </View>
    </View>
  );
}
const bh = StyleSheet.create({
  row:        { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  chartCard:  { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14 },
  iconCircle: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  legendTxt:  { fontSize: 9.5 },
  recoCard:   { width: 180, borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center", gap: 8 },
  recoIconWrap:{ width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  recoLabel:  { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, textAlign: "center" },
  recoTitle:  { fontSize: 18, fontWeight: "900", textAlign: "center", lineHeight: 22 },
  recoSub:    { fontSize: 10.5, textAlign: "center", lineHeight: 15 },
  shieldWrap: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 4 },
});

// ─── Tarjetas inferiores ──────────────────────────────────────────────────────
function BottomCards({ m, T }: { m: MetricaAnimal; T: ReturnType<typeof useT> }) {
  const recovColor = m.diag === "sano" ? T.verde : m.diag === "atencion" ? T.naranja : T.rojo;
  const recovLabel = m.enRecuperacion ? "Recuperando" : m.diag === "sano" ? "Normal" : m.diag === "atencion" ? "Atención" : "Crítico";

  return (
    <View style={bc.row}>
      {/* Patrón post-comida */}
      <View style={[bc.card, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <View style={[bc.iconCircle, { backgroundColor: T.verdeAlfa }]}>
            <Utensils size={16} color={T.verde} strokeWidth={2} />
          </View>
          <View>
            <Text style={[bc.titleSm, { color: T.txtTer }]}>PATRÓN POST-COMIDA</Text>
            <Text style={[bc.timeLabel, { color: T.txtTer }]}>Últimas 24h</Text>
          </View>
        </View>
        <Text style={[bc.body, { color: T.txtSec }]}>
          {m.anomaliaPostComida
            ? `Temperatura sube +${m.tempPostComidaDelta.toFixed(2)}°C y no baja al punto base. Posible proceso inflamatorio.`
            : "Comportamiento normal detectado. Recuperación adecuada después de la alimentación."}
        </Text>
      </View>

      {/* Recuperación */}
      <View style={[bc.card, { backgroundColor: T.card, borderColor: T.borde }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <View style={[bc.iconCircle, { backgroundColor: T.verdeAlfa }]}>
            <CheckCircle2 size={16} color={T.verde} strokeWidth={2} />
          </View>
          <View>
            <Text style={[bc.titleSm, { color: T.txtTer }]}>RECUPERACIÓN</Text>
            <Text style={[bc.timeLabel, { color: T.txtTer }]}>Estado actual</Text>
          </View>
        </View>
        <Text style={[bc.bigStatus, { color: recovColor }]}>{recovLabel}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
          <CheckCircle2 size={14} color={recovColor} strokeWidth={2} />
          <Text style={[bc.body, { color: T.txtTer }]}>
            {m.diag === "sano" ? "Sin signos de alerta temprana." : m.recomendacion}
          </Text>
        </View>
      </View>
    </View>
  );
}
const bc = StyleSheet.create({
  row:        { flexDirection: "row", gap: 10 },
  card:       { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14 },
  iconCircle: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  titleSm:    { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  timeLabel:  { fontSize: 9.5, marginTop: 1 },
  body:       { fontSize: 11, lineHeight: 16 },
  bigStatus:  { fontSize: 22, fontWeight: "900" },
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

  const sanos    = metricas.filter((m) => m.diag === "sano").length;
  const atencion = metricas.filter((m) => m.diag === "atencion").length;
  const criticos = metricas.filter((m) => m.diag === "critico").length;
  const avgIdx   = Math.round(metricas.reduce((s, m) => s + m.indice, 0) / metricas.length);
  const avgTemp  = (metricas.reduce((s, m) => s + m.tempActual, 0) / metricas.length).toFixed(1);

  const topRight = (
    <TouchableOpacity onPress={refrescar} activeOpacity={0.75}
      style={[st.refreshBtn, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
      <RefreshCw size={12} color={cargando ? T.verde : T.txtMain} strokeWidth={2} />
      <Text style={[st.refreshTxt, { color: T.txtMain }]}>
        {cargando ? "Analizando…" : "Actualizar"}
      </Text>
    </TouchableOpacity>
  );

  // ── Filter tab helper ──
  const FILTROS: { key: DiagIA | "todos"; label: string; Icon: React.ComponentType<any>; color: (a: boolean) => string; bg: (a: boolean) => string }[] = [
    {
      key: "todos",
      label: "Todos",
      Icon: Activity,
      color: (a) => a ? T.verde : T.txtTer,
      bg:    (a) => a ? T.verdeAlfa : "transparent",
    },
    {
      key: "sano",
      label: "Sanos",
      Icon: Heart,
      color: (a) => a ? T.verde : T.txtTer,
      bg:    (a) => a ? T.verdeAlfa : "transparent",
    },
    {
      key: "atencion",
      label: "Atención",
      Icon: Bell,
      color: (a) => a ? T.naranja : T.txtTer,
      bg:    (a) => a ? T.naranjaBg : "transparent",
    },
    {
      key: "critico",
      label: "Críticos",
      Icon: AlertTriangle,
      color: (a) => a ? T.rojo : T.txtTer,
      bg:    (a) => a ? T.rojoBg : "transparent",
    },
  ];

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

          {/* ── Columna izquierda: lista de animales ── */}
          {!isSm && (
            <View style={[st.leftCol, { backgroundColor: T.card, borderRightColor: T.borde }]}>

              {/* Header lista */}
              <View style={[st.listHeader, { borderBottomColor: T.borde }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Plus size={13} color={T.verde} strokeWidth={2.5} />
                  <Text style={[st.listTitle, { color: T.txtMain }]}>Animales monitoreados</Text>
                </View>
                <View style={[st.countBadge, { backgroundColor: T.verdeAlfa }]}>
                  <Text style={[st.countTxt, { color: T.verde }]}>{metricas.length}</Text>
                </View>
              </View>

              {/* Tabs filtro */}
              <View style={[st.filterRow, { borderBottomColor: T.borde }]}>
                {FILTROS.map(({ key, label, Icon, color, bg }) => {
                  const active = filtro === key;
                  return (
                    <TouchableOpacity key={key} onPress={() => setFiltro(key)} activeOpacity={0.75}
                      style={[st.pill, { backgroundColor: bg(active) }]}>
                      <Icon size={11} color={color(active)} strokeWidth={2} />
                      <Text style={[st.pillTxt, { color: color(active) }]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Lista */}
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {lista.map((m) => (
                  <AnimalRow key={m.id} m={m} active={m.id === selId}
                    onPress={() => setSelId(m.id)} T={T} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Panel derecho: dashboard ── */}
          <ScrollView style={st.rightCol} contentContainerStyle={st.rightContent}
            showsVerticalScrollIndicator={false}>

            {/* Mobile selector */}
            {isSm && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 6 }}>
                {metricas.map((m) => {
                  const c = diagColor(m.diag, T);
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

            {/* 1. Fila de estadísticas globales */}
            <View style={st.statsRow}>
              <StatTile T={T} icon={Heart}         value={sanos}        label="Sanos"         color={T.verde}  bg={T.verdeAlfa}    />
              <StatTile T={T} icon={AlertTriangle}  value={atencion}     label="Atención"      color={T.naranja} bg={T.naranjaBg}   />
              <StatTile T={T} icon={HeartPulse}     value={criticos}     label="Críticos"      color={T.rojo}   bg={T.rojoBg}       />
              <StatTile T={T} icon={TrendingUp}     value={avgIdx}       label="Índice medio"  color={avgIdx >= 65 ? T.verde : T.naranja} bg={avgIdx >= 65 ? T.verdeAlfa : T.naranjaBg} />
              <StatTile T={T} icon={ThermometerSun} value={`${avgTemp}°`} label="Media de temp." color={T.rojo} bg={T.rojoBg} />
            </View>

            {/* 2. Estado General IA — banner individual */}
            <EstadoGeneralBanner m={animal} T={T} />

            {/* 3. 4 tarjetas métricas: Temp · Actividad · Movilidad · Alimentación/Rumia */}
            <MetricCards m={animal} T={T} />

            {/* 4. Motor IA */}
            <MotorIACard T={T} />

            {/* 5. Grid 2×2 escenarios del animal seleccionado */}
            <ScenarioGrid m={animal} T={T} />

            {/* 6. Gráfica comportamiento 24h + Recomendación IA */}
            <BehaviorChartSection m={animal} T={T} />

            {/* 7. Fila inferior */}
            <BottomCards m={animal} T={T} />

          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root:         { flex: 1, flexDirection: "row" },
  main:         { flex: 1, flexDirection: "column" },
  body:         { flex: 1, flexDirection: "row", overflow: "hidden" },

  // Left column
  leftCol:      { width: 300, flexDirection: "column", borderRightWidth: 1 },
  listHeader:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  listTitle:    { fontSize: 12, fontWeight: "700" },
  countBadge:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  countTxt:     { fontSize: 11, fontWeight: "800" },
  filterRow:    { flexDirection: "row", gap: 4, padding: 8, borderBottomWidth: 1 },
  pill:         { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  pillTxt:      { fontSize: 10.5, fontWeight: "700" },

  // Right column
  rightCol:     { flex: 1 },
  rightContent: { padding: 16, gap: 12, paddingBottom: 32 },

  // Stats row
  statsRow:     { flexDirection: "row", gap: 8 },

  // Refresh button
  refreshBtn:   { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  refreshTxt:   { fontSize: 11, fontWeight: "600" },

  // Mobile pills
  smPill:       { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999, borderWidth: 1.5 },
  smPillTxt:    { fontSize: 10.5, fontWeight: "700" },
});
