import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import {
  Home,
  Map,
  Bell,
  Settings,
  User,
  Info,
  LogOut,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { useT } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import { navigateTo } from "@navigation/navigationRef";

// ─── CowIcon SVG ──────────────────────────────────────────────────────────────
function CowIcon({ size = 20, color = "#76C043" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M6.27335 12.5175875c0 0.22014375 -0.17846875 0.3986 -0.3986125 0.3986125H4.81178125c-0.30685625 -0.0000125 -0.4986375 -0.3322 -0.3452 -0.59793125 0.07120625 -0.12331875 0.2028 -0.1992875 0.3452 -0.19929375h1.06295625c0.22014375 0.0000125 0.3986125 0.178475 0.3986125 0.3986125Zm4.9162 -0.3986125h-1.0629625c-0.30685 0.00001875 -0.49863125 0.3322 -0.34519375 0.59793125 0.0712 0.12331875 0.2028 0.1992875 0.34519375 0.19929375h1.0629625c0.30685 -0.0000125 0.4986375 -0.3322 0.3452 -0.59793125 -0.07120625 -0.12331875 -0.2028 -0.1992875 -0.3452 -0.19929375Zm-5.04906875 -4.783325c-0.51141875 0 -0.83105625 0.553625 -0.57534375 0.996525 0.25570625 0.4429 0.89498125 0.4429 1.1506875 0 0.0583125 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.2974375 -0.66435 -0.66435 -0.66435Zm3.72036875 0c-0.51141875 0 -0.83105625 0.553625 -0.57535 0.996525 0.2557125 0.4429 0.89498125 0.4429 1.15069375 0 0.05830625 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.29744375 -0.66435 -0.66435 -0.66435Zm5.7698875 0.45508125c-0.17666875 0.21655 -0.44134375 0.34218125 -0.72081875 0.3421375H12.651125v2.32855c1.5828375 1.12755625 1.3515 3.54575 -0.41640625 4.35275 -0.32810625 0.149775 -0.68449375 0.2275 -1.04516875 0.22795625H4.81178125c-1.9433875 -0.0024375 -3.15536875 -2.10773125 -2.18156875 -3.7895375 0.180725 -0.312125 0.4262375 -0.58190625 0.71999375 -0.79116875v-2.32855H1.0914125c-0.2799375 0.00044375 -0.5451875 -0.125225 -0.72215 -0.3421375 -0.17531875 -0.21299375 -0.245575 -0.493525 -0.19133125 -0.76400625 0.3399375 -1.6740625 1.8108375 -2.87783125 3.51906875 -2.8799625h0.4577375c-0.84463125 -0.68 -1.33585625 -1.70593125 -1.3360125 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.123325 0.07120625 0.1993 0.20279375 0.1993 0.34520625 0 1.541025 1.24925 2.790275 2.790275 2.790275h3.1888875c1.540975 -0.00006875 2.790275 -1.2493 2.790275 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.12333125 0.07120625 0.1993 0.20279375 0.1993 0.34520625 -0.00015625 1.08434375 -0.49138125 2.110275 -1.33600625 2.790275h0.4577375c1.707725 0.0027625 3.1779 1.2063875 3.5177375 2.8799625 0.0542375 0.27048125 -0.0160125 0.5510125 -0.19133125 0.76400625Zm-12.28053125 -0.45508125v-0.66435c-0.00028125 -0.642175 0.24500625 -1.26014375 0.6856125 -1.72731875h-0.338825c-1.328925 0.00055 -2.47380625 0.93655625 -2.73845 2.23886875 -0.007425 0.03658125 0.002375 0.07455 0.02656875 0.102975 0.02578125 0.03220625 0.06505 0.05061875 0.1063 0.049825Zm9.56665625 5.1819375c0 -0.954 -0.7733125 -1.72735625 -1.7273125 -1.7273125H4.81178125c-1.3296875 0 -2.16074375 1.439425 -1.4959 2.59096875 0.30855625 0.53443125 0.8787875 0.86365625 1.4959 0.86365625h6.37776875c0.954 0.00004375 1.7273125 -0.7733125 1.7273125 -1.7273125Zm-1.0629625 -2.4355125v-3.410775c0 -0.95396875 -0.77334375 -1.72731875 -1.7273125 -1.72731875H5.8747375c-0.95396875 0 -1.7273125 0.77335 -1.7273125 1.72731875v3.410775c0.21650625 -0.05911875 0.439925 -0.08905625 0.66435625 -0.08901875h6.37776875c0.224425 -0.0000375 0.44785 0.0299 0.66435 0.08901875Zm3.1888875 -2.899225c-0.26465 -1.3023125 -1.409525 -2.23831875 -2.73845625 -2.23886875h-0.33881875c0.44060625 0.467175 0.68589375 1.08514375 0.6856125 1.72731875v0.66435h2.25879375c0.04078125 0.00038125 0.07948125 -0.0179875 0.10496875 -0.049825 0.02466875 -0.02819375 0.0349625 -0.0661875 0.0279 -0.102975Z"
        fill={color}
        strokeWidth={0.0625}
      />
    </Svg>
  );
}

// ─── Nav item definition ──────────────────────────────────────────────────────
type NavItem = {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  route: string;
};

const NAV_ITEMS: NavItem[] = [
  { icon: Home,     label: "Inicio",         route: "Home"     },
  { icon: CowIcon,  label: "Animales",        route: "Animals"  },
  { icon: Map,      label: "Cerca virtual",   route: "Map"      },
  { icon: Bell,     label: "Alertas",         route: "Alerts"   },
  { icon: Settings, label: "Configuración",   route: "Settings" },
  { icon: User,     label: "Perfil",          route: "Profile"  },
  { icon: Info,     label: "Información",     route: "Info"     },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface WebSidebarProps {
  activeRoute: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WebSidebar({ activeRoute }: WebSidebarProps) {
  const T = useT();
  const { usuario, cerrarSesion } = useAuth();
  const { width } = useWindowDimensions();

  const collapsed = width < 1100;

  const iniciales = (usuario?.nombre ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        st.sidebar,
        collapsed && st.sidebarMini,
        { backgroundColor: T.card, borderRightColor: T.borde },
      ]}
    >
      {/* ── 1. Logo area ── */}
      <View
        style={[
          st.logoArea,
          collapsed && st.logoAreaMini,
          { borderBottomColor: T.borde },
        ]}
      >
        <Image
          source={require("../../assets/logotipo.png")}
          style={st.logoImg}
          resizeMode="contain"
        />
        {!collapsed && (
          <View style={st.logoTextWrap}>
            <Text style={st.brandRow}>
              <Text style={[st.brandMain, { color: T.txtMain }]}>SMARTFENCE </Text>
              <Text style={[st.brandAi, { color: T.verde }]}>AI</Text>
            </Text>
            <Text style={[st.brandSub, { color: T.txtSec }]}>GANADO INTELIGENTE</Text>
          </View>
        )}
      </View>

      {/* ── 2. Nav items ── */}
      <ScrollView
        style={st.navScroll}
        contentContainerStyle={st.navContent}
        showsVerticalScrollIndicator={false}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              activeOpacity={0.75}
              onPress={() => navigateTo(item.route)}
              style={[
                st.navItem,
                collapsed && st.navItemMini,
                isActive && {
                  backgroundColor: T.verdeLuz,
                  borderLeftColor: collapsed ? "transparent" : T.verde,
                },
                !isActive && { borderLeftColor: "transparent" },
              ]}
            >
              <item.icon
                size={18}
                color={isActive ? T.verde : T.txtSec}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {!collapsed && (
                <Text
                  style={[
                    st.navLabel,
                    { color: isActive ? T.verde : T.txtSec },
                    isActive && { fontWeight: "700" },
                  ]}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── 3. Bottom area ── */}
      <View style={[st.bottomWrap, { borderTopColor: T.borde }]}>
        {collapsed ? (
          /* Collapsed: avatar centered + logout icon */
          <>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigateTo("Profile")}
              style={st.avatarCentered}
            >
              <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
                <Text style={st.avatarTxt}>{iniciales}</Text>
                <View style={[st.onlineDot, { backgroundColor: T.verde }]} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => cerrarSesion()}
              style={st.logoutIconBtn}
            >
              <LogOut size={18} color={T.rojo} strokeWidth={1.8} />
            </TouchableOpacity>
          </>
        ) : (
          /* Expanded: full user card + logout text + version */
          <>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigateTo("Profile")}
              style={st.userRow}
            >
              <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
                <Text style={st.avatarTxt}>{iniciales}</Text>
                <View style={[st.onlineDot, { backgroundColor: T.verde }]} />
              </View>
              <View style={st.userInfo}>
                <Text
                  style={[st.userName, { color: T.txtMain }]}
                  numberOfLines={1}
                >
                  {usuario?.nombre ?? "Usuario"}
                </Text>
                <Text
                  style={[st.userFinca, { color: T.txtSec }]}
                  numberOfLines={1}
                >
                  {usuario?.finca ?? "Sin finca"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => cerrarSesion()}
              style={st.logoutBtn}
            >
              <Text style={[st.logoutTxt, { color: T.rojo }]}>Cerrar sesión</Text>
            </TouchableOpacity>

            <Text style={[st.version, { color: T.txtTer }]}>v1.0.0</Text>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  sidebar: {
    width: 260,
    height: "100%",
    flexDirection: "column",
    borderRightWidth: 1,
  },
  sidebarMini: {
    width: 64,
  },

  // Logo area
  logoArea: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    borderBottomWidth: 1,
  },
  logoAreaMini: {
    justifyContent: "center",
    paddingHorizontal: 0,
    gap: 0,
  },
  logoImg: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  logoTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  brandRow: {
    fontSize: 13,
    lineHeight: 16,
  },
  brandMain: {
    fontWeight: "700",
    fontSize: 13,
  },
  brandAi: {
    fontWeight: "700",
    fontSize: 13,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Nav
  navScroll: {
    flex: 1,
  },
  navContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  navItemMini: {
    justifyContent: "center",
    paddingHorizontal: 0,
    borderLeftWidth: 0,
  },
  navLabel: {
    fontSize: 13.5,
    fontWeight: "500",
    flex: 1,
  },

  // Bottom section
  bottomWrap: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCentered: {
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  userFinca: {
    fontSize: 11,
    marginTop: 1,
  },
  logoutBtn: {
    paddingVertical: 6,
    alignItems: "center",
  },
  logoutTxt: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  logoutIconBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  version: {
    textAlign: "center",
    fontSize: 10,
  },
});
