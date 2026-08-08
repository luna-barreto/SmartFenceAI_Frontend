import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import {
  Plus,
  Search,
  ShieldCheck,
  TriangleAlert,
  BatteryMedium,
  Wifi,
  ChevronRight,
  FileText,
  Pencil,
  X,
  Check,
} from "lucide-react-native";
import { useT } from "@context/ThemeContext";
import { useAnimalsCtx } from "@context/AnimalsContext";
import { centroDe, generarPoligonoCentrado } from "@utils/geo";
import { Coordenada } from "@/types";
import { navigateTo } from "@navigation/navigationRef";
import WebSidebar from "@components/WebSidebar";
import WebTopBar from "@components/WebTopBar";
import MapaOSM, { MapaOSMHandle } from "@components/MapaOSM";
import { CercasAPI } from "@services/api";
import { useAuth } from "@context/AuthContext";
import {
  ANIMALES_DEMO, STATS_DEMO, CENTRO_DEMO, CERCA_DEMO,
  type AnimalDemo, type SaludSensor,
} from "@/demo/demoData";

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ marginVertical }: { marginVertical: number }) {
  const T = useT();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: T.borde,
        marginVertical,
      }}
    />
  );
}

// ─── MapScreen (web) ──────────────────────────────────────────────────────────
export default function MapScreen() {
  const T = useT();
  const { usuario } = useAuth();
  const { animales, conectado, cerca: cercaBackend, cargandoCerca, recargar: recargarContexto } = useAnimalsCtx();
  const { width } = useWindowDimensions();
  const isMd = width < 1100;
  const isSm = width < 768;
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const mapaRef = useRef<MapaOSMHandle>(null);
  const cercaIdRef = useRef<string | undefined>(cercaBackend?.id);
  const cercaSnapshotRef = useRef<Coordenada[]>([]);
  const bloqueandoSyncRef = useRef(false);

  // Inicializar desde el contexto para no mostrar CERCA_DEMO al volver a la pantalla
  const [cerca, setCerca] = useState<Coordenada[]>(
    () => cercaBackend?.coordenadas?.length ? cercaBackend.coordenadas : CERCA_DEMO
  );

  useEffect(() => {
    if (cargandoCerca) return;
    if (bloqueandoSyncRef.current) return; // no pisar edición local
    const coords = cercaBackend?.coordenadas?.length ? cercaBackend.coordenadas : CERCA_DEMO;
    setCerca(coords);
    cercaIdRef.current = cercaBackend?.id;
  }, [cercaBackend, cargandoCerca]);

  const ubicacionUsuario = null;

  const bateriaProm = animales.length
    ? Math.round(animales.reduce((s, a) => s + (a.collar?.bateria ?? 0), 0) / animales.length)
    : 69;

  const centro = cercaBackend?.coordenadas?.length
    ? centroDe(cerca)
    : CENTRO_DEMO;

  // Solo actualiza estado local mientras el usuario arrastra vértices.
  // El guardado real ocurre únicamente al presionar "Guardar".
  function guardarCerca(pts: Coordenada[]) {
    setCerca(pts);
  }

  function iniciarEdicion() {
    cercaSnapshotRef.current = cerca;
    bloqueandoSyncRef.current = true;
    setEditando(true);
  }

  function cancelarEdicion() {
    bloqueandoSyncRef.current = false;
    setCerca(cercaSnapshotRef.current);
    setEditando(false);
  }

  async function confirmarGuardado() {
    const fincaId = usuario?.fincaId;
    if (!fincaId || fincaId === "demo") { setEditando(false); return; }
    setGuardando(true);
    try {
      const id = cercaIdRef.current;
      if (id) {
        await CercasAPI.actualizar(id, { coordenadas: cerca });
      } else {
        const { data } = await CercasAPI.crear({
          fincaId,
          nombre: "Geocerca principal",
          coordenadas: cerca,
        });
        cercaIdRef.current = data.id;
      }
      setEditando(false);
      bloqueandoSyncRef.current = false;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Error desconocido";
      console.error("Error guardando geocerca:", msg);
    } finally {
      setGuardando(false);
    }
  }

  const dentroCount = animales.length
    ? animales.filter((a) => a.dentroDeCerca).length
    : STATS_DEMO.dentroCount;
  const fueraCount = animales.length
    ? animales.filter((a) => !a.dentroDeCerca).length
    : STATS_DEMO.fueraCount;

  // Animal list — use real data or full demo dataset
  const listaAnimales: AnimalDemo[] = animales.length > 0
    ? animales.map((a, i): AnimalDemo => ({
        id: a.id,
        nombre: a.nombre,
        displayNombre: a.nombre,
        identificacion: a.codigo ?? `VAC-${100 + i}`,
        categoria: "Vaca",
        raza: a.raza ?? "—",
        edad: "—",
        genero: "♀",
        potrero: "—",
        estado: a.dentroDeCerca ? "dentro" : "fuera",
        estadoCollar: "en_linea",
        salud: { sensor: "verde", label: "Excelente", descripcion: "", r: 180, g: 220, b: 170 },
        bateria: a.collar?.bateria ?? 0,
        señal: (a.collar?.señal ?? "Buena") as "Excelente" | "Buena" | "Débil",
        collarId: a.collar?.id ?? "—",
        ubicacion: a.ubicacion ?? { lat: 10.875244, lng: -74.908449 },
        dentroDeCerca: a.dentroDeCerca ?? false,
        ultimaVez: "Reciente",
        peso: a.peso ?? 0,
      }))
    : ANIMALES_DEMO;

  const listaFiltrada = busqueda.trim()
    ? listaAnimales.filter((a) =>
        a.displayNombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : listaAnimales;

  // Build map-ready list: real animals when connected, demo dataset otherwise.
  // Extra salud fields (saludLabel/R/G/B) are passed through JSON to Leaflet's makeTooltip.
  const animalesParaMapa = (animales.length > 0 ? animales : ANIMALES_DEMO.map((a) => ({
    id: a.id,
    codigo: a.identificacion,
    nombre: a.displayNombre,
    raza: a.raza,
    fincaId: "demo",
    ubicacion: a.ubicacion,
    dentroDeCerca: a.dentroDeCerca,
    peso: a.peso,
    saludLabel: a.salud.label,
    saludR: a.salud.r,
    saludG: a.salud.g,
    saludB: a.salud.b,
    collar: {
      id: a.collarId,
      serial: a.collarId,
      fincaId: "demo",
      activo: a.estadoCollar !== "cortado" && a.estadoCollar !== "retirado",
      bateria: a.bateria,
      bateriaPorcentaje: a.bateria,
      estado: (
        a.estadoCollar === "en_linea" || a.estadoCollar === "bateria_baja"
          ? "en_linea"
          : a.estadoCollar === "sin_señal"
          ? "sin_señal"
          : "fuera_de_rango"
      ) as "en_linea" | "sin_señal" | "fuera_de_rango",
    },
  }))) as any;

  // ── Right content for WebTopBar ──────────────────────────────────────────
  const rightContent = (
    <View style={st.topBarActions}>
      <TouchableOpacity
        style={[st.btnNuevaGeocerca, { backgroundColor: T.verdeOscuro }]}
        activeOpacity={0.85}
        onPress={() => {
          const origen = centroDe(cerca.length ? cerca : CERCA_DEMO);
          cercaSnapshotRef.current = cerca;
          setCerca(generarPoligonoCentrado(origen, 150));
          setEditando(true);
        }}
      >
        <Plus size={14} color="#fff" strokeWidth={2.5} />
        <Text style={st.btnNuevaGeocercaTxt}>Nueva geocerca</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          st.btnSearch,
          { backgroundColor: T.cardElevada, borderColor: T.borde },
        ]}
        activeOpacity={0.8}
      >
        <Search size={16} color={T.txtSec} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[st.root, { backgroundColor: T.fondo }]}>
      {/* ── Sidebar ── */}
      <WebSidebar activeRoute="Map" />

      {/* ── Main ── */}
      <View style={st.main}>
        {/* ── Top bar ── */}
        <WebTopBar
          titulo="Cerca virtual"
          sub="Monitoreo GPS en tiempo real"
          rightContent={rightContent}
        />

        {/* ── Content row ── */}
        <View style={st.content}>

          {/* ── LEFT PANEL — hidden on small screens ── */}
          {!isSm && (
          <View
            style={[
              st.leftPanel,
              isMd && st.leftPanelMd,
              { backgroundColor: T.card, borderRightColor: T.borde },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={st.leftScroll}
            >
              {/* Section title */}
              <Text style={[st.sectionTitle, { color: T.txtMain }]}>
                Estado del rebaño
              </Text>

              {/* Stat rows */}
              <StatRow
                Icon={ShieldCheck}
                iconColor={T.verde}
                iconBg={T.verdeAlfa}
                label="Dentro de la cerca"
                valor={String(dentroCount)}
                valorColor={T.verde}
                isLast={false}
              />
              <StatRow
                Icon={TriangleAlert}
                iconColor={T.rojo}
                iconBg={"rgba(239,68,68,0.12)"}
                label="Fuera de la cerca"
                valor={String(fueraCount)}
                valorColor={T.rojo}
                isLast={false}
              />
              <StatRow
                Icon={BatteryMedium}
                iconColor={T.naranja}
                iconBg={"rgba(245,158,11,0.12)"}
                label="Batería promedio"
                valor={bateriaProm + "%"}
                valorColor={T.naranja}
                isLast={false}
              />
              <StatRow
                Icon={Wifi}
                iconColor={T.azul}
                iconBg={"rgba(59,130,246,0.12)"}
                label="Señal promedio"
                valor="Buena"
                valorColor={T.azul}
                isLast
              />

              <Divider marginVertical={16} />

              {/* Geocercas activas */}
              <Text
                style={[st.sectionTitle, { color: T.txtMain, marginBottom: 10 }]}
              >
                Geocercas activas
              </Text>

              <FenceRow
                Icon={ShieldCheck}
                iconColor={T.verde}
                iconBg={T.verdeAlfa}
                nombre="Potrero Principal"
                detalle="Activa • 2.4 km²"
                dotColor={T.verde}
              />
              <FenceRow
                Icon={ShieldCheck}
                iconColor={T.verde}
                iconBg={T.verdeAlfa}
                nombre="Zona de Descanso"
                detalle="Activa • 0.8 km²"
                dotColor={T.verde}
              />
              <FenceRow
                Icon={ShieldCheck}
                iconColor={T.naranja}
                iconBg={"rgba(245,158,11,0.12)"}
                nombre="Límite Norte"
                detalle="Inactiva • 1.1 km²"
                dotColor={T.naranja}
              />

              <Divider marginVertical={16} />

              {/* Leyenda */}
              <Text
                style={[
                  st.sectionTitleSmall,
                  { color: T.txtSec },
                ]}
              >
                LEYENDA
              </Text>

              <LeyendaRow dotType="filled" dotColor={T.verde}   label="Dentro del perímetro" />
              <LeyendaRow dotType="filled" dotColor={T.rojo}    label="Fuera del perímetro" />
              <LeyendaRow dotType="filled" dotColor={T.azul}    label="Dispositivo gateway" />
              <LeyendaRow dotType="dashed" dotColor={T.verde}   label="Cerca virtual activa" />

              {/* Spacer */}
              <View style={{ flex: 1, minHeight: 20 }} />
            </ScrollView>

            {/* Bottom button */}
            <View
              style={[
                st.leftBottom,
                { borderTopColor: T.borde },
              ]}
            >
              <TouchableOpacity
                style={[st.btnReporte, { backgroundColor: T.verdeOscuro }]}
                activeOpacity={0.85}
              >
                <FileText size={15} color="#fff" strokeWidth={2} />
                <Text style={st.btnReporteTxt}>Ver reporte completo</Text>
              </TouchableOpacity>
            </View>
          </View>
          )}

          {/* ── CENTER MAP ── */}
          <View style={st.mapArea}>
            <MapaOSM
              ref={mapaRef}
              animales={animalesParaMapa}
              cerca={cerca}
              centro={centro}
              editando={editando}
              onGuardarCerca={guardarCerca}
              ubicacionUsuario={ubicacionUsuario}
            />

            {/* Botones de edición */}
            {!editando ? (
              <View style={st.mapActionsRow}>
                <TouchableOpacity
                  style={[st.btnEditar, { backgroundColor: T.card, borderColor: T.borde }]}
                  onPress={iniciarEdicion}
                  activeOpacity={0.85}
                >
                  <Pencil size={14} color={T.txtMain} strokeWidth={2} />
                  <Text style={[st.btnEditarTxt, { color: T.txtMain }]}>Editar cerca</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={st.editBannerWeb}>
                <View style={[st.editBannerInner, { backgroundColor: T.verdeOscuro }]}>
                  <Text style={st.editBannerTxt}>Arrastra los puntos para editar</Text>
                  <TouchableOpacity
                    style={st.editCancelBtn}
                    onPress={cancelarEdicion}
                    activeOpacity={0.8}
                    disabled={guardando}
                  >
                    <Text style={st.editCancelTxt}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[st.editSaveBtn, guardando && { opacity: 0.6 }]}
                    onPress={confirmarGuardado}
                    activeOpacity={0.8}
                    disabled={guardando}
                  >
                    {guardando
                      ? <ActivityIndicator size="small" color={T.verdeOscuro} />
                      : <><Check size={13} color={T.verdeOscuro} strokeWidth={3} /><Text style={[st.editSaveTxt, { color: T.verdeOscuro }]}>Guardar</Text></>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Guardando */}
            {guardando && (
              <View style={[st.savingBadge, { backgroundColor: T.card, borderColor: T.borde }]}>
                <ActivityIndicator size="small" color={T.verde} />
                <Text style={[st.savingTxt, { color: T.txtMain }]}>Guardando…</Text>
              </View>
            )}

            {/* Legend pill on map */}
            <View style={[st.mapPill, { backgroundColor: T.card }]}>
              <View style={[st.pillDot, { backgroundColor: T.verde }]} />
              <Text style={[st.pillTxt, { color: T.txtMain }]}>
                Dentro ({dentroCount})
              </Text>
              <View style={[st.pillDot, { backgroundColor: T.rojo }]} />
              <Text style={[st.pillTxt, { color: T.txtMain }]}>
                Fuera ({fueraCount})
              </Text>
              <View style={[st.pillDot, { backgroundColor: T.azul }]} />
              <Text style={[st.pillTxt, { color: T.txtMain }]}>Dispositivo</Text>
            </View>
          </View>

          {/* ── RIGHT PANEL — hidden on small screens ── */}
          {!isSm && (
          <View
            style={[
              st.rightPanel,
              isMd && st.rightPanelMd,
              { backgroundColor: T.card, borderLeftColor: T.borde },
            ]}
          >
            {/* Header */}
            <View style={st.rightHeader}>
              <View style={st.rightHeaderLeft}>
                <Text style={[st.sectionTitle, { color: T.txtMain, marginBottom: 0 }]}>
                  Animales
                </Text>
                <View
                  style={[
                    st.countBadge,
                    { backgroundColor: T.verdeAlfa },
                  ]}
                >
                  <Text style={[st.countBadgeTxt, { color: T.verde }]}>
                    {listaAnimales.length} · {fueraCount > 0 ? `${fueraCount} fuera` : "Todos dentro"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigateTo("Animals")}
              >
                <Text style={[st.verTodos, { color: T.verde }]}>Ver todos →</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={[
                st.searchWrap,
                { backgroundColor: T.cardElevada, borderColor: T.borde },
              ]}
            >
              <Search size={13} color={T.txtTer} strokeWidth={1.8} />
              <TextInput
                style={[st.searchInput, { color: T.txtMain }]}
                placeholder="Buscar animal..."
                placeholderTextColor={T.txtTer}
                value={busqueda}
                onChangeText={setBusqueda}
              />
            </View>

            {/* Animal list */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {listaFiltrada.map((animal, idx) => {
                const initials = animal.displayNombre
                  .split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                const avatarBg    = idx % 2 === 0 ? T.verdeLuz : T.naranjaBg;
                const statusColor = animal.dentroDeCerca ? T.verde : T.rojo;
                const statusLabel = animal.dentroDeCerca ? "Dentro" : "Fuera";
                const batPct = animal.bateria;
                const saludColor: Record<SaludSensor, string> = { verde: T.verde, amarillo: T.naranja, rojo: T.rojo };

                return (
                  <View key={animal.id} style={[st.animalRow, { borderBottomColor: T.borde }]}>
                    {/* Avatar */}
                    <View style={[st.animalAvatar, { backgroundColor: avatarBg }]}>
                      <Text style={[st.animalInitials, { color: T.verdeOscuro }]}>{initials}</Text>
                    </View>

                    {/* Info */}
                    <View style={st.animalInfo}>
                      <Text style={[st.animalNombre, { color: T.txtMain }]} numberOfLines={1}>
                        {animal.displayNombre}
                      </Text>
                      <Text style={[st.animalSub, { color: T.txtSec }]} numberOfLines={1}>
                        {animal.collarId} · {animal.raza}
                      </Text>
                      {/* Health indicator */}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: `rgb(${animal.salud.r},${animal.salud.g},${animal.salud.b})` }} />
                        <Text style={[st.animalCoords, { color: saludColor[animal.salud.sensor] }]}>
                          {animal.salud.label}
                        </Text>
                        {(animal.estadoCollar === "cortado" || animal.estadoCollar === "retirado") && (
                          <Text style={[st.animalCoords, { color: T.rojo }]}>• ⚠ Collar</Text>
                        )}
                      </View>
                    </View>

                    {/* Status + battery */}
                    <View style={st.animalRight}>
                      <View style={st.animalStatus}>
                        <View style={[st.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[st.statusTxt, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                      <View style={st.batRow}>
                        <View style={[st.batBar, { backgroundColor: T.borde }]}>
                          <View style={[st.batFill, {
                            width: `${batPct}%` as any,
                            backgroundColor: batPct > 50 ? T.verde : batPct > 20 ? T.naranja : T.rojo,
                          }]} />
                        </View>
                        <Text style={[st.batPct, { color: T.txtTer }]}>{batPct}%</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── StatRow ──────────────────────────────────────────────────────────────────
function StatRow({
  Icon, iconColor, iconBg, label, valor, valorColor, isLast,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconColor: string;
  iconBg: string;
  label: string;
  valor: string;
  valorColor: string;
  isLast: boolean;
}) {
  const T = useT();
  return (
    <View
      style={[
        st.statRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: T.borde },
      ]}
    >
      <View style={[st.statIconBox, { backgroundColor: iconBg }]}>
        <Icon size={16} color={iconColor} strokeWidth={2} />
      </View>
      <Text style={[st.statLabel, { color: T.txtSec }]}>{label}</Text>
      <Text style={[st.statValor, { color: valorColor }]}>{valor}</Text>
    </View>
  );
}

// ─── FenceRow ─────────────────────────────────────────────────────────────────
function FenceRow({
  Icon, iconColor, iconBg, nombre, detalle, dotColor,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconColor: string;
  iconBg: string;
  nombre: string;
  detalle: string;
  dotColor: string;
}) {
  const T = useT();
  return (
    <View
      style={[
        st.fenceRow,
        { backgroundColor: T.card, borderColor: T.borde },
      ]}
    >
      <View style={[st.fenceIconBox, { backgroundColor: iconBg }]}>
        <Icon size={16} color={iconColor} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.fenceNombre, { color: T.txtMain }]}>{nombre}</Text>
        <Text style={[st.fenceDetalle, { color: T.txtSec }]}>{detalle}</Text>
      </View>
      <View style={[st.fenceStatusDot, { backgroundColor: dotColor }]} />
      <ChevronRight size={14} color={T.txtTer} strokeWidth={2} />
    </View>
  );
}

// ─── LeyendaRow ───────────────────────────────────────────────────────────────
function LeyendaRow({
  dotType, dotColor, label,
}: {
  dotType: "filled" | "dashed";
  dotColor: string;
  label: string;
}) {
  const T = useT();
  return (
    <View style={st.leyendaRow}>
      {dotType === "filled" ? (
        <View style={[st.leyendaDot, { backgroundColor: dotColor }]} />
      ) : (
        <View
          style={[
            st.leyendaDotDashed,
            { borderColor: dotColor },
          ]}
        />
      )}
      <Text style={[st.leyendaTxt, { color: T.txtSec }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  // Root
  root: {
    flex: 1,
    flexDirection: "row",
  },

  // Main column
  main: {
    flex: 1,
    flexDirection: "column",
  },

  // Top bar actions (rightContent)
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnNuevaGeocerca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  btnNuevaGeocercaTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  btnSearch: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Content row
  content: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },

  // Left panel
  leftPanel: {
    width: 280,
    borderRightWidth: 1,
    flexDirection: "column",
  },
  leftPanelMd: {
    width: 220,
  },
  leftScroll: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  leftBottom: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  // Section titles
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionTitleSmall: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Stat rows
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    flex: 1,
    fontSize: 12,
  },
  statValor: {
    fontSize: 13,
    fontWeight: "800",
  },

  // Fence rows
  fenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  fenceIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fenceNombre: {
    fontSize: 12,
    fontWeight: "700",
  },
  fenceDetalle: {
    fontSize: 10,
    marginTop: 1,
  },
  fenceStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Leyenda
  leyendaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  leyendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaDotDashed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  leyendaTxt: {
    fontSize: 12,
  },

  // Bottom report button
  btnReporte: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    width: "100%",
  },
  btnReporteTxt: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // Map area
  mapArea: {
    flex: 1,
    position: "relative",
  },
  mapPill: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillTxt: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Right panel
  rightPanel: {
    width: 280,
    borderLeftWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    flexDirection: "column",
  },
  rightPanelMd: {
    width: 220,
    paddingHorizontal: 12,
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rightHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeTxt: {
    fontSize: 11,
    fontWeight: "700",
  },
  verTodos: {
    fontSize: 12,
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    height: 34,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    height: "100%",
  },

  // Animal rows
  animalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  animalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  animalInitials: {
    fontWeight: "800",
    fontSize: 12,
  },
  animalInfo: {
    flex: 1,
  },
  animalNombre: {
    fontSize: 12,
    fontWeight: "700",
  },
  animalSub: {
    fontSize: 10,
    marginTop: 1,
  },
  animalCoords: {
    fontSize: 9,
    marginTop: 1,
    fontVariant: ["tabular-nums"],
  },
  animalRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  animalStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTxt: {
    fontSize: 10,
    fontWeight: "700",
  },
  batRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  batBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  batFill: {
    height: "100%",
    borderRadius: 2,
  },
  batPct: {
    fontSize: 10,
  },

  // Floating action row (bottom-left of map)
  mapActionsRow: {
    position: "absolute",
    bottom: 56,
    left: 14,
    gap: 8,
  },
  btnEditar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  btnEditarTxt: { fontSize: 12, fontWeight: "700" },
  btnMover: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  btnMoverTxt: { fontSize: 12, fontWeight: "700" },

  // Edit mode banner (top of map)
  editBannerWeb: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  editBannerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  editBannerTxt: { fontSize: 12, color: "#fff", fontWeight: "600", flex: 1 },
  editCancelBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
    marginLeft: 8,
  },
  editCancelTxt: { fontSize: 12, color: "#fff", fontWeight: "700" },
  editSaveBtn: {
    backgroundColor: "#fff",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
    flexDirection: "row", alignItems: "center", gap: 4, marginLeft: 6,
  },
  editSaveTxt: { fontSize: 12, fontWeight: "800" },

  // Saving badge
  savingBadge: {
    position: "absolute",
    bottom: 56,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  savingTxt: { fontSize: 12, fontWeight: "600" },
});
