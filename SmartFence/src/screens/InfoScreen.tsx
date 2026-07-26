import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform, StatusBar, Image, Dimensions,
} from "react-native";
import {
  Menu, Bell, ShieldCheck, Wifi, BatteryCharging,
  MapPin, LayoutGrid, ChevronRight, Cpu, Radio,
  Smartphone, Clock,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { useDrawer } from "@context/DrawerContext";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useT } from "@context/ThemeContext";

const { width: SW } = Dimensions.get("window");
const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

// morado stays hardcoded — not in the palette
const MORADO    = "#A78BFA";
const MORADO_BG = "rgba(167,139,250,0.14)";

// ─── Ícono LoRa (wifi style) ───────────────────────────────────────────────────
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

// ─── Paso del flujo ───────────────────────────────────────────────────────────
function PasoFlujo({
  num, icon: Icon, texto, isLast,
}: {
  num: number; icon: React.ComponentType<any>; texto: string; isLast?: boolean;
}) {
  const T = useT();
  return (
    <View style={ps.pasoWrap}>
      <View style={ps.pasoCol}>
        <View style={ps.pasoIconWrap}>
          <View style={[ps.pasoIconBox, { backgroundColor: T.verdeAlfa, borderColor: T.borde }]}>
            <Icon size={24} color={T.verde} strokeWidth={1.6} />
          </View>
          <View style={[ps.pasoBadge, { backgroundColor: T.verdeOscuro, borderColor: T.card }]}>
            <Text style={ps.pasoBadgeTxt}>{num}</Text>
          </View>
        </View>
        <Text style={[ps.pasoTxt, { color: T.txtSec }]} numberOfLines={4}>{texto}</Text>
      </View>
      {!isLast && (
        <View style={ps.pasoArrow}>
          <Text style={[ps.pasoArrowTxt, { color: T.borde }]}>›</Text>
        </View>
      )}
    </View>
  );
}

