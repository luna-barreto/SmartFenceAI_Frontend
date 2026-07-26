import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Dimensions, Modal,
  KeyboardAvoidingView, TextInput, ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Pencil, CircleCheck, TriangleAlert, Shield, Heart, Weight,
  BatteryMedium, Signal, Wifi, Clock, Radio,
  MapPin, Map, Info, ChevronRight, X, Check,
} from "lucide-react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { PilaRaiz } from "@navigation/types";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { tiempoRelativo } from "@utils/format";

type Props = NativeStackScreenProps<PilaRaiz, "AnimalDetail">;

type CampoId =
  | "nombre" | "raza" | "peso" | "salud" | "genero" | "edad"
  | "potrero" | "observaciones" | "frecuenciaEnvio";

interface ConfigCampo {
  titulo: string;
  valor: string;
  tipo: "texto" | "numero" | "seleccion";
  opciones?: string[];
  multiline?: boolean;
}
type CampoActivo = ConfigCampo & { id: CampoId };

const { width: SW } = Dimensions.get("window");

const C = {
  verde:       "#43A047",
  verdeOscuro: "#2E7D32",
  verdeLuz:    "#E8F5E9",
  verdeMuy:    "#F1F8F1",
  blanco:      "#FFFFFF",
  fondo:       "#F4F8F4",
  txtMain:     "#1F2937",
  txtSec:      "#6B7280",
  borde:       "#E5E7EB",
  rojo:        "#EF4444",
  rojoBg:      "#FEE2E2",
  naranja:     "#F59E0B",
  azul:        "#3B82F6",
};

// ─── CowIcon ──────────────────────────────────────────────────────────────────
function CowIcon({ size = 22, color = C.verdeOscuro }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M6.27335 12.5175875c0 0.22014375 -0.17846875 0.3986 -0.3986125 0.3986125H4.81178125c-0.30685625 -0.0000125 -0.4986375 -0.3322 -0.3452 -0.59793125 0.07120625 -0.12331875 0.2028 -0.1992875 0.3452 -0.19929375h1.06295625c0.22014375 0.0000125 0.3986125 0.178475 0.3986125 0.3986125Zm4.9162 -0.3986125h-1.0629625c-0.30685 0.00001875 -0.49863125 0.3322 -0.34519375 0.59793125 0.0712 0.12331875 0.2028 0.1992875 0.34519375 0.19929375h1.0629625c0.30685 -0.0000125 0.4986375 -0.3322 0.3452 -0.59793125 -0.07120625 -0.12331875 -0.2028 -0.1992875 -0.3452 -0.19929375Zm-5.04906875 -4.783325c-0.51141875 0 -0.83105625 0.553625 -0.57534375 0.996525 0.25570625 0.4429 0.89498125 0.4429 1.1506875 0 0.0583125 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.2974375 -0.66435 -0.66435 -0.66435Zm3.72036875 0c-0.51141875 0 -0.83105625 0.553625 -0.57535 0.996525 0.2557125 0.4429 0.89498125 0.4429 1.15069375 0 0.05830625 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.29744375 -0.66435 -0.66435 -0.66435Zm5.7698875 0.45508125c-0.17666875 0.21655 -0.44134375 0.34218125 -0.72081875 0.3421375H12.651125v2.32855c1.5828375 1.12755625 1.3515 3.54575 -0.41640625 4.35275 -0.32810625 0.149775 -0.68449375 0.2275 -1.04516875 0.22795625H4.81178125c-1.9433875 -0.0024375 -3.15536875 -2.10773125 -2.18156875 -3.7895375 0.180725 -0.312125 0.4262375 -0.58190625 0.71999375 -0.79116875v-2.32855H1.0914125c-0.2799375 0.00044375 -0.5451875 -0.125225 -0.72215 -0.3421375 -0.17531875 -0.21299375 -0.245575 -0.493525 -0.19133125 -0.76400625 0.3399375 -1.6740625 1.8108375 -2.87783125 3.51906875 -2.8799625h0.4577375c-0.84463125 -0.68 -1.33585625 -1.70593125 -1.3360125 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.123325 0.07120625 0.1993 0.20279375 0.1993 0.34520625 0 1.541025 1.24925 2.790275 2.790275 2.790275h3.1888875c1.540975 -0.00006875 2.790275 -1.2493 2.790275 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.12333125 0.07120625 0.1993 0.20279375 0.1993 0.34520625 -0.00015625 1.08434375 -0.49138125 2.110275 -1.33600625 2.790275h0.4577375c1.707725 0.0027625 3.1779 1.2063875 3.5177375 2.8799625 0.0542375 0.27048125 -0.0160125 0.5510125 -0.19133125 0.76400625Zm-12.28053125 -0.45508125v-0.66435c-0.00028125 -0.642175 0.24500625 -1.26014375 0.6856125 -1.72731875h-0.338825c-1.328925 0.00055 -2.47380625 0.93655625 -2.73845 2.23886875 -0.007425 0.03658125 0.002375 0.07455 0.02656875 0.102975 0.02578125 0.03220625 0.06505 0.05061875 0.1063 0.049825Zm9.56665625 5.1819375c0 -0.954 -0.7733125 -1.72735625 -1.7273125 -1.7273125H4.81178125c-1.3296875 0 -2.16074375 1.439425 -1.4959 2.59096875 0.30855625 0.53443125 0.8787875 0.86365625 1.4959 0.86365625h6.37776875c0.954 0.00004375 1.7273125 -0.7733125 1.7273125 -1.7273125Zm-1.0629625 -2.4355125v-3.410775c0 -0.95396875 -0.77334375 -1.72731875 -1.7273125 -1.72731875H5.8747375c-0.95396875 0 -1.7273125 0.77335 -1.7273125 1.72731875v3.410775c0.21650625 -0.05911875 0.439925 -0.08905625 0.66435625 -0.08901875h6.37776875c0.224425 -0.0000375 0.44785 0.0299 0.66435 0.08901875Zm3.1888875 -2.899225c-0.26465 -1.3023125 -1.409525 -2.23831875 -2.73845625 -2.23886875h-0.33881875c0.44060625 0.467175 0.68589375 1.08514375 0.6856125 1.72731875v0.66435h2.25879375c0.04078125 0.00038125 0.07948125 -0.0179875 0.10496875 -0.049825 0.02466875 -0.02819375 0.0349625 -0.0661875 0.0279 -0.102975Z"
        fill={color} strokeWidth={0.0625}
      />
    </Svg>
  );
}

