import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Switch,
  StyleSheet, Platform, StatusBar, Image,
  Modal, TextInput, KeyboardAvoidingView,
  Alert, ActivityIndicator, Linking,
} from "react-native";
import {
  Menu, Bell, ArrowLeft, Pencil, MapPin, Clock,
  BellRing, MessageSquare, Info, Paintbrush, Moon,
  Sun, ShieldCheck, ChevronRight, HelpCircle,
  MessageCircle, Star, X, Check, Phone,
} from "lucide-react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useDrawer } from "@context/DrawerContext";
import { useAuth } from "@context/AuthContext";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useNavigation } from "@react-navigation/native";
import { useTema, useT } from "@context/ThemeContext";
import { useNotificationsCtx } from "@context/NotificationsContext";

const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

// ─── Ilustración finca mini (SVG) ─────────────────────────────────────────────
function IlustraFinca() {
  const T = useT();
  return (
    <Svg width={110} height={70} viewBox="0 0 110 70">
      <Rect x={0} y={0} width={110} height={70} rx={10} fill={T.cardElevada} />
      <Rect x={0} y={45} width={110} height={25} rx={0} fill={T.verdeOscuro} />
      <Rect x={30} y={28} width={28} height={20} fill={T.card} />
      <Path d="M28 30 L44 18 L60 30Z" fill={T.verde} />
      <Rect x={76} y={36} width={4} height={12} fill="#5D4037" />
      <Path d="M78 20 L88 40 L68 40Z" fill={T.verdeOscuro} />
      <Rect x={0} y={48} width={110} height={2} fill="rgba(255,255,255,0.3)" opacity={0.6} />
      <Rect x={10} y={44} width={2} height={8} fill="rgba(255,255,255,0.3)" opacity={0.6} />
      <Rect x={25} y={44} width={2} height={8} fill="rgba(255,255,255,0.3)" opacity={0.6} />
      <Rect x={40} y={44} width={2} height={8} fill="rgba(255,255,255,0.3)" opacity={0.6} />
      <Rect x={55} y={44} width={2} height={8} fill="rgba(255,255,255,0.3)" opacity={0.6} />
      <Rect x={70} y={44} width={2} height={8} fill="rgba(255,255,255,0.3)" opacity={0.6} />
      <Rect x={85} y={44} width={2} height={8} fill="rgba(255,255,255,0.3)" opacity={0.6} />
      <Rect x={100} y={44} width={2} height={8} fill="rgba(255,255,255,0.3)" opacity={0.6} />
    </Svg>
  );
}