const ps = StyleSheet.create({
  pasoWrap:    { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  pasoCol:     { alignItems: "center", flex: 1, gap: 8 },
  pasoIconWrap:{ position: "relative" },
  pasoIconBox: {
    width: 60, height: 60, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  pasoBadge: {
    position: "absolute", bottom: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  pasoBadgeTxt: { fontSize: 10, fontWeight: "900", color: "#fff" },
  pasoTxt:  { fontSize: 10.5, textAlign: "center", lineHeight: 15 },
  pasoArrow:{ paddingTop: 18, paddingHorizontal: 2 },
  pasoArrowTxt: { fontSize: 20, fontWeight: "300" },
});

// ─── Característica ──────────────────────────────────────────────────────────
function CaracteristicaItem({
  icon: Icon, texto, color, bg,
}: {
  icon: React.ComponentType<any>; texto: string; color: string; bg: string;
}) {
  const T = useT();
  return (
    <View style={ca.item}>
      <View style={[ca.iconBox, { backgroundColor: bg }]}>
        <Icon size={22} color={color} strokeWidth={1.6} />
      </View>
      <Text style={[ca.txt, { color: T.txtSec }]}>{texto}</Text>
    </View>
  );
}

const ca = StyleSheet.create({
  item: { alignItems: "center", width: (SW - 48) / 5, gap: 6 },
  iconBox: {
    width: 52, height: 52, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  txt: { fontSize: 9.5, textAlign: "center", lineHeight: 13 },
});

// ─── Dispositivo ─────────────────────────────────────────────────────────────
function DispositivoRow({
  icon: Icon, nombre, descripcion, color, bg, imagen,
}: {
  icon: React.ComponentType<any>;
  nombre: string;
  descripcion: string;
  color: string;
  bg: string;
  imagen?: any;
}) {
  const T = useT();
  return (
    <TouchableOpacity style={[dv.row, { backgroundColor: T.card, borderColor: T.borde }]} activeOpacity={0.8}>
      {/* Imagen del dispositivo */}
      <View style={[dv.imgBox, { backgroundColor: T.cardElevada }]}>
        {imagen ? (
          <Image source={imagen} style={dv.img} resizeMode="contain" />
        ) : (
          <View style={[dv.imgPlaceholder, { backgroundColor: bg }]}>
            <Icon size={32} color={color} strokeWidth={1.6} />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[dv.nombre, { color: T.txtMain }]}>{nombre}</Text>
        <Text style={[dv.desc, { color: T.txtSec }]} numberOfLines={3}>{descripcion}</Text>
      </View>
      <ChevronRight size={16} color={T.txtSec} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}

const dv = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 20, borderWidth: 1,
    padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 2,
  },
  imgBox: {
    width: 80, height: 80, borderRadius: 14,
    overflow: "hidden",
  },
  img: { width: 80, height: 80 },
  imgPlaceholder: {
    width: 80, height: 80, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  nombre: { fontSize: 14, fontWeight: "800", marginBottom: 3 },
  desc:   { fontSize: 11.5, lineHeight: 16 },
});

// ─── InfoScreen ───────────────────────────────────────────────────────────────
export default function InfoScreen() {
  const T = useT();
  const { openDrawer } = useDrawer();
  const { conectado } = useAnimalsCtx();
  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>

      {/* ── Header ── */}
      <View style={[st.header, { backgroundColor: T.header, borderBottomColor: T.borde }]}>
        <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={openDrawer} activeOpacity={0.7}>
          <Menu size={20} color={T.txtMain} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={st.headerCenter}>
          <Image source={require("../../assets/logotipo.png")} style={st.headerLogoImg} resizeMode="contain" />
          <Text style={st.headerBrand}>
            <Text style={{ color: T.txtMain, fontWeight: "700" }}>SMART</Text>
            <Text style={{ color: T.verde, fontWeight: "900" }}>FENCE</Text>
            <Text style={{ color: T.verdeBrillo, fontWeight: "900" }}> AI</Text>
          </Text>
        </View>
        <View style={st.headerRight}>
          <View style={[st.conectadoBadge, { backgroundColor: conectado ? T.verdeLuz : T.rojoBg }]}>
            <View style={[st.conectadoDot, { backgroundColor: conectado ? T.verde : T.rojo }]} />
            <Text style={[st.conectadoTxt, { color: conectado ? T.verdeBrillo : T.rojo }]}>
              {conectado ? "Conectado" : "Sin señal"}
            </Text>
          </View>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} activeOpacity={0.7}>
            <Bell size={20} color={T.txtMain} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HERO CARD: ¿Qué es SmartFence AI? ── */}
        <View style={[st.heroCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          {/* Columna izquierda — texto */}
          <View style={st.heroLeft}>
            {/* Título con ícono */}
            <View style={st.heroIconRow}>
              <View style={[st.heroIconBox, { backgroundColor: T.verdeAlfa }]}>
                <ShieldCheck size={16} color={T.verde} strokeWidth={2} />
              </View>
              <Text style={[st.heroTitleSm, { color: T.txtSec }]}>¿Qué es</Text>
            </View>
            <Text style={[st.heroTitle, { color: T.txtMain }]}>
              SmartFence{"\n"}<Text style={{ color: T.verde }}>AI?</Text>
            </Text>

            {/* Descripción compacta */}
            <Text style={[st.heroDesc, { color: T.txtSec }]} numberOfLines={4}>
              Plataforma de monitoreo ganadero con{" "}
              <Text style={[st.heroDescBold, { color: T.txtMain }]}>collares GPS LoRa, cercas virtuales y alertas en tiempo real</Text>
              {" "}para saber siempre dónde está cada animal.
            </Text>

            {/* Badge */}
            <View style={[st.heroBadge, { backgroundColor: T.verdeAlfa }]}>
              <ShieldCheck size={10} color={T.verde} strokeWidth={2} />
              <Text style={[st.heroBadgeTxt, { color: T.verdeBrillo }]}>Tecnología que cuida tu ganado</Text>
            </View>

            {/* Mini stats */}
            <View style={[st.heroMiniStats, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <View style={st.heroMiniItem}>
                <LoRaIcon size={14} color={T.verde} />
                <Text style={[st.heroMiniTxt, { color: T.txtSec }]}>LoRaWAN{"\n"}largo alcance</Text>
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
          <View style={st.heroRight}>
            <Image
              source={require("../../assets/Vaca.png")}
              style={st.heroImg}
              resizeMode="cover"
            />
            {/* Curva orgánica en el borde izquierdo de la imagen */}
            <View style={[st.heroCurve, { backgroundColor: T.card }]} />
          </View>
        </View>

        {/* ── ¿Cómo funciona? ── */}
        <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
          <Text style={[st.seccionTitulo, { color: T.txtMain }]}>¿Cómo funciona?</Text>
          <View style={st.flujoRow}>
            <PasoFlujo
              num={1} icon={Cpu}
              texto={"El collar GPS LoRa obtiene la ubicación del animal."}
            />
            <PasoFlujo
              num={2} icon={LoRaIcon}
              texto={"Envía los datos al gateway LoRa instalado en la finca."}
            />
            <PasoFlujo
              num={3} icon={Wifi}
              texto={"El gateway sincroniza la información con la nube."}
            />
            <PasoFlujo
              num={4} icon={Smartphone}
              texto={"La app muestra la ubicación y envía alertas en tiempo real."}
              isLast
            />
          </View>
        </View>

        {/* ── Características clave ── */}
        <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
          <Text style={[st.seccionTitulo, { color: T.txtMain }]}>Características clave</Text>
          <View style={st.caracteristicasRow}>
            <CaracteristicaItem icon={MapPin}         texto={"Monitoreo GPS\nen tiempo real\nde todo el ganado"} color={T.verde}   bg={T.verdeLuz}   />
            <CaracteristicaItem icon={LayoutGrid}      texto={"Cercas virtuales\nconfigurables\npor finca"}      color={T.azul}    bg={T.azulBg}     />
            <CaracteristicaItem icon={Bell}            texto={"Alertas instantáneas\ncuando un animal\nsale del perímetro"} color={T.naranja} bg={T.naranjaBg}  />
            <CaracteristicaItem icon={BatteryCharging} texto={"Panel de batería\ny señal de\ncada collar"}       color={MORADO}    bg={MORADO_BG}    />
            <CaracteristicaItem icon={Clock}           texto={"Historial de\nmovimiento y\ntrazabilidad"}        color={T.verde}   bg={T.verdeLuz}   />
          </View>
        </View>

        {/* ── Nuestros dispositivos ── */}
        <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
          <Text style={[st.seccionTitulo, { color: T.txtMain }]}>Nuestros dispositivos</Text>
          <View style={{ gap: 12 }}>
            <DispositivoRow
              icon={Cpu}
              nombre="Collar GPS LoRa"
              descripcion="Collar ESP32 con módulo GPS NEO-6M y transceptor LoRa. Transmite posición cada 4 segundos al gateway con autonomía de hasta 72 horas."
              color={T.verde}
              bg={T.verdeLuz}
            />
            <DispositivoRow
              icon={Radio}
              nombre="Gateway LoRa"
              descripcion="Concentrador LoRaWAN instalado en la finca. Recibe las tramas de todos los collares y las reenvía al servidor mediante WiFi o datos móviles."
              color={T.azul}
              bg={T.azulBg}
            />
            <DispositivoRow
              icon={Smartphone}
              nombre="App Móvil"
              descripcion="Aplicación en React Native/Expo disponible para Android e iOS. Visualiza el ganado en mapa, recibe alertas y consulta reportes."
              color={MORADO}
              bg={MORADO_BG}
            />
          </View>
        </View>

        {/* ── Versión ── */}
        <View style={[st.versionCard, { backgroundColor: T.card, borderColor: T.borde }]}>
          <Image source={require("../../assets/logotipo.png")} style={st.versionLogo} resizeMode="contain" />
          <View style={{ alignItems: "center", gap: 2 }}>
            <Text style={[st.versionNombre, { color: T.txtMain }]}>SmartFence AI</Text>
            <Text style={[st.versionNum, { color: T.txtSec }]}>Versión 1.0.0 — MVP</Text>
            <Text style={[st.versionStack, { color: T.txtTer }]}>Desarrollado con React Native / Expo SDK 54</Text>
          </View>
          <View style={[st.versionBadge, { backgroundColor: T.verdeAlfa }]}>
            <View style={[st.versionDot, { backgroundColor: T.verde }]} />
            <Text style={[st.versionBadgeTxt, { color: T.verdeBrillo }]}>Sistema activo</Text>
          </View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: STATUS_BAR_H + HEADER_EXTRA_PT,
    paddingBottom: 12, paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  headerCenter:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogoImg: { width: 30, height: 30, borderRadius: 8 },
  headerBrand:   { fontSize: 13, letterSpacing: 0.4 },
  headerRight:   { flexDirection: "row", alignItems: "center", gap: 8 },
  conectadoBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  conectadoDot: { width: 7, height: 7, borderRadius: 4 },
  conectadoTxt: { fontSize: 11, fontWeight: "700" },

  scroll: { padding: 16, gap: 20 },

  // Hero
  heroCard: {
    borderRadius: 24, borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    height: 260,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 5,
  },
  heroLeft: {
    flex: 1,
    paddingTop: 16, paddingBottom: 14,
    paddingLeft: 16, paddingRight: 10,
    gap: 7,
    justifyContent: "center",
  },
  heroIconRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroIconBox: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  heroTitleSm: { fontSize: 12, fontWeight: "500" },
  heroTitle:   { fontSize: 20, fontWeight: "900", lineHeight: 24 },
  heroDesc:    { fontSize: 11, lineHeight: 16 },
  heroDescBold:{ fontWeight: "800" },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
    alignSelf: "flex-start",
  },
  heroBadgeTxt: { fontSize: 9.5, fontWeight: "700" },
  heroMiniStats: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
    paddingVertical: 7, paddingHorizontal: 6,
    marginTop: 2,
  },
  heroMiniItem: { alignItems: "center", gap: 3, flex: 1 },
  heroMiniSep:  { width: 1, height: 28 },
  heroMiniTxt:  { fontSize: 8.5, textAlign: "center", lineHeight: 11 },

  heroRight: {
    width: SW * 0.46,
    position: "relative",
    overflow: "hidden",
  },
  heroImg: {
    position: "absolute",
    top: 0, right: 0, bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroCurve: {
    position: "absolute",
    top: -30, left: -28,
    width: 70, height: 320,
    borderRadius: 40,
    transform: [{ rotate: "8deg" }],
  },

  // Secciones
  seccion: {
    borderRadius: 24, borderWidth: 1,
    padding: 18, gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 2,
  },
  seccionTitulo: { fontSize: 18, fontWeight: "900", letterSpacing: -0.2 },

  // Flujo
  flujoRow: { flexDirection: "row", alignItems: "flex-start" },

  // Características
  caracteristicasRow: { flexDirection: "row", justifyContent: "space-between" },

  // Versión
  versionCard: {
    borderRadius: 24, borderWidth: 1,
    padding: 20, alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 2,
  },
  versionLogo:     { width: 56, height: 56, borderRadius: 16 },
  versionNombre:   { fontSize: 15, fontWeight: "800" },
  versionNum:      { fontSize: 12 },
  versionStack:    { fontSize: 11 },
  versionBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
  },
  versionDot:      { width: 8, height: 8, borderRadius: 4 },
  versionBadgeTxt: { fontSize: 12, fontWeight: "700" },
});
