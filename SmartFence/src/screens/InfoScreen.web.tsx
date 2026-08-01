import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, useWindowDimensions,
} from "react-native";
import {
  ShieldCheck, Wifi, BatteryCharging,
  Bell, MapPin, LayoutGrid, Cpu, Radio,
  Smartphone, Clock, ChevronRight,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { useAnimals } from "@hooks/useAnimals";
import { useT } from "@context/ThemeContext";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";

const MORADO    = "#A78BFA";
const MORADO_BG = "rgba(167,139,250,0.14)";

// ─── LoRaIcon ─────────────────────────────────────────────────────────────────
function LoRaIcon({ size = 22, color = "#76C043" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
        fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── PasoFlujo ────────────────────────────────────────────────────────────────
function PasoFlujo({
  num, icon: Icon, texto, isLast,
}: {
  num: number; icon: React.ComponentType<any>; texto: string; isLast?: boolean;
}) {
  const T = useT();
  return (
    <View style={pf.wrap}>
      <View style={pf.col}>
        <View style={pf.iconWrap}>
          <View style={[pf.iconBox, { backgroundColor: T.verdeAlfa, borderColor: T.borde }]}>
            <Icon size={26} color={T.verde} strokeWidth={1.6} />
          </View>
          <View style={[pf.badge, { backgroundColor: T.verdeOscuro, borderColor: T.card }]}>
            <Text style={pf.badgeTxt}>{num}</Text>
          </View>
        </View>
        <Text style={[pf.txt, { color: T.txtSec }]}>{texto}</Text>
      </View>
      {!isLast && (
        <View style={pf.arrow}>
          <Text style={[pf.arrowTxt, { color: T.borde }]}>›</Text>
        </View>
      )}
    </View>
  );
}
const pf = StyleSheet.create({
  wrap:    { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  col:     { alignItems: "center", flex: 1, gap: 10 },
  iconWrap:{ position: "relative" },
  iconBox: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  badge: {
    position: "absolute", bottom: -5, right: -5,
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },
  badgeTxt: { fontSize: 10, fontWeight: "900", color: "#fff" },
  txt:  { fontSize: 11, textAlign: "center", lineHeight: 16, maxWidth: 120 },
  arrow:    { paddingTop: 20, paddingHorizontal: 4 },
  arrowTxt: { fontSize: 22, fontWeight: "300" },
});

// ─── CaracteristicaItem ───────────────────────────────────────────────────────
function CaracteristicaItem({
  icon: Icon, texto, color, bg,
}: {
  icon: React.ComponentType<any>; texto: string; color: string; bg: string;
}) {
  const T = useT();
  return (
    <View style={ci.item}>
      <View style={[ci.iconBox, { backgroundColor: bg }]}>
        <Icon size={24} color={color} strokeWidth={1.6} />
      </View>
      <Text style={[ci.txt, { color: T.txtSec }]}>{texto}</Text>
    </View>
  );
}
const ci = StyleSheet.create({
  item:   { alignItems: "center", flex: 1, gap: 8, minWidth: 80 },
  iconBox:{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  txt:    { fontSize: 10.5, textAlign: "center", lineHeight: 15 },
});

// ─── DispositivoRow ───────────────────────────────────────────────────────────
function DispositivoRow({
  icon: Icon, nombre, descripcion, color, bg, imagen,
}: {
  icon: React.ComponentType<any>; nombre: string; descripcion: string;
  color: string; bg: string; imagen?: any;
}) {
  const T = useT();
  return (
    <TouchableOpacity
      style={[dr.row, { backgroundColor: T.card, borderColor: T.borde }]}
      activeOpacity={0.8}
    >
      <View style={[dr.imgBox, { backgroundColor: T.cardElevada }]}>
        {imagen ? (
          <Image source={imagen} style={dr.img} resizeMode="contain" />
        ) : (
          <View style={[dr.placeholder, { backgroundColor: bg }]}>
            <Icon size={32} color={color} strokeWidth={1.6} />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[dr.nombre, { color: T.txtMain }]}>{nombre}</Text>
        <Text style={[dr.desc, { color: T.txtSec }]} numberOfLines={3}>{descripcion}</Text>
      </View>
      <ChevronRight size={16} color={T.txtSec} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}
const dr = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, borderWidth: 1, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  imgBox:     { width: 80, height: 80, borderRadius: 14, overflow: "hidden", flexShrink: 0 },
  img:        { width: 80, height: 80 },
  placeholder:{ width: 80, height: 80, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  nombre:     { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  desc:       { fontSize: 12, lineHeight: 17 },
});

// ─── InfoScreen ───────────────────────────────────────────────────────────────
export default function InfoScreen() {
  const T = useT();
  const { conectado } = useAnimals();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Info" />

      <View style={st.main}>
        <WebTopBar
          titulo="Información"
          sub="Conoce más sobre SmartFence AI y cómo funciona nuestra tecnología."
          conectado={conectado}
        />

        <ScrollView
          style={st.scroll}
          contentContainerStyle={st.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── HERO CARD ── */}
          <View style={[st.heroCard, !isDesktop && { flexDirection: "column" }, { backgroundColor: T.card, borderColor: T.borde }]}>
            {/* Columna izquierda */}
            <View style={st.heroLeft}>
              <View style={st.heroIconRow}>
                <View style={[st.heroIconBox, { backgroundColor: T.verdeAlfa }]}>
                  <ShieldCheck size={16} color={T.verde} strokeWidth={2} />
                </View>
                <Text style={[st.heroTitleSm, { color: T.txtSec }]}>¿Qué es</Text>
              </View>
              <Text style={[st.heroTitle, { color: T.txtMain }]}>
                SmartFence{"\n"}<Text style={{ color: T.verde }}>AI?</Text>
              </Text>
              <Text style={[st.heroDesc, { color: T.txtSec }]}>
                SmartFence AI es una plataforma de monitoreo ganadero inteligente que combina{" "}
                <Text style={[st.heroDescBold, { color: T.txtMain }]}>
                  collares GPS LoRa, cercas virtuales y alertas
                </Text>
                {" "}en tiempo real para que el ganadero siempre sepa dónde está cada animal.
              </Text>
              <View style={[st.heroBadge, { backgroundColor: T.verdeAlfa }]}>
                <ShieldCheck size={11} color={T.verde} strokeWidth={2} />
                <Text style={[st.heroBadgeTxt, { color: T.verdeBrillo }]}>Tecnología que cuida tu ganado</Text>
              </View>
              <View style={[st.heroMiniStats, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                <View style={st.heroMiniItem}>
                  <LoRaIcon size={14} color={T.verde} />
                  <Text style={[st.heroMiniTxt, { color: T.txtSec }]}>LoRaWAN{"\n"}de largo alcance</Text>
                </View>
                <View style={[st.heroMiniSep, { backgroundColor: T.borde }]} />
                <View style={st.heroMiniItem}>
                  <BatteryCharging size={14} color={T.verde} />
                  <Text style={[st.heroMiniTxt, { color: T.txtSec }]}>Bajo consumo{"\n"}de energía</Text>
                </View>
                <View style={[st.heroMiniSep, { backgroundColor: T.borde }]} />
                <View style={st.heroMiniItem}>
                  <Bell size={14} color={T.verde} />
                  <Text style={[st.heroMiniTxt, { color: T.txtSec }]}>Alertas{"\n"}instantáneas</Text>
                </View>
              </View>
            </View>
            {/* Columna derecha — imagen */}
            <View style={[st.heroRight, !isDesktop && { width: "100%", minWidth: 0, height: 180 }]}>
              <Image
                source={require("../../assets/Vaca.png")}
                style={st.heroImg}
                resizeMode="cover"
              />
              <View style={[st.heroCurve, { backgroundColor: T.card }]} />
            </View>
          </View>

          {/* ── Fila ¿Cómo funciona? + Características ── */}
          <View style={[st.midRow, !isDesktop && { flexDirection: "column" }]}>

            {/* ¿Cómo funciona? */}
            <View style={[st.seccion, st.midLeft, { backgroundColor: T.card, borderColor: T.borde }]}>
              <Text style={[st.seccionTitulo, { color: T.txtMain }]}>¿Cómo funciona?</Text>
              <View style={[st.flujoRow, !isDesktop && { flexWrap: "wrap" }]}>
                <PasoFlujo num={1} icon={Cpu}        texto="El collar GPS LoRa obtiene la ubicación del animal." />
                <PasoFlujo num={2} icon={LoRaIcon}   texto="Envía los datos al gateway LoRa instalado en la finca." />
                <PasoFlujo num={3} icon={Wifi}       texto="El gateway sincroniza la información con la nube." />
                <PasoFlujo num={4} icon={Smartphone} texto="La app muestra la ubicación y envía alertas en tiempo real." isLast />
              </View>
            </View>

            {/* Características clave */}
            <View style={[st.seccion, st.midRight, { backgroundColor: T.card, borderColor: T.borde }]}>
              <Text style={[st.seccionTitulo, { color: T.txtMain }]}>Características clave</Text>
              <View style={st.caracteristicasGrid}>
                <CaracteristicaItem icon={MapPin}         texto={"Monitoreo GPS\nen tiempo real\nde todo el ganado"} color={T.verde}   bg={T.verdeLuz}   />
                <CaracteristicaItem icon={LayoutGrid}     texto={"Cercas virtuales\nconfigurables\npor finca"}      color={T.azul}    bg={T.azulBg}     />
                <CaracteristicaItem icon={Bell}           texto={"Alertas instantáneas\ncuando un animal\nsale del perímetro"} color={T.naranja} bg={T.naranjaBg}  />
                <CaracteristicaItem icon={BatteryCharging} texto={"Panel de batería\ny señal de\ncada collar"}      color={MORADO}    bg={MORADO_BG}    />
                <CaracteristicaItem icon={Clock}          texto={"Historial de\nmovimiento y\ntrazabilidad"}        color={T.verde}   bg={T.verdeLuz}   />
              </View>
            </View>
          </View>

          {/* ── Nuestros dispositivos ── */}
          <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
            <Text style={[st.seccionTitulo, { color: T.txtMain }]}>Nuestros dispositivos</Text>
            <View style={[st.dispositivosGrid, !isDesktop && { flexDirection: "column" }]}>
              <View style={st.dispoCol}>
                <DispositivoRow
                  icon={Cpu}
                  nombre="Collar GPS LoRa"
                  descripcion="Collar ESP32 con módulo GPS NEO-6M y transceptor LoRa. Transmite posición cada 4 segundos al gateway con autonomía de hasta 72 horas."
                  color={T.verde}
                  bg={T.verdeLuz}
                />
              </View>
              <View style={st.dispoCol}>
                <DispositivoRow
                  icon={Radio}
                  nombre="Gateway LoRa"
                  descripcion="Concentrador LoRaWAN instalado en la finca. Recibe las tramas de todos los collares y las reenvía al servidor mediante WiFi o datos móviles."
                  color={T.azul}
                  bg={T.azulBg}
                />
              </View>
              <View style={st.dispoCol}>
                <DispositivoRow
                  icon={Smartphone}
                  nombre="App Móvil"
                  descripcion="Aplicación en React Native/Expo disponible para Android e iOS. Visualiza el ganado en mapa, recibe alertas y consulta reportes."
                  color={MORADO}
                  bg={MORADO_BG}
                />
              </View>
            </View>
          </View>

          {/* ── Versión ── */}
          <Text style={[st.footer, { color: T.txtTer }]}>SmartFence AI • v1.0 MVP © 2024</Text>
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

  // Hero
  heroCard: {
    borderRadius: 20, borderWidth: 1,
    overflow: "hidden", flexDirection: "row",
    minHeight: 280,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 14, elevation: 4,
  },
  heroLeft: {
    flex: 1,
    paddingTop: 24, paddingBottom: 20,
    paddingLeft: 24, paddingRight: 16,
    gap: 10, justifyContent: "center",
  },
  heroIconRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  heroIconBox: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  heroTitleSm: { fontSize: 14, fontWeight: "500" },
  heroTitle:   { fontSize: 26, fontWeight: "900", lineHeight: 32 },
  heroDesc:    { fontSize: 13, lineHeight: 19 },
  heroDescBold:{ fontWeight: "800" },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: "flex-start",
  },
  heroBadgeTxt: { fontSize: 10, fontWeight: "700" },
  heroMiniStats: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
    paddingVertical: 8, paddingHorizontal: 8,
  },
  heroMiniItem: { alignItems: "center", gap: 4, flex: 1 },
  heroMiniSep:  { width: 1, height: 28 },
  heroMiniTxt:  { fontSize: 9, textAlign: "center", lineHeight: 12 },
  heroRight: {
    width: "40%", minWidth: 260,
    position: "relative", overflow: "hidden",
  },
  heroImg: {
    position: "absolute", top: 0, right: 0, bottom: 0,
    width: "100%", height: "100%",
  },
  heroCurve: {
    position: "absolute", top: -30, left: -28,
    width: 70, height: 320,
    borderRadius: 40, transform: [{ rotate: "8deg" }],
  },

  // Mid row (¿Cómo funciona? + Características)
  midRow:  { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  midLeft: { flex: 1.4 },
  midRight:{ flex: 1 },

  // Secciones generales
  seccion: {
    borderRadius: 20, borderWidth: 1,
    padding: 20, gap: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  seccionTitulo: { fontSize: 17, fontWeight: "900", letterSpacing: -0.2 },

  flujoRow: { flexDirection: "row", alignItems: "flex-start" },

  // Características
  caracteristicasGrid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 12, justifyContent: "space-between",
  },

  // Dispositivos
  dispositivosGrid:{ flexDirection: "row", gap: 14 },
  dispoCol:        { flex: 1 },

  footer: { textAlign: "center", fontSize: 12, paddingTop: 4 },
});
