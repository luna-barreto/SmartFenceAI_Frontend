import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, Animated,
  Dimensions, Image, StyleSheet, Platform,
  PanResponder, ScrollView, useWindowDimensions,
} from "react-native";
import {
  Home, Map, Bell, Settings, Info,
  LogOut, User, ChevronRight, ShieldCheck, Users,
} from "lucide-react-native";
import Svg, { Path, Ellipse } from "react-native-svg";
import { useDrawer } from "@context/DrawerContext";
import { useAuth } from "@context/AuthContext";
import { useT } from "@context/ThemeContext";
import { navigateTo, navigationRef } from "@navigation/navigationRef";

// ─── CowIcon outline ──────────────────────────────────────────────────────────
function CowIcon({ size = 20, color = "#76C043" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M6.27335 12.5175875c0 0.22014375 -0.17846875 0.3986 -0.3986125 0.3986125H4.81178125c-0.30685625 -0.0000125 -0.4986375 -0.3322 -0.3452 -0.59793125 0.07120625 -0.12331875 0.2028 -0.1992875 0.3452 -0.19929375h1.06295625c0.22014375 0.0000125 0.3986125 0.178475 0.3986125 0.3986125Zm4.9162 -0.3986125h-1.0629625c-0.30685 0.00001875 -0.49863125 0.3322 -0.34519375 0.59793125 0.0712 0.12331875 0.2028 0.1992875 0.34519375 0.19929375h1.0629625c0.30685 -0.0000125 0.4986375 -0.3322 0.3452 -0.59793125 -0.07120625 -0.12331875 -0.2028 -0.1992875 -0.3452 -0.19929375Zm-5.04906875 -4.783325c-0.51141875 0 -0.83105625 0.553625 -0.57534375 0.996525 0.25570625 0.4429 0.89498125 0.4429 1.1506875 0 0.0583125 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.2974375 -0.66435 -0.66435 -0.66435Zm3.72036875 0c-0.51141875 0 -0.83105625 0.553625 -0.57535 0.996525 0.2557125 0.4429 0.89498125 0.4429 1.15069375 0 0.05830625 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.29744375 -0.66435 -0.66435 -0.66435Zm5.7698875 0.45508125c-0.17666875 0.21655 -0.44134375 0.34218125 -0.72081875 0.3421375H12.651125v2.32855c1.5828375 1.12755625 1.3515 3.54575 -0.41640625 4.35275 -0.32810625 0.149775 -0.68449375 0.2275 -1.04516875 0.22795625H4.81178125c-1.9433875 -0.0024375 -3.15536875 -2.10773125 -2.18156875 -3.7895375 0.180725 -0.312125 0.4262375 -0.58190625 0.71999375 -0.79116875v-2.32855H1.0914125c-0.2799375 0.00044375 -0.5451875 -0.125225 -0.72215 -0.3421375 -0.17531875 -0.21299375 -0.245575 -0.493525 -0.19133125 -0.76400625 0.3399375 -1.6740625 1.8108375 -2.87783125 3.51906875 -2.8799625h0.4577375c-0.84463125 -0.68 -1.33585625 -1.70593125 -1.3360125 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.123325 0.07120625 0.1993 0.20279375 0.1993 0.34520625 0 1.541025 1.24925 2.790275 2.790275 2.790275h3.1888875c1.540975 -0.00006875 2.790275 -1.2493 2.790275 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.12333125 0.07120625 0.1993 0.20279375 0.1993 0.34520625 -0.00015625 1.08434375 -0.49138125 2.110275 -1.33600625 2.790275h0.4577375c1.707725 0.0027625 3.1779 1.2063875 3.5177375 2.8799625 0.0542375 0.27048125 -0.0160125 0.5510125 -0.19133125 0.76400625Zm-12.28053125 -0.45508125v-0.66435c-0.00028125 -0.642175 0.24500625 -1.26014375 0.6856125 -1.72731875h-0.338825c-1.328925 0.00055 -2.47380625 0.93655625 -2.73845 2.23886875 -0.007425 0.03658125 0.002375 0.07455 0.02656875 0.102975 0.02578125 0.03220625 0.06505 0.05061875 0.1063 0.049825Zm9.56665625 5.1819375c0 -0.954 -0.7733125 -1.72735625 -1.7273125 -1.7273125H4.81178125c-1.3296875 0 -2.16074375 1.439425 -1.4959 2.59096875 0.30855625 0.53443125 0.8787875 0.86365625 1.4959 0.86365625h6.37776875c0.954 0.00004375 1.7273125 -0.7733125 1.7273125 -1.7273125Zm-1.0629625 -2.4355125v-3.410775c0 -0.95396875 -0.77334375 -1.72731875 -1.7273125 -1.72731875H5.8747375c-0.95396875 0 -1.7273125 0.77335 -1.7273125 1.72731875v3.410775c0.21650625 -0.05911875 0.439925 -0.08905625 0.66435625 -0.08901875h6.37776875c0.224425 -0.0000375 0.44785 0.0299 0.66435 0.08901875Zm3.1888875 -2.899225c-0.26465 -1.3023125 -1.409525 -2.23831875 -2.73845625 -2.23886875h-0.33881875c0.44060625 0.467175 0.68589375 1.08514375 0.6856125 1.72731875v0.66435h2.25879375c0.04078125 0.00038125 0.07948125 -0.0179875 0.10496875 -0.049825 0.02466875 -0.02819375 0.0349625 -0.0661875 0.0279 -0.102975Z"
        fill={color} strokeWidth={0.0625}
      />
    </Svg>
  );
}

