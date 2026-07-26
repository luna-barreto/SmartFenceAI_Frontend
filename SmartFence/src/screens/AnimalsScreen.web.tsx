import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  useWindowDimensions,
} from "react-native";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BarChart2,
  MoreHorizontal,
  Map,
  Plus,
} from "lucide-react-native";
import Svg, { Path, Polyline, Rect } from "react-native-svg";
import { useAnimals } from "@hooks/useAnimals";
import { useT } from "@context/ThemeContext";
import { navigateTo } from "@navigation/navigationRef";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import { Animal } from "@/types";

// ─── CowIcon ──────────────────────────────────────────────────────────────────
function CowIcon({ size = 20, color = "#4F9E2C" }: { size?: number; color?: string }) {
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

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ color }: { color: string }) {
  return (
    <Svg width={44} height={18} viewBox="0 0 44 18">
      <Polyline
        points="2,15 8,12 16,9 22,7 28,5 36,3 42,2"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Signal bars ─────────────────────────────────────────────────────────────
function SignalBars({ señal, color }: { señal: string; color: string }) {
  const bars = señal === "Excelente" ? 3 : señal === "Buena" ? 2 : 1;
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14">
      <Rect x={0} y={10} width={4} height={4} rx={1} fill={bars >= 1 ? color : "#d1d5db"} />
      <Rect x={6} y={6} width={4} height={8} rx={1} fill={bars >= 2 ? color : "#d1d5db"} />
      <Rect x={12} y={2} width={4} height={12} rx={1} fill={bars >= 3 ? color : "#d1d5db"} />
    </Svg>
  );
}

// ─── Enrich ───────────────────────────────────────────────────────────────────
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
const EDADES = ["1.5 años", "2.5 años", "3 años", "4 años", "1.8 años", "2.2 años", "3.5 años", "1.2 años", "5 años", "2.8 años"];

function enrich(a: Animal, i: number, T: ReturnType<typeof useT>): EnrichedAnimal {
  const esToro = a.nombre.includes("Trueno") || a.nombre.includes("Sultán") || i % 5 === 1;
  const categoria = esToro ? "Toro" : "Vaca";
  const idNum = String(100 + i).padStart(3, "0");
  return {
    ...a,
    potrero: POTREROS[i % 4],
    categoria,
    identificacion: `${esToro ? "TOR" : "VAC"}-${idNum}`,
    edad: EDADES[i % 10],
    genero: esToro ? "♂" : "♀",
    avatarBg: esToro ? T.naranjaBg : T.verdeLuz,
    displayNombre: `${categoria} ${String(i + 1).padStart(2, "0")}`,
  };
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  valor,
  label,
  color,
  bg,
  sparkline,
  sparkPct,
  progressPct,
  progressColor,
}: {
  icon: React.ComponentType<any>;
  valor: number | string;
  label: string;
  color: string;
  bg: string;
  sparkline?: boolean;
  sparkPct?: string;
  progressPct?: number;
  progressColor?: string;
}) {
  const T = useT();
  return (
    <View style={[st.statCard, { backgroundColor: T.card, borderColor: T.borde }]}>
      <View style={st.statCardTop}>
        <View style={[st.statIconBox, { backgroundColor: bg }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={[st.statValor, { color }]}>{valor}</Text>
      </View>
      <Text style={[st.statLabel, { color: T.txtSec }]}>{label}</Text>
      {sparkline ? (
        <View style={st.statBottom}>
          <Sparkline color={color} />
          {sparkPct && <Text style={[st.statPct, { color }]}>↑ {sparkPct}</Text>}
        </View>
      ) : (
        <View style={st.statProgressWrap}>
          <View style={[st.statProgressBg, { backgroundColor: T.borde }]}>
            <View
              style={[
                st.statProgressFill,
                { width: `${Math.min(progressPct ?? 0, 100)}%` as any, backgroundColor: progressColor ?? color },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Dropdown pill ────────────────────────────────────────────────────────────
function FilterPill({ label, T }: { label: string; T: ReturnType<typeof useT> }) {
  return (
    <View style={[st.filterPill, { backgroundColor: T.card, borderColor: T.borde }]}>
      <Text style={[st.filterPillTxt, { color: T.txtSec }]}>{label}</Text>
      <ChevronDown size={14} color={T.txtTer} strokeWidth={1.8} />
    </View>
  );
}

// ─── Table header cell ────────────────────────────────────────────────────────
function TH({ label, flex, width }: { label: string; flex?: number; width?: number }) {
  const T = useT();
  return (
    <Text
      style={[
        st.thCell,
        { color: T.txtSec },
        flex !== undefined ? { flex } : undefined,
        width !== undefined ? { width } : undefined,
      ]}
    >
      {label}
    </Text>
  );
}

const ITEMS_PER_PAGE = 8;

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AnimalsScreen() {
  const T = useT();
  const { animales } = useAnimals();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const enriched = useMemo(() => animales.map((a, i) => enrich(a, i, T)), [animales, T]);

  const total = enriched.length || 28;
  const dentroCount = enriched.filter((a) => a.dentroDeCerca).length || 24;
  const fueraCount = enriched.filter((a) => !a.dentroDeCerca).length || 4;
  const atencionCount = enriched.filter((a) => a.salud === "Regular").length || 3;

  const filtrados = useMemo(() => {
    if (!busqueda) return enriched;
    const q = busqueda.toLowerCase();
    return enriched.filter((a) =>
      `${a.displayNombre} ${a.identificacion} ${a.raza} ${a.potrero}`.toLowerCase().includes(q)
    );
  }, [enriched, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice((paginaActual - 1) * ITEMS_PER_PAGE, paginaActual * ITEMS_PER_PAGE);

  const registerButton = (
    <TouchableOpacity
      style={[st.registerBtn, { backgroundColor: T.verdeOscuro }]}
      activeOpacity={0.85}
    >
      <Plus size={14} color="#fff" strokeWidth={2.5} />
      <Text style={st.registerBtnTxt}>Registrar animal</Text>
    </TouchableOpacity>
  );

  const { width } = useWindowDimensions();
  const isMd = width < 1100;
  const isSm = width < 768;

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      {/* Sidebar */}
      <WebSidebar activeRoute="Animals" />

      {/* Main */}
      <View style={st.main}>
        <WebTopBar
          titulo="Animales"
          sub="Gestiona y registra todos los animales"
          alertasCount={0}
          rightContent={registerButton}
        />

        {/* Content row */}
        <View style={st.contentRow}>
          {/* Left main area */}
          <ScrollView
            style={st.leftArea}
            contentContainerStyle={st.leftContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Stat cards */}
            <View style={[st.statCardsRow, isMd && { flexWrap: "wrap" }]}>
              <StatCard
                icon={CowIcon}
                valor={total}
                label="Total animales"
                color={T.verde}
                bg={T.verdeLuz}
                sparkline
                sparkPct="12% vs. mes anterior"
              />
              <StatCard
                icon={CowIcon}
                valor={dentroCount}
                label="Dentro de la cerca"
                color={T.verde}
                bg={T.verdeLuz}
                progressPct={total > 0 ? (dentroCount / total) * 100 : 85}
                progressColor={T.verde}
              />
              <StatCard
                icon={CowIcon}
                valor={fueraCount}
                label="Fuera de la cerca"
                color={T.rojo}
                bg={T.rojoBg}
                progressPct={total > 0 ? (fueraCount / total) * 100 : 15}
                progressColor={T.rojo}
              />
              <StatCard
                icon={CowIcon}
                valor={atencionCount}
                label="Con atención"
                color={T.naranja}
                bg={T.naranjaBg}
                progressPct={total > 0 ? (atencionCount / total) * 100 : 11}
                progressColor={T.naranja}
              />
            </View>

            {/* Toolbar */}
            <View style={st.toolbarRow}>
              <View style={[st.searchWrap, { backgroundColor: T.card, borderColor: T.borde }]}>
                <Search size={14} color={T.txtTer} strokeWidth={1.8} />
                <TextInput
                  value={busqueda}
                  onChangeText={(t) => { setBusqueda(t); setPagina(1); }}
                  placeholder="Buscar animal..."
                  placeholderTextColor={T.txtTer}
                  style={[st.searchInput, { color: T.txtMain }]}
                />
              </View>
              <FilterPill label="Estado: Todos" T={T} />
              <FilterPill label="Categoría: Todas" T={T} />
              <FilterPill label="Potrero: Todos" T={T} />
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={[st.iconBtn, { backgroundColor: T.card, borderColor: T.borde }]}
                activeOpacity={0.75}
              >
                <SlidersHorizontal size={16} color={T.txtMain} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>

            {/* Table */}
            <View style={[st.table, { backgroundColor: T.card, borderColor: T.borde }]}>
              {/* Table header */}
              <View style={[st.tableHeader, { backgroundColor: T.cardElevada, borderBottomColor: T.borde }]}>
                <TH label="ANIMAL" flex={2} />
                <TH label="ESTADO" width={100} />
                <TH label="POTRERO" flex={1} />
                <TH label="COLLAR / DISP." flex={1} />
                <TH label="BATERÍA" width={90} />
                <TH label="SEÑAL" width={80} />
                <TH label="ÚLTIMA UBICACIÓN" flex={1} />
                <TH label="ACCIONES" width={80} />
              </View>

              {/* Rows */}
              {paginados.length === 0 ? (
                <View style={[st.emptyRow, { borderColor: T.borde }]}>
                  <CowIcon size={32} color={T.txtTer} />
                  <Text style={[st.emptyTxt, { color: T.txtSec }]}>No se encontraron animales.</Text>
                </View>
              ) : (
                paginados.map((animal, idx) => (
                  <AnimalTableRow
                    key={animal.id}
                    animal={animal}
                    isLast={idx === paginados.length - 1}
                    T={T}
                  />
                ))
              )}

              {/* Pagination */}
              <TablePagination
                pagina={paginaActual}
                totalPaginas={totalPaginas}
                totalItems={filtrados.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onCambiar={setPagina}
                T={T}
              />
            </View>
          </ScrollView>

          {/* Right panel */}
          <RightFiltersPanel T={T} enriched={enriched} />
        </View>
      </View>
    </View>
  );
}

// ─── Animal table row ─────────────────────────────────────────────────────────
function AnimalTableRow({
  animal,
  isLast,
  T,
}: {
  animal: EnrichedAnimal;
  isLast: boolean;
  T: ReturnType<typeof useT>;
}) {
  const dentroColor = animal.dentroDeCerca ? T.verde : T.rojo;
  const dentroBg = animal.dentroDeCerca ? T.verdeAlfa : T.rojoBg;
  const bateria = animal.collar?.bateria ?? 0;
  const bateriaColor = bateria >= 60 ? T.verde : bateria >= 30 ? T.naranja : T.rojo;
  const señal = animal.collar?.señal ?? "Buena";
  const señalColor = señal === "Excelente" ? T.verde : señal === "Buena" ? T.naranja : T.rojo;
  const lat = (animal.ubicacion?.lat ?? 0).toFixed(4);
  const lng = (animal.ubicacion?.lng ?? 0).toFixed(4);
  const initials = animal.displayNombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity
      style={[
        st.tableRow,
        { backgroundColor: T.card, borderBottomColor: T.borde },
        isLast && { borderBottomWidth: 0 },
      ]}
      activeOpacity={0.75}
      onPress={() => navigateTo("AnimalDetail", { animalId: animal.id })}
    >
      {/* Animal cell */}
      <View style={[st.tdAnimal, { flex: 2 }]}>
        <View style={[st.rowAvatar, { backgroundColor: animal.avatarBg }]}>
          <Text style={[st.rowAvatarTxt, { color: T.verdeOscuro }]}>{initials}</Text>
        </View>
        <View style={st.rowAnimalInfo}>
          <Text style={[st.rowName, { color: T.txtMain }]}>{animal.displayNombre}</Text>
          <Text style={[st.rowId, { color: T.txtSec }]}>{animal.identificacion}</Text>
          <View style={st.rowChips}>
            <View style={[st.rowChip, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <Text style={[st.rowChipTxt, { color: T.txtSec }]}>{animal.categoria}</Text>
            </View>
            <View style={[st.rowChip, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
              <Text style={[st.rowChipTxt, { color: T.txtSec }]}>{animal.edad}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Estado */}
      <View style={{ width: 100, alignItems: "flex-start" }}>
        <View style={[st.estadoBadge, { backgroundColor: dentroBg }]}>
          <Text style={[st.estadoBadgeTxt, { color: dentroColor }]}>
            {animal.dentroDeCerca ? "Dentro" : "Fuera"}
          </Text>
        </View>
      </View>

      {/* Potrero */}
      <View style={[st.tdRow, { flex: 1 }]}>
        <MapPin size={12} color={T.txtTer} strokeWidth={1.8} />
        <Text style={[st.tdTxt, { color: T.txtMain }]}>{animal.potrero}</Text>
      </View>

      {/* Collar */}
      <View style={{ flex: 1 }}>
        <Text style={[st.tdTxt, { color: T.txtMain }]}>{animal.collar?.id ?? "Sin collar"}</Text>
        <Text style={[st.tdSubTxt, { color: T.txtSec }]}>LoRa</Text>
      </View>

      {/* Batería */}
      <View style={{ width: 90 }}>
        <View style={[st.batBarBg, { backgroundColor: T.cardElevada }]}>
          <View
            style={[
              st.batBarFill,
              { width: `${bateria}%` as any, backgroundColor: bateriaColor },
            ]}
          />
        </View>
        <Text style={[st.tdTxt, { color: T.txtMain, marginTop: 3 }]}>{bateria}%</Text>
      </View>

      {/* Señal */}
      <View style={{ width: 80, alignItems: "flex-start", gap: 3 }}>
        <SignalBars señal={señal} color={señalColor} />
        <Text style={[st.tdSubTxt, { color: T.txtSec }]}>{señal}</Text>
      </View>

      {/* Ubicación */}
      <View style={{ flex: 1 }}>
        <Text style={[st.tdSubTxt, { color: T.txtSec }]}>{lat}°N</Text>
        <Text style={[st.tdSubTxt, { color: T.txtSec }]}>{lng}°W</Text>
        <Text style={[st.tdTerTxt, { color: T.txtTer }]}>Hace 2 min</Text>
      </View>

      {/* Acciones */}
      <View style={[st.actionsCell, { width: 80 }]}>
        <TouchableOpacity
          style={[st.actionBtn, { backgroundColor: T.cardElevada }]}
          activeOpacity={0.75}
          onPress={() => navigateTo("Map")}
        >
          <MapPin size={13} color={T.txtSec} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[st.actionBtn, { backgroundColor: T.cardElevada }]}
          activeOpacity={0.75}
        >
          <BarChart2 size={13} color={T.txtSec} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[st.actionBtn, { backgroundColor: T.cardElevada }]}
          activeOpacity={0.75}
        >
          <MoreHorizontal size={13} color={T.txtSec} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Table pagination ─────────────────────────────────────────────────────────
function TablePagination({
  pagina,
  totalPaginas,
  totalItems,
  itemsPerPage,
  onCambiar,
  T,
}: {
  pagina: number;
  totalPaginas: number;
  totalItems: number;
  itemsPerPage: number;
  onCambiar: (p: number) => void;
  T: ReturnType<typeof useT>;
}) {
  const from = (pagina - 1) * itemsPerPage + 1;
  const to = Math.min(pagina * itemsPerPage, totalItems);
  const pages = Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => i + 1);

  return (
    <View style={[st.paginationRow, { borderTopColor: T.borde }]}>
      <Text style={[st.paginationInfo, { color: T.txtSec }]}>
        Mostrando {from} a {to} de {totalItems} animales
      </Text>
      <View style={st.paginationBtns}>
        <TouchableOpacity
          style={[st.pageBtn, { backgroundColor: T.card, borderColor: T.borde }, pagina === 1 && { opacity: 0.4 }]}
          onPress={() => pagina > 1 && onCambiar(pagina - 1)}
          disabled={pagina === 1}
          activeOpacity={0.75}
        >
          <ChevronLeft size={14} color={T.txtMain} strokeWidth={2} />
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
            <Text style={[st.pageBtnTxt, { color: pagina === p ? "#fff" : T.txtMain }]}>{p}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[st.pageBtn, { backgroundColor: T.card, borderColor: T.borde }, pagina === totalPaginas && { opacity: 0.4 }]}
          onPress={() => pagina < totalPaginas && onCambiar(pagina + 1)}
          disabled={pagina === totalPaginas}
          activeOpacity={0.75}
        >
          <ChevronRight size={14} color={T.txtMain} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View style={[st.perPageSelector, { backgroundColor: T.card, borderColor: T.borde }]}>
        <Text style={[st.perPageTxt, { color: T.txtSec }]}>10 por página</Text>
        <ChevronDown size={12} color={T.txtTer} strokeWidth={1.8} />
      </View>
    </View>
  );
}

// ─── Right filters panel ──────────────────────────────────────────────────────
function RightFiltersPanel({
  T,
  enriched,
}: {
  T: ReturnType<typeof useT>;
  enriched: EnrichedAnimal[];
}) {
  const potreroSummary = [
    { name: "Potrero Norte", count: enriched.filter((a) => a.potrero === "Potrero Norte").length || 12, color: T.verde },
    { name: "Potrero Sur", count: enriched.filter((a) => a.potrero === "Potrero Sur").length || 6, color: T.rojo },
    { name: "Potrero Este", count: enriched.filter((a) => a.potrero === "Potrero Este").length || 5, color: T.verde },
    { name: "Potrero Oeste", count: enriched.filter((a) => a.potrero === "Potrero Oeste").length || 5, color: T.naranja },
  ];

  return (
    <View style={[st.rightPanel, { backgroundColor: T.card, borderLeftColor: T.borde }]}>
      {/* Header */}
      <View style={st.rightPanelHeader}>
        <Text style={[st.rightPanelTitle, { color: T.txtMain }]}>Filtros</Text>
        <TouchableOpacity activeOpacity={0.75}>
          <Text style={[st.limpiarTxt, { color: T.verde }]}>Limpiar todo</Text>
        </TouchableOpacity>
      </View>

      {/* Filter dropdowns */}
      {[
        { label: "ESTADO", value: "Todos" },
        { label: "CATEGORÍA", value: "Todas" },
        { label: "POTRERO", value: "Todos" },
        { label: "ESTADO DE SALUD", value: "Todos" },
      ].map((f) => (
        <View key={f.label} style={st.filterSection}>
          <Text style={[st.filterSectionLabel, { color: T.txtSec }]}>{f.label}</Text>
          <View style={[st.filterDropdown, { backgroundColor: T.cardElevada, borderColor: T.borde }]}>
            <Text style={[st.filterDropdownTxt, { color: T.txtMain }]}>{f.value}</Text>
            <ChevronDown size={14} color={T.txtTer} strokeWidth={1.8} />
          </View>
        </View>
      ))}

      {/* Apply button */}
      <TouchableOpacity
        style={[st.applyBtn, { backgroundColor: T.verdeOscuro }]}
        activeOpacity={0.85}
      >
        <Text style={st.applyBtnTxt}>Aplicar filtros</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={[st.divider, { backgroundColor: T.borde }]} />

      {/* Potrero summary */}
      <Text style={[st.summaryTitle, { color: T.txtMain }]}>Resumen por potrero</Text>
      {potreroSummary.map((p) => (
        <View key={p.name} style={st.potreroRow}>
          <View style={[st.potreroDot, { backgroundColor: p.color }]} />
          <Text style={[st.potreroName, { color: T.txtMain }]}>{p.name}</Text>
          <Text style={[st.potreroCount, { color: T.txtSec }]}>{p.count}</Text>
        </View>
      ))}

      {/* Ver mapa */}
      <TouchableOpacity
        style={st.verMapaLink}
        activeOpacity={0.75}
        onPress={() => navigateTo("Map")}
      >
        <Map size={13} color={T.verde} strokeWidth={1.8} />
        <Text style={[st.verMapaTxt, { color: T.verde }]}>Ver mapa de potreros</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  main: {
    flex: 1,
    flexDirection: "column",
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden" as any,
  },

  // Left area
  leftArea: {
    flex: 1,
  },
  leftContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 0,
  },

  // Register button
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  registerBtnTxt: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // Stat cards
  statCardsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  statCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValor: {
    fontSize: 28,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 8,
  },
  statBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statPct: {
    fontSize: 11,
    fontWeight: "700",
  },
  statProgressWrap: {
    marginTop: 2,
  },
  statProgressBg: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden" as any,
  },
  statProgressFill: {
    height: 5,
    borderRadius: 3,
  },

  // Toolbar
  toolbarRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  searchWrap: {
    flex: 1,
    maxWidth: 280,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
    outlineStyle: "none" as any,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterPillTxt: {
    fontSize: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Table
  table: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden" as any,
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  thCell: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Table row
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  tdAnimal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowAvatarTxt: {
    fontSize: 13,
    fontWeight: "700",
  },
  rowAnimalInfo: {
    gap: 2,
  },
  rowName: {
    fontSize: 13,
    fontWeight: "700",
  },
  rowId: {
    fontSize: 11,
  },
  rowChips: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  rowChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  rowChipTxt: {
    fontSize: 10,
  },
  estadoBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  estadoBadgeTxt: {
    fontSize: 11,
    fontWeight: "700",
  },
  tdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tdTxt: {
    fontSize: 12,
  },
  tdSubTxt: {
    fontSize: 11,
  },
  tdTerTxt: {
    fontSize: 10,
    marginTop: 2,
  },
  batBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden" as any,
    width: 60,
  },
  batBarFill: {
    height: 5,
    borderRadius: 3,
  },
  actionsCell: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  emptyRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 10,
    borderBottomWidth: 1,
  },
  emptyTxt: {
    fontSize: 13,
  },

  // Pagination
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  paginationInfo: {
    fontSize: 12,
    flex: 1,
  },
  paginationBtns: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  pageBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnTxt: {
    fontSize: 12,
    fontWeight: "600",
  },
  perPageSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  perPageTxt: {
    fontSize: 12,
  },

  // Right panel
  rightPanel: {
    width: 260,
    borderLeftWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 20,
  },
  rightPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rightPanelTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  limpiarTxt: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterSection: {
    marginBottom: 12,
    gap: 6,
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  filterDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterDropdownTxt: {
    fontSize: 13,
  },
  applyBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  applyBtnTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  potreroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  potreroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  potreroName: {
    fontSize: 12,
    flex: 1,
  },
  potreroCount: {
    fontSize: 12,
  },
  verMapaLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },
  verMapaTxt: {
    fontSize: 12,
  },
});
