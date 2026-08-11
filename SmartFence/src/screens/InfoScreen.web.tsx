import React from "react";
import {
  View, Text, ScrollView, Image,
  StyleSheet, useWindowDimensions,
} from "react-native";
import {
  ShieldCheck, Wifi, BatteryCharging, Bell,
  MapPin, LayoutGrid, Cpu, Radio, Smartphone, Clock, ChevronRight,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { useT } from "@context/ThemeContext";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";

function LoRaIcon({ size = 22, color = "#76C043" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
        fill="none" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

const MORADO    = "#A78BFA";
const MORADO_BG = "rgba(167,139,250,0.14)";

/* ─── Mini stats bar (reutilizado en hero) ──────────────────────────────────── */
function MiniStatsBar({ T, borderless }: { T: ReturnType<typeof useT>; borderless?: boolean }) {
  const items = [
    { Icon: LoRaIcon,        label: "LoRaWAN",     sub: "de largo alcance" },
    { Icon: BatteryCharging, label: "Bajo consumo", sub: "de energía" },
    { Icon: Bell,            label: "Alertas",     sub: "instantáneas" },
  ];
  return (
    <View style={[
      ms.bar,
      { backgroundColor: T.cardElevada, borderColor: T.borde },
      borderless && ms.barBorderless,
    ]}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <View style={[ms.sep, { backgroundColor: T.borde }]} />}
          <View style={ms.item}>
            <item.Icon size={borderless ? 14 : 16} color={T.verde} strokeWidth={1.8} />
            <View>
              <Text style={[ms.label, { color: T.txtMain }, borderless && { fontSize: 9.5 }]}>
                {item.label}
              </Text>
              <Text style={[ms.sub, { color: T.txtTer }, borderless && { fontSize: 8.5 }]}>
                {item.sub}
              </Text>
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}
const ms = StyleSheet.create({
  bar: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
    paddingVertical: 9, paddingHorizontal: 6,
  },
  barBorderless: {
    borderRadius: 0, borderWidth: 0, borderTopWidth: 1,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  item:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 7, justifyContent: "center" },
  sep:   { width: 1, height: 28, marginHorizontal: 2 },
  label: { fontSize: 11, fontWeight: "700" },
  sub:   { fontSize: 9.5, marginTop: 1 },
});

/* ─── InfoScreen ────────────────────────────────────────────────────────────── */
export default function InfoScreen() {
  const T = useT();
  const { width } = useWindowDimensions();
  const isMobile  = width < 640;
  const isTablet  = width >= 640 && width < 1000;
  const isDesktop = width >= 1000;

  /* Hero row height (the image+text zone; stats bar adds extra on mobile) */
  const heroRowH = isDesktop ? 370 : isTablet ? 290 : 220;

  const PASOS = [
    { num: 1, Icon: Cpu,        txt: "El collar GPS LoRa obtiene la ubicación del animal." },
    { num: 2, Icon: LoRaIcon,   txt: "Envía los datos al gateway LoRa instalado en la finca." },
    { num: 3, Icon: Wifi,       txt: "El gateway sincroniza la información con la nube." },
    { num: 4, Icon: Smartphone, txt: "La app muestra la ubicación y envía alertas en tiempo real." },
  ];

  const FEATURES = [
    { Icon: MapPin,          label: "Monitoreo GPS\nen tiempo real\nde todo el ganado",           color: T.verde,   bg: T.verdeLuz },
    { Icon: LayoutGrid,      label: "Cercas virtuales\nconfigurables\npor finca",                 color: T.azul,    bg: T.azulBg },
    { Icon: Bell,            label: "Alertas instantáneas\ncuando un animal\nsale del perímetro", color: T.naranja, bg: T.naranjaBg },
    { Icon: BatteryCharging, label: "Panel de batería\ny señal de\ncada collar",                  color: MORADO,    bg: MORADO_BG },
    { Icon: Clock,           label: "Historial de movimiento\ny trazabilidad\ncompleta",          color: T.verde,   bg: T.verdeLuz },
  ];

  const DEVICES = [
    { Icon: Cpu,        color: T.verde, bg: T.verdeLuz, nombre: "Collar GPS LoRa",  desc: "Collar ESP32 con módulo GPS NEO-6M y transceptor LoRa. Transmite posición cada 4 segundos al gateway con autonomía de hasta 72 horas." },
    { Icon: Radio,      color: T.azul,  bg: T.azulBg,   nombre: "Gateway LoRa",     desc: "Concentrador LoRaWAN instalado en la finca. Recibe las tramas de todos los collares y las reenvía al servidor mediante WiFi o datos móviles." },
    { Icon: Smartphone, color: MORADO,  bg: MORADO_BG,  nombre: "App Móvil",        desc: "Aplicación en React Native/Expo disponible para Android e iOS. Visualiza el ganado en mapa, recibe alertas y consulta reportes." },
  ];

  /* Feature item width: 3 cols desktop, 3 cols on tablet (más compacto), 1/5 en mobile */
  const featW = isMobile ? "18%" : "30%" as any;

  return (
    <View style={[s.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Info" />

      <View style={s.main}>
        <WebTopBar
          titulo="Información"
          sub="Conoce más sobre SmartFence AI y cómo funciona nuestra tecnología."
        />

        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.content, isMobile && { padding: 12, paddingBottom: 60 }]}
          showsVerticalScrollIndicator={false}
        >

          {/* ══════════════════════════════ HERO ══════════════════════════════ */}
          <View style={[s.heroCard, { backgroundColor: T.card, borderColor: T.borde }]}>

            {/* Fila superior: texto ← | imagen → */}
            <View style={{ flexDirection: "row", height: heroRowH }}>

              {/* Columna texto */}
              <View style={[
                s.heroLeft,
                isMobile && s.heroLeftSm,
                { flex: isMobile ? 0.58 : isTablet ? 0.55 : 0.52 },
              ]}>
                {/* Eyebrow */}
                <View style={s.eyebrowRow}>
                  <View style={[s.eyebrowBox, { backgroundColor: T.verdeAlfa }]}>
                    <ShieldCheck size={12} color={T.verde} strokeWidth={2.5} />
                  </View>
                  <Text style={[s.eyebrow, { color: T.txtSec }]}>¿Qué es</Text>
                </View>

                {/* Título */}
                <Text style={[
                  s.heroTitle,
                  { color: T.txtMain },
                  isDesktop && { fontSize: 28, lineHeight: 36 },
                  isTablet  && { fontSize: 22, lineHeight: 30 },
                  isMobile  && { fontSize: 17, lineHeight: 24 },
                ]}>
                  {"¿Qué es\n"}
                  <Text style={{ color: T.verde }}>SmartFence AI?</Text>
                </Text>

                {/* Descripción */}
                <Text style={[
                  s.heroDesc, { color: T.txtSec },
                  isMobile && { fontSize: 11, lineHeight: 15 },
                ]}>
                  SmartFence AI es una plataforma de monitoreo ganadero inteligente que combina{" "}
                  <Text style={{ fontWeight: "700", color: T.txtMain }}>
                    collares GPS LoRa, cercas virtuales y alertas
                  </Text>
                  {" "}en tiempo real para que el ganadero siempre sepa dónde está cada animal.
                </Text>

                {/* Badge */}
                <View style={[s.heroBadge, { backgroundColor: T.verdeAlfa }]}>
                  <ShieldCheck size={10} color={T.verde} strokeWidth={2.2} />
                  <Text style={[s.heroBadgeTxt, { color: T.verdeBrillo }]}>
                    Tecnología que cuida tu ganado
                  </Text>
                </View>

                {/* Mini stats — solo en desktop/tablet (dentro de la columna) */}
                {!isMobile && <MiniStatsBar T={T} />}
              </View>

              {/* Columna imagen */}
              <View style={[
                s.heroRight,
                { backgroundColor: T.verdeLuz },
                { flex: isMobile ? 0.42 : isTablet ? 0.45 : 0.48 },
              ]}>
                {/* Blob decorativo */}
                <View
                  style={[s.blob, { backgroundColor: T.verde }]}
                  pointerEvents="none"
                />
                <Image
                  source={require("../../assets/vaca informa.png")}
                  style={s.heroImg}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Mini stats — solo en mobile (ancho completo en base de la card) */}
            {isMobile && <MiniStatsBar T={T} borderless />}
          </View>

          {/* ══════ CÓMO FUNCIONA  +  CARACTERÍSTICAS (lado a lado en desktop) ══════ */}
          <View style={[s.midRow, (isTablet || isMobile) && { flexDirection: "column" }]}>

            {/* ¿Cómo funciona? */}
            <View style={[s.secCard, s.midLeft, { backgroundColor: T.card, borderColor: T.borde }]}>
              <Text style={[s.secTitle, { color: T.txtMain }]}>¿Cómo funciona?</Text>
              <View style={s.stepsRow}>
                {PASOS.map((p, i) => (
                  <React.Fragment key={i}>
                    <View style={s.step}>
                      <View style={[s.stepBubble, { backgroundColor: T.verdeAlfa, borderColor: T.borde }]}>
                        <p.Icon
                          size={isDesktop ? 28 : isMobile ? 20 : 24}
                          color={T.verde}
                          strokeWidth={1.6}
                        />
                        <View style={[s.stepBadge, { backgroundColor: T.verdeOscuro, borderColor: T.card }]}>
                          <Text style={s.stepBadgeTxt}>{p.num}</Text>
                        </View>
                      </View>
                      <Text style={[s.stepTxt, { color: T.txtSec }, isMobile && { fontSize: 10 }]}>
                        {p.txt}
                      </Text>
                    </View>
                    {i < 3 && (
                      <View style={s.stepArrowWrap}>
                        <Text style={[s.stepArrow, { color: T.txtTer }]}>→</Text>
                      </View>
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Características clave */}
            <View style={[s.secCard, s.midRight, { backgroundColor: T.card, borderColor: T.borde }]}>
              <Text style={[s.secTitle, { color: T.txtMain }]}>Características clave</Text>
              <View style={s.featGrid}>
                {FEATURES.map((f, i) => (
                  <View key={i} style={[s.featItem, { width: featW }]}>
                    <View style={[s.featIcon, { backgroundColor: f.bg }, isMobile && { width: 44, height: 44, borderRadius: 14 }]}>
                      <f.Icon size={isMobile ? 19 : 22} color={f.color} strokeWidth={1.6} />
                    </View>
                    <Text style={[s.featLabel, { color: T.txtSec }, isMobile && { fontSize: 9.5 }]}>
                      {f.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ══════════════════════ NUESTROS DISPOSITIVOS ══════════════════════ */}
          <View style={[s.secCard, { backgroundColor: T.card, borderColor: T.borde }]}>
            <Text style={[s.secTitle, { color: T.txtMain }]}>Nuestros dispositivos</Text>

            <View style={[s.devRow, isMobile && { flexDirection: "column" }]}>
              {DEVICES.map((d, i) => (
                <View
                  key={i}
                  style={[
                    s.devCard,
                    { backgroundColor: T.cardElevada, borderColor: T.borde },
                    !isMobile && { flex: 1 },
                  ]}
                >
                  {/* Área imagen */}
                  <View style={[s.devImgArea, { backgroundColor: T.fondo, borderColor: T.borde }]}>
                    <View style={[s.devIconWrap, { backgroundColor: d.bg }]}>
                      <d.Icon size={28} color={d.color} strokeWidth={1.4} />
                    </View>
                  </View>

                  {/* Contenido */}
                  <View style={s.devInfo}>
                    <View style={s.devNameRow}>
                      <View style={[s.devIconSm, { backgroundColor: d.bg }]}>
                        <d.Icon size={11} color={d.color} strokeWidth={2} />
                      </View>
                      <Text style={[s.devName, { color: T.txtMain }]}>{d.nombre}</Text>
                    </View>
                    <Text style={[s.devDesc, { color: T.txtSec }]} numberOfLines={4}>
                      {d.desc}
                    </Text>
                  </View>

                  {/* Chevron */}
                  <ChevronRight size={16} color={T.txtTer} strokeWidth={1.8} />
                </View>
              ))}
            </View>
          </View>

          <Text style={[s.footer, { color: T.txtTer }]}>SmartFence AI • v1.0 MVP © 2024</Text>
        </ScrollView>
      </View>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root:    { flex: 1, flexDirection: "row" },
  main:    { flex: 1, flexDirection: "column", overflow: "hidden" },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 80, gap: 16 },

  /* ── Hero ─────────────────────────────────────────────────────────────────── */
  heroCard: {
    borderRadius: 22, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
  },

  heroLeft: {
    paddingVertical: 28, paddingLeft: 28, paddingRight: 18,
    gap: 12, justifyContent: "center",
  },
  heroLeftSm: {
    paddingVertical: 16, paddingLeft: 16, paddingRight: 10, gap: 9,
  },

  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  eyebrowBox: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  eyebrow:    { fontSize: 13, fontWeight: "500" },

  heroTitle: { fontWeight: "900", letterSpacing: -0.4 },
  heroDesc:  { fontSize: 13, lineHeight: 20 },

  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start", borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  heroBadgeTxt: { fontSize: 10.5, fontWeight: "700" },

  heroRight: { overflow: "hidden" },
  blob: {
    position: "absolute", width: 280, height: 280, borderRadius: 140,
    bottom: -60, right: -40, opacity: 0.22,
  } as any,
  heroImg: { width: "100%", height: "100%" },

  /* ── Mid row ──────────────────────────────────────────────────────────────── */
  midRow:  { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  midLeft: { flex: 1.5 },
  midRight:{ flex: 1 },

  /* ── Section cards ────────────────────────────────────────────────────────── */
  secCard: {
    borderRadius: 20, borderWidth: 1, padding: 20, gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  secTitle: { fontSize: 16, fontWeight: "900", letterSpacing: -0.2 },

  /* ── Steps ────────────────────────────────────────────────────────────────── */
  stepsRow: { flexDirection: "row", alignItems: "flex-start" },

  step: { flex: 1, alignItems: "center", gap: 10 },

  stepBubble: {
    width: 66, height: 66, borderRadius: 22, borderWidth: 1,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  stepBadge: {
    position: "absolute", bottom: -6, right: -6,
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  stepBadgeTxt:  { fontSize: 9, fontWeight: "900", color: "#fff" },
  stepTxt:       { fontSize: 11, textAlign: "center", lineHeight: 16, maxWidth: 115 },
  stepArrowWrap: { paddingTop: 20, paddingHorizontal: 2 },
  stepArrow:     { fontSize: 16 },

  /* ── Features ─────────────────────────────────────────────────────────────── */
  featGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  featItem:  { alignItems: "center", gap: 7 },
  featIcon:  { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  featLabel: { fontSize: 10.5, textAlign: "center", lineHeight: 15 },

  /* ── Devices ──────────────────────────────────────────────────────────────── */
  devRow: { flexDirection: "row", gap: 12 },
  devCard: {
    borderRadius: 16, borderWidth: 1, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 5, elevation: 1,
  },
  devImgArea: {
    width: 88, height: 88, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  devIconWrap: { width: 54, height: 54, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  devInfo:     { flex: 1, gap: 5 },
  devNameRow:  { flexDirection: "row", alignItems: "center", gap: 6 },
  devIconSm:   { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  devName:     { fontSize: 14, fontWeight: "800" },
  devDesc:     { fontSize: 11.5, lineHeight: 17 },

  footer: { textAlign: "center", fontSize: 11.5, paddingTop: 4, paddingBottom: 4 },
});
