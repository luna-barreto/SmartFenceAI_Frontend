import React, { useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, useWindowDimensions, Modal,
} from "react-native";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  MapPin, BarChart2, MoreHorizontal, Map, Plus, X,
  Droplets, Scissors, HeartPulse, Filter,
} from "lucide-react-native";
import Svg, { Path, Polyline, Rect, Circle as SvgCircle } from "react-native-svg";
import { useT } from "@context/ThemeContext";
import { navigateTo } from "@navigation/navigationRef";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import {
  ANIMALES_DEMO, STATS_DEMO, CENTRO_DEMO, type AnimalDemo, type SaludSensor,
} from "@/demo/demoData";

const ITEMS_PER_PAGE = 10;
const SM = 700;
const MD = 1080;

// ─── CowIcon ──────────────────────────────────────────────────────────────────
function CowIcon({ size = 20, color = "#4F9E2C" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M6.27335 12.5175875c0 0.22014375 -0.17846875 0.3986 -0.3986125 0.3986125H4.81178125c-0.30685625 -0.0000125 -0.4986375 -0.3322 -0.3452 -0.59793125 0.07120625 -0.12331875 0.2028 -0.1992875 0.3452 -0.19929375h1.06295625c0.22014375 0.0000125 0.3986125 0.178475 0.3986125 0.3986125Zm4.9162 -0.3986125h-1.0629625c-0.30685 0.00001875 -0.49863125 0.3322 -0.34519375 0.59793125 0.0712 0.12331875 0.2028 0.1992875 0.34519375 0.19929375h1.0629625c0.30685 -0.0000125 0.4986375 -0.3322 0.3452 -0.59793125 -0.07120625 -0.12331875 -0.2028 -0.1992875 -0.3452 -0.19929375Zm-5.04906875 -4.783325c-0.51141875 0 -0.83105625 0.553625 -0.57534375 0.996525 0.25570625 0.4429 0.89498125 0.4429 1.1506875 0 0.0583125 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.2974375 -0.66435 -0.66435 -0.66435Zm3.72036875 0c-0.51141875 0 -0.83105625 0.553625 -0.57535 0.996525 0.2557125 0.4429 0.89498125 0.4429 1.15069375 0 0.05830625 -0.10099375 0.08900625 -0.21555625 0.08900625 -0.332175 0 -0.3669125 -0.29744375 -0.66435 -0.66435 -0.66435Zm5.7698875 0.45508125c-0.17666875 0.21655 -0.44134375 0.34218125 -0.72081875 0.3421375H12.651125v2.32855c1.5828375 1.12755625 1.3515 3.54575 -0.41640625 4.35275 -0.32810625 0.149775 -0.68449375 0.2275 -1.04516875 0.22795625H4.81178125c-1.9433875 -0.0024375 -3.15536875 -2.10773125 -2.18156875 -3.7895375 0.180725 -0.312125 0.4262375 -0.58190625 0.71999375 -0.79116875v-2.32855H1.0914125c-0.2799375 0.00044375 -0.5451875 -0.125225 -0.72215 -0.3421375 -0.17531875 -0.21299375 -0.245575 -0.493525 -0.19133125 -0.76400625 0.3399375 -1.6740625 1.8108375 -2.87783125 3.51906875 -2.8799625h0.4577375c-0.84463125 -0.68 -1.33585625 -1.70593125 -1.3360125 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.123325 0.07120625 0.1993 0.20279375 0.1993 0.34520625 0 1.541025 1.24925 2.790275 2.790275 2.790275h3.1888875c1.540975 -0.00006875 2.790275 -1.2493 2.790275 -2.790275 0 -0.30685 0.332175 -0.49863125 0.59791875 -0.34520625 0.12333125 0.07120625 0.1993 0.20279375 0.1993 0.34520625 -0.00015625 1.08434375 -0.49138125 2.110275 -1.33600625 2.790275h0.4577375c1.707725 0.0027625 3.1779 1.2063875 3.5177375 2.8799625 0.0542375 0.27048125 -0.0160125 0.5510125 -0.19133125 0.76400625Zm-12.28053125 -0.45508125v-0.66435c-0.00028125 -0.642175 0.24500625 -1.26014375 0.6856125 -1.72731875h-0.338825c-1.328925 0.00055 -2.47380625 0.93655625 -2.73845 2.23886875 -0.007425 0.03658125 0.002375 0.07455 0.02656875 0.102975 0.02578125 0.03220625 0.06505 0.05061875 0.1063 0.049825Zm9.56665625 5.1819375c0 -0.954 -0.7733125 -1.72735625 -1.7273125 -1.7273125H4.81178125c-1.3296875 0 -2.16074375 1.439425 -1.4959 2.59096875 0.30855625 0.53443125 0.8787875 0.86365625 1.4959 0.86365625h6.37776875c0.954 0.00004375 1.7273125 -0.7733125 1.7273125 -1.7273125Zm-1.0629625 -2.4355125v-3.410775c0 -0.95396875 -0.77334375 -1.72731875 -1.7273125 -1.72731875H5.8747375c-0.95396875 0 -1.7273125 0.77335 -1.7273125 1.72731875v3.410775c0.21650625 -0.05911875 0.439925 -0.08905625 0.66435625 -0.08901875h6.37776875c0.224425 -0.0000375 0.44785 0.0299 0.66435 0.08901875Zm3.1888875 -2.899225c-0.26465 -1.3023125 -1.409525 -2.23831875 -2.73845625 -2.23886875h-0.33881875c0.44060625 0.467175 0.68589375 1.08514375 0.6856125 1.72731875v0.66435h2.25879375c0.04078125 0.00038125 0.07948125 -0.0179875 0.10496875 -0.049825 0.02466875 -0.02819375 0.0349625 -0.0661875 0.0279 -0.102975Z"
        fill={color} strokeWidth={0.0625}
      />
    </Svg>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ color }: { color: string }) {
  return (
    <Svg width={80} height={22} viewBox="0 0 80 22">
      <Polyline points="2,18 14,14 26,11 38,8 50,5 64,3 78,2"
        fill="none" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Signal bars ──────────────────────────────────────────────────────────────
function SignalBars({ señal, color }: { señal: string; color: string }) {
  const bars = señal === "Excelente" ? 3 : señal === "Buena" ? 2 : 1;
  return (
    <Svg width={18} height={14} viewBox="0 0 18 14">
      <Rect x={0} y={10} width={4} height={4} rx={1} fill={bars >= 1 ? color : "#d1d5db"} />
      <Rect x={7} y={6}  width={4} height={8} rx={1} fill={bars >= 2 ? color : "#d1d5db"} />
      <Rect x={14} y={2} width={4} height={12} rx={1} fill={bars >= 3 ? color : "#d1d5db"} />
    </Svg>
  );
}

// ─── Battery icon ─────────────────────────────────────────────────────────────
function BatteryIcon({ pct, color }: { pct: number; color: string }) {
  const fillW = Math.max(0, Math.round((13 * pct) / 100));
  return (
    <Svg width={22} height={12} viewBox="0 0 22 12">
      <Rect x={0} y={1} width={18} height={10} rx={2} stroke={color} strokeWidth={1.3} fill="none" />
      <Rect x={18.5} y={4} width={2.5} height={4} rx={1} fill={color} />
      <Rect x={1.5} y={2.5} width={fillW} height={7} rx={1} fill={color} />
    </Svg>
  );
}

// ─── Sensor color circle ──────────────────────────────────────────────────────
function ColorDot({ r, g, b, size = 10 }: { r: number; g: number; b: number; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <SvgCircle cx={size / 2} cy={size / 2} r={size / 2} fill={`rgb(${r},${g},${b})`} />
    </Svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, valor, label, sub, color, bg, sparkline, progressPct }: {
  icon: React.ComponentType<any>;
  valor: number | string; label: string; sub: string;
  color: string; bg: string; sparkline?: boolean; progressPct?: number;
}) {
  const T = useT();
  return (
    <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={st.statTop}>
        <View style={[st.statIcon, { backgroundColor: bg }]}>
          <Icon size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[st.statLabel, { color: T.txtSec }]}>{label}</Text>
          <Text style={[st.statValor, { color: T.txtMain }]}>{valor}</Text>
        </View>
      </View>
      <Text style={[st.statSub, { color }]}>{sub}</Text>
      {sparkline ? (
        <Sparkline color={color} />
      ) : (
        <View style={[st.progBg, { backgroundColor: T.borde }]}>
          <View style={[st.progFill, { width: `${Math.min(progressPct ?? 0, 100)}%` as any, backgroundColor: color }]} />
        </View>
      )}
    </View>
  );
}

// ─── Filter pill dropdown ─────────────────────────────────────────────────────
function FilterPill({ label, valor, opciones, onSelect, T }: {
  label: string; valor: string; opciones: string[];
  onSelect: (v: string) => void; T: ReturnType<typeof useT>;
}) {
  const [open, setOpen] = useState(false);
  const activo = valor !== opciones[0];
  return (
    <View style={{ zIndex: open ? 20 : 1 }}>
      <TouchableOpacity
        style={[st.pill, {
          backgroundColor: activo ? T.verdeOscuro : T.card,
          borderColor: activo ? T.verdeOscuro : T.borde,
        }]}
        activeOpacity={0.75}
        onPress={() => setOpen((o) => !o)}
      >
        <Text style={[st.pillTxt, { color: activo ? "#fff" : T.txtMain }]}>
          {label}: {valor}
        </Text>
        <ChevronDown size={13} color={activo ? "#fff" : T.txtTer} strokeWidth={2} />
      </TouchableOpacity>
      {open && (
        <View style={[st.pillMenu, { backgroundColor: T.card, borderColor: T.borde }]}>
          {opciones.map((op) => (
            <TouchableOpacity
              key={op}
              style={[st.pillMenuItem, { borderBottomColor: T.borde }]}
              onPress={() => { onSelect(op); setOpen(false); }}
              activeOpacity={0.75}
            >
              <Text style={[st.pillMenuTxt, { color: op === valor ? T.verde : T.txtMain }]}>{op}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Table header cell ────────────────────────────────────────────────────────
function TH({ label, flex, width }: { label: string; flex?: number; width?: number }) {
  const T = useT();
  return (
    <Text style={[
      st.th, { color: T.txtSec },
      flex !== undefined && { flex },
      width !== undefined && { width },
    ]}>
      {label}
    </Text>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AnimalsScreen() {
  const T = useT();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [animalesLocales, setAnimalesLocales] = useState<AnimalDemo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [animalDetalle, setAnimalDetalle] = useState<AnimalDemo | null>(null);
  // Filtros
  const [filtroEstado,    setFiltroEstado]    = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroPotrero,   setFiltroPotrero]   = useState("Todos");
  const [filtroSalud,     setFiltroSalud]     = useState("Todos");
  const [filtroGenero,    setFiltroGenero]    = useState("Todos");

  const { width } = useWindowDimensions();
  const isSm = width < SM;
  const isMd = width < MD;

  const todosAnimales = useMemo(
    () => [...ANIMALES_DEMO, ...animalesLocales],
    [animalesLocales]
  );

  const total        = todosAnimales.length;
  const dentroCount  = todosAnimales.filter((a) => a.dentroDeCerca).length;
  const fueraCount   = todosAnimales.filter((a) => !a.dentroDeCerca).length;
  const atencionCount = todosAnimales.filter((a) => a.salud.sensor !== "verde").length;

  // Opciones de potrero únicas derivadas de los datos reales
  const opcionesPotrero = useMemo(
    () => ["Todos", ...Array.from(new Set(todosAnimales.map((a) => a.potrero))).sort()],
    [todosAnimales]
  );

  function limpiarFiltros() {
    setFiltroEstado("Todos"); setFiltroCategoria("Todas"); setFiltroPotrero("Todos");
    setFiltroSalud("Todos"); setFiltroGenero("Todos"); setBusqueda(""); setPagina(1);
  }

  const filtrados = useMemo(() => {
    let r = todosAnimales;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      r = r.filter((a) =>
        `${a.displayNombre} ${a.identificacion} ${a.raza} ${a.potrero}`.toLowerCase().includes(q)
      );
    }
    if (filtroEstado === "Dentro") r = r.filter((a) => a.dentroDeCerca);
    if (filtroEstado === "Fuera")  r = r.filter((a) => !a.dentroDeCerca);
    if (filtroCategoria !== "Todas") r = r.filter((a) => a.categoria === filtroCategoria);
    if (filtroPotrero   !== "Todos") r = r.filter((a) => a.potrero   === filtroPotrero);
    if (filtroSalud === "Excelente") r = r.filter((a) => a.salud.sensor === "verde");
    if (filtroSalud === "Atención")  r = r.filter((a) => a.salud.sensor === "amarillo");
    if (filtroSalud === "Crítico")   r = r.filter((a) => a.salud.sensor === "rojo");
    if (filtroGenero === "♀ Hembra") r = r.filter((a) => a.genero === "♀");
    if (filtroGenero === "♂ Macho")  r = r.filter((a) => a.genero === "♂");
    return r;
  }, [busqueda, todosAnimales, filtroEstado, filtroCategoria, filtroPotrero, filtroSalud, filtroGenero]);

  const filtrosActivos = [filtroEstado !== "Todos", filtroCategoria !== "Todas",
    filtroPotrero !== "Todos", filtroSalud !== "Todos", filtroGenero !== "Todos"].filter(Boolean).length;

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginados    = filtrados.slice((paginaActual - 1) * ITEMS_PER_PAGE, paginaActual * ITEMS_PER_PAGE);

  const registerBtn = (
    <TouchableOpacity
      style={[st.registerBtn, { backgroundColor: T.verdeOscuro }]}
      activeOpacity={0.85}
      onPress={() => setModalVisible(true)}
    >
      <Plus size={14} color="#fff" strokeWidth={2.5} />
      <Text style={st.registerBtnTxt}>Registrar animal</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      <WebSidebar activeRoute="Animals" />

      <View style={st.main}>
        <WebTopBar
          titulo="Animales"
          sub="Gestiona y registra todos los animales de tu finca"
          alertasCount={fueraCount + STATS_DEMO.alertasCriticas}
          rightContent={registerBtn}
        />

        <View style={[st.body, isSm && { flexDirection: "column" }]}>
          <ScrollView
            style={st.scroll}
            contentContainerStyle={[st.scrollContent, isSm && { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Stat cards ── */}
            <View style={[st.statsRow, (isSm || isMd) && { flexWrap: "wrap" }]}>
              <StatCard icon={CowIcon}    valor={total}        label="Total animales"     sub="↑ 12% vs. mes anterior" color={T.verde}   bg={T.verdeLuz}  sparkline />
              <StatCard icon={CowIcon}    valor={dentroCount}  label="Dentro de la cerca" sub={`${total > 0 ? Math.round(dentroCount/total*100) : 0}% del total`}  color={T.verde}   bg={T.verdeLuz}  progressPct={total > 0 ? (dentroCount/total)*100 : 85} />
              <StatCard icon={CowIcon}    valor={fueraCount}   label="Fuera de la cerca"  sub={`${total > 0 ? Math.round(fueraCount/total*100) : 0}% del total`}   color={T.rojo}    bg={T.rojoBg}    progressPct={total > 0 ? (fueraCount/total)*100 : 5}  />
              <StatCard icon={HeartPulse} valor={atencionCount} label="Con atención"       sub={`${total > 0 ? Math.round(atencionCount/total*100) : 0}% del total`} color={T.naranja} bg={T.naranjaBg} progressPct={total > 0 ? (atencionCount/total)*100 : 25} />
            </View>

            {/* ── Toolbar ── */}
            <View style={[st.toolbar, isSm && { flexWrap: "wrap" }]}>
              <View style={[st.searchBox, { backgroundColor: T.card, borderColor: T.borde }, isSm && { flex: 1, width: "100%" as any }]}>
                <Search size={14} color={T.txtTer} strokeWidth={1.8} />
                <TextInput
                  value={busqueda}
                  onChangeText={(t) => { setBusqueda(t); setPagina(1); }}
                  placeholder="Buscar animal..."
                  placeholderTextColor={T.txtTer}
                  style={[st.searchInput, { color: T.txtMain }]}
                />
              </View>
              {!isSm && (
                <FilterPill label="Estado" valor={filtroEstado}
                  opciones={["Todos", "Dentro", "Fuera"]}
                  onSelect={(v) => { setFiltroEstado(v); setPagina(1); }} T={T} />
              )}
              {!isSm && (
                <FilterPill label="Categoría" valor={filtroCategoria}
                  opciones={["Todas", "Vaca", "Toro", "Ternero"]}
                  onSelect={(v) => { setFiltroCategoria(v); setPagina(1); }} T={T} />
              )}
              {!isSm && (
                <FilterPill label="Potrero" valor={filtroPotrero}
                  opciones={opcionesPotrero}
                  onSelect={(v) => { setFiltroPotrero(v); setPagina(1); }} T={T} />
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={[st.moreFiltersBtn, {
                  backgroundColor: filtrosActivos > 0 ? T.rojoBg : T.card,
                  borderColor: filtrosActivos > 0 ? T.rojo : T.borde,
                }]}
                activeOpacity={0.75}
                onPress={limpiarFiltros}
              >
                <Filter size={14} color={filtrosActivos > 0 ? T.rojo : T.txtMain} strokeWidth={1.8} />
                {!isSm && (
                  <Text style={[st.moreFiltersTxt, { color: filtrosActivos > 0 ? T.rojo : T.txtMain }]}>
                    {filtrosActivos > 0 ? `Limpiar (${filtrosActivos})` : "Más filtros"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Table / Cards ── */}
            {isSm ? (
              <View style={st.cardList}>
                {paginados.length === 0 ? (
                  <View style={[st.emptyBox, { borderColor: T.borde, backgroundColor: T.card }]}>
                    <CowIcon size={32} color={T.txtTer} />
                    <Text style={[st.emptyTxt, { color: T.txtSec }]}>No se encontraron animales.</Text>
                  </View>
                ) : paginados.map((a) => (
                  <AnimalCard key={a.id} animal={a} T={T} onPress={() => setAnimalDetalle(a)} />
                ))}
              </View>
            ) : (
              <ScrollView horizontal={false} showsHorizontalScrollIndicator={false}>
                <View style={[st.table, { backgroundColor: T.card, borderColor: T.borde }]}>
                  {/* Header */}
                  <View style={[st.thead, { backgroundColor: T.cardElevada, borderBottomColor: T.borde }]}>
                    <TH label="ANIMAL"               flex={2.2} />
                    <TH label="ESTADO"               width={100} />
                    <TH label="POTRERO"              width={130} />
                    <TH label="COLLAR / DISPOSITIVO" flex={1.2} />
                    <TH label="BATERÍA"              width={90} />
                    <TH label="SEÑAL"                width={70} />
                    <TH label="ÚLTIMA UBICACIÓN"     flex={1.3} />
                    <TH label="ACCIONES"             width={82} />
                  </View>

                  {paginados.length === 0 ? (
                    <View style={[st.emptyBox, { borderBottomWidth: 0 }]}>
                      <CowIcon size={32} color={T.txtTer} />
                      <Text style={[st.emptyTxt, { color: T.txtSec }]}>No se encontraron animales.</Text>
                    </View>
                  ) : paginados.map((a, i) => (
                    <AnimalRow key={a.id} animal={a} isLast={i === paginados.length - 1} T={T} onPress={() => setAnimalDetalle(a)} />
                  ))}

                  <TablePagination
                    pagina={paginaActual} totalPaginas={totalPaginas}
                    totalItems={filtrados.length} itemsPerPage={ITEMS_PER_PAGE}
                    onCambiar={setPagina} T={T}
                  />
                </View>
              </ScrollView>
            )}

            {/* Mobile pagination */}
            {isSm && (
              <TablePagination
                pagina={paginaActual} totalPaginas={totalPaginas}
                totalItems={filtrados.length} itemsPerPage={ITEMS_PER_PAGE}
                onCambiar={setPagina} T={T}
              />
            )}
          </ScrollView>

          {!isSm && (
            <RightPanel
              T={T} animales={todosAnimales}
              filtroEstado={filtroEstado}    setFiltroEstado={(v) => { setFiltroEstado(v); setPagina(1); }}
              filtroCategoria={filtroCategoria} setFiltroCategoria={(v) => { setFiltroCategoria(v); setPagina(1); }}
              filtroPotrero={filtroPotrero}  setFiltroPotrero={(v) => { setFiltroPotrero(v); setPagina(1); }}
              filtroSalud={filtroSalud}      setFiltroSalud={(v) => { setFiltroSalud(v); setPagina(1); }}
              filtroGenero={filtroGenero}    setFiltroGenero={(v) => { setFiltroGenero(v); setPagina(1); }}
              opcionesPotrero={opcionesPotrero}
              onLimpiar={limpiarFiltros}
            />
          )}
        </View>
      </View>

      <AddAnimalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onRegistrar={(animal) => {
          setAnimalesLocales((prev) => [...prev, animal]);
          setModalVisible(false);
        }}
        T={T}
      />

      <AnimalDetailModal
        animal={animalDetalle}
        onClose={() => setAnimalDetalle(null)}
        T={T}
      />
    </View>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────
function AnimalRow({ animal, isLast, T, onPress }: { animal: AnimalDemo; isLast: boolean; T: ReturnType<typeof useT>; onPress: () => void }) {
  const dentroColor = animal.dentroDeCerca ? T.verde : T.rojo;
  const dentroBg    = animal.dentroDeCerca ? T.verdeAlfa : T.rojoBg;
  const batColor    = animal.bateria >= 60 ? T.verde : animal.bateria >= 30 ? T.naranja : T.rojo;
  const señalColor  = animal.señal === "Excelente" ? T.verde : animal.señal === "Buena" ? T.naranja : T.rojo;

  const hasCollarIssue = animal.estadoCollar === "cortado" || animal.estadoCollar === "retirado";
  const collarBadge = {
    en_linea:     { label: "En línea",  color: T.verde,   bg: T.verdeAlfa },
    bateria_baja: { label: "Bat. baja", color: T.naranja, bg: T.naranjaBg },
    cortado:      { label: "Cortado",   color: T.rojo,    bg: T.rojoBg    },
    retirado:     { label: "Retirado",  color: T.rojo,    bg: T.rojoBg    },
    sin_señal:    { label: "Sin señal", color: T.azul,    bg: T.azulBg    },
  }[animal.estadoCollar];

  const saludColor: Record<SaludSensor, string> = { verde: T.verde, amarillo: T.naranja, rojo: T.rojo };
  const initials = animal.displayNombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const avatarBg = animal.categoria === "Toro" ? T.naranjaBg : T.verdeLuz;

  const lat = animal.ubicacion.lat.toFixed(5);
  const lng = animal.ubicacion.lng.toFixed(5);

  return (
    <TouchableOpacity
      style={[st.row, { backgroundColor: T.card, borderBottomColor: T.borde }, isLast && { borderBottomWidth: 0 }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Animal */}
      <View style={[st.cellAnimal, { flex: 2.2 }]}>
        <View style={[st.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[st.avatarTxt, { color: T.verdeOscuro }]}>{initials}</Text>
        </View>
        <View style={st.animalInfo}>
          <Text style={[st.animalName, { color: T.txtMain }]}>{animal.displayNombre}</Text>
          <Text style={[st.animalSub, { color: T.txtSec }]}>{animal.identificacion} · {animal.genero}</Text>
          <View style={st.chips}>
            <View style={[st.chip, { backgroundColor: animal.categoria === "Toro" ? T.naranjaBg : T.verdeLuz, borderColor: T.borde }]}>
              <Text style={[st.chipTxt, { color: animal.categoria === "Toro" ? T.naranja : T.verde }]}>{animal.categoria}</Text>
            </View>
            <View style={[st.chip, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <Text style={[st.chipTxt, { color: T.txtSec }]}>{animal.edad}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Estado */}
      <View style={{ width: 100 }}>
        <View style={[st.badge, { backgroundColor: dentroBg }]}>
          <Text style={[st.badgeTxt, { color: dentroColor }]}>{animal.dentroDeCerca ? "Dentro" : "Fuera"}</Text>
        </View>
        <Text style={[st.subTxt, { color: T.txtTer, marginTop: 4 }]}>{animal.ultimaVez}</Text>
      </View>

      {/* Potrero */}
      <View style={[st.cellRow, { width: 130 }]}>
        <MapPin size={11} color={T.txtTer} strokeWidth={1.8} />
        <Text style={[st.cellTxt, { color: T.txtMain }]} numberOfLines={1}>{animal.potrero}</Text>
      </View>

      {/* Collar */}
      <View style={{ flex: 1.2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {hasCollarIssue && <Scissors size={10} color={T.rojo} strokeWidth={2} />}
          <Text style={[st.cellTxtBold, { color: T.txtMain }]}>{animal.collarId}</Text>
        </View>
        <Text style={[st.subTxt, { color: T.txtSec }]}>LoRa</Text>
        <View style={[st.badge, { backgroundColor: collarBadge.bg, marginTop: 3 }]}>
          <Text style={[st.badgeTxt, { color: collarBadge.color }]}>{collarBadge.label}</Text>
        </View>
      </View>

      {/* Batería */}
      <View style={{ width: 90 }}>
        <View style={st.cellRow}>
          <Text style={[st.cellTxtBold, { color: batColor }]}>{animal.bateria}%</Text>
          <BatteryIcon pct={animal.bateria} color={batColor} />
        </View>
        <View style={[st.batBg, { backgroundColor: T.cardElevada }]}>
          <View style={[st.batFill, { width: `${animal.bateria}%` as any, backgroundColor: batColor }]} />
        </View>
      </View>

      {/* Señal */}
      <View style={[st.cellCenter, { width: 70 }]}>
        <SignalBars señal={animal.señal} color={señalColor} />
        <Text style={[st.subTxt, { color: T.txtSec, marginTop: 2 }]}>{animal.señal}</Text>
      </View>

      {/* Última ubicación */}
      <View style={{ flex: 1.3 }}>
        <View style={[st.cellRow, { gap: 4 }]}>
          <ColorDot r={animal.salud.r} g={animal.salud.g} b={animal.salud.b} size={8} />
          <Text style={[st.subTxt, { color: T.txtSec }]}>{animal.ultimaVez}</Text>
        </View>
        <Text style={[st.coordTxt, { color: T.txtTer }]}>Lat {lat}</Text>
        <Text style={[st.coordTxt, { color: T.txtTer }]}>Lng {lng}</Text>
      </View>

      {/* Acciones */}
      <View style={[st.actions, { width: 82 }]}>
        <TouchableOpacity style={[st.actionBtn, { backgroundColor: T.cardElevada }]} activeOpacity={0.75} onPress={() => navigateTo("Map")}>
          <MapPin size={12} color={T.txtSec} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity style={[st.actionBtn, { backgroundColor: T.cardElevada }]} activeOpacity={0.75}>
          <BarChart2 size={12} color={T.txtSec} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity style={[st.actionBtn, { backgroundColor: T.cardElevada }]} activeOpacity={0.75}>
          <MoreHorizontal size={12} color={T.txtSec} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────
function AnimalCard({ animal, T, onPress }: { animal: AnimalDemo; T: ReturnType<typeof useT>; onPress: () => void }) {
  const dentroColor = animal.dentroDeCerca ? T.verde : T.rojo;
  const dentroBg    = animal.dentroDeCerca ? T.verdeAlfa : T.rojoBg;
  const batColor    = animal.bateria >= 60 ? T.verde : animal.bateria >= 30 ? T.naranja : T.rojo;
  const señalColor  = animal.señal === "Excelente" ? T.verde : animal.señal === "Buena" ? T.naranja : T.rojo;
  const initials    = animal.displayNombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const avatarBg    = animal.categoria === "Toro" ? T.naranjaBg : T.verdeLuz;

  return (
    <TouchableOpacity style={[st.mCard, { backgroundColor: T.card, borderColor: T.borde }]} activeOpacity={0.75} onPress={onPress}>
      {/* Top row */}
      <View style={st.mCardTop}>
        <View style={[st.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[st.avatarTxt, { color: T.verdeOscuro }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[st.animalName, { color: T.txtMain }]}>{animal.displayNombre}</Text>
          <Text style={[st.animalSub, { color: T.txtSec }]}>{animal.identificacion} · {animal.raza}</Text>
          <View style={st.chips}>
            <View style={[st.chip, { backgroundColor: animal.categoria === "Toro" ? T.naranjaBg : T.verdeLuz, borderColor: T.borde }]}>
              <Text style={[st.chipTxt, { color: animal.categoria === "Toro" ? T.naranja : T.verde }]}>{animal.categoria}</Text>
            </View>
            <View style={[st.chip, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <Text style={[st.chipTxt, { color: T.txtSec }]}>{animal.edad}</Text>
            </View>
          </View>
        </View>
        <View style={[st.badge, { backgroundColor: dentroBg }]}>
          <Text style={[st.badgeTxt, { color: dentroColor }]}>{animal.dentroDeCerca ? "Dentro" : "Fuera"}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[st.mDivider, { backgroundColor: T.borde }]} />

      {/* Bottom row */}
      <View style={st.mCardBottom}>
        <View style={st.mStat}>
          <Text style={[st.mStatLabel, { color: T.txtTer }]}>Collar</Text>
          <Text style={[st.mStatVal, { color: T.txtMain }]}>{animal.collarId}</Text>
        </View>
        <View style={st.mStat}>
          <Text style={[st.mStatLabel, { color: T.txtTer }]}>Potrero</Text>
          <Text style={[st.mStatVal, { color: T.txtMain }]}>{animal.potrero.replace("Potrero ", "")}</Text>
        </View>
        <View style={st.mStat}>
          <Text style={[st.mStatLabel, { color: T.txtTer }]}>Batería</Text>
          <View style={st.cellRow}>
            <Text style={[st.mStatVal, { color: batColor }]}>{animal.bateria}%</Text>
            <BatteryIcon pct={animal.bateria} color={batColor} />
          </View>
        </View>
        <View style={st.mStat}>
          <Text style={[st.mStatLabel, { color: T.txtTer }]}>Señal</Text>
          <SignalBars señal={animal.señal} color={señalColor} />
        </View>
      </View>

      {/* Actions */}
      <View style={st.mActions}>
        <TouchableOpacity style={[st.mActionBtn, { backgroundColor: T.cardElevada, borderColor: T.borde }]} activeOpacity={0.75} onPress={() => navigateTo("Map")}>
          <MapPin size={13} color={T.txtSec} strokeWidth={1.8} />
          <Text style={[st.mActionTxt, { color: T.txtSec }]}>Ver mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.mActionBtn, { backgroundColor: T.cardElevada, borderColor: T.borde }]} activeOpacity={0.75}>
          <BarChart2 size={13} color={T.txtSec} strokeWidth={1.8} />
          <Text style={[st.mActionTxt, { color: T.txtSec }]}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.mActionBtn, { backgroundColor: T.cardElevada, borderColor: T.borde }]} activeOpacity={0.75}>
          <MoreHorizontal size={13} color={T.txtSec} strokeWidth={1.8} />
          <Text style={[st.mActionTxt, { color: T.txtSec }]}>Más</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function TablePagination({ pagina, totalPaginas, totalItems, itemsPerPage, onCambiar, T }: {
  pagina: number; totalPaginas: number; totalItems: number; itemsPerPage: number;
  onCambiar: (p: number) => void; T: ReturnType<typeof useT>;
}) {
  const from  = (pagina - 1) * itemsPerPage + 1;
  const to    = Math.min(pagina * itemsPerPage, totalItems);
  const pages = Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => i + 1);
  return (
    <View style={[st.pagination, { borderTopColor: T.borde }]}>
      <Text style={[st.paginInfo, { color: T.txtSec }]}>
        Mostrando {from} a {to} de {totalItems} animales
      </Text>
      <View style={st.paginBtns}>
        <TouchableOpacity
          style={[st.pBtn, { backgroundColor: T.card, borderColor: T.borde }, pagina === 1 && { opacity: 0.4 }]}
          onPress={() => pagina > 1 && onCambiar(pagina - 1)} disabled={pagina === 1} activeOpacity={0.75}>
          <ChevronLeft size={13} color={T.txtMain} strokeWidth={2} />
        </TouchableOpacity>
        {pages.map((p) => (
          <TouchableOpacity key={p}
            style={[st.pBtn, pagina === p ? { backgroundColor: T.verdeOscuro, borderColor: T.verdeOscuro } : { backgroundColor: T.card, borderColor: T.borde }]}
            onPress={() => onCambiar(p)} activeOpacity={0.75}>
            <Text style={[st.pBtnTxt, { color: pagina === p ? "#fff" : T.txtMain }]}>{p}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[st.pBtn, { backgroundColor: T.card, borderColor: T.borde }, pagina === totalPaginas && { opacity: 0.4 }]}
          onPress={() => pagina < totalPaginas && onCambiar(pagina + 1)} disabled={pagina === totalPaginas} activeOpacity={0.75}>
          <ChevronRight size={13} color={T.txtMain} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────
function RpDropdown({ label, valor, opciones, onSelect, T }: {
  label: string; valor: string; opciones: string[];
  onSelect: (v: string) => void; T: ReturnType<typeof useT>;
}) {
  const [open, setOpen] = useState(false);
  const activo = valor !== opciones[0];
  return (
    <View style={st.rpFilter}>
      <Text style={[st.rpFilterLabel, { color: T.txtSec }]}>{label}</Text>
      <TouchableOpacity
        style={[st.rpDropdown, {
          backgroundColor: activo ? T.verdeAlfa : T.cardElevada,
          borderColor: activo ? T.verde : T.borde,
        }]}
        activeOpacity={0.75}
        onPress={() => setOpen((o) => !o)}
      >
        <Text style={[st.rpDropdownTxt, { color: activo ? T.verde : T.txtMain, fontWeight: activo ? "700" : "400" }]}>
          {valor}
        </Text>
        <ChevronDown size={13} color={activo ? T.verde : T.txtTer} strokeWidth={2} />
      </TouchableOpacity>
      {open && (
        <View style={[st.rpMenu, { backgroundColor: T.card, borderColor: T.borde }]}>
          {opciones.map((op) => (
            <TouchableOpacity
              key={op}
              style={[st.rpMenuItem, { borderBottomColor: T.borde }]}
              onPress={() => { onSelect(op); setOpen(false); }}
              activeOpacity={0.75}
            >
              <Text style={[st.rpMenuTxt, { color: op === valor ? T.verde : T.txtMain,
                fontWeight: op === valor ? "700" : "400" }]}>{op}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function RightPanel({ T, animales,
  filtroEstado,    setFiltroEstado,
  filtroCategoria, setFiltroCategoria,
  filtroPotrero,   setFiltroPotrero,
  filtroSalud,     setFiltroSalud,
  filtroGenero,    setFiltroGenero,
  opcionesPotrero, onLimpiar,
}: {
  T: ReturnType<typeof useT>; animales: AnimalDemo[];
  filtroEstado: string;    setFiltroEstado: (v: string) => void;
  filtroCategoria: string; setFiltroCategoria: (v: string) => void;
  filtroPotrero: string;   setFiltroPotrero: (v: string) => void;
  filtroSalud: string;     setFiltroSalud: (v: string) => void;
  filtroGenero: string;    setFiltroGenero: (v: string) => void;
  opcionesPotrero: string[]; onLimpiar: () => void;
}) {
  // Resumen por potrero dinámico
  const resumenPotreros = useMemo(() => {
    const map = new Map<string, number>();
    animales.forEach((a) => map.set(a.potrero, (map.get(a.potrero) ?? 0) + 1));
    const COLORS = [T.verde, T.rojo, T.verde, T.naranja, T.azul];
    return Array.from(map.entries()).map(([name, count], i) => ({
      name, count, color: COLORS[i % COLORS.length],
    }));
  }, [animales, T]);

  const hayFiltros = [filtroEstado !== "Todos", filtroCategoria !== "Todas",
    filtroPotrero !== "Todos", filtroSalud !== "Todos", filtroGenero !== "Todos"]
    .some(Boolean);

  return (
    <View style={[st.rightPanel, { backgroundColor: T.card, borderLeftColor: T.borde }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={st.rpHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Filter size={14} color={T.txtMain} strokeWidth={2} />
            <Text style={[st.rpTitle, { color: T.txtMain }]}>Filtros</Text>
            {hayFiltros && (
              <View style={[st.rpActiveBadge, { backgroundColor: T.verdeAlfa }]}>
                <Text style={[{ fontSize: 9, fontWeight: "800", color: T.verde }]}>
                  {[filtroEstado !== "Todos", filtroCategoria !== "Todas",
                    filtroPotrero !== "Todos", filtroSalud !== "Todos", filtroGenero !== "Todos"]
                    .filter(Boolean).length} activos
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity activeOpacity={0.75} onPress={onLimpiar}>
            <Text style={[st.rpClear, { color: hayFiltros ? T.rojo : T.verde }]}>Limpiar todo</Text>
          </TouchableOpacity>
        </View>

        <RpDropdown label="Estado"         valor={filtroEstado}    T={T}
          opciones={["Todos", "Dentro", "Fuera"]}
          onSelect={setFiltroEstado} />
        <RpDropdown label="Categoría"      valor={filtroCategoria} T={T}
          opciones={["Todas", "Vaca", "Toro", "Ternero"]}
          onSelect={setFiltroCategoria} />
        <RpDropdown label="Potrero"        valor={filtroPotrero}   T={T}
          opciones={opcionesPotrero}
          onSelect={setFiltroPotrero} />
        <RpDropdown label="Salud"          valor={filtroSalud}     T={T}
          opciones={["Todos", "Excelente", "Atención", "Crítico"]}
          onSelect={setFiltroSalud} />
        <RpDropdown label="Género"         valor={filtroGenero}    T={T}
          opciones={["Todos", "♀ Hembra", "♂ Macho"]}
          onSelect={setFiltroGenero} />

        <TouchableOpacity
          style={[st.applyBtn, { backgroundColor: hayFiltros ? T.verdeOscuro : T.cardElevada }]}
          activeOpacity={0.85}
          onPress={hayFiltros ? undefined : onLimpiar}
        >
          <Text style={[st.applyBtnTxt, { color: hayFiltros ? "#fff" : T.txtSec }]}>
            {hayFiltros ? "Filtros aplicados ✓" : "Sin filtros activos"}
          </Text>
        </TouchableOpacity>

        <View style={[st.rpDivider, { backgroundColor: T.borde }]} />

        <Text style={[st.rpSectionTitle, { color: T.txtMain }]}>Resumen por potrero</Text>
        {resumenPotreros.map((p) => (
          <TouchableOpacity
            key={p.name}
            style={st.rpPotreroRow}
            activeOpacity={0.75}
            onPress={() => setFiltroPotrero(p.name === filtroPotrero ? "Todos" : p.name)}
          >
            <View style={[st.rpDot, { backgroundColor: p.name === filtroPotrero ? T.verde : p.color }]} />
            <Text style={[st.rpPotreroName, { color: p.name === filtroPotrero ? T.verde : T.txtMain,
              fontWeight: p.name === filtroPotrero ? "700" : "400" }]}>{p.name}</Text>
            <Text style={[st.rpPotreroCount, { color: T.txtSec }]}>{p.count}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={st.mapLink} activeOpacity={0.75} onPress={() => navigateTo("Map")}>
          <Map size={13} color={T.verde} strokeWidth={1.8} />
          <Text style={[st.mapLinkTxt, { color: T.verde }]}>Ver mapa de potreros</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Add animal modal ─────────────────────────────────────────────────────────
function AddAnimalModal({ visible, onClose, onRegistrar, T }: {
  visible: boolean;
  onClose: () => void;
  onRegistrar: (animal: AnimalDemo) => void;
  T: ReturnType<typeof useT>;
}) {
  const { width: sw, height: sh } = useWindowDimensions();
  const isSm = sw < 600;
  const [nombre,    setNombre]    = useState("");
  const [collar,    setCollar]    = useState("");
  const [categoria, setCategoria] = useState<"Vaca" | "Toro" | "Ternero">("Vaca");
  const [potrero,   setPotrero]   = useState("Potrero Norte");
  const [errNombre, setErrNombre] = useState(false);
  const [errCollar, setErrCollar] = useState(false);

  function reset() {
    setNombre(""); setCollar(""); setCategoria("Vaca"); setPotrero("Potrero Norte");
    setErrNombre(false); setErrCollar(false);
  }

  function handleClose() { reset(); onClose(); }

  function handleRegistrar() {
    const okNombre = nombre.trim().length > 0;
    const okCollar = collar.trim().length > 0;
    setErrNombre(!okNombre);
    setErrCollar(!okCollar);
    if (!okNombre || !okCollar) return;

    const prefijo = categoria === "Toro" ? "TOR" : categoria === "Ternero" ? "TER" : "VAC";
    const num = String(Math.floor(Math.random() * 900) + 100);
    onRegistrar({
      id: `local-${Date.now()}`,
      nombre: nombre.trim(),
      displayNombre: nombre.trim(),
      identificacion: `${prefijo}-${num}`,
      categoria,
      raza: "Sin especificar",
      edad: "Sin dato",
      genero: categoria === "Toro" ? "♂" : "♀",
      potrero,
      estado: "dentro",
      estadoCollar: "en_linea",
      salud: { sensor: "verde", label: "Excelente", descripcion: "Animal recién registrado.", r: 180, g: 220, b: 170 },
      bateria: 100,
      señal: "Buena",
      collarId: collar.trim(),
      ubicacion: {
        lat: CENTRO_DEMO.lat + (Math.random() - 0.5) * 0.003,
        lng: CENTRO_DEMO.lng + (Math.random() - 0.5) * 0.003,
      },
      dentroDeCerca: true,
      ultimaVez: "Ahora",
      peso: 0,
    });
    reset();
  }

  const CATEGORIAS: Array<"Vaca" | "Toro" | "Ternero"> = ["Vaca", "Toro", "Ternero"];
  const POTREROS = ["Potrero Norte", "Potrero Sur", "Potrero Este", "Potrero Oeste"];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={mo.backdrop}>
        <View style={[mo.dialog, { backgroundColor: T.card, borderColor: T.borde, width: Math.min(480, sw * 0.95), maxHeight: sh - 40, borderRadius: isSm ? 14 : 20 }]}>

          {/* Header */}
          <View style={[mo.header, isSm && { padding: 14, paddingBottom: 12, gap: 10 }]}>
            <View style={[mo.headerIcon, { backgroundColor: T.verdeLuz }]}>
              <Plus size={18} color={T.verde} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[mo.title, { color: T.txtMain }]}>Registrar animal</Text>
              <Text style={[mo.sub, { color: T.txtSec }]}>Agrega un nuevo animal al registro</Text>
            </View>
            <TouchableOpacity style={[mo.closeBtn, { backgroundColor: T.cardElevada }]} onPress={handleClose} activeOpacity={0.75}>
              <X size={16} color={T.txtSec} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={[mo.divider, { backgroundColor: T.borde }]} />

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: Math.max(200, sh - 260) }}>

          {/* Nombre */}
          <View style={mo.field}>
            <Text style={[mo.label, { color: T.txtSec }]}>Nombre del animal *</Text>
            <View style={[mo.inputBox, { borderColor: errNombre ? T.rojo : T.borde, backgroundColor: T.fondo }]}>
              <TextInput
                value={nombre}
                onChangeText={(t) => { setNombre(t); if (t.trim()) setErrNombre(false); }}
                placeholder="Ej: Luna, Estrella, Trueno..."
                placeholderTextColor={T.txtTer}
                style={[mo.inputText, { color: T.txtMain }] as any}
              />
            </View>
            {errNombre && <Text style={[mo.error, { color: T.rojo }]}>El nombre es requerido</Text>}
          </View>

          {/* Collar */}
          <View style={mo.field}>
            <Text style={[mo.label, { color: T.txtSec }]}>ID del collar *</Text>
            <View style={[mo.inputBox, { borderColor: errCollar ? T.rojo : T.borde, backgroundColor: T.fondo }]}>
              <TextInput
                value={collar}
                onChangeText={(t) => { setCollar(t); if (t.trim()) setErrCollar(false); }}
                placeholder="Ej: COL-1017, SF-2001..."
                placeholderTextColor={T.txtTer}
                style={[mo.inputText, { color: T.txtMain }] as any}
              />
            </View>
            {errCollar && <Text style={[mo.error, { color: T.rojo }]}>El ID del collar es requerido</Text>}
          </View>

          {/* Categoría */}
          <View style={mo.field}>
            <Text style={[mo.label, { color: T.txtSec }]}>Categoría</Text>
            <View style={mo.pills}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[mo.pill, cat === categoria
                    ? { backgroundColor: T.verdeOscuro, borderColor: T.verdeOscuro }
                    : { backgroundColor: T.cardElevada, borderColor: T.borde }
                  ]}
                  onPress={() => setCategoria(cat)}
                  activeOpacity={0.75}
                >
                  <Text style={[mo.pillTxt, { color: cat === categoria ? "#fff" : T.txtMain }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Potrero */}
          <View style={mo.field}>
            <Text style={[mo.label, { color: T.txtSec }]}>Potrero</Text>
            <View style={mo.pills}>
              {POTREROS.map((pot) => (
                <TouchableOpacity
                  key={pot}
                  style={[mo.pill, pot === potrero
                    ? { backgroundColor: T.verdeOscuro, borderColor: T.verdeOscuro }
                    : { backgroundColor: T.cardElevada, borderColor: T.borde }
                  ]}
                  onPress={() => setPotrero(pot)}
                  activeOpacity={0.75}
                >
                  <Text style={[mo.pillTxt, { color: pot === potrero ? "#fff" : T.txtMain }]}>
                    {pot.replace("Potrero ", "")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[mo.divider, { backgroundColor: T.borde, marginTop: 16 }]} />

          {/* Actions */}
          <View style={mo.actions}>
            <TouchableOpacity
              style={[mo.cancelBtn, { borderColor: T.borde, backgroundColor: T.card }]}
              onPress={handleClose}
              activeOpacity={0.75}
            >
              <Text style={[mo.cancelTxt, { color: T.txtSec }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[mo.saveBtn, { backgroundColor: T.verdeOscuro }]}
              onPress={handleRegistrar}
              activeOpacity={0.85}
            >
              <Plus size={15} color="#fff" strokeWidth={2.5} />
              <Text style={mo.saveTxt}>Registrar animal</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Animal detail modal ──────────────────────────────────────────────────────
function AnimalDetailModal({ animal, onClose, T }: {
  animal: AnimalDemo | null;
  onClose: () => void;
  T: ReturnType<typeof useT>;
}) {
  const { width: sw, height: sh } = useWindowDimensions();
  const isSm = sw < 600;

  if (!animal) return null;

  const dentroColor  = animal.dentroDeCerca ? T.verde : T.rojo;
  const dentroBg     = animal.dentroDeCerca ? T.verdeAlfa : T.rojoBg;
  const batColor     = animal.bateria >= 60 ? T.verde : animal.bateria >= 30 ? T.naranja : T.rojo;
  const señalColor   = animal.señal === "Excelente" ? T.verde : animal.señal === "Buena" ? T.naranja : T.rojo;
  const saludColor: Record<string, string> = { verde: T.verde, amarillo: T.naranja, rojo: T.rojo };

  const initials  = animal.displayNombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const avatarBg  = animal.categoria === "Toro" ? T.naranjaBg : T.verdeLuz;

  const collarBadge = {
    en_linea:     { label: "En línea",  color: T.verde,   bg: T.verdeAlfa },
    bateria_baja: { label: "Bat. baja", color: T.naranja, bg: T.naranjaBg },
    cortado:      { label: "Cortado",   color: T.rojo,    bg: T.rojoBg    },
    retirado:     { label: "Retirado",  color: T.rojo,    bg: T.rojoBg    },
    sin_señal:    { label: "Sin señal", color: T.azul,    bg: T.azulBg    },
  }[animal.estadoCollar];

  function DetailRow({ icon: Icon, label, value, valueColor }: {
    icon: React.ComponentType<any>; label: string; value: string; valueColor?: string;
  }) {
    return (
      <View style={dm.detailRow}>
        <View style={[dm.detailIcon, { backgroundColor: T.cardElevada }]}>
          <Icon size={13} color={T.txtSec} strokeWidth={1.8} />
        </View>
        <Text style={[dm.detailLabel, { color: T.txtSec }]}>{label}</Text>
        <Text style={[dm.detailValue, { color: valueColor ?? T.txtMain }]} numberOfLines={1}>{value}</Text>
      </View>
    );
  }

  return (
    <Modal visible={!!animal} transparent animationType="fade" onRequestClose={onClose}>
      <View style={mo.backdrop}>
        <View style={[dm.dialog, { backgroundColor: T.card, borderColor: T.borde, width: Math.min(540, sw * 0.95), maxHeight: sh - 40, borderRadius: isSm ? 14 : 20 }]}>

          {/* ── Header ── */}
          <View style={[dm.header, isSm && { padding: 14, paddingBottom: 12, gap: 10 }]}>
            <View style={[st.avatar, { backgroundColor: avatarBg, width: isSm ? 42 : 52, height: isSm ? 42 : 52, borderRadius: isSm ? 21 : 26 }]}>
              <Text style={[st.avatarTxt, { color: T.verdeOscuro, fontSize: isSm ? 13 : 16 }]}>{initials}</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[dm.name, { color: T.txtMain }]}>{animal.displayNombre}</Text>
              <Text style={[dm.idTxt, { color: T.txtSec }]}>{animal.identificacion} · {animal.genero} · {animal.raza}</Text>
              <View style={dm.headerBadges}>
                <View style={[st.badge, { backgroundColor: dentroBg }]}>
                  <Text style={[st.badgeTxt, { color: dentroColor }]}>{animal.dentroDeCerca ? "Dentro de la cerca" : "Fuera de la cerca"}</Text>
                </View>
                <View style={[st.badge, { backgroundColor: animal.categoria === "Toro" ? T.naranjaBg : T.verdeLuz }]}>
                  <Text style={[st.badgeTxt, { color: animal.categoria === "Toro" ? T.naranja : T.verde }]}>{animal.categoria}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={[mo.closeBtn, { backgroundColor: T.cardElevada }]} onPress={onClose} activeOpacity={0.75}>
              <X size={16} color={T.txtSec} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={[mo.divider, { backgroundColor: T.borde }]} />

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: Math.max(180, sh - 220) }}>
            {/* ── Collar ── */}
            <View style={dm.section}>
              <Text style={[dm.sectionTitle, { color: T.txtSec }]}>COLLAR / DISPOSITIVO</Text>

              <View style={[dm.collarBox, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                <View style={dm.collarTop}>
                  <View style={{ gap: 2, flex: 1 }}>
                    <Text style={[dm.collarId, { color: T.txtMain }]}>{animal.collarId}</Text>
                    <Text style={[dm.collarProtocol, { color: T.txtSec }]}>Protocolo LoRa</Text>
                  </View>
                  <View style={[st.badge, { backgroundColor: collarBadge.bg }]}>
                    <Text style={[st.badgeTxt, { color: collarBadge.color }]}>{collarBadge.label}</Text>
                  </View>
                </View>

                {/* Batería */}
                <View style={dm.batRow}>
                  <BatteryIcon pct={animal.bateria} color={batColor} />
                  <Text style={[dm.batPct, { color: batColor }]}>{animal.bateria}%</Text>
                  <View style={[dm.batBarBg, { backgroundColor: T.borde, flex: 1 }]}>
                    <View style={[dm.batBarFill, { width: `${animal.bateria}%` as any, backgroundColor: batColor }]} />
                  </View>
                  <Text style={[dm.batLabel, { color: T.txtTer }]}>Batería</Text>
                </View>

                {/* Señal */}
                <View style={dm.señalRow}>
                  <SignalBars señal={animal.señal} color={señalColor} />
                  <Text style={[dm.señalTxt, { color: señalColor }]}>{animal.señal}</Text>
                  <Text style={[dm.señalLabel, { color: T.txtTer }]}>Señal LoRa</Text>
                </View>
              </View>
            </View>

            {/* ── Ubicación ── */}
            <View style={dm.section}>
              <Text style={[dm.sectionTitle, { color: T.txtSec }]}>UBICACIÓN</Text>
              <View style={dm.grid}>
                <View style={[dm.gridCell, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                  <MapPin size={14} color={T.verde} strokeWidth={1.8} />
                  <Text style={[dm.gridLabel, { color: T.txtTer }]}>Potrero</Text>
                  <Text style={[dm.gridValue, { color: T.txtMain }]}>{animal.potrero}</Text>
                </View>
                <View style={[dm.gridCell, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                  <MapPin size={14} color={T.azul} strokeWidth={1.8} />
                  <Text style={[dm.gridLabel, { color: T.txtTer }]}>Coordenadas</Text>
                  <Text style={[dm.gridValue, { color: T.txtMain }]}>
                    {animal.ubicacion.lat.toFixed(5)}, {animal.ubicacion.lng.toFixed(5)}
                  </Text>
                </View>
                <View style={[dm.gridCell, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                  <HeartPulse size={14} color={T.txtSec} strokeWidth={1.8} />
                  <Text style={[dm.gridLabel, { color: T.txtTer }]}>Última vez visto</Text>
                  <Text style={[dm.gridValue, { color: T.txtMain }]}>{animal.ultimaVez}</Text>
                </View>
              </View>
            </View>

            {/* ── Salud ── */}
            <View style={dm.section}>
              <Text style={[dm.sectionTitle, { color: T.txtSec }]}>SALUD</Text>
              <View style={[dm.saludBox, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                <View style={dm.saludTop}>
                  <ColorDot r={animal.salud.r} g={animal.salud.g} b={animal.salud.b} size={14} />
                  <Text style={[dm.saludLabel, { color: saludColor[animal.salud.sensor] }]}>{animal.salud.label}</Text>
                  <View style={{ flex: 1 }} />
                  <View style={[st.badge, {
                    backgroundColor: animal.salud.sensor === "verde" ? T.verdeAlfa : animal.salud.sensor === "amarillo" ? T.naranjaBg : T.rojoBg,
                  }]}>
                    <Text style={[st.badgeTxt, { color: saludColor[animal.salud.sensor] }]}>Sensor mucosa</Text>
                  </View>
                </View>
                <Text style={[dm.saludDesc, { color: T.txtSec }]}>{animal.salud.descripcion}</Text>
                <View style={dm.saludRgb}>
                  <Text style={[dm.rgbTxt, { color: T.txtTer }]}>
                    RGB detectado: ({animal.salud.r}, {animal.salud.g}, {animal.salud.b})
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Info general ── */}
            <View style={[dm.section, { paddingBottom: 4 }]}>
              <Text style={[dm.sectionTitle, { color: T.txtSec }]}>INFORMACIÓN GENERAL</Text>
              <View style={[dm.infoBox, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
                <View style={dm.infoGrid}>
                  {[
                    { label: "Edad",    value: animal.edad         },
                    { label: "Género",  value: `${animal.genero} ${animal.categoria}` },
                    { label: "Raza",    value: animal.raza         },
                    { label: "Peso",    value: animal.peso ? `${animal.peso} kg` : "Sin dato" },
                  ].map((item) => (
                    <View key={item.label} style={dm.infoItem}>
                      <Text style={[dm.infoLabel, { color: T.txtTer }]}>{item.label}</Text>
                      <Text style={[dm.infoValue, { color: T.txtMain }]}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={[mo.divider, { backgroundColor: T.borde, marginBottom: 0 }]} />

          {/* ── Footer actions ── */}
          <View style={[dm.footer, isSm && { flexWrap: "wrap" as any, padding: 12, paddingTop: 10, gap: 6 }]}>
            <TouchableOpacity
              style={[dm.footerBtn, { borderColor: T.borde, backgroundColor: T.card }, isSm && { flex: 1, justifyContent: "center" as any }]}
              onPress={onClose}
              activeOpacity={0.75}
            >
              <X size={14} color={T.txtSec} strokeWidth={2} />
              <Text style={[dm.footerBtnTxt, { color: T.txtSec }]}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dm.footerBtn, { borderColor: T.borde, backgroundColor: T.cardElevada }, isSm && { flex: 1, justifyContent: "center" as any }]}
              onPress={() => { onClose(); navigateTo("Map"); }}
              activeOpacity={0.75}
            >
              <Map size={14} color={T.txtMain} strokeWidth={1.8} />
              <Text style={[dm.footerBtnTxt, { color: T.txtMain }]}>Ver en mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dm.footerBtn, { backgroundColor: T.verdeOscuro, borderColor: T.verdeOscuro }, isSm && { flex: 1, justifyContent: "center" as any }]}
              activeOpacity={0.85}
            >
              <BarChart2 size={14} color="#fff" strokeWidth={1.8} />
              <Text style={[dm.footerBtnTxt, { color: "#fff" }]}>Ver historial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  dialog:     { width: 540, maxWidth: "95%" as any, borderRadius: 20, borderWidth: 1, overflow: "hidden" as any },
  header:     { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 20, paddingBottom: 16 },
  name:       { fontSize: 18, fontWeight: "800" },
  idTxt:      { fontSize: 12 },
  headerBadges: { flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" as any },
  section:    { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  // Collar box
  collarBox:  { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  collarTop:  { flexDirection: "row", alignItems: "center", gap: 10 },
  collarId:   { fontSize: 15, fontWeight: "800" },
  collarProtocol: { fontSize: 11 },
  batRow:     { flexDirection: "row", alignItems: "center", gap: 8 },
  batPct:     { fontSize: 13, fontWeight: "700", minWidth: 36 },
  batBarBg:   { height: 6, borderRadius: 3, overflow: "hidden" as any },
  batBarFill: { height: 6, borderRadius: 3 },
  batLabel:   { fontSize: 11, minWidth: 44 },
  señalRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  señalTxt:   { fontSize: 13, fontWeight: "700" },
  señalLabel: { fontSize: 11 },
  // Grid
  grid:       { flexDirection: "row", gap: 8, flexWrap: "wrap" as any },
  gridCell:   { flex: 1, minWidth: 120, borderRadius: 10, borderWidth: 1, padding: 12, gap: 4 },
  gridLabel:  { fontSize: 10, fontWeight: "600", marginTop: 4 },
  gridValue:  { fontSize: 13, fontWeight: "700" },
  // Salud
  saludBox:   { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  saludTop:   { flexDirection: "row", alignItems: "center", gap: 8 },
  saludLabel: { fontSize: 14, fontWeight: "800" },
  saludDesc:  { fontSize: 12, lineHeight: 18 },
  saludRgb:   { flexDirection: "row" },
  rgbTxt:     { fontSize: 10 },
  // Info general
  infoBox:    { borderRadius: 12, borderWidth: 1, padding: 14 },
  infoGrid:   { flexDirection: "row", flexWrap: "wrap" as any, gap: 0 },
  infoItem:   { width: "50%" as any, paddingVertical: 6, paddingRight: 12, gap: 2 },
  infoLabel:  { fontSize: 10, fontWeight: "600" },
  infoValue:  { fontSize: 13, fontWeight: "700" },
  // Detail row (unused, kept for future)
  detailRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  detailIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  detailLabel:{ fontSize: 12, minWidth: 100 },
  detailValue:{ fontSize: 12, fontWeight: "600", flex: 1, textAlign: "right" as any },
  // Footer
  footer:     { flexDirection: "row", gap: 8, padding: 16, justifyContent: "flex-end" },
  footerBtn:  { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  footerBtnTxt: { fontSize: 13, fontWeight: "600" },
});

const mo = StyleSheet.create({
  backdrop:   { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  dialog:     { width: 480, maxWidth: "92%" as any, borderRadius: 20, borderWidth: 1, overflow: "hidden" as any },
  header:     { flexDirection: "row", alignItems: "center", gap: 12, padding: 20, paddingBottom: 16 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title:      { fontSize: 16, fontWeight: "800" },
  sub:        { fontSize: 12, marginTop: 2 },
  closeBtn:   { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  divider:    { height: 1, marginHorizontal: 20 },
  field:      { paddingHorizontal: 20, paddingTop: 14, gap: 6 },
  label:      { fontSize: 12, fontWeight: "600" },
  inputBox:   { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  inputText:  { flex: 1, fontSize: 14 } as any,
  error:      { fontSize: 11 },
  pills:      { flexDirection: "row", gap: 8, flexWrap: "wrap" as any },
  pill:       { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  pillTxt:    { fontSize: 13, fontWeight: "600" },
  actions:    { flexDirection: "row", gap: 10, padding: 20, paddingTop: 16, justifyContent: "flex-end" },
  cancelBtn:  { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  cancelTxt:  { fontSize: 14, fontWeight: "600" },
  saveBtn:    { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 },
  saveTxt:    { fontSize: 14, fontWeight: "700", color: "#fff" },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:   { flex: 1, flexDirection: "row" },
  main:   { flex: 1, flexDirection: "column", overflow: "hidden" as any },
  body:   { flex: 1, flexDirection: "row", overflow: "hidden" as any },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 60, gap: 12 },

  registerBtn:    { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  registerBtnTxt: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // Stats
  statsRow:  { flexDirection: "row", gap: 10 },
  statCard:  { flex: 1, minWidth: 140, borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  statTop:   { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  statIcon:  { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { fontSize: 11, marginBottom: 2 },
  statValor: { fontSize: 26, fontWeight: "900", lineHeight: 28 },
  statSub:   { fontSize: 11, fontWeight: "600" },
  progBg:    { height: 5, borderRadius: 3, overflow: "hidden" as any, marginTop: 6 },
  progFill:  { height: 5, borderRadius: 3 },

  // Toolbar
  toolbar:   { flexDirection: "row", gap: 8, alignItems: "center" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 38, minWidth: 180, flex: 1, maxWidth: 280 },
  searchInput: { flex: 1, fontSize: 13, padding: 0, outlineStyle: "none" as any },
  pill:       { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 38 },
  pillTxt:    { fontSize: 12, fontWeight: "500" },
  moreFiltersBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 38 },
  moreFiltersTxt: { fontSize: 12, fontWeight: "500" },

  // Table
  table:   { borderRadius: 14, borderWidth: 1, overflow: "hidden" as any },
  thead:   { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1 },
  th:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },

  row:     { flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, gap: 6 },
  cellAnimal: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar:  { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarTxt: { fontSize: 12, fontWeight: "800" },
  animalInfo: { gap: 1 },
  animalName: { fontSize: 12, fontWeight: "700" },
  animalSub:  { fontSize: 10 },
  chips:   { flexDirection: "row", gap: 4, marginTop: 2 },
  chip:    { borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  chipTxt: { fontSize: 9, fontWeight: "600" },
  badge:   { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  badgeTxt: { fontSize: 10, fontWeight: "700" },
  cellTxt:  { fontSize: 11 },
  cellTxtBold: { fontSize: 11, fontWeight: "700" },
  subTxt:  { fontSize: 10 },
  coordTxt: { fontSize: 9 },
  cellRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cellCenter: { alignItems: "flex-start" },
  batBg:   { height: 4, borderRadius: 2, overflow: "hidden" as any, width: 60, marginTop: 4 },
  batFill: { height: 4, borderRadius: 2 },
  actions: { flexDirection: "row", gap: 4, alignItems: "center" },
  actionBtn: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },

  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 10, borderBottomWidth: 1 },
  emptyTxt: { fontSize: 13 },

  // Pagination
  pagination: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, gap: 8, flexWrap: "wrap" as any },
  paginInfo:  { fontSize: 12, flex: 1 },
  paginBtns:  { flexDirection: "row", gap: 4 },
  pBtn:       { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  pBtnTxt:    { fontSize: 12, fontWeight: "600" },

  // Mobile cards
  cardList: { gap: 10 },
  mCard:    { borderRadius: 14, borderWidth: 1, padding: 14, gap: 0 },
  mCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  mDivider: { height: 1, marginVertical: 12 },
  mCardBottom: { flexDirection: "row", gap: 0, justifyContent: "space-between" },
  mStat:    { flex: 1, gap: 4 },
  mStatLabel: { fontSize: 10 },
  mStatVal:   { fontSize: 12, fontWeight: "700" },
  mActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  mActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1, borderRadius: 8, paddingVertical: 8 },
  mActionTxt: { fontSize: 11, fontWeight: "600" },

  // Filter pill dropdown menu
  pillMenu:     { position: "absolute" as any, top: 40, left: 0, minWidth: 160, borderRadius: 10, borderWidth: 1, overflow: "hidden" as any, zIndex: 20 },
  pillMenuItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  pillMenuTxt:  { fontSize: 13 },

  // Right panel
  rightPanel: { width: 255, borderLeftWidth: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  rpHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  rpTitle:  { fontSize: 14, fontWeight: "700" },
  rpClear:  { fontSize: 12, fontWeight: "600" },
  rpActiveBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  rpFilter: { marginBottom: 10, gap: 5 },
  rpFilterLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase" as any },
  rpDropdown: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  rpDropdownTxt: { fontSize: 13 },
  rpMenu:    { borderRadius: 10, borderWidth: 1, marginTop: 4, overflow: "hidden" as any },
  rpMenuItem:{ paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1 },
  rpMenuTxt: { fontSize: 13 },
  applyBtn:    { borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center", marginTop: 4, marginBottom: 16 },
  applyBtnTxt: { fontSize: 13, fontWeight: "700" },
  rpDivider:   { height: 1, marginBottom: 16 },
  rpSectionTitle: { fontSize: 12, fontWeight: "700", marginBottom: 10 },
  rpPotreroRow:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, paddingVertical: 2 },
  rpDot:       { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  rpPotreroName: { fontSize: 12, flex: 1 },
  rpPotreroCount: { fontSize: 12, fontWeight: "600" },
  mapLink:     { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  mapLinkTxt:  { fontSize: 12, fontWeight: "600" },
});