// ─── Ilustración colinas SVG para el header ───────────────────────────────────
function HeaderLandscape() {
  const T = useT();
  return (
    <Svg width="100%" height={48} viewBox="0 0 320 48" preserveAspectRatio="none">
      <Path d="M0 48 Q80 10 160 28 Q240 46 320 8 L320 48 Z" fill={T.verdeMuy} opacity={0.8} />
      <Path d="M0 48 Q60 20 140 34 Q220 48 320 18 L320 48 Z" fill={T.verdeMuy} opacity={0.6} />
      <Path d="M260 30 L260 38" stroke="#4F9E2C" strokeWidth={2} strokeLinecap="round" />
      <Ellipse cx={260} cy={26} rx={7} ry={8} fill="#4F9E2C" opacity={0.6} />
      <Path d="M280 34 L280 40" stroke="#4F9E2C" strokeWidth={1.5} strokeLinecap="round" />
      <Ellipse cx={280} cy={30} rx={5} ry={6} fill="#4F9E2C" opacity={0.5} />
    </Svg>
  );
}

const SWIPE_THRESHOLD = 40;

type MenuItem = {
  icono: React.ComponentType<any>;
  label: string;
  ruta: string | null;
  color: string;
  fondo: string;
  activoColor: string;
  activoFondo: string;
  accion?: () => void;
};

