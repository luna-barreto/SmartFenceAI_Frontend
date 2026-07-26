import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Bell } from "lucide-react-native";
import { useT } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import { navigateTo } from "@navigation/navigationRef";

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
  conectado = true,
  alertasCount = 0,
  rightContent,
}: WebTopBarProps) {
  const T = useT();
  const { usuario } = useAuth();

  const iniciales = (usuario?.nombre ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        st.bar,
        { backgroundColor: T.header, borderBottomColor: T.borde },
      ]}
    >
      {/* ── Left: title + subtitle ── */}
      <View style={st.titleWrap}>
        <Text style={[st.titulo, { color: T.txtMain }]} numberOfLines={1}>
          {titulo}
        </Text>
        {sub ? (
          <Text style={[st.sub, { color: T.txtSec }]} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>

      {/* ── Spacer ── */}
      <View style={st.spacer} />

      {/* ── Connected status badge ── */}
      <View
        style={[
          st.badge,
          { backgroundColor: conectado ? T.verdeMuy : T.rojoBg },
        ]}
      >
        <View
          style={[
            st.badgeDot,
            { backgroundColor: conectado ? T.verde : T.rojo },
          ]}
        />
        <Text
          style={[
            st.badgeTxt,
            { color: conectado ? T.verde : T.rojo },
          ]}
        >
          {conectado ? "Conectado" : "Sin señal"}
        </Text>
      </View>

      {/* ── Bell button ── */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => navigateTo("Alerts")}
        style={[st.bellBtn, { backgroundColor: T.headerBtn }]}
      >
        <Bell size={18} color={T.txtSec} strokeWidth={1.8} />
        {alertasCount > 0 && (
          <View style={[st.bellBadge, { backgroundColor: T.rojo }]}>
            <Text style={st.bellBadgeTxt}>
              {alertasCount > 99 ? "99+" : String(alertasCount)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── rightContent slot ── */}
      {rightContent ?? null}

      {/* ── User avatar ── */}
      <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
        <Text style={st.avatarTxt}>{iniciales}</Text>
        <View style={[st.onlineDot, { backgroundColor: T.verde }]} />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  bar: {
    height: 56,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 16,
    borderBottomWidth: 1,
  },

  // Title
  titleWrap: {
    justifyContent: "center",
  },
  titulo: {
    fontSize: 18,
    fontWeight: "800",
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
