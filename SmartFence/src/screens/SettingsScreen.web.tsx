import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch,
} from "react-native";
import {
  Bell, BellRing, CheckCircle2, ChevronDown, Clock,
  Cpu, Mail, MapPin, MessageSquare, Monitor, Paintbrush,
  Pencil, Check, Settings, Shield, Users,
} from "lucide-react-native";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import { useAuth } from "@context/AuthContext";
import { useAnimals } from "@hooks/useAnimals";
import { useT, useTema } from "@context/ThemeContext";
import { useNotificationsCtx } from "@context/NotificationsContext";
import { navigateTo } from "@navigation/navigationRef";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { key: "General",           label: "General",           Icon: Settings },
  { key: "Notificaciones",    label: "Notificaciones",    Icon: Bell     },
  { key: "Dispositivos",      label: "Dispositivos",      Icon: Cpu      },
  { key: "Mapa y ubicación",  label: "Mapa y ubicación",  Icon: MapPin   },
  { key: "Usuarios",          label: "Usuarios",          Icon: Users    },
  { key: "Seguridad",         label: "Seguridad",         Icon: Shield   },
  { key: "Sistema",           label: "Sistema",           Icon: Monitor  },
] as const;

// ─── SettingsScreen (web) ─────────────────────────────────────────────────────
export default function SettingsScreenWeb() {
  const T = useT();
  const { usuario, actualizarUsuario } = useAuth();
  const { oscuro, alternarTema } = useTema();
  const { conectado } = useAnimals();
  const { habilitadas: notifPush, setHabilitadas: setNotifPush } = useNotificationsCtx();

  const [nombreFinca, setNombreFinca] = useState(usuario?.finca ?? "Finca El Paraíso");
  const [intervalo,   setIntervalo]   = useState(4);
  const [notifCorreo, setNotifCorreo] = useState(true);
  const [activeTab,   setActiveTab]   = useState("General");

  // ── rightContent for WebTopBar ──
  const rightContent = (
    <View style={s.rightItems}>
      <View style={[s.connBadge, { backgroundColor: T.verdeMuy }]}>
        <View style={[s.connDot, { backgroundColor: T.verde }]} />
        <Text style={[s.connTxt, { color: T.verde }]}>Conectado</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => navigateTo("Alerts")}
        style={[s.bellBtn, { backgroundColor: T.cardElevada, borderColor: T.borde }]}
      >
        <Bell size={18} color={T.txtSec} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Settings" />

      <View style={s.main}>
        <WebTopBar
          titulo="Configuración"
          sub="Personaliza tu experiencia en SmartFence AI"
          rightContent={rightContent}
        />

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Tab navigation row ── */}
          <View style={[s.tabRow, { borderBottomColor: T.borde }]}>
            {TABS.map(({ key, label, Icon }) => {
              const isActive = activeTab === key;
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.75}
                  onPress={() => setActiveTab(key)}
                  style={[
                    s.tab,
                    { borderBottomColor: isActive ? T.verdeOscuro : "transparent" },
                  ]}
                >
                  <Icon
                    size={14}
                    color={isActive ? T.verdeOscuro : T.txtSec}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <Text
                    style={[
                      s.tabLabel,
                      { color: isActive ? T.verdeOscuro : T.txtSec },
                      isActive && s.tabLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Content ── */}
          {activeTab !== "General" ? (
            <View style={s.proximamente}>
              <Text style={[s.proximamenteTxt, { color: T.txtSec }]}>Próximamente</Text>
            </View>
          ) : (
            <View style={s.columns}>
              {/* ── LEFT COLUMN ── */}
              <View style={s.colLeft}>

                {/* Datos de la finca */}
                <View style={[s.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                  <View style={s.cardHeader}>
                    <MapPin size={20} color={T.verde} strokeWidth={1.8} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cardTitle, { color: T.txtMain }]}>Datos de la finca</Text>
                      <Text style={[s.cardSub, { color: T.txtSec }]}>Información básica de tu predio</Text>
                    </View>
                  </View>
                  <View style={[s.divider, { backgroundColor: T.borde }]} />
                  <Text style={[s.label, { color: T.txtSec }]}>NOMBRE DE LA FINCA</Text>
                  <View style={[s.inputRow, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                    <TextInput
                      value={nombreFinca}
                      onChangeText={setNombreFinca}
                      style={[s.inputField, { color: T.txtMain }]}
                      placeholderTextColor={T.txtTer}
                    />
                    <TouchableOpacity
                      activeOpacity={0.75}
                      style={[s.editBtn, { backgroundColor: T.verdeLuz }]}
                    >
                      <Pencil size={12} color={T.verde} strokeWidth={2} />
                      <Text style={[s.editBtnTxt, { color: T.verde }]}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Cerca virtual y sincronización */}
                <View style={[s.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                  <View style={s.cardHeader}>
                    <Clock size={20} color={T.verde} strokeWidth={1.8} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cardTitle, { color: T.txtMain }]}>Cerca virtual y sincronización</Text>
                      <Text style={[s.cardSub, { color: T.txtSec }]}>Ajusta la frecuencia de los dispositivos</Text>
                    </View>
                  </View>
                  <View style={[s.divider, { backgroundColor: T.borde }]} />
                  <Text style={[s.label, { color: T.txtSec }]}>INTERVALO DE SINCRONIZACIÓN</Text>
                  <Text style={[s.sublabel, { color: T.txtTer }]}>
                    Frecuencia de transmisión del collar → app
                  </Text>
                  <View style={s.segRow}>
                    {([2, 4, 8] as const).map((sec) => (
                      <TouchableOpacity
                        key={sec}
                        activeOpacity={0.75}
                        onPress={() => setIntervalo(sec)}
                        style={[
                          s.segBtn,
                          intervalo === sec
                            ? { backgroundColor: T.verdeOscuro }
                            : { backgroundColor: T.cardElevada },
                        ]}
                      >
                        <Text
                          style={[
                            s.segTxt,
                            { color: intervalo === sec ? "#fff" : T.txtSec },
                          ]}
                        >
                          {sec}s
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={[s.infoBanner, { backgroundColor: T.verdeMuy }]}>
                    <Clock size={15} color={T.verde} strokeWidth={1.8} />
                    <Text style={[s.infoTxt, { color: T.txtSec }]}>
                      Un intervalo más corto usa más batería, pero ofrece actualizaciones más rápidas.
                    </Text>
                  </View>
                </View>

              </View>

              {/* ── RIGHT COLUMN ── */}
              <View style={s.colRight}>

                {/* Notificaciones */}
                <View style={[s.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                  <View style={s.cardHeader}>
                    <BellRing size={20} color={T.verde} strokeWidth={1.8} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cardTitle, { color: T.txtMain }]}>Notificaciones</Text>
                      <Text style={[s.cardSub, { color: T.txtSec }]}>Elige cómo quieres recibir alertas</Text>
                    </View>
                  </View>
                  <View style={[s.divider, { backgroundColor: T.borde }]} />

                  {[
                    {
                      Icon: Bell,
                      title: "Notificaciones push",
                      sub: "Alertas instantáneas en la app",
                      value: notifPush,
                      onChange: setNotifPush,
                    },
                    {
                      Icon: MessageSquare,
                      title: "Notificaciones por SMS",
                      sub: "Respaldo cuando no hay internet",
                      value: false,
                      onChange: (_v: boolean) => {},
                    },
                    {
                      Icon: Mail,
                      title: "Alertas por correo",
                      sub: "Resumen diario de eventos importantes",
                      value: notifCorreo,
                      onChange: setNotifCorreo,
                    },
                  ].map(({ Icon, title, sub, value, onChange }, idx, arr) => (
                    <View
                      key={title}
                      style={[
                        s.switchRow,
                        idx < arr.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: T.borde,
                        },
                      ]}
                    >
                      <View style={[s.switchIcon, { backgroundColor: T.verdeMuy }]}>
                        <Icon size={16} color={T.verde} strokeWidth={1.8} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.switchTitle, { color: T.txtMain }]}>{title}</Text>
                        <Text style={[s.switchSub, { color: T.txtSec }]}>{sub}</Text>
                      </View>
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        trackColor={{ false: T.borde, true: T.verde }}
                        thumbColor={T.verdeOscuro}
                      />
                    </View>
                  ))}

                  <View style={[s.infoBanner, { backgroundColor: T.verdeMuy, marginTop: 8 }]}>
                    <Text style={[s.infoTxt, { color: T.txtSec }]}>
                      Te notificaremos cuando un animal salga del perímetro, batería baja o si hay algún problema con el dispositivo.
                    </Text>
                  </View>
                </View>

                {/* Apariencia */}
                <View style={[s.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                  <View style={s.cardHeader}>
                    <Paintbrush size={20} color={T.verde} strokeWidth={1.8} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cardTitle, { color: T.txtMain }]}>Apariencia</Text>
                      <Text style={[s.cardSub, { color: T.txtSec }]}>
                        Personaliza la apariencia de la aplicación
                      </Text>
                    </View>
                  </View>
                  <View style={[s.divider, { backgroundColor: T.borde }]} />
                  <View style={s.temaRow}>
                    {/* Modo claro */}
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => oscuro && alternarTema()}
                      style={[s.temaOption, { borderColor: !oscuro ? T.verde : T.borde }]}
                    >
                      <View style={[s.temaPreview, { backgroundColor: T.cardElevada }]}>
                        <View style={[s.temaHeader, { backgroundColor: T.borde }]} />
                        <View style={[s.temaBar, { backgroundColor: T.borde }]} />
                        <View style={[s.temaBar, { backgroundColor: T.borde, width: "60%" }]} />
                        {!oscuro && (
                          <View style={s.temaCheckBadge}>
                            <CheckCircle2 size={16} color={T.verde} strokeWidth={2} />
                          </View>
                        )}
                      </View>
                      <Text style={[s.temaLabel, { color: T.txtMain }]}>Modo claro</Text>
                      <Text style={[s.temaSub, { color: T.txtSec }]}>Interfaz con fondo claro</Text>
                    </TouchableOpacity>
                    {/* Modo oscuro */}
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => !oscuro && alternarTema()}
                      style={[s.temaOption, { borderColor: oscuro ? T.verde : T.borde }]}
                    >
                      <View style={[s.temaPreview, { backgroundColor: "#1A211F" }]}>
                        <View style={[s.temaHeader, { backgroundColor: "#242C29" }]} />
                        <View style={[s.temaBar, { backgroundColor: "#242C29" }]} />
                        <View style={[s.temaBar, { backgroundColor: "#242C29", width: "60%" }]} />
                        {oscuro && (
                          <View style={s.temaCheckBadge}>
                            <CheckCircle2 size={16} color={T.verde} strokeWidth={2} />
                          </View>
                        )}
                      </View>
                      <Text style={[s.temaLabel, { color: T.txtMain }]}>Modo oscuro</Text>
                      <Text style={[s.temaSub, { color: T.txtSec }]}>Interfaz con fondo oscuro</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Zona horaria */}
                <View style={[s.card, { backgroundColor: T.card, borderColor: T.borde }]}>
                  <View style={s.cardHeader}>
                    <Clock size={20} color={T.verde} strokeWidth={1.8} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cardTitle, { color: T.txtMain }]}>Zona horaria</Text>
                      <Text style={[s.cardSub, { color: T.txtSec }]}>
                        Selecciona la zona horaria de tu ubicación
                      </Text>
                    </View>
                  </View>
                  <View style={[s.divider, { backgroundColor: T.borde }]} />
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={[s.dropdown, { backgroundColor: T.cardElevada, borderColor: T.borde }]}
                  >
                    <Text style={[s.dropdownTxt, { color: T.txtMain }]}>
                      (GMT-05:00) Bogotá, Lima, Quito
                    </Text>
                    <ChevronDown size={14} color={T.txtTer} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          )}

          {/* ── Bottom action bar ── */}
          <View style={s.bottomBar}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={[s.resetBtn, { borderColor: T.borde }]}
            >
              <Text style={[s.resetTxt, { color: T.txtSec }]}>Restablecer configuración</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              activeOpacity={0.75}
              style={[s.saveBtn, { backgroundColor: T.verdeOscuro }]}
            >
              <Check size={16} color="#fff" strokeWidth={2.5} />
              <Text style={s.saveTxt}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flexDirection: "row", flex: 1 },
  main: { flex: 1, flexDirection: "column" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 32, paddingTop: 24, paddingBottom: 40 },

  // ── rightContent ──
  rightItems: { flexDirection: "row", alignItems: "center", gap: 10 },
  connBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  connDot:  { width: 8, height: 8, borderRadius: 4 },
  connTxt:  { fontSize: 13, fontWeight: "700" },
  bellBtn: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: "row", gap: 0,
    marginBottom: 28, borderBottomWidth: 1,
  },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabLabel:       { fontSize: 13 },
  tabLabelActive: { fontWeight: "700" },

  // ── Placeholder ──
  proximamente:    { paddingTop: 60, alignItems: "center" },
  proximamenteTxt: { fontSize: 15 },

  // ── Columns ──
  columns:  { flexDirection: "row", gap: 24, alignItems: "flex-start" },
  colLeft:  { flex: 1, gap: 20 },
  colRight: { width: 380, gap: 20 },

  // ── Card ──
  card: { borderRadius: 16, borderWidth: 1, padding: 24 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardTitle:  { fontSize: 16, fontWeight: "800" },
  cardSub:    { fontSize: 12, marginTop: 2 },
  divider:    { height: 1, marginVertical: 16 },
  label: {
    fontSize: 11, fontWeight: "700",
    textTransform: "uppercase", marginBottom: 8,
  },
  sublabel: { fontSize: 11, marginBottom: 12 },

  // ── Input row (farm name) ──
  inputRow: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, height: 44,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  inputField: { flex: 1, fontSize: 15 },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  editBtnTxt: { fontSize: 12, fontWeight: "700" },

  // ── Segmented control ──
  segRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  segBtn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 10 },
  segTxt: { fontSize: 13, fontWeight: "700" },

  // ── Info banner ──
  infoBanner: {
    borderRadius: 12, padding: 12,
    flexDirection: "row", gap: 8, alignItems: "flex-start",
  },
  infoTxt: { flex: 1, fontSize: 12, lineHeight: 17 },

  // ── Switch rows ──
  switchRow: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14,
  },
  switchIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  switchTitle: { fontSize: 13, fontWeight: "600" },
  switchSub:   { fontSize: 11, marginTop: 1 },

  // ── Appearance ──
  temaRow: { flexDirection: "row", gap: 12 },
  temaOption: {
    flex: 1, borderRadius: 12, borderWidth: 2, overflow: "hidden",
  },
  temaPreview: {
    height: 70, padding: 8, gap: 6,
  },
  temaHeader: { height: 14, borderRadius: 4, width: "100%" },
  temaBar:    { height: 6, borderRadius: 3, width: "100%" },
  temaCheckBadge: { position: "absolute", top: 6, right: 6 },
  temaLabel: { fontSize: 12, fontWeight: "700", paddingHorizontal: 8, paddingTop: 6 },
  temaSub:   { fontSize: 10, paddingHorizontal: 8, paddingBottom: 8 },

  // ── Timezone dropdown ──
  dropdown: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  dropdownTxt: { fontSize: 13 },

  // ── Bottom bar ──
  bottomBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 8,
  },
  resetBtn: {
    borderWidth: 1, borderRadius: 12,
    paddingVertical: 11, paddingHorizontal: 20,
  },
  resetTxt: { fontSize: 13 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingVertical: 11, paddingHorizontal: 24,
  },
  saveTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
