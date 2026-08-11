import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch, useWindowDimensions, ActivityIndicator, Alert,
} from "react-native";
import {
  Bell, BellRing, CheckCircle2, ChevronDown, Clock,
  Mail, MapPin, MessageSquare, Paintbrush,
  Pencil, Check, Settings, Shield, Lock, Eye, EyeOff,
  LogIn, Smartphone, AlertTriangle, KeyRound, ShieldCheck,
  X, Laptop,
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
  { key: "General",   label: "General",   Icon: Settings },
  { key: "Seguridad", label: "Seguridad", Icon: Shield   },
] as const;

// ─── SettingsScreen (web) ─────────────────────────────────────────────────────
export default function SettingsScreenWeb() {
  const T = useT();
  const { usuario } = useAuth();
  const { oscuro, alternarTema } = useTema();
  const { habilitadas: notifPush, setHabilitadas: setNotifPush } = useNotificationsCtx();
  const [nombreFinca, setNombreFinca] = useState(usuario?.finca ?? "");
  const [intervalo,   setIntervalo]   = useState(4);
  const [notifCorreo, setNotifCorreo] = useState(true);
  const [activeTab,   setActiveTab]   = useState("General");

  // ── Seguridad ──
  const [passActual,    setPassActual]    = useState("");
  const [passNueva,     setPassNueva]     = useState("");
  const [passConfirm,   setPassConfirm]   = useState("");
  const [verActual,     setVerActual]     = useState(false);
  const [verNueva,      setVerNueva]      = useState(false);
  const [verConfirm,    setVerConfirm]    = useState(false);
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [dosFactor,     setDosFactor]     = useState(false);

  const { width } = useWindowDimensions();
  // Breakpoints
  const isDesktop = width >= 1100;
  const isTablet  = width >= 640;
  // derived helpers
  const cardPad    = isTablet ? 24 : 16;
  const scrollPad  = isDesktop ? 28 : isTablet ? 18 : 12;
  const titleSize  = isTablet ? 16 : 15;

  useEffect(() => {
    if (usuario?.finca) setNombreFinca(usuario.finca);
  }, [usuario?.finca]);

  async function cambiarContrasena() {
    if (!passNueva.trim()) { Alert.alert("Validación", "Ingresa una contraseña nueva."); return; }
    if (passNueva !== passConfirm) { Alert.alert("Validación", "Las contraseñas nuevas no coinciden."); return; }
    if (passNueva.length < 8) { Alert.alert("Validación", "La contraseña debe tener al menos 8 caracteres."); return; }
    setGuardandoPass(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // demo delay
      setPassActual(""); setPassNueva(""); setPassConfirm("");
      Alert.alert("Éxito", "Contraseña actualizada correctamente.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo cambiar la contraseña.");
    } finally {
      setGuardandoPass(false);
    }
  }

  // ── Shared card shell ──────────────────────────────────────────────────────
  function Card({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
    return (
      <View style={[
        s.card,
        { backgroundColor: T.card, borderColor: danger ? "#fca5a5" : T.borde, padding: cardPad },
      ]}>
        {children}
      </View>
    );
  }

  function CardHeader({
    icon: Icon, title, sub, iconBg, iconColor, titleColor,
  }: {
    icon: React.ComponentType<any>; title: string; sub: string;
    iconBg?: string; iconColor?: string; titleColor?: string;
  }) {
    return (
      <View style={s.cardHeader}>
        <View style={[s.secIconBox, { backgroundColor: iconBg ?? T.verdeLuz }]}>
          <Icon size={isTablet ? 20 : 18} color={iconColor ?? T.verde} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.cardTitle, { color: titleColor ?? T.txtMain, fontSize: titleSize }]}>{title}</Text>
          <Text style={[s.cardSub, { color: T.txtSec }]}>{sub}</Text>
        </View>
      </View>
    );
  }

  function Divider({ danger }: { danger?: boolean }) {
    return <View style={[s.divider, { backgroundColor: danger ? "#fca5a5" : T.borde }]} />;
  }

  // ── Password field ─────────────────────────────────────────────────────────
  function PassField({
    label, value, onChange, placeholder, visible, onToggle, mt,
  }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder: string; visible: boolean; onToggle: () => void; mt?: number;
  }) {
    return (
      <>
        <Text style={[s.label, { color: T.txtSec, marginTop: mt ?? 0 }]}>{label}</Text>
        <View style={[s.passRow, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
          <TextInput
            value={value}
            onChangeText={onChange}
            secureTextEntry={!visible}
            placeholder={placeholder}
            placeholderTextColor={T.txtTer}
            style={[s.passInput, { color: T.txtMain }] as any}
            editable={!guardandoPass}
          />
          <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
            {visible
              ? <EyeOff size={16} color={T.txtSec} strokeWidth={1.8} />
              : <Eye    size={16} color={T.txtSec} strokeWidth={1.8} />}
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // ── Tab Seguridad content ──────────────────────────────────────────────────
  const seguridadContent = (
    <View style={[s.columns, !isDesktop && s.columnsSingle]}>

      {/* LEFT: Cambiar contraseña + Sesiones */}
      <View style={s.colLeft}>
        <Card>
          <CardHeader icon={KeyRound} title="Cambiar contraseña" sub="Actualiza tu contraseña de acceso" />
          <Divider />

          <PassField
            label="CONTRASEÑA ACTUAL"
            value={passActual} onChange={setPassActual}
            placeholder="Ingresa tu contraseña actual"
            visible={verActual} onToggle={() => setVerActual(v => !v)}
          />
          <PassField
            label="NUEVA CONTRASEÑA"
            value={passNueva} onChange={setPassNueva}
            placeholder="Mínimo 8 caracteres"
            visible={verNueva} onToggle={() => setVerNueva(v => !v)}
            mt={14}
          />
          <PassField
            label="CONFIRMAR CONTRASEÑA"
            value={passConfirm} onChange={setPassConfirm}
            placeholder="Repite la nueva contraseña"
            visible={verConfirm} onToggle={() => setVerConfirm(v => !v)}
            mt={14}
          />

          {passNueva.length > 0 && (
            <View style={s.strengthRow}>
              {[1, 2, 3, 4].map(n => {
                const len = passNueva.length;
                const active = (n === 1 && len >= 1) || (n === 2 && len >= 6) ||
                               (n === 3 && len >= 10) || (n === 4 && len >= 14);
                const color = len < 6 ? "#ef4444" : len < 10 ? "#f97316" : len < 14 ? "#eab308" : T.verde;
                return <View key={n} style={[s.strengthBar, { backgroundColor: active ? color : T.borde }]} />;
              })}
              <Text style={[s.strengthTxt, { color: T.txtTer }]}>
                {passNueva.length < 6 ? "Muy débil" : passNueva.length < 10 ? "Débil" :
                 passNueva.length < 14 ? "Fuerte" : "Muy fuerte"}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={cambiarContrasena}
            disabled={guardandoPass}
            activeOpacity={0.8}
            style={[s.passBtn, { backgroundColor: guardandoPass ? T.verdeOscuro : T.verde }]}
          >
            {guardandoPass ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check size={16} color="#fff" strokeWidth={2.5} />
                <Text style={s.passBtnTxt}>Actualizar contraseña</Text>
              </>
            )}
          </TouchableOpacity>
        </Card>

        {/* Sesiones activas */}
        <Card>
          <CardHeader icon={LogIn} title="Sesiones activas" sub="Dispositivos con sesión iniciada" />
          <Divider />
          {[
            { icon: Laptop,     label: "Este dispositivo",  sub: "Navegador web • Activo ahora",   badge: "Actual" },
            { icon: Smartphone, label: "Dispositivo móvil", sub: "Última actividad hace 2 días",   badge: null },
          ].map(({ icon: Icon, label, sub, badge }, idx, arr) => (
            <View
              key={label}
              style={[s.sessionRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.borde }]}
            >
              <View style={[s.sessionIcon, { backgroundColor: T.verdeMuy }]}>
                <Icon size={18} color={T.verde} strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.sessionLabelRow}>
                  <Text style={[s.sessionLabel, { color: T.txtMain }]}>{label}</Text>
                  {badge && (
                    <View style={[s.sessionBadge, { backgroundColor: T.verdeAlfa }]}>
                      <Text style={[s.sessionBadgeTxt, { color: T.verde }]}>{badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.sessionSub, { color: T.txtSec }]}>{sub}</Text>
              </View>
              {!badge && (
                <TouchableOpacity activeOpacity={0.75}>
                  <X size={16} color={T.rojo} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Card>
      </View>

      {/* RIGHT: 2FA + Info + Zona peligro */}
      <View style={[s.colRight, !isDesktop && s.colRightFull]}>

        {/* Verificación en dos pasos */}
        <Card>
          <CardHeader icon={ShieldCheck} title="Verificación en dos pasos" sub="Añade una capa extra de seguridad" />
          <Divider />
          <View style={s.switchRow}>
            <View style={[s.switchIcon, { backgroundColor: T.verdeMuy }]}>
              <Smartphone size={16} color={T.verde} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.switchTitle, { color: T.txtMain }]}>Autenticación de dos factores</Text>
              <Text style={[s.switchSub, { color: T.txtSec }]}>Código por app autenticadora</Text>
            </View>
            <Switch
              value={dosFactor}
              onValueChange={setDosFactor}
              trackColor={{ false: T.borde, true: T.verde }}
              thumbColor={T.verdeOscuro}
            />
          </View>
          <View style={[s.infoBanner, { backgroundColor: T.verdeMuy, marginTop: 8 }]}>
            <ShieldCheck size={15} color={T.verde} strokeWidth={1.8} />
            <Text style={[s.infoTxt, { color: T.txtSec }]}>
              Al activarla, necesitarás un código de tu app autenticadora cada vez que inicies sesión.
            </Text>
          </View>
        </Card>

        {/* Info de acceso */}
        <Card>
          <CardHeader icon={Lock} title="Información de acceso" sub="Resumen de tu cuenta" />
          <Divider />
          {[
            { label: "Correo",       value: usuario?.correo ?? "—" },
            { label: "Rol",          value: usuario?.rol    ?? "Ganadero" },
            { label: "Estado",       value: "Activa" },
            { label: "Último acceso",value: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) },
          ].map(({ label, value }, idx, arr) => (
            <View
              key={label}
              style={[s.infoRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.borde }]}
            >
              <Text style={[s.infoRowLabel, { color: T.txtSec }]}>{label}</Text>
              <Text style={[s.infoRowValue, { color: T.txtMain }]} numberOfLines={1}>{value}</Text>
            </View>
          ))}
        </Card>

        {/* Zona de peligro */}
        <Card danger>
          <CardHeader
            icon={AlertTriangle} title="Zona de peligro" sub="Acciones irreversibles de cuenta"
            iconBg={T.rojoBg} iconColor={T.rojo} titleColor={T.rojo}
          />
          <Divider danger />
          <TouchableOpacity
            activeOpacity={0.8}
            style={[s.dangerBtn, { borderColor: T.rojo }]}
            onPress={() =>
              Alert.alert(
                "Eliminar cuenta",
                "Esta acción es permanente e irreversible. ¿Deseas continuar?",
                [{ text: "Cancelar", style: "cancel" }, { text: "Eliminar", style: "destructive" }]
              )
            }
          >
            <X size={15} color={T.rojo} strokeWidth={2.2} />
            <Text style={[s.dangerBtnTxt, { color: T.rojo }]}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </Card>

      </View>
    </View>
  );

  // ── Tab General content ────────────────────────────────────────────────────
  const generalContent = (
    <View style={[s.columns, !isDesktop && s.columnsSingle]}>

      {/* LEFT */}
      <View style={s.colLeft}>
        <Card>
          <CardHeader icon={MapPin} title="Datos de la finca" sub="Información básica de tu predio" />
          <Divider />
          <Text style={[s.label, { color: T.txtSec }]}>NOMBRE DE LA FINCA</Text>
          <View style={[s.inputRow, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput
              value={nombreFinca}
              onChangeText={setNombreFinca}
              style={[s.inputField, { color: T.txtMain }]}
              placeholderTextColor={T.txtTer}
            />
            <TouchableOpacity activeOpacity={0.75} style={[s.editBtn, { backgroundColor: T.verdeLuz }]}>
              <Pencil size={12} color={T.verde} strokeWidth={2} />
              <Text style={[s.editBtnTxt, { color: T.verde }]}>Editar</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card>
          <CardHeader icon={Clock} title="Cerca virtual y sincronización" sub="Ajusta la frecuencia de los dispositivos" />
          <Divider />
          <Text style={[s.label, { color: T.txtSec }]}>INTERVALO DE SINCRONIZACIÓN</Text>
          <Text style={[s.sublabel, { color: T.txtTer }]}>Frecuencia de transmisión del collar → app</Text>
          <View style={s.segRow}>
            {([2, 4, 8] as const).map((sec) => (
              <TouchableOpacity
                key={sec}
                activeOpacity={0.75}
                onPress={() => setIntervalo(sec)}
                style={[
                  s.segBtn,
                  { backgroundColor: intervalo === sec ? T.verdeOscuro : T.cardElevada },
                ]}
              >
                <Text style={[s.segTxt, { color: intervalo === sec ? "#fff" : T.txtSec }]}>{sec}s</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[s.infoBanner, { backgroundColor: T.verdeMuy }]}>
            <Clock size={15} color={T.verde} strokeWidth={1.8} />
            <Text style={[s.infoTxt, { color: T.txtSec }]}>
              Un intervalo más corto usa más batería, pero ofrece actualizaciones más rápidas.
            </Text>
          </View>
        </Card>
      </View>

      {/* RIGHT */}
      <View style={[s.colRight, !isDesktop && s.colRightFull]}>

        <Card>
          <CardHeader icon={BellRing} title="Notificaciones" sub="Elige cómo quieres recibir alertas" />
          <Divider />
          {[
            { Icon: Bell,         title: "Notificaciones push",    sub: "Alertas instantáneas en la app",           value: notifPush,   onChange: setNotifPush },
            { Icon: MessageSquare,title: "Notificaciones por SMS", sub: "Respaldo cuando no hay internet",          value: false,       onChange: (_v: boolean) => {} },
            { Icon: Mail,         title: "Alertas por correo",     sub: "Resumen diario de eventos importantes",    value: notifCorreo, onChange: setNotifCorreo },
          ].map(({ Icon, title, sub, value, onChange }, idx, arr) => (
            <View
              key={title}
              style={[s.switchRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.borde }]}
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
        </Card>

        <Card>
          <CardHeader icon={Paintbrush} title="Apariencia" sub="Personaliza la apariencia de la aplicación" />
          <Divider />
          <View style={s.temaRow}>
            {[
              { dark: false, label: "Modo claro",  sub: "Interfaz con fondo claro" },
              { dark: true,  label: "Modo oscuro", sub: "Interfaz con fondo oscuro" },
            ].map(({ dark, label, sub }) => {
              const isActive = oscuro === dark;
              return (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.75}
                  onPress={() => oscuro !== dark && alternarTema()}
                  style={[s.temaOption, { borderColor: isActive ? T.verde : T.borde }]}
                >
                  <View style={[s.temaPreview, { backgroundColor: dark ? "#1A211F" : T.cardElevada }]}>
                    <View style={[s.temaHeader, { backgroundColor: dark ? "#242C29" : T.borde }]} />
                    <View style={[s.temaBar,   { backgroundColor: dark ? "#242C29" : T.borde }]} />
                    <View style={[s.temaBar,   { backgroundColor: dark ? "#242C29" : T.borde, width: "60%" }]} />
                    {isActive && (
                      <View style={s.temaCheckBadge}>
                        <CheckCircle2 size={16} color={T.verde} strokeWidth={2} />
                      </View>
                    )}
                  </View>
                  <Text style={[s.temaLabel, { color: T.txtMain }]}>{label}</Text>
                  <Text style={[s.temaSub, { color: T.txtSec }]}>{sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card>
          <CardHeader icon={Clock} title="Zona horaria" sub="Selecciona la zona horaria de tu ubicación" />
          <Divider />
          <TouchableOpacity activeOpacity={0.75} style={[s.dropdown, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <Text style={[s.dropdownTxt, { color: T.txtMain }]}>(GMT-05:00) Bogotá, Lima, Quito</Text>
            <ChevronDown size={14} color={T.txtTer} strokeWidth={2} />
          </TouchableOpacity>
        </Card>

      </View>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Settings" />

      <View style={s.main}>
        <WebTopBar
          titulo="Configuración"
          sub="Personaliza tu experiencia en SmartFence AI"
          conectado={false}
        />

        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.scrollContent, { padding: scrollPad }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Tabs ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[s.tabRow, { borderBottomColor: T.borde }]}>
              {TABS.map(({ key, label, Icon }) => {
                const isActive = activeTab === key;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.75}
                    onPress={() => setActiveTab(key)}
                    style={[s.tab, { borderBottomColor: isActive ? T.verdeOscuro : "transparent" }]}
                  >
                    <Icon size={14} color={isActive ? T.verdeOscuro : T.txtSec} strokeWidth={isActive ? 2.2 : 1.8} />
                    <Text style={[s.tabLabel, { color: isActive ? T.verdeOscuro : T.txtSec }, isActive && s.tabLabelActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* ── Content ── */}
          {activeTab === "Seguridad" ? seguridadContent : generalContent}

          {/* ── Bottom bar ── */}
          <View style={[s.bottomBar, !isTablet && s.bottomBarMobile]}>
            <TouchableOpacity activeOpacity={0.75} style={[s.resetBtn, { borderColor: T.borde }, !isTablet && s.btnFull]}>
              <Text style={[s.resetTxt, { color: T.txtSec }]}>Restablecer configuración</Text>
            </TouchableOpacity>
            {isTablet && <View style={{ flex: 1 }} />}
            <TouchableOpacity activeOpacity={0.75} style={[s.saveBtn, { backgroundColor: T.verdeOscuro }, !isTablet && s.btnFull]}>
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
  scrollContent: { paddingBottom: 80, gap: 20, flexGrow: 1 },

  // ── Tabs ──
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabLabel:       { fontSize: 13 },
  tabLabelActive: { fontWeight: "700" },

  // ── Columns ──
  columns:       { flexDirection: "row",    gap: 20, alignItems: "flex-start" },
  columnsSingle: { flexDirection: "column", gap: 16, alignItems: "stretch", width: "100%" },
  colLeft:       { flex: 1, minWidth: 0, gap: 16 },
  colRight:      { width: 340, gap: 16 },
  colRightFull:  { width: "100%" },

  // ── Card ──
  card:       { borderRadius: 16, borderWidth: 1, alignSelf: "stretch" },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardTitle:  { fontWeight: "800" },
  cardSub:    { fontSize: 12, marginTop: 2 },
  divider:    { height: 1, marginVertical: 16 },
  label: {
    fontSize: 11, fontWeight: "700",
    textTransform: "uppercase", marginBottom: 8,
  },
  sublabel: { fontSize: 11, marginBottom: 12 },

  // ── Security icon box ──
  secIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },

  // ── Password field ──
  passRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, height: 46, gap: 8, marginBottom: 4,
  },
  passInput: { flex: 1, fontSize: 14, outlineStyle: "none" } as any,
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, marginBottom: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthTxt: { fontSize: 11, minWidth: 60 },
  passBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 12, paddingVertical: 12, marginTop: 16,
  },
  passBtnTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // ── Sessions ──
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  sessionIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  sessionLabelRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  sessionLabel:    { fontSize: 13, fontWeight: "600" },
  sessionBadge:    { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  sessionBadgeTxt: { fontSize: 10, fontWeight: "700" },
  sessionSub:      { fontSize: 11, marginTop: 1 },

  // ── Info rows ──
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 11, gap: 8,
  },
  infoRowLabel: { fontSize: 12, fontWeight: "600" },
  infoRowValue: { fontSize: 13, flex: 1, textAlign: "right" },

  // ── Danger ──
  dangerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, borderWidth: 1, borderRadius: 12, paddingVertical: 11,
  },
  dangerBtnTxt: { fontSize: 14, fontWeight: "700" },

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
  switchRow:   { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  switchIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  switchTitle: { fontSize: 13, fontWeight: "600" },
  switchSub:   { fontSize: 11, marginTop: 1 },

  // ── Appearance ──
  temaRow:    { flexDirection: "row", gap: 12 },
  temaOption: { flex: 1, borderRadius: 12, borderWidth: 2, overflow: "hidden" },
  temaPreview:    { height: 70, padding: 8, gap: 6 },
  temaHeader:     { height: 14, borderRadius: 4, width: "100%" },
  temaBar:        { height: 6, borderRadius: 3, width: "100%" },
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
  bottomBar:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bottomBarMobile: { flexDirection: "column-reverse", gap: 10 },
  btnFull:  { width: "100%", justifyContent: "center" },
  resetBtn: {
    borderWidth: 1, borderRadius: 12,
    paddingVertical: 11, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  resetTxt: { fontSize: 13 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingVertical: 11, paddingHorizontal: 24,
  },
  saveTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
