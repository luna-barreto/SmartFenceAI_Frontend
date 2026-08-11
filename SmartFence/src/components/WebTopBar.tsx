import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { Bell, Menu } from "lucide-react-native";
import { useT } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import { useDrawer } from "@context/DrawerContext";
import { navigateTo } from "@navigation/navigationRef";
import { useDemoSim } from "@context/DemoSimContext";

// ─── Props ────────────────────────────────────────────────────────────────────
interface WebTopBarProps {
  titulo: string;
  sub?: string;
  conectado?: boolean;
  alertasCount?: number;
  rightContent?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WebTopBar({
  titulo,
  sub,
  conectado,
  alertasCount,
  rightContent,
}: WebTopBarProps) {
  const T = useT();
  const { usuario } = useAuth();
  const { openDrawer } = useDrawer();
  const { width } = useWindowDimensions();
  const isSm = width < 640;
  const { alertas } = useDemoSim();
  const noLeidas = alertas.filter((a) => !a.leida).length;

  const iniciales = (usuario?.nombre ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  // ── Mobile header (< 640px): hamburger + logo centered + bell + avatar ──────
  if (isSm) {
    return (
      <View style={{ backgroundColor: T.header, borderBottomColor: T.borde, borderBottomWidth: 1 }}>
        <View style={st.mobileBar}>
          {/* Hamburger */}
          <TouchableOpacity
            style={[st.iconBtn, { backgroundColor: T.headerBtn }]}
            onPress={openDrawer}
            activeOpacity={0.75}
          >
            <Menu size={20} color={T.txtSec} strokeWidth={1.8} />
          </TouchableOpacity>

          {/* Logo + brand — centrado absolutamente */}
          <View style={st.mobileLogo} pointerEvents="none">
            <Image
              source={require("../../assets/logotipo.png")}
              style={st.logoImg}
              resizeMode="contain"
            />
            <Text style={[st.logoText, { color: T.txtMain }]}>
              Smart<Text style={{ color: T.verdeBrillo, fontWeight: "900" }}>fence</Text>
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          {/* Bell + avatar */}
          <View style={st.mobileRight}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigateTo("Alerts")}
              style={[st.iconBtn, { backgroundColor: T.headerBtn }]}
            >
              <Bell size={18} color={T.txtSec} strokeWidth={1.8} />
              {noLeidas > 0 && (
                <View style={[st.bellBadge, { backgroundColor: T.rojo }]}>
                  <Text style={st.bellBadgeTxt}>
                    {noLeidas > 99 ? "99+" : String(noLeidas)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
              <Text style={st.avatarTxt}>{iniciales}</Text>
              <View style={[st.onlineDot, { backgroundColor: T.verde }]} />
            </View>
          </View>
        </View>

        {/* Optional rightContent below (e.g. Configuración button in Alerts) */}
        {rightContent && (
          <View style={st.actionRow}>
            {rightContent}
          </View>
        )}
      </View>
    );
  }

  // ── Desktop / tablet header (>= 640px) ─────────────────────────────────────
  return (
    <View style={{ backgroundColor: T.header, borderBottomColor: T.borde, borderBottomWidth: 1 }}>
      <View style={st.bar}>
        {/* Left: title + subtitle */}
        <View style={st.titleWrap}>
          <Text style={[st.titulo, { color: T.txtMain }]} numberOfLines={1}>
            {titulo}
          </Text>
          {sub && (
            <Text style={[st.sub, { color: T.txtSec }]} numberOfLines={1}>
              {sub}
            </Text>
          )}
        </View>

        <View style={st.spacer} />

        {/* Bell */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigateTo("Alerts")}
          style={[st.bellBtn, { backgroundColor: T.headerBtn }]}
        >
          <Bell size={18} color={T.txtSec} strokeWidth={1.8} />
          {noLeidas > 0 && (
            <View style={[st.bellBadge, { backgroundColor: T.rojo }]}>
              <Text style={st.bellBadgeTxt}>
                {noLeidas > 99 ? "99+" : String(noLeidas)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {rightContent ?? null}

        {/* User avatar */}
        <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
          <Text style={st.avatarTxt}>{iniciales}</Text>
          <View style={[st.onlineDot, { backgroundColor: T.verde }]} />
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  // Desktop bar
  bar: {
    minHeight: 52,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 8,
  },

  // Mobile bar
  mobileBar: {
    height: 52,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },

  // Mobile logo (centered absolute)
  mobileLogo: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  logoImg: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  logoText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Mobile right actions
  mobileRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Title
  titleWrap: {
    justifyContent: "center",
    flex: 1,
    minWidth: 0,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Inter",
  },
  sub: {
    fontSize: 12,
    marginTop: 1,
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Connected badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeTxt: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Bell button
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  bellBadgeTxt: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Action row (rightContent below mobile bar)
  actionRow: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  // Avatar
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
