import React, { useMemo, useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, TextInput,
  Modal, KeyboardAvoidingView, Alert, ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import {
  Bell, ChevronRight, ChevronLeft, Search, SlidersHorizontal,
  ChevronDown, MapPin, HeartPulse, BatteryMedium, Plus, Menu,
  X, Check,
} from "lucide-react-native";
import Svg, { Path, Polyline } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { useDrawer } from "@context/DrawerContext";
import { useAuth } from "@context/AuthContext";
import { useT } from "@context/ThemeContext";
import { Animal, Collar } from "@/types";
import { tiempoRelativo } from "@/utils/format";
import { AnimalesAPI, CollaresAPI } from "@services/api";

const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;
const ITEMS_PER_PAGE = 5;

// ─── CowIcon Streamline ───────────────────────────────────────────────────────
function CowIcon({ size = 28, color = "#4F9E2C" }: { size?: number; color?: string }) {
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

// ─── Sparkline mini ───────────────────────────────────────────────────────────
function Sparkline({ color }: { color: string }) {
  return (
    <Svg width={40} height={16} viewBox="0 0 40 16">
      <Polyline
        points="2,13 8,10 14,8 20,6 26,5 32,3 38,2"
        fill="none" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Tipo enriquecido ─────────────────────────────────────────────────────────
type EnrichedAnimal = Animal & {
  potrero: string;
  categoria: string;
  identificacion: string;
  edad: string;
  genero: string;
  avatarBg: string;
  displayNombre: string;
};

const POTREROS = ["Potrero Norte", "Potrero Sur", "Potrero Este", "Potrero Oeste"];
const EDADES   = ["1.5 años", "2.5 años", "3 años", "4 años", "1.8 años",
                  "2.2 años", "3.5 años", "1.2 años", "5 años", "2.8 años"];

function enrich(a: Animal, i: number, T: ReturnType<typeof useT>): EnrichedAnimal {
  const esToro = a.nombre.includes("Trueno") || a.nombre.includes("Sultán") || i % 5 === 1;
  const categoria = esToro ? "Toro" : "Vaca";
  const idNum = String(100 + i).padStart(3, "0");
  return {
    ...a,
    potrero:      POTREROS[i % POTREROS.length],
    categoria,
    identificacion: `${esToro ? "TOR" : "VAC"}-${idNum}`,
    edad:         EDADES[i % EDADES.length],
    genero:       esToro ? "♂" : "♀",
    avatarBg:     esToro ? T.naranjaBg : T.verdeLuz,
    displayNombre: `${categoria} ${String(i + 1).padStart(2, "0")}`,
  };
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, valor, label, subLabel, subColor, color, bg, sparkline, sparkPct, width,
}: {
  icon: React.ComponentType<any>;
  valor: number | string;
  label: string;
  subLabel?: string;
  subColor?: string;
  color: string;
  bg: string;
  sparkline?: boolean;
  sparkPct?: string;
  width?: number;
}) {
  const T = useT();
  return (
    <View style={[st.kpiCard, { backgroundColor: T.card, borderColor: T.borde, width }]}>
      <View style={[st.kpiIconBox, { backgroundColor: bg }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[st.kpiValor, { color }]}>{valor}</Text>
      <Text style={[st.kpiLabel, { color: T.txtSec }]}>{label}</Text>
      {sparkline ? (
        <View style={st.kpiBottom}>
          <Sparkline color={color} />
          {sparkPct && <Text style={[st.kpiPct, { color }]}>↑ {sparkPct}</Text>}
        </View>
      ) : subLabel ? (
        <View style={st.kpiBottom}>
          <View style={[st.kpiDot, { backgroundColor: subColor ?? color }]} />
          <Text style={[st.kpiSubTxt, { color: subColor ?? color }]}>{subLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Animal card ──────────────────────────────────────────────────────────────
function AnimalRow({ animal, onPress }: { animal: EnrichedAnimal; onPress: () => void }) {
  const T = useT();
  const dentroColor = animal.dentroDeCerca ? T.verdeBrillo : T.rojo;
  const dentroBg    = animal.dentroDeCerca ? T.verdeAlfa : T.rojoBg;
  const generoColor = animal.genero === "♀" ? "#EC4899" : T.azul;

  // Collar / batería
  const bateria     = animal.collar?.bateria ?? 0;
  const bateriaColor =
    bateria >= 60 ? T.verdeBrillo :
    bateria >= 30 ? T.naranja : T.rojo;
  const estadoConexion = animal.collar?.estado ?? "sin_señal";
  const estadoLabel =
    estadoConexion === "en_linea"       ? "En línea" :
    estadoConexion === "fuera_de_rango" ? "Sin rango" : "Sin señal";
  const estadoColor =
    estadoConexion === "en_linea"       ? T.verdeBrillo :
    estadoConexion === "fuera_de_rango" ? T.naranja : T.rojo;
  const estadoBg =
    estadoConexion === "en_linea"       ? T.verdeAlfa :
    estadoConexion === "fuera_de_rango" ? T.naranjaBg : T.rojoBg;

  return (
    <TouchableOpacity
      style={[st.animalCard, { backgroundColor: T.card, borderColor: T.borde }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Avatar con punto de estado */}
      <View style={st.avatarWrap}>
        <View style={[st.animalAvatar, { backgroundColor: animal.avatarBg }]}>
          <CowIcon size={30} color={animal.dentroDeCerca ? T.verdeOscuro : T.rojo} />
        </View>
        <View style={[st.statDot, { backgroundColor: animal.dentroDeCerca ? T.verde : T.rojo, borderColor: T.card }]} />
      </View>

      {/* Info central */}
      <View style={st.animalInfo}>
        <View style={st.nameRow}>
          <Text style={[st.animalName, { color: T.txtMain }]}>{animal.displayNombre}</Text>
          <View style={[st.estadoBadge, { backgroundColor: dentroBg }]}>
            <Text style={[st.estadoBadgeTxt, { color: dentroColor }]}>
              {animal.dentroDeCerca ? "Dentro" : "Fuera"}
            </Text>
          </View>
        </View>

        <Text style={[st.animalIdTxt, { color: T.txtSec }]}>
          Identificación: <Text style={{ color: T.txtMain, fontWeight: "600" }}>{animal.identificacion}</Text>
        </Text>

        <View style={st.tagsRow}>
          <View style={[st.tagPill, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <Text style={[st.tagTxt, { color: T.txtSec }]}>{animal.categoria}</Text>
          </View>
          <View style={[st.tagPill, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <Text style={[st.tagTxt, { color: T.txtSec }]}>{animal.edad}</Text>
          </View>
          <Text style={[st.generoTxt, { color: generoColor }]}>{animal.genero}</Text>
        </View>

        <View style={st.potreroRow}>
          <MapPin size={11} color={T.txtSec} strokeWidth={1.8} />
          <Text style={[st.potreroTxt, { color: T.txtSec }]}>{animal.potrero}</Text>
        </View>
      </View>

      {/* Derecha: collar + batería + estado */}
      <View style={st.animalRight}>
        {/* ID collar */}
        <Text style={[st.collarId, { color: T.txtSec }]}>{animal.collar?.id ?? "Sin collar"}</Text>

        {/* Batería */}
        <View style={st.bateriaRow}>
          <BatteryMedium size={13} color={bateriaColor} strokeWidth={1.8} />
          <Text style={[st.bateriaTxt, { color: bateriaColor }]}>{bateria}%</Text>
        </View>

        {/* Estado conexión */}
        <View style={[st.estadoConBadge, { backgroundColor: estadoBg }]}>
          <View style={[st.estadoConDot, { backgroundColor: estadoColor }]} />
          <Text style={[st.estadoConTxt, { color: estadoColor }]}>{estadoLabel}</Text>
        </View>
      </View>

      <ChevronRight size={15} color={T.txtSec} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}

// ─── Paginación ───────────────────────────────────────────────────────────────
function Paginacion({
  pagina, total, onCambiar,
}: { pagina: number; total: number; onCambiar: (p: number) => void }) {
  const T = useT();
  if (total <= 1) return null;
  const visibles = Math.min(total, 4);
  const pages = Array.from({ length: visibles }, (_, i) => i + 1);

  return (
    <View style={st.paginacion}>
      <TouchableOpacity
        style={[st.pageBtn, { backgroundColor: T.card, borderColor: T.borde }, pagina === 1 && st.pageBtnOff]}
        onPress={() => pagina > 1 && onCambiar(pagina - 1)}
        disabled={pagina === 1}
        activeOpacity={0.75}
      >
        <ChevronLeft size={15} color={pagina === 1 ? T.borde : T.txtMain} strokeWidth={2} />
      </TouchableOpacity>

      {pages.map((p) => (
        <TouchableOpacity
          key={p}
          style={[
            st.pageBtn,
            pagina === p
              ? { backgroundColor: T.verdeOscuro, borderColor: T.verdeOscuro }
              : { backgroundColor: T.card, borderColor: T.borde },
          ]}
          onPress={() => onCambiar(p)}
          activeOpacity={0.75}
        >
          <Text style={[st.pageTxt, { color: T.txtMain }, pagina === p && st.pageTxtActivo]}>{p}</Text>
        </TouchableOpacity>
      ))}

      {total > 4 && <Text style={[st.pageDots, { color: T.txtSec }]}>...</Text>}
      {total > 4 && (
        <TouchableOpacity
          style={[st.pageBtn, { backgroundColor: T.card, borderColor: T.borde }]}
          onPress={() => onCambiar(total)}
          activeOpacity={0.75}
        >
          <Text style={[st.pageTxt, { color: T.txtMain }]}>{total}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[st.pageBtn, { backgroundColor: T.card, borderColor: T.borde }, pagina === total && st.pageBtnOff]}
        onPress={() => pagina < total && onCambiar(pagina + 1)}
        disabled={pagina === total}
        activeOpacity={0.75}
      >
        <ChevronRight size={15} color={pagina === total ? T.borde : T.txtMain} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Modal registrar animal ───────────────────────────────────────────────────
function RegistrarAnimalModal({
  visible, onCerrar, onRegistrado,
}: {
  visible: boolean;
  onCerrar: () => void;
  onRegistrado: () => void;
}) {
  const T = useT();
  const { usuario } = useAuth();

  const [nombre,       setNombre]       = useState("");
  const [raza,         setRaza]         = useState("");
  const [categoria,    setCategoria]    = useState<"Vaca" | "Toro">("Vaca");
  const [collarSerial, setCollarSerial] = useState("");
  const [collarManual, setCollarManual] = useState(false);
  const [guardando,    setGuardando]    = useState(false);
  const [cargandoCollares, setCargandoCollares] = useState(false);
  const [collaresDisponibles, setCollaresDisponibles] = useState<Collar[]>([]);

  // Cargar collares disponibles al abrir
  useEffect(() => {
    if (!visible) return;
    setCargandoCollares(true);
    CollaresAPI.disponibles(usuario?.fincaId)
      .then(({ data }) => setCollaresDisponibles(data))
      .catch(() => setCollaresDisponibles([]))
      .finally(() => setCargandoCollares(false));
  }, [visible]);

  function limpiar() {
    setNombre(""); setRaza(""); setCategoria("Vaca");
    setCollarSerial(""); setCollarManual(false);
  }

  async function guardar() {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre del animal es obligatorio.");
      return;
    }
    const serial = collarSerial.trim();
    if (!serial) {
      Alert.alert("Collar requerido", "Debes ingresar o seleccionar el serial del collar físico.");
      return;
    }

    setGuardando(true);
    try {
      await AnimalesAPI.crearConCollar({
        nombre: nombre.trim(),
        raza: raza.trim() || undefined,
        fincaId: usuario?.fincaId,
        collarSerial: serial,
      });
      limpiar();
      onRegistrado();
      onCerrar();
      Alert.alert(
        "✓ Animal registrado",
        `${nombre.trim()} fue creado y vinculado al collar ${serial}.`
      );
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje ?? "Verifica la conexión con el servidor.";
      Alert.alert("Error al registrar", msg);
    } finally {
      setGuardando(false);
    }
  }

  function cerrar() { limpiar(); onCerrar(); }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={cerrar}>
      <KeyboardAvoidingView style={rm.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={rm.backdrop} activeOpacity={1} onPress={cerrar} />
        <ScrollView style={[rm.sheet, { backgroundColor: T.card }]} keyboardShouldPersistTaps="handled">
          <View style={[rm.handle, { backgroundColor: T.borde }]} />
          <View style={rm.header}>
            <Text style={[rm.titulo, { color: T.txtMain }]}>Registrar animal</Text>
            <TouchableOpacity style={[rm.closeBtn, { backgroundColor: T.cardElevada }]} onPress={cerrar} activeOpacity={0.7}>
              <X size={18} color={T.txtSec} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Categoría */}
          <Text style={[rm.label, { color: T.txtSec }]}>Categoría</Text>
          <View style={rm.chips}>
            {(["Vaca", "Toro"] as const).map((op) => (
              <TouchableOpacity
                key={op}
                style={[
                  rm.chip,
                  categoria === op
                    ? { backgroundColor: T.verdeOscuro, borderColor: T.verdeOscuro }
                    : { backgroundColor: T.cardElevada, borderColor: T.borde },
                ]}
                onPress={() => setCategoria(op)}
                activeOpacity={0.8}
              >
                <Text style={[rm.chipTxt, { color: T.txtSec }, categoria === op && rm.chipTxtActivo]}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nombre */}
          <Text style={[rm.label, { color: T.txtSec }]}>Nombre *</Text>
          <View style={[rm.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput
              style={[rm.input, { color: T.txtMain }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Lucero, Trueno..."
              placeholderTextColor={T.txtSec}
              autoFocus
            />
          </View>

          {/* Raza */}
          <Text style={[rm.label, { color: T.txtSec }]}>Raza</Text>
          <View style={[rm.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <TextInput
              style={[rm.input, { color: T.txtMain }]}
              value={raza}
              onChangeText={setRaza}
              placeholder="Ej. Holstein, Brahman..."
              placeholderTextColor={T.txtSec}
            />
          </View>

          {/* Collar — serial del dispositivo físico */}
          <Text style={[rm.label, { color: T.txtSec }]}>Serial del collar (dispositivo físico) *</Text>

          {/* Collares ya conocidos en el sistema */}
          {!collarManual && (
            <>
              {cargandoCollares ? (
                <ActivityIndicator size="small" color={T.verde} style={{ marginVertical: 8 }} />
              ) : collaresDisponibles.length > 0 ? (
                <>
                  <Text style={[rm.hint, { color: T.txtSec }]}>Collares detectados en la red:</Text>
                  {collaresDisponibles.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        rm.collarOption,
                        { borderColor: collarSerial === c.serial ? T.verdeOscuro : T.borde,
                          backgroundColor: collarSerial === c.serial ? T.verdeLuz : T.cardElevada },
                      ]}
                      onPress={() => setCollarSerial(c.serial)}
                      activeOpacity={0.8}
                    >
                      <Text style={[rm.collarOptionTxt, { color: T.txtMain }]}>{c.serial}</Text>
                      {c.bateriaPorcentaje != null && (
                        <Text style={[rm.collarBat, { color: T.txtSec }]}>{c.bateriaPorcentaje}%</Text>
                      )}
                      {collarSerial === c.serial && (
                        <Check size={14} color={T.verdeOscuro} strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => { setCollarManual(true); setCollarSerial(""); }} activeOpacity={0.7}>
                    <Text style={[rm.hint, { color: T.azul, marginTop: 4 }]}>+ Ingresar serial manualmente</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={[rm.hint, { color: T.txtSec }]}>
                  No hay collares detectados. Ingresa el serial manualmente.
                </Text>
              )}
            </>
          )}

          {/* Campo manual */}
          {(collarManual || collaresDisponibles.length === 0) && (
            <View style={[rm.inputWrap, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <TextInput
                style={[rm.input, { color: T.txtMain }]}
                value={collarSerial}
                onChangeText={(t) => setCollarSerial(t.toUpperCase())}
                placeholder="Ej. SF-1001, COL-1000..."
                placeholderTextColor={T.txtSec}
                autoCapitalize="characters"
              />
            </View>
          )}

          <TouchableOpacity
            style={[rm.btnGuardar, { backgroundColor: T.verdeOscuro }, guardando && { opacity: 0.7 }]}
            onPress={guardar}
            activeOpacity={0.85}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Check size={16} color="#fff" strokeWidth={2.5} /><Text style={rm.btnTxt}>Registrar animal</Text></>
            }
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const rm = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12, gap: 10,
    maxHeight: "90%",
  },
  handle:   { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  header:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  titulo:   { fontSize: 17, fontWeight: "800" },
  closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label:    { fontSize: 12, fontWeight: "700", marginTop: 4 },
  hint:     { fontSize: 11.5, marginTop: 2 },
  chips:    { flexDirection: "row", gap: 8 },
  chip:     { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
  chipTxt:      { fontSize: 13, fontWeight: "700" },
  chipTxtActivo:{ color: "#fff" },
  inputWrap: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14 },
  input:     { fontSize: 15, paddingVertical: 11 },
  collarOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 6,
  },
  collarOptionTxt: { fontSize: 14, fontWeight: "700", flex: 1 },
  collarBat:       { fontSize: 11, marginRight: 8 },
  btnGuardar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 16, paddingVertical: 15, marginTop: 6,
  },
  btnTxt: { fontSize: 15, fontWeight: "800", color: "#fff" },
  azul: "#3B82F6",
});

// ─── AnimalsScreen ────────────────────────────────────────────────────────────
export default function AnimalsScreen() {
  const { width: SW } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const { openDrawer } = useDrawer();
  const { usuario } = useAuth();
  const { animales, conectado, recargar } = useAnimalsCtx();
  const T = useT();
  const KPI_GAP = 8;
  const KPI_W = (SW - 35 - KPI_GAP * 2) / 3;

  const [busqueda, setBusqueda]               = useState("");
  const [filtroEstado, setFiltroEstado]       = useState<"Todos" | "Dentro" | "Fuera">("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState<"Todas" | "Vaca" | "Toro">("Todas");
  const [pagina, setPagina]                   = useState(1);
  const [modalRegistrar, setModalRegistrar]   = useState(false);

  const nombreUsuario = usuario?.nombre?.split(" ")[0] ?? "Ganadero";

  const enriched = useMemo(() => animales.map((a, i) => enrich(a, i, T)), [animales, T]);

  // KPIs
  const total        = enriched.length;
  const dentroCount  = enriched.filter((a) => a.dentroDeCerca).length;
  const fueraCount   = total - dentroCount;
  const atencionCount = enriched.filter((a) => a.salud === "Regular").length;

  // Filtros
  const filtrados = useMemo(() => enriched.filter((a) => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      if (!`${a.displayNombre} ${a.identificacion} ${a.raza} ${a.potrero}`.toLowerCase().includes(q)) return false;
    }
    if (filtroEstado === "Dentro" && !a.dentroDeCerca) return false;
    if (filtroEstado === "Fuera"  &&  a.dentroDeCerca) return false;
    if (filtroCategoria === "Vaca" && a.categoria !== "Vaca") return false;
    if (filtroCategoria === "Toro" && a.categoria !== "Toro") return false;
    return true;
  }), [enriched, busqueda, filtroEstado, filtroCategoria]);

  const totalPaginas  = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));
  const paginaActual  = Math.min(pagina, totalPaginas);
  const paginados     = filtrados.slice((paginaActual - 1) * ITEMS_PER_PAGE, paginaActual * ITEMS_PER_PAGE);

  function ciclarEstado() {
    const opts: Array<"Todos" | "Dentro" | "Fuera"> = ["Todos", "Dentro", "Fuera"];
    setFiltroEstado(opts[(opts.indexOf(filtroEstado) + 1) % opts.length]);
    setPagina(1);
  }
  function ciclarCategoria() {
    const opts: Array<"Todas" | "Vaca" | "Toro"> = ["Todas", "Vaca", "Toro"];
    setFiltroCategoria(opts[(opts.indexOf(filtroCategoria) + 1) % opts.length]);
    setPagina(1);
  }

  const pctDentro = total > 0 ? `${((dentroCount / total) * 100).toFixed(1)}%` : "0%";
  const pctFuera  = total > 0 ? `${((fueraCount  / total) * 100).toFixed(1)}%` : "0%";
  const pctAten   = total > 0 ? `${((atencionCount / total) * 100).toFixed(1)}%` : "0%";

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>

      {/* ── Header ── */}
      <View style={[st.header, { backgroundColor: T.header, borderBottomColor: T.borde }]}>
        <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} onPress={openDrawer} activeOpacity={0.7}>
          <Menu size={20} color={T.txtMain} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={st.headerLogo}>
          <Image source={require("../../assets/logotipo.png")} style={st.headerLogoImg} resizeMode="contain" />
          <Text style={st.headerBrand}>
            <Text style={{ color: T.txtMain, fontWeight: "700" }}>SMART</Text>
            <Text style={{ color: T.verdeOscuro, fontWeight: "900" }}>FENCE</Text>
            <Text style={{ color: T.verde, fontWeight: "900" }}> AI</Text>
          </Text>
        </View>
        <View style={st.headerRight}>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: T.headerBtn }]} activeOpacity={0.7}>
            <Bell size={20} color={T.txtMain} strokeWidth={1.8} />
          </TouchableOpacity>
          <View style={[st.avatar, { backgroundColor: T.verdeOscuro }]}>
            <Text style={st.avatarTxt}>{nombreUsuario.charAt(0).toUpperCase()}</Text>
            <View style={[st.avatarDot, { backgroundColor: conectado ? T.verde : T.rojo, borderColor: T.card }]} />
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Título + Registrar ── */}
        <View style={st.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[st.pageTitle, { color: T.txtMain }]}>Animales</Text>
            <Text style={[st.pageSub, { color: T.txtSec }]}>Gestiona y registra todos los animales de tu finca</Text>
          </View>
          <TouchableOpacity
            style={[st.registerBtn, { backgroundColor: T.verdeOscuro, shadowColor: T.verdeOscuro }]}
            activeOpacity={0.85}
            onPress={() => setModalRegistrar(true)}
          >
            <Plus size={15} color="#fff" strokeWidth={2.5} />
            <Text style={st.registerTxt}>Registrar animal</Text>
          </TouchableOpacity>
        </View>

        {/* ── 3 KPIs ── */}
        <View style={st.kpisRow}>
          <KpiCard
            icon={CowIcon} valor={total}
            label="Total animales" color={T.verde} bg={T.verdeLuz}
            sparkline sparkPct="25%" width={KPI_W}
          />
          <KpiCard
            icon={CowIcon} valor={dentroCount}
            label="Dentro de la cerca" color={T.verde} bg={T.verdeLuz}
            subLabel={pctDentro} subColor={T.verde} width={KPI_W}
          />
          <KpiCard
            icon={CowIcon} valor={fueraCount}
            label="Fuera de la cerca" color={T.rojo} bg={T.rojoBg}
            subLabel={pctFuera} subColor={T.rojo} width={KPI_W}
          />
        </View>

        {/* ── Búsqueda + filtros ── */}
        <View style={st.filtersRow}>
          <View style={[st.searchBox, { backgroundColor: T.card, borderColor: T.borde }]}>
            <Search size={15} color={T.txtSec} strokeWidth={1.8} />
            <TextInput
              value={busqueda}
              onChangeText={(t) => { setBusqueda(t); setPagina(1); }}
              placeholder="Buscar animal..."
              placeholderTextColor={T.txtSec}
              style={[st.searchInput, { color: T.txtMain }]}
            />
          </View>
          <TouchableOpacity style={[st.filterBtn, { backgroundColor: T.card, borderColor: T.borde }]} onPress={ciclarEstado} activeOpacity={0.75}>
            <Text style={[st.filterTxt, { color: T.txtMain }]}>{filtroEstado === "Todos" ? "Estado" : filtroEstado}</Text>
            <ChevronDown size={12} color={T.txtMain} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={[st.filterBtn, { backgroundColor: T.card, borderColor: T.borde }]} onPress={ciclarCategoria} activeOpacity={0.75}>
            <Text style={[st.filterTxt, { color: T.txtMain }]}>{filtroCategoria === "Todas" ? "Categoría" : filtroCategoria}</Text>
            <ChevronDown size={12} color={T.txtMain} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={[st.iconFilterBtn, { backgroundColor: T.card, borderColor: T.borde }]} activeOpacity={0.75}>
            <SlidersHorizontal size={16} color={T.txtMain} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* ── Lista de animales ── */}
        {paginados.length === 0 ? (
          <View style={[st.emptyBox, { backgroundColor: T.card, borderColor: T.borde }]}>
            <CowIcon size={40} color={T.borde} />
            <Text style={[st.emptyTxt, { color: T.txtSec }]}>No se encontraron animales.</Text>
          </View>
        ) : (
          paginados.map((a) => (
            <AnimalRow
              key={a.id}
              animal={a}
              onPress={() => navigation.navigate("AnimalDetail", { animalId: a.id })}
            />
          ))
        )}

        {/* ── Paginación ── */}
        <Paginacion pagina={paginaActual} total={totalPaginas} onCambiar={setPagina} />

        <View style={{ height: 24 }} />
      </ScrollView>

      <RegistrarAnimalModal
        visible={modalRegistrar}
        onCerrar={() => setModalRegistrar(false)}
        onRegistrado={recargar}
      />
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
  headerLogo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogoImg: { width: 30, height: 30, borderRadius: 8 },
  headerBrand: { fontSize: 13, letterSpacing: 0.4 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  avatarTxt: { fontSize: 14, fontWeight: "800", color: "#fff" },
  avatarDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 1.5,
  },

  scroll: { padding: 16, gap: 14 },

  // Título
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pageTitle: { fontSize: 26, fontWeight: "900", letterSpacing: -0.3 },
  pageSub:   { fontSize: 13, marginTop: 2 },
  registerBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  registerTxt: { fontSize: 12.5, fontWeight: "700", color: "#fff" },

  // KPIs
  kpisRow: { flexDirection: "row", gap: 8 },
  kpiCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  kpiIconBox: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  kpiValor:  { fontSize: 20, fontWeight: "900" },
  kpiLabel:  { fontSize: 9.5, marginTop: 1 },
  kpiBottom: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 6 },
  kpiPct:    { fontSize: 9.5, fontWeight: "700" },
  kpiDot:    { width: 6, height: 6, borderRadius: 3 },
  kpiSubTxt: { fontSize: 9.5, fontWeight: "600" },

  // Filtros
  filtersRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  filterBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 10,
  },
  filterTxt: { fontSize: 12, fontWeight: "600" },
  iconFilterBtn: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },

  // Animal card
  animalCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 20, borderWidth: 1,
    padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  avatarWrap: { width: 60, height: 60, flexShrink: 0 },
  animalAvatar: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: "center", justifyContent: "center",
  },
  statDot: {
    position: "absolute", top: 0, left: 0,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2,
  },
  animalInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  animalName: { fontSize: 14.5, fontWeight: "800" },
  estadoBadge: {
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2,
  },
  estadoBadgeTxt: { fontSize: 10.5, fontWeight: "700" },
  animalIdTxt: { fontSize: 11 },
  tagsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  tagPill: {
    borderWidth: 1,
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
  },
  tagTxt:   { fontSize: 10, fontWeight: "500" },
  generoTxt: { fontSize: 14, fontWeight: "700" },
  potreroRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 },
  potreroTxt: { fontSize: 11 },

  animalRight: { alignItems: "flex-end", gap: 5 },
  collarId: { fontSize: 10.5, fontWeight: "700", letterSpacing: 0.2 },
  bateriaRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  bateriaTxt: { fontSize: 11.5, fontWeight: "700" },
  estadoConBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3,
  },
  estadoConDot: { width: 6, height: 6, borderRadius: 3 },
  estadoConTxt: { fontSize: 10, fontWeight: "700" },

  // Empty
  emptyBox: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 48, gap: 10,
    borderRadius: 20, borderWidth: 1,
  },
  emptyTxt: { fontSize: 13 },

  // Paginación
  paginacion: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
  },
  pageBtn: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  pageBtnOff:    { opacity: 0.35 },
  pageTxt:       { fontSize: 13, fontWeight: "600" },
  pageTxtActivo: { color: "#fff" },
  pageDots:      { fontSize: 13, marginHorizontal: 2 },
});