// ─── Mapa mini estático ────────────────────────────────────────────────────────
function MapaMini({ lat, lng, dentro }: { lat: number; lng: number; dentro: boolean }) {
  const pinColor = dentro ? C.verde : C.rojo;
  return (
    <View style={mm.wrap}>
      <Svg width="100%" height={130} viewBox="0 0 320 130">
        <Path d="M0 0 H320 V130 H0Z" fill="#E8F0E8" />
        <Path d="M0 65 H320" stroke="#C5D9C5" strokeWidth={12} />
        <Path d="M180 0 V130" stroke="#C5D9C5" strokeWidth={8} />
        <Path d="M60 0 V130" stroke="#D4E8D4" strokeWidth={5} />
        <Path d="M0 30 H320" stroke="#D4E8D4" strokeWidth={4} />
        <Path d="M0 100 H320" stroke="#D4E8D4" strokeWidth={4} />
        <Path d="M0 0 H55 V25 H0Z"    fill="#D4E8D4" />
        <Path d="M65 0 H175 V25 H65Z"  fill="#D4E8D4" />
        <Path d="M185 0 H320 V25 H185Z" fill="#D4E8D4" />
        <Path d="M0 35 H55 V60 H0Z"   fill="#D4E8D4" />
        <Path d="M185 35 H320 V60 H185Z" fill="#D4E8D4" />
        <Path d="M0 75 H55 V95 H0Z"   fill="#D4E8D4" />
        <Path d="M65 75 H175 V95 H65Z"  fill="#D4E8D4" />
        <Path d="M185 75 H320 V95 H185Z" fill="#D4E8D4" />
        <Circle cx={160} cy={65} r={24} fill={pinColor} opacity={0.18} />
        <Circle cx={160} cy={65} r={14} fill={pinColor} opacity={0.35} />
        <Circle cx={160} cy={58} r={10} fill={pinColor} />
        <Path d="M153 58 Q160 70 167 58" fill={pinColor} />
        <Circle cx={160} cy={58} r={4} fill="#fff" />
      </Svg>
      <View style={mm.precisionBadge}>
        <Signal size={11} color={C.verdeOscuro} strokeWidth={1.8} />
        <Text style={mm.precisionTxt}>Precisión: ± 8 m</Text>
      </View>
    </View>
  );
}
const mm = StyleSheet.create({
  wrap:           { borderRadius: 14, overflow: "hidden" },
  precisionBadge: {
    position: "absolute", bottom: 8, left: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  precisionTxt: { fontSize: 10.5, fontWeight: "600", color: C.verdeOscuro },
});

// ─── InfoFila editable ─────────────────────────────────────────────────────────
function InfoFila({ label, valor, nav, onPress, onEdit }: {
  label: string; valor: string; nav?: boolean;
  onPress?: () => void; onEdit?: () => void;
}) {
  return (
    <TouchableOpacity
      style={inf.row}
      activeOpacity={nav || onEdit ? 0.7 : 1}
      onPress={onEdit ?? onPress}
    >
      <Text style={inf.label}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={[inf.valor, nav && { color: C.verdeOscuro }]}>{valor}</Text>
        {nav   && <ChevronRight size={14} color={C.verdeOscuro} strokeWidth={2} />}
        {onEdit && <Pencil size={12} color={C.verde} strokeWidth={2.5} />}
      </View>
    </TouchableOpacity>
  );
}
const inf = StyleSheet.create({
  row:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.borde },
  label: { fontSize: 13, color: C.txtSec },
  valor: { fontSize: 13, fontWeight: "700", color: C.txtMain },
});