export default function DrawerMenu() {
  const { width: SCREEN_W } = useWindowDimensions();
  const DRAWER_W = Math.min(SCREEN_W * 0.82, 320);
  const { isOpen, cerrarDrawer } = useDrawer();
  const { usuario, cerrarSesion } = useAuth();
  const T = useT();
  const [rutaActiva, setRutaActiva] = useState<string>("Home");

  const translateX     = useRef(new Animated.Value(-DRAWER_W)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      const nombre = navigationRef.current?.getCurrentRoute()?.name;
      if (nombre) setRutaActiva(nombre);
    }
  }, [isOpen]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isOpen ? 0 : -DRAWER_W,
        duration: isOpen ? 260 : 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: isOpen ? 260 : 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, DRAWER_W]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx < -10 && Math.abs(g.dy) < Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(Math.max(-DRAWER_W, g.dx));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          cerrarDrawer();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        }
      },
    })
  ).current;

  function navegar(ruta: string) {
    setRutaActiva(ruta);
    cerrarDrawer();
    setTimeout(() => navigateTo(ruta as any), 10);
  }

  const iniciales = (usuario?.nombre ?? "U")
    .split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  const menuItems: (MenuItem | "divider")[] = [
    {
      icono: Home, label: "Inicio", ruta: "Home",
      color: T.verde, fondo: T.verdeMuy,
      activoColor: T.verdeBrillo, activoFondo: T.verdeLuz,
    },
    {
      icono: CowIcon, label: "Animales", ruta: "Animals",
      color: T.txtSec, fondo: T.verdeMuy,
      activoColor: T.verdeBrillo, activoFondo: T.verdeLuz,
    },
    "divider",
    {
      icono: Map, label: "Cerca virtual", ruta: "Map",
      color: T.txtSec, fondo: T.azulBg,
      activoColor: T.azul, activoFondo: T.azulBg,
    },
    {
      icono: Bell, label: "Alarmas", ruta: "Alerts",
      color: T.txtSec, fondo: T.naranjaBg,
      activoColor: T.naranja, activoFondo: T.naranjaBg,
    },
    "divider",
    {
      icono: User, label: "Perfil", ruta: "Profile",
      color: T.txtSec, fondo: T.azulBg,
      activoColor: T.azul, activoFondo: T.azulBg,
    },
    {
      icono: Settings, label: "Ajustes", ruta: "Settings",
      color: T.txtSec, fondo: T.verdeMuy,
      activoColor: T.txtSec, activoFondo: T.verdeMuy,
    },
    {
      icono: Info, label: "Información", ruta: "Info",
      color: T.txtSec, fondo: T.azulBg,
      activoColor: T.azul, activoFondo: T.azulBg,
    },
    ...(usuario?.rol?.toUpperCase() === "ADMINISTRADOR" ? [
      "divider" as const,
      {
        icono: Users, label: "Panel Admin", ruta: "Admin",
        color: "#8E24AA", fondo: "#8E24AA22",
        activoColor: "#8E24AA", activoFondo: "#8E24AA22",
      } as MenuItem,
    ] : []),
    {
      icono: LogOut, label: "Cerrar sesión", ruta: null,
      color: T.rojo, fondo: T.rojoBg,
      activoColor: T.rojo, activoFondo: T.rojoBg,
      accion: () => { cerrarDrawer(); setTimeout(() => cerrarSesion(), 10); },
    },
  ];

  return (
    <>
      {/* Overlay */}
      <Animated.View
        pointerEvents={isOpen ? "auto" : "none"}
        style={[st.overlay, { opacity: overlayOpacity }]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={cerrarDrawer} activeOpacity={1} />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[st.drawer, { backgroundColor: T.fondoSec, width: DRAWER_W, transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* ── Header ── */}
        <View style={[st.headerWrap, { backgroundColor: T.fondoSec, borderBottomColor: T.borde }]}>
          <View style={st.headerTop}>
            <Image
              source={require("../../assets/logotipo.png")}
              style={st.logo}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={st.brandText}>
                <Text style={{ color: T.txtMain, fontWeight: "700" }}>SMARTFENCE </Text>
                <Text style={{ color: T.verdeBrillo, fontWeight: "900" }}>AI</Text>
              </Text>
              <Text style={[st.brandSub, { color: T.verdeBrillo }]}>GANADO INTELIGENTE</Text>
              <Text style={[st.brandSub2, { color: T.txtSec }]}>CERCAS VIRTUALES • CONTROL TOTAL</Text>
            </View>
          </View>
          <HeaderLandscape />
        </View>

        {/* ── Tarjeta usuario ── */}
        <TouchableOpacity
          style={[st.userCard, { backgroundColor: T.card, borderColor: T.borde }]}
          onPress={() => navegar("Profile")}
          activeOpacity={0.75}
        >
          <View style={[st.userAvatar, { backgroundColor: T.verdeOscuro }]}>
            <Text style={st.userAvatarTxt}>{iniciales}</Text>
            <View style={[st.userDot, { backgroundColor: T.verde, borderColor: T.fondoSec }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[st.userName, { color: T.txtMain }]} numberOfLines={1}>{usuario?.nombre ?? "Usuario"}</Text>
            <Text style={[st.userFinca, { color: T.txtSec }]} numberOfLines={1}>{usuario?.finca ?? "Sin finca"}</Text>
          </View>
          <ChevronRight size={16} color={T.txtTer} strokeWidth={2} />
        </TouchableOpacity>

        {/* ── Items del menú ── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={st.menuList}
          showsVerticalScrollIndicator={false}
        >
          {menuItems.map((item, i) => {
            if (item === "divider") {
              return <View key={`d-${i}`} style={[st.divider, { backgroundColor: T.borde }]} />;
            }

            const activo = item.ruta !== null && rutaActiva === item.ruta && item.label !== "Cerrar sesión";
            const txtColor = item.label === "Cerrar sesión"
              ? item.color
              : activo ? item.activoColor : T.txtSec;

            return (
              <TouchableOpacity
                key={`${item.label}-${i}`}
                style={[st.menuItem, activo && { backgroundColor: item.activoFondo }]}
                onPress={() => item.accion ? item.accion() : item.ruta && navegar(item.ruta)}
                activeOpacity={0.72}
              >
                <View style={[st.iconBox, { backgroundColor: activo ? item.activoFondo : item.fondo }]}>
                  <item.icono
                    size={19}
                    color={activo ? item.activoColor : item.color}
                    strokeWidth={activo ? 2.2 : 1.8}
                  />
                </View>
                <Text style={[st.menuLabel, { color: txtColor, fontWeight: activo ? "700" : "500" }]}>
                  {item.label}
                </Text>
                <ChevronRight size={14} color={activo ? item.activoColor : T.txtTer} strokeWidth={2} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Banner inferior sistema activo ── */}
        <View style={[st.bottomCard, { backgroundColor: T.verdeMuy, borderColor: T.borde }]}>
          <View style={[st.bottomIconBox, { backgroundColor: T.card }]}>
            <ShieldCheck size={18} color={T.verde} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={[st.bottomTitle, { color: T.verdeBrillo }]}>Sistema activo</Text>
              <View style={[st.greenDot, { backgroundColor: T.verde }]} />
            </View>
            <Text style={[st.bottomSub, { color: T.verde }]}>Monitoreo en tiempo real</Text>
          </View>
          <Svg width={52} height={36} viewBox="0 0 52 36" style={{ opacity: 0.3 }}>
            <Path d="M0 36 Q13 18 26 24 Q39 30 52 12 L52 36 Z" fill="#4F9E2C" />
            <Path d="M30 20 Q32 16 36 17 Q38 18 37 21 Q35 24 31 23 Z" fill="#76C043" />
            <Path d="M36 17 L38 14" stroke="#76C043" strokeWidth={1} strokeLinecap="round" />
            <Path d="M35 17 L36 14" stroke="#76C043" strokeWidth={1} strokeLinecap="round" />
            <Path d="M31 23 L30 28 L32 28 L33 23" fill="#76C043" />
            <Path d="M35 23 L34 28 L36 28 L37 23" fill="#76C043" />
            <Path d="M40 8 Q44 4 48 8" stroke="#8FE25C" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            <Path d="M41 11 Q44 8 47 11" stroke="#8FE25C" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          </Svg>
        </View>

        {/* Versión */}
        <Text style={[st.version, { color: T.txtTer }]}>SmartFence AI v1.0.0</Text>
      </Animated.View>
    </>
  );
}

const st = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.60)",
    zIndex: 100,
  },
  drawer: {
    position: "absolute",
    top: 0, left: 0, bottom: 0,
    zIndex: 101,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 14, elevation: 18,
    paddingTop: Platform.OS === "android" ? 36 : 52,
    paddingBottom: 16,
  },

  // Header
  headerWrap: {
    borderBottomWidth: 1,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12,
  },
  logo:      { width: 64, height: 64, borderRadius: 16 },
  brandText: { fontSize: 16, letterSpacing: 0.3 },
  brandSub:  { fontSize: 10, fontWeight: "700", marginTop: 3, letterSpacing: 0.5 },
  brandSub2: { fontSize: 8.5, letterSpacing: 0.3, marginTop: 2 },

  // Usuario
  userCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 14, marginTop: 14, marginBottom: 6,
    borderRadius: 16, padding: 12,
    borderWidth: 1,
  },
  userAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  userAvatarTxt: { fontSize: 15, fontWeight: "800", color: "#fff" },
  userDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    borderWidth: 2,
  },
  userName:  { fontSize: 13.5, fontWeight: "700" },
  userFinca: { fontSize: 11, marginTop: 1 },

  // Menú
  menuList: { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 8, gap: 2 },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 11, paddingHorizontal: 10,
    borderRadius: 14,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  menuLabel: {
    flex: 1, fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 5, marginHorizontal: 4,
  },

  // Banner inferior
  bottomCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 14, marginTop: 8,
    borderRadius: 16, padding: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  bottomIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  bottomTitle: { fontSize: 12.5, fontWeight: "700" },
  bottomSub:   { fontSize: 10.5, marginTop: 1 },
  greenDot: {
    width: 7, height: 7, borderRadius: 4,
  },

  version: {
    textAlign: "center", fontSize: 10,
    marginTop: 10,
  },
});