// ─── Modal editar texto ───────────────────────────────────────────────────────
function EditModal({
  visible, titulo, valor, onGuardar, onCerrar,
}: {
  visible: boolean; titulo: string; valor: string;
  onGuardar: (v: string) => Promise<void>; onCerrar: () => void;
}) {
  const T = useT();
  const [texto, setTexto] = useState(valor);
  const [guardando, setGuardando] = useState(false);

  React.useEffect(() => { if (visible) setTexto(valor); }, [visible]);

  async function handleGuardar() {
    if (!texto.trim()) { Alert.alert("Campo vacío", "Este campo no puede estar vacío."); return; }
    setGuardando(true);
    try {
      await onGuardar(texto.trim());
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView style={em.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={[em.backdrop, { backgroundColor: "rgba(0,0,0,0.6)" }]} activeOpacity={1} onPress={onCerrar} />
        <View style={[em.sheet, { backgroundColor: T.card, borderColor: T.borde }]}>
          <View style={[em.handle, { backgroundColor: T.borde }]} />
          <View style={em.sheetHeader}>
            <Text style={[em.titulo, { color: T.txtMain }]}>{titulo}</Text>
            <TouchableOpacity style={[em.closeBtn, { backgroundColor: T.cardElevada }]} onPress={onCerrar} activeOpacity={0.7}>
              <X size={18} color={T.txtSec} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={[em.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput
              style={[em.input, { color: T.txtMain }]}
              value={texto}
              onChangeText={setTexto}
              autoFocus
              placeholderTextColor={T.txtSec}
            />
          </View>
          <TouchableOpacity
            style={[em.btnGuardar, { backgroundColor: T.verdeOscuro }, guardando && { opacity: 0.7 }]}
            onPress={handleGuardar} activeOpacity={0.85} disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Check size={16} color="#fff" strokeWidth={2.5} /><Text style={[em.btnTxt, { color: "#fff" }]}>Guardar</Text></>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const em = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: "flex-end" },
  backdrop:   { ...StyleSheet.absoluteFillObject },
  sheet:      { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, gap: 14, borderTopWidth: 1 },
  handle:     { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  sheetHeader:{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titulo:     { fontSize: 17, fontWeight: "800" },
  closeBtn:   { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  inputWrap:  { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14 },
  input:      { fontSize: 15, paddingVertical: 13 },
  btnGuardar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15, marginTop: 4 },
  btnTxt:     { fontSize: 15, fontWeight: "800" },
});

// ─── Cabecera de sección ──────────────────────────────────────────────────────
function SeccionHeader({
  icon: Icon, titulo, sub,
}: {
  icon: React.ComponentType<any>; titulo: string; sub: string;
}) {
  const T = useT();
  return (
    <View style={sh.row}>
      <View style={[sh.iconBox, { backgroundColor: T.verdeAlfa }]}>
        <Icon size={22} color={T.verde} strokeWidth={1.6} />
      </View>
      <View>
        <Text style={[sh.titulo, { color: T.txtMain }]}>{titulo}</Text>
        <Text style={[sh.sub, { color: T.txtSec }]}>{sub}</Text>
      </View>
    </View>
  );
}
const sh = StyleSheet.create({
  row:     { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  titulo:  { fontSize: 16, fontWeight: "800" },
  sub:     { fontSize: 12, marginTop: 1 },
});

// ─── Fila switch ──────────────────────────────────────────────────────────────
function FilaSwitch({
  icon: Icon, titulo, sub, valor, onChange, last,
}: {
  icon: React.ComponentType<any>; titulo: string; sub: string;
  valor: boolean; onChange: (v: boolean) => void; last?: boolean;
}) {
  const T = useT();
  return (
    <View style={[fs.row, !last && fs.rowBorder, !last && { borderBottomColor: T.borde }]}>
      <View style={[fs.iconBox, { backgroundColor: T.cardElevada }]}>
        <Icon size={18} color={T.txtSec} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[fs.titulo, { color: T.txtMain }]}>{titulo}</Text>
        <Text style={[fs.sub, { color: T.txtSec }]}>{sub}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: T.borde, true: T.verde }}
        thumbColor={T.txtMain}
        ios_backgroundColor={T.borde}
      />
    </View>
  );
}
const fs = StyleSheet.create({
  row:       { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1 },
  iconBox:   { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  titulo:    { fontSize: 13.5, fontWeight: "700" },
  sub:       { fontSize: 11.5, marginTop: 1 },
});

// ─── Fila de nav ──────────────────────────────────────────────────────────────
function FilaNav({
  icon: Icon, titulo, sub, color, bg,
  onPress, last,
}: {
  icon: React.ComponentType<any>; titulo: string; sub: string;
  color?: string; bg?: string; onPress?: () => void; last?: boolean;
}) {
  const T = useT();
  const iconBg = bg ?? T.cardElevada;
  const iconColor = color ?? T.txtMain;
  return (
    <TouchableOpacity
      style={[fn.row, !last && fn.rowBorder, !last && { borderBottomColor: T.borde }]}
      onPress={onPress} activeOpacity={0.72}
    >
      <View style={[fn.iconBox, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[fn.titulo, { color: T.txtMain }]}>{titulo}</Text>
        <Text style={[fn.sub, { color: T.txtSec }]}>{sub}</Text>
      </View>
      <ChevronRight size={15} color={T.txtSec} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}
const fn = StyleSheet.create({
  row:       { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1 },
  iconBox:   { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  titulo:    { fontSize: 13.5, fontWeight: "700" },
  sub:       { fontSize: 11.5, marginTop: 1 },
});

// ─── SettingsScreen ───────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const T = useT();
  const { openDrawer } = useDrawer();
  const { usuario, actualizarUsuario } = useAuth();
  const { oscuro: modoOscuro, alternarTema } = useTema();
  const { conectado } = useAnimalsCtx();
  const navigation = useNavigation<any>();

  const {
    habilitadas: notifPush,
    alertasBateria: notifBateria,
    alertasRuptura: notifRuptura,
    reporteDiario: notifReporte,
    permisoConcedido,
    setHabilitadas: setNotifPush,
    setAlertasBateria: setNotifBateria,
    setAlertasRuptura: setNotifRuptura,
    setReporteDiario: setNotifReporte,
  } = useNotificationsCtx();

  const [nombreFinca,  setNombreFinca]  = useState(usuario?.finca      ?? "Finca El Paraíso");
  const [intervalo,    setIntervalo]    = useState(4);
  const [notifSms,     setNotifSms]     = useState(false);
  const [editFinca,    setEditFinca]    = useState(false);

  async function guardarFinca(val: string): Promise<void> {
    setNombreFinca(val);
    await actualizarUsuario({ finca: val });
    setEditFinca(false);
    Alert.alert("✓ Guardado", "Nombre de la finca actualizado.");
  }

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>

      {/* ── Header ── */}
      <View style={[st.header, { backgroundColor: T.header, borderBottomColor: T.borde }]}>
        <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={T.txtMain} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[st.headerTitulo, { color: T.txtMain }]}>Configuración</Text>
          <Text style={[st.headerSub, { color: T.txtSec }]}>Personaliza tu experiencia en SmartFence AI</Text>
        </View>
        <View style={st.headerRight}>
          <View style={[st.conectadoBadge, { backgroundColor: T.verdeLuz }]}>
            <View style={[st.dot, { backgroundColor: conectado ? T.verde : T.rojo }]} />
            <Text style={[st.conectadoTxt, { color: conectado ? T.verdeBrillo : T.rojo }]}>
              {conectado ? "Conectado" : "Sin señal"}
            </Text>
          </View>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} activeOpacity={0.7}
            onPress={() => navigation.navigate("Alerts")}>
            <Bell size={20} color={T.txtMain} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        contentContainerStyle={st.scroll}>

        {/* ── Datos de la finca ── */}
        <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
          <SeccionHeader icon={MapPin} titulo="Datos de la finca" sub="Información básica de tu predio" />

          <View style={[st.campoCard, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <View style={{ flex: 1 }}>
              <Text style={[st.campoLabel, { color: T.txtMain }]}>Nombre de la finca</Text>
              <Text style={[st.campoSub, { color: T.txtSec }]}>Identificación del predio</Text>
              <Text style={[st.campoValor, { color: T.verdeBrillo }]}>{nombreFinca}</Text>
            </View>
            <TouchableOpacity style={[st.editBtn, { borderColor: T.verde }]} onPress={() => setEditFinca(true)} activeOpacity={0.8}>
              <Pencil size={13} color={T.verde} strokeWidth={2} />
              <Text style={[st.editBtnTxt, { color: T.verde }]}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Cerca virtual y sincronización ── */}
        <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
          <SeccionHeader icon={MapPin} titulo="Cerca virtual y sincronización"
            sub="Ajusta la frecuencia y sincronización de los dispositivos" />

          <View style={[st.campoCard, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <View style={{ flex: 1 }}>
              <Text style={[st.campoLabel, { color: T.txtMain }]}>Intervalo de sincronización</Text>
              <Text style={[st.campoSub, { color: T.txtSec }]}>Frecuencia de transmisión del collar → app</Text>
            </View>
            <View style={[st.segmentado, { backgroundColor: T.fondo }]}>
              {[2, 4, 8].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[st.segBtn, intervalo === s && { backgroundColor: T.verdeOscuro }]}
                  onPress={() => setIntervalo(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[st.segTxt, { color: intervalo === s ? "#fff" : T.txtSec }]}>{s}s</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[st.infoBanner, { backgroundColor: T.verdeMuy, borderColor: T.borde }]}>
            <Clock size={16} color={T.verde} strokeWidth={1.8} />
            <Text style={[st.infoTxt, { color: T.txtSec }]}>
              Un intervalo más corto usa más batería, pero ofrece actualizaciones más rápidas.
            </Text>
          </View>
        </View>

        {/* ── Notificaciones ── */}
        <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
          <SeccionHeader icon={BellRing} titulo="Notificaciones"
            sub="Elige cómo quieres recibir alertas" />

          <FilaSwitch icon={Bell}         titulo="Notificaciones push"
            sub={permisoConcedido ? "Activas en el sistema operativo" : "Permiso no concedido — toca para activar"}
            valor={notifPush} onChange={setNotifPush} />
          <FilaSwitch icon={MessageSquare} titulo="Notificaciones por SMS"
            sub="Respaldo cuando no hay internet en la finca"
            valor={notifSms} onChange={setNotifSms} />
          <FilaSwitch icon={BellRing}      titulo="Alertas de batería baja"
            sub="Aviso cuando un collar llega al 20%"
            valor={notifBateria} onChange={setNotifBateria} />
          <FilaSwitch icon={ShieldCheck}   titulo="Ruptura de cerca"
            sub="Alerta inmediata al salir del perímetro"
            valor={notifRuptura} onChange={setNotifRuptura} />
          <FilaSwitch icon={Clock}         titulo="Reporte diario"
            sub="Resumen a las 7:00 AM con el estado del rebaño"
            valor={notifReporte} onChange={setNotifReporte} last />

          <View style={[st.infoBanner, {
            backgroundColor: permisoConcedido ? T.verdeMuy : T.naranjaBg,
            borderColor: T.borde, marginTop: 10,
          }]}>
            <Info size={16} color={permisoConcedido ? T.verde : T.naranja} strokeWidth={1.8} />
            <Text style={[st.infoTxt, { color: T.txtSec }]}>
              {permisoConcedido
                ? "Las notificaciones del SO están activas. Recibirás alertas aunque la app esté cerrada."
                : "SmartFence AI necesita permiso de notificaciones para enviarte alertas cuando la app está cerrada. Activa las notificaciones en Configuración del sistema."}
            </Text>
          </View>
        </View>

        {/* ── Apariencia ── */}
        <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
          <SeccionHeader icon={Paintbrush} titulo="Apariencia"
            sub="Personaliza la apariencia de la aplicación" />

          <FilaSwitch icon={Moon} titulo="Modo oscuro"
            sub="Reduce el brillo en uso nocturno"
            valor={modoOscuro} onChange={alternarTema} last />

          {/* Selector visual de tema */}
          <View style={st.temaRow}>
            <TouchableOpacity
              style={[st.temaCard, { borderColor: !modoOscuro ? T.verde : T.borde }]}
              onPress={() => modoOscuro && alternarTema()} activeOpacity={0.85}
            >
              <View style={[st.temaPreviewClaro, { backgroundColor: "#F8FAF8" }]}>
                <View style={[st.temaBarraVerde, { backgroundColor: "#4F9E2C" }]} />
                <View style={[st.temaLineaGris, { backgroundColor: "#E5E7EB" }]} />
                <View style={[st.temaLineaGris, { backgroundColor: "#E5E7EB", width: "60%" }]} />
              </View>
              <View style={[st.temaFooter, { backgroundColor: T.card }]}>
                <Sun size={13} color={!modoOscuro ? T.verde : T.txtSec} strokeWidth={2} />
                <Text style={[st.temaTxt, { color: !modoOscuro ? T.verde : T.txtSec }]}>Claro</Text>
                {!modoOscuro && (
                  <View style={[st.temaCheck, { backgroundColor: T.verde }]}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[st.temaCard, { borderColor: modoOscuro ? T.verde : T.borde }]}
              onPress={() => !modoOscuro && alternarTema()} activeOpacity={0.85}
            >
              <View style={[st.temaPreviewOscuro, { backgroundColor: "#0B0F0E" }]}>
                <View style={[st.temaBarraOscura, { backgroundColor: "#242C29" }]} />
                <View style={[st.temaLineaGris, { backgroundColor: "#242C29" }]} />
                <View style={[st.temaLineaGris, { backgroundColor: "#242C29", width: "60%" }]} />
              </View>
              <View style={[st.temaFooter, { backgroundColor: T.card }]}>
                <Moon size={13} color={modoOscuro ? T.verde : T.txtSec} strokeWidth={2} />
                <Text style={[st.temaTxt, { color: modoOscuro ? T.verde : T.txtSec }]}>Oscuro</Text>
                {modoOscuro && (
                  <View style={[st.temaCheck, { backgroundColor: T.verde }]}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Ayuda y soporte ── */}
        <View style={[st.seccion, { backgroundColor: T.card, borderColor: T.borde }]}>
          <SeccionHeader icon={HelpCircle} titulo="Ayuda y soporte"
            sub="Centro de ayuda y contacto con SmartFence" />

          <FilaNav icon={HelpCircle}    titulo="Preguntas frecuentes"
            sub="Respuestas a las dudas más comunes" bg={T.verdeAlfa}
            color={T.verde}
            onPress={() => Alert.alert("FAQ", "Próximamente disponible.")} />
          <FilaNav icon={MessageCircle} titulo="Chat de soporte"
            sub="Habla con un agente en tiempo real" bg={T.azulBg}
            color={T.azul}
            onPress={() => Alert.alert("Soporte", "Próximamente disponible.")} />
          <FilaNav icon={Phone}         titulo="Línea de atención"
            sub="+57 300 000 0000 · Lun–Vie 8am–6pm" bg={T.verdeAlfa}
            color={T.verde}
            onPress={() => Linking.openURL("tel:+573000000000")} />
          <FilaNav icon={Star}          titulo="Calificar la app"
            sub="Tu opinión nos ayuda a mejorar" bg={T.naranjaBg}
            color={T.naranja}
            onPress={() => Alert.alert("Calificación", "Próximamente disponible.")}
            last />
        </View>

        {/* ── Banner seguridad ── */}
        <View style={[st.bannerSeg, { backgroundColor: T.card, borderColor: T.borde }]}>
          <View style={[st.bannerSegIcon, { backgroundColor: T.verdeAlfa }]}>
            <ShieldCheck size={26} color={T.verde} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[st.bannerSegTitulo, { color: T.verdeBrillo }]}>Tus datos están seguros</Text>
            <Text style={[st.bannerSegSub, { color: T.txtSec }]}>
              SmartFence AI protege la información de tu finca y tus animales.
            </Text>
          </View>
          <IlustraFinca />
        </View>

        <Text style={[st.version, { color: T.txtTer }]}>SmartFence AI · v1.0 MVP</Text>
        <View style={{ height: 28 }} />
      </ScrollView>

      {/* ── Modal editar finca ── */}
      <EditModal
        visible={editFinca}
        titulo="Nombre de la finca"
        valor={nombreFinca}
        onGuardar={guardarFinca}
        onCerrar={() => setEditFinca(false)}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1 },

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
    flexShrink: 0,
  },
  headerTitulo: { fontSize: 17, fontWeight: "900" },
  headerSub:    { fontSize: 11, marginTop: 1 },
  headerRight:  { flexDirection: "row", alignItems: "center", gap: 8 },
  conectadoBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  dot:          { width: 7, height: 7, borderRadius: 4 },
  conectadoTxt: { fontSize: 11, fontWeight: "700" },

  scroll: { padding: 16, gap: 16 },

  // Sección
  seccion: {
    borderRadius: 24, borderWidth: 1,
    padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 2,
  },

  // Campo editable
  campoCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, borderWidth: 1,
    padding: 14, gap: 10,
  },
  campoLabel: { fontSize: 13, fontWeight: "800" },
  campoSub:   { fontSize: 11, marginTop: 1 },
  campoValor: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1.5,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  editBtnTxt: { fontSize: 12, fontWeight: "700" },

  // Segmentado
  segmentado: {
    flexDirection: "row", gap: 4,
    borderRadius: 12, padding: 3,
  },
  segBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9,
  },
  segTxt: { fontSize: 13, fontWeight: "700" },

  // Info banner
  infoBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderRadius: 12, borderWidth: 1,
    padding: 12, marginTop: 4,
  },
  infoTxt: { flex: 1, fontSize: 11.5, lineHeight: 16 },

  // Temas
  temaRow:          { flexDirection: "row", gap: 10, marginTop: 12 },
  temaCard:         { flex: 1, borderRadius: 16, borderWidth: 1.5, overflow: "hidden" },
  temaPreviewClaro: { padding: 10, gap: 6 },
  temaPreviewOscuro:{ padding: 10, gap: 6 },
  temaBarraVerde:   { height: 10, borderRadius: 4, width: "100%" },
  temaBarraOscura:  { height: 10, borderRadius: 4, width: "100%" },
  temaLineaGris:    { height: 6, borderRadius: 3, width: "100%" },
  temaFooter: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  temaTxt:   { flex: 1, fontSize: 12, fontWeight: "700" },
  temaCheck: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },

  // Banner seguridad
  bannerSeg: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 24, borderWidth: 1,
    padding: 16, overflow: "hidden",
  },
  bannerSegIcon: {
    width: 50, height: 50, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  bannerSegTitulo: { fontSize: 14, fontWeight: "800" },
  bannerSegSub:    { fontSize: 11.5, marginTop: 3, lineHeight: 16 },

  version: { textAlign: "center", fontSize: 11, marginTop: 4 },
});