// ─── Sección contenedor ────────────────────────────────────────────────────────
function Seccion({ children }: { children: React.ReactNode }) {
  return <View style={st.seccion}>{children}</View>;
}
function SeccionHeader({ icon: Icon, titulo, badge }: {
  icon: React.ComponentType<any>; titulo: string; badge?: React.ReactNode;
}) {
  return (
    <View style={st.seccionHeader}>
      <View style={st.seccionIconBox}>
        <Icon size={20} color={C.verdeOscuro} strokeWidth={1.6} />
      </View>
      <Text style={st.seccionTitulo}>{titulo}</Text>
      {badge}
    </View>
  );
}

// ─── Modal de edición ──────────────────────────────────────────────────────────
function EditModal({ config, onGuardar, onCerrar, guardando }: {
  config: CampoActivo | null;
  onGuardar: (id: CampoId, valor: string) => void;
  onCerrar: () => void;
  guardando: boolean;
}) {
  const [val, setVal] = useState("");

  useEffect(() => {
    if (config) setVal(config.valor);
  }, [config?.id]);

  if (!config) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={em.backdrop} activeOpacity={1} onPress={onCerrar} />
        <View style={em.sheet}>
          <View style={em.handle} />
          <Text style={em.titulo}>{config.titulo}</Text>

          {config.tipo === "seleccion" ? (
            <View style={em.opcionesWrap}>
              {(config.opciones ?? []).map((op) => (
                <TouchableOpacity
                  key={op}
                  style={[em.opcionBtn, val === op && em.opcionActiva]}
                  onPress={() => setVal(op)}
                  activeOpacity={0.75}
                >
                  <Text style={[em.opcionTxt, val === op && em.opcionActivaTxt]}>{op}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TextInput
              style={[em.input, config.multiline && em.inputMulti]}
              value={val}
              onChangeText={setVal}
              keyboardType={config.tipo === "numero" ? "numeric" : "default"}
              multiline={config.multiline}
              numberOfLines={config.multiline ? 3 : 1}
              autoFocus
              placeholder={config.titulo}
              placeholderTextColor={C.txtSec}
            />
          )}

          <View style={em.botonesRow}>
            <TouchableOpacity style={em.btnCancelar} onPress={onCerrar} activeOpacity={0.7}>
              <X size={15} color={C.txtSec} strokeWidth={2} />
              <Text style={em.btnCancelarTxt}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[em.btnGuardar, guardando && { opacity: 0.7 }]}
              onPress={() => onGuardar(config.id, val)}
              disabled={guardando}
              activeOpacity={0.8}
            >
              {guardando
                ? <ActivityIndicator color="#fff" size="small" />
                : (
                  <>
                    <Check size={15} color="#fff" strokeWidth={2.5} />
                    <Text style={em.btnGuardarTxt}>Guardar</Text>
                  </>
                )
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const em = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.38)" },
  sheet: {
    backgroundColor: C.blanco,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    gap: 16,
  },
  handle: {
    alignSelf: "center", width: 40, height: 4,
    backgroundColor: C.borde, borderRadius: 2, marginBottom: 6,
  },
  titulo: { fontSize: 18, fontWeight: "800", color: C.txtMain },
  input: {
    borderWidth: 1.5, borderColor: C.borde, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: C.txtMain, backgroundColor: C.verdeMuy,
  },
  inputMulti: { height: 90, textAlignVertical: "top" },
  opcionesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  opcionBtn: {
    paddingHorizontal: 22, paddingVertical: 11,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.borde,
    backgroundColor: C.verdeMuy,
  },
  opcionActiva:    { backgroundColor: C.verde, borderColor: C.verde },
  opcionTxt:       { fontSize: 14, fontWeight: "700", color: C.txtSec },
  opcionActivaTxt: { color: C.blanco },
  botonesRow: { flexDirection: "row", gap: 12 },
  btnCancelar: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.borde,
  },
  btnCancelarTxt: { fontSize: 15, fontWeight: "700", color: C.txtSec },
  btnGuardar: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderRadius: 16,
    backgroundColor: C.verde,
  },
  btnGuardarTxt: { fontSize: 15, fontWeight: "700", color: C.blanco },
});

// ─── AnimalDetailScreen ────────────────────────────────────────────────────────
export default function AnimalDetailScreen({ route }: Props) {
  const navigation = useNavigation<any>();
  const { animales } = useAnimalsCtx();
  const animal = animales.find((a) => a.id === route.params.animalId) ?? animales[0];

  const [campoActivo, setCampoActivo] = useState<CampoActivo | null>(null);
  const [guardando, setGuardando]     = useState(false);
  const [local, setLocal] = useState({
    nombre:          animal?.nombre ?? "",
    raza:            animal?.raza   ?? "",
    peso:            String(animal?.peso ?? ""),
    salud:           (animal?.salud ?? "Buena") as string,
    genero:          "Hembra",
    edad:            "3 años",
    potrero:         "Potrero Norte",
    observaciones:   "Sin observaciones",
    frecuenciaEnvio: "4s",
  });

  const ANIMAL_KEY = `sf_animal_${animal?.id ?? "unknown"}`;

  useEffect(() => {
    AsyncStorage.getItem(ANIMAL_KEY).then((raw) => {
      if (!raw) return;
      try { setLocal((prev) => ({ ...prev, ...JSON.parse(raw) })); } catch {}
    });
  }, [ANIMAL_KEY]);

  if (!animal) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.fondo }}>
        <Text style={{ color: C.txtSec }}>Animal no encontrado.</Text>
      </View>
    );
  }

  // ── Campos editables ──
  const configCampos: Record<CampoId, ConfigCampo> = {
    nombre:          { titulo: "Nombre del animal",    valor: local.nombre,          tipo: "texto" },
    raza:            { titulo: "Raza",                 valor: local.raza,            tipo: "texto" },
    peso:            { titulo: "Peso (kg)",            valor: local.peso,            tipo: "numero" },
    salud:           { titulo: "Estado de salud",      valor: local.salud,           tipo: "seleccion", opciones: ["Excelente", "Buena", "Regular"] },
    genero:          { titulo: "Género",               valor: local.genero,          tipo: "seleccion", opciones: ["Macho", "Hembra"] },
    edad:            { titulo: "Edad",                 valor: local.edad,            tipo: "texto" },
    potrero:         { titulo: "Potrero actual",       valor: local.potrero,         tipo: "texto" },
    observaciones:   { titulo: "Observaciones",        valor: local.observaciones,   tipo: "texto", multiline: true },
    frecuenciaEnvio: { titulo: "Frecuencia de envío",  valor: local.frecuenciaEnvio, tipo: "seleccion", opciones: ["2s", "4s", "8s"] },
  };

  function abrirCampo(id: CampoId) {
    setCampoActivo({ id, ...configCampos[id] });
  }

  async function guardar(id: CampoId, valor: string) {
    if (!valor.trim()) return;
    setGuardando(true);
    const nuevo = { ...local, [id]: valor.trim() };
    setLocal(nuevo);
    await AsyncStorage.setItem(ANIMAL_KEY, JSON.stringify(nuevo));
    setGuardando(false);
    setCampoActivo(null);
  }

  // ── Derivados ──
  const bateria      = animal.collar?.bateria ?? 0;
  const bateriaColor = bateria >= 60 ? C.verde : bateria >= 30 ? C.naranja : C.rojo;
  const saludColor   = local.salud === "Excelente" ? C.verde : local.salud === "Buena" ? C.naranja : C.rojo;
  const idAnimal     = `ANM-${animal.id.replace(/\D/g, "").padStart(3, "0")}`;
  const ultimaTrans  = animal.collar?.ultimaConexion ? tiempoRelativo(animal.collar.ultimaConexion) : "—";

  return (
    <View style={st.root}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        contentContainerStyle={st.scroll}>

        {/* ── Tarjeta principal ── */}
        <Seccion>
          <View style={st.animalTop}>
            <View style={st.avatarWrap}>
              <Image
                source={require("../../assets/Vaca.png")}
                style={st.avatar}
                resizeMode="cover"
              />
              <View style={[st.avatarDot,
                { backgroundColor: animal.dentroDeCerca ? C.verde : C.rojo }]}
              />
            </View>

            <View style={{ flex: 1, gap: 6 }}>
              {/* Nombre + pencil */}
              <View style={st.nombreRow}>
                <Text style={st.nombre}>{local.nombre}</Text>
                <TouchableOpacity style={st.editBtn} activeOpacity={0.8}
                  onPress={() => abrirCampo("nombre")}>
                  <Pencil size={14} color={C.txtSec} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Badge dentro/fuera */}
              <View style={[st.cercaBadge,
                { backgroundColor: animal.dentroDeCerca ? C.verdeLuz : C.rojoBg }]}
              >
                {animal.dentroDeCerca
                  ? <CircleCheck   size={13} color={C.verdeOscuro} strokeWidth={2} />
                  : <TriangleAlert size={13} color={C.rojo}        strokeWidth={2} />}
                <Text style={[st.cercaTxt,
                  { color: animal.dentroDeCerca ? C.verdeOscuro : C.rojo }]}>
                  {animal.dentroDeCerca ? "Dentro de la cerca" : "Fuera de la cerca"}
                </Text>
              </View>

              {/* ID · género (tap) · edad (tap) */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <Text style={st.metaTxt}>ID: {idAnimal}</Text>
                <Text style={st.metaDot}>·</Text>
                <TouchableOpacity onPress={() => abrirCampo("genero")} activeOpacity={0.7}
                  style={st.metaChip}>
                  <Text style={st.metaTxt}>{local.genero}</Text>
                  <Pencil size={9} color={C.verde} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={st.metaDot}>·</Text>
                <TouchableOpacity onPress={() => abrirCampo("edad")} activeOpacity={0.7}
                  style={st.metaChip}>
                  <Text style={st.metaTxt}>{local.edad}</Text>
                  <Pencil size={9} color={C.verde} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats raza / peso / salud — cada uno tappable */}
          <View style={st.statsRow}>
            <TouchableOpacity style={st.statItem} activeOpacity={0.7}
              onPress={() => abrirCampo("raza")}>
              <CowIcon size={18} color={C.verdeOscuro} />
              <View style={{ flex: 1 }}>
                <Text style={st.statLabel}>Raza</Text>
                <Text style={st.statValor}>{local.raza}</Text>
              </View>
              <Pencil size={10} color={C.verde} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={st.statSep} />

            <TouchableOpacity style={st.statItem} activeOpacity={0.7}
              onPress={() => abrirCampo("peso")}>
              <Weight size={18} color={C.azul} strokeWidth={1.6} />
              <View style={{ flex: 1 }}>
                <Text style={st.statLabel}>Peso</Text>
                <Text style={st.statValor}>{local.peso} kg</Text>
              </View>
              <Pencil size={10} color={C.verde} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={st.statSep} />

            <TouchableOpacity style={st.statItem} activeOpacity={0.7}
              onPress={() => abrirCampo("salud")}>
              <Heart size={18} color={saludColor} strokeWidth={1.6} />
              <View style={{ flex: 1 }}>
                <Text style={st.statLabel}>Salud</Text>
                <Text style={[st.statValor, { color: saludColor }]}>{local.salud}</Text>
              </View>
              <Pencil size={10} color={C.verde} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </Seccion>

        {/* ── Dispositivo (Collar) ── */}
        <Seccion>
          <SeccionHeader
            icon={Shield}
            titulo="Dispositivo (Collar)"
            badge={
              <View style={st.activoBadge}>
                <View style={[st.activoDot,
                  { backgroundColor: animal.collar?.estado === "en_linea" ? C.verde : C.naranja }]}
                />
                <Text style={[st.activoTxt,
                  { color: animal.collar?.estado === "en_linea" ? C.verdeOscuro : C.naranja }]}>
                  {animal.collar?.estado === "en_linea" ? "Activo" : "Sin rango"}
                </Text>
              </View>
            }
          />

          <View style={st.collarRow}>
            <View style={st.collarImgBox}>
              <Image
                source={require("../../assets/logotipo.png")}
                style={st.collarImg}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={st.collarId}>{animal.collar?.id ?? "—"}</Text>
                <View style={st.loraBadge}>
                  <Text style={st.loraTxt}>{animal.collar?.protocolo ?? "LoRa"}</Text>
                </View>
              </View>
              <Text style={st.collarSub}>Collar GPS LoRa</Text>
            </View>
          </View>

          {/* Grid fila 1 */}
          <View style={st.collarStats}>
            <View style={st.collarStatCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <BatteryMedium size={16} color={bateriaColor} strokeWidth={1.6} />
                <Text style={st.collarStatLabel}>Batería</Text>
              </View>
              <Text style={[st.collarStatValor, { color: bateriaColor }]}>{bateria}%</Text>
              <View style={st.bateriaBarBg}>
                <View style={[st.bateriaBarFill,
                  { width: `${bateria}%`, backgroundColor: bateriaColor }]}
                />
              </View>
            </View>

            <View style={st.collarStatCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Signal size={16} color={C.azul} strokeWidth={1.6} />
                <Text style={st.collarStatLabel}>Señal</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={st.collarStatValor}>{animal.collar?.señal ?? "—"}</Text>
                <Signal size={12} color={C.azul} strokeWidth={2} />
              </View>
            </View>

            <View style={st.collarStatCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Radio size={16} color="#7C3AED" strokeWidth={1.6} />
                <Text style={st.collarStatLabel}>Protocolo</Text>
              </View>
              <Text style={st.collarStatValor}>{animal.collar?.protocolo ?? "LoRa"}</Text>
            </View>
          </View>

          {/* Grid fila 2 */}
          <View style={st.collarStats}>
            <View style={st.collarStatCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Clock size={16} color={C.txtSec} strokeWidth={1.6} />
                <Text style={st.collarStatLabel}>Última transmisión</Text>
              </View>
              <Text style={st.collarStatValor}>
                {ultimaTrans === "ahora" ? "Ahora mismo" : ultimaTrans}
              </Text>
              <Text style={st.collarStatSub}>
                {new Date(animal.collar.ultimaConexion).toLocaleTimeString("es-CO", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </Text>
            </View>

            {/* Frecuencia — editable */}
            <TouchableOpacity style={st.collarStatCard} activeOpacity={0.7}
              onPress={() => abrirCampo("frecuenciaEnvio")}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Wifi size={16} color={C.verde} strokeWidth={1.6} />
                  <Text style={st.collarStatLabel}>Frecuencia</Text>
                </View>
                <Pencil size={10} color={C.verde} strokeWidth={2.5} />
              </View>
              <Text style={st.collarStatValor}>{local.frecuenciaEnvio}</Text>
              <Text style={st.collarStatSub}>Cada {local.frecuenciaEnvio}</Text>
            </TouchableOpacity>

            <View style={st.collarStatCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Shield size={16} color={C.verde} strokeWidth={1.6} />
                <Text style={st.collarStatLabel}>Estado</Text>
              </View>
              <Text style={[st.collarStatValor, { color: C.verde }]}>Funcionando</Text>
              <Text style={st.collarStatSub}>Todo normal</Text>
            </View>
          </View>
        </Seccion>

        {/* ── Ubicación actual ── */}
        <Seccion>
          <View style={st.ubicacionHeader}>
            <View style={st.seccionHeader}>
              <View style={st.seccionIconBox}>
                <MapPin size={20} color={C.verdeOscuro} strokeWidth={1.6} />
              </View>
              <View>
                <Text style={st.seccionTitulo}>Ubicación actual</Text>
                <Text style={st.ubicacionCoords}>
                  lat {animal.ubicacion.lat.toFixed(5)},  lng {animal.ubicacion.lng.toFixed(5)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={st.verMapaBtn}
              onPress={() => navigation.navigate("Map")}
              activeOpacity={0.8}
            >
              <Map size={14} color={C.verdeOscuro} strokeWidth={2} />
              <Text style={st.verMapaTxt}>Ver en el mapa</Text>
            </TouchableOpacity>
          </View>
          <MapaMini lat={animal.ubicacion.lat} lng={animal.ubicacion.lng} dentro={animal.dentroDeCerca} />
        </Seccion>

        {/* ── Información adicional ── */}
        <Seccion>
          <SeccionHeader icon={Info} titulo="Información adicional" />
          <View style={{ marginTop: 4 }}>
            <InfoFila label="Potrero actual"  valor={local.potrero}       onEdit={() => abrirCampo("potrero")} />
            <InfoFila label="Observaciones"   valor={local.observaciones} onEdit={() => abrirCampo("observaciones")} />
            <View style={[inf.row, { borderBottomWidth: 0 }]}>
              <Text style={[inf.label, { color: C.txtSec }]}>Historial de movimientos</Text>
              <ChevronRight size={15} color={C.verdeOscuro} strokeWidth={2} />
            </View>
          </View>
        </Seccion>

        <View style={{ height: 24 }} />
      </ScrollView>

      <EditModal
        config={campoActivo}
        onGuardar={guardar}
        onCerrar={() => setCampoActivo(null)}
        guardando={guardando}
      />
    </View>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.fondo },
  scroll: { padding: 16, gap: 14 },

  seccion: {
    backgroundColor: C.blanco,
    borderRadius: 24, borderWidth: 1, borderColor: C.borde,
    padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    gap: 12,
  },
  seccionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  seccionIconBox: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: C.verdeLuz, alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  seccionTitulo: { fontSize: 15, fontWeight: "800", color: C.txtMain, flex: 1 },

  animalTop:  { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: C.verde,
  },
  avatarDot: {
    position: "absolute", bottom: 4, right: 4,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: C.blanco,
  },
  nombreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nombre:    { fontSize: 22, fontWeight: "900", color: C.txtMain, flex: 1 },
  editBtn:   {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  cercaBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start",
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  cercaTxt: { fontSize: 12, fontWeight: "700" },
  metaTxt:  { fontSize: 12, color: C.txtSec },
  metaDot:  { fontSize: 12, color: C.txtSec },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 3 },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.verdeMuy,
    borderRadius: 16, borderWidth: 1, borderColor: "#DFF0DF",
    paddingVertical: 12, paddingHorizontal: 10,
  },
  statItem:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 7 },
  statSep:   { width: 1, height: 30, backgroundColor: C.borde },
  statLabel: { fontSize: 10, color: C.txtSec },
  statValor: { fontSize: 13, fontWeight: "800", color: C.txtMain },

  activoBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: C.verdeLuz,
  },
  activoDot: { width: 7, height: 7, borderRadius: 4 },
  activoTxt: { fontSize: 11, fontWeight: "700" },

  collarRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  collarImgBox: {
    width: 80, height: 80, borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  collarImg:   { width: 60, height: 60 },
  collarId:    { fontSize: 18, fontWeight: "900", color: C.txtMain },
  loraBadge:   { backgroundColor: C.verdeLuz, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  loraTxt:     { fontSize: 10, fontWeight: "800", color: C.verdeOscuro },
  collarSub:   { fontSize: 12, color: C.txtSec },

  collarStats: { flexDirection: "row", gap: 8 },
  collarStatCard: {
    flex: 1, backgroundColor: C.verdeMuy,
    borderRadius: 14, borderWidth: 1, borderColor: "#DFF0DF",
    padding: 10, gap: 4,
  },
  collarStatLabel: { fontSize: 9, color: C.txtSec, lineHeight: 12 },
  collarStatValor: { fontSize: 13, fontWeight: "800", color: C.txtMain },
  collarStatSub:   { fontSize: 9.5, color: C.txtSec },

  bateriaBarBg:   { height: 4, backgroundColor: C.borde, borderRadius: 2, marginTop: 2 },
  bateriaBarFill: { height: 4, borderRadius: 2 },

  ubicacionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ubicacionCoords: { fontSize: 11.5, color: C.txtSec, marginTop: 2 },
  verMapaBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1.5, borderColor: C.verdeOscuro,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7,
  },
  verMapaTxt: { fontSize: 12, fontWeight: "700", color: C.verdeOscuro },
});
