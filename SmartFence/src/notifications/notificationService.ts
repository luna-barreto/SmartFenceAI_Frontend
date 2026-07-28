import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import {
  CANALES_NOTIFICACION,
  DatosNotificacionSmartFence,
  TipoNotificacion,
  canalParaTipo,
  colorParaPrioridad,
  prioridadParaTipo,
  tituloParaTipo,
} from "./notificationTypes";
import { navigateTo } from "@navigation/navigationRef";

// En Expo Go (SDK 53+) las push notifications remotas no están disponibles.
// Todas las funciones de este módulo son no-op cuando se detecta ese entorno.
const EN_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// ── Configuración del handler global ─────────────────────────────────────────
if (!EN_EXPO_GO) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

let _listenerRecibida: Notifications.Subscription | null = null;
let _listenerTocada: Notifications.Subscription | null = null;

// ── Inicialización ────────────────────────────────────────────────────────────
export async function inicializarNotificaciones(): Promise<boolean> {
  if (EN_EXPO_GO) return false;

  // Crear canales Android
  if (Platform.OS === "android") {
    for (const canal of CANALES_NOTIFICACION) {
      await Notifications.setNotificationChannelAsync(canal.id, {
        name: canal.nombre,
        description: canal.descripcion,
        importance: mapearImportancia(canal.importancia),
        vibrationPattern: canal.vibrar ? [0, 250, 250, 250] : undefined,
        enableVibrate: canal.vibrar,
        sound: canal.sonido ? "default" : null,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        enableLights: true,
        lightColor: "#4CAF50",
      });
    }
  }

  // Solicitar permisos
  const { status: existente } = await Notifications.getPermissionsAsync();
  if (existente === "granted") {
    registrarListeners();
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowDisplayInCarPlay: false,
      allowCriticalAlerts: true,
      provideAppNotificationSettings: true,
    },
  });

  if (status === "granted") {
    registrarListeners();
    return true;
  }

  return false;
}

function mapearImportancia(imp: string): Notifications.AndroidImportance {
  switch (imp) {
    case "max":     return Notifications.AndroidImportance.MAX;
    case "high":    return Notifications.AndroidImportance.HIGH;
    case "default": return Notifications.AndroidImportance.DEFAULT;
    case "low":     return Notifications.AndroidImportance.LOW;
    case "min":     return Notifications.AndroidImportance.MIN;
    default:        return Notifications.AndroidImportance.DEFAULT;
  }
}

// ── Listeners ─────────────────────────────────────────────────────────────────
function registrarListeners() {
  if (_listenerRecibida) return;

  _listenerRecibida = Notifications.addNotificationReceivedListener((notif) => {
    // Notificación recibida con app en primer plano (solo logging)
    const datos = notif.request.content.data as DatosNotificacionSmartFence;
    console.log("[SmartFence] Notificación recibida:", datos?.tipo);
  });

  _listenerTocada = Notifications.addNotificationResponseReceivedListener((respuesta) => {
    const datos = respuesta.notification.request.content.data as DatosNotificacionSmartFence;
    const accion = respuesta.actionIdentifier;
    manejarAccionNotificacion(accion, datos);
  });
}

function manejarAccionNotificacion(
  accion: string,
  datos: DatosNotificacionSmartFence
) {
  if (
    accion === Notifications.DEFAULT_ACTION_IDENTIFIER ||
    accion === "ver_mapa"
  ) {
    navigateTo("Map");
    return;
  }
  if (accion === "abrir_animal" && datos?.animalId) {
    navigateTo("AnimalDetail", { animalId: datos.animalId });
    return;
  }
  if (accion === "marcar_atendida") {
    // La marca se gestiona en AlertsScreen — solo navegar
    navigateTo("Alerts");
    return;
  }
  if (accion === "silenciar") {
    // No navegar — solo descartar (el SO ya lo hace)
    return;
  }
}

export function limpiarListeners() {
  _listenerRecibida?.remove();
  _listenerTocada?.remove();
  _listenerRecibida = null;
  _listenerTocada = null;
}

// ── Envío de notificación ─────────────────────────────────────────────────────
export async function enviarNotificacion(
  tipo: TipoNotificacion,
  cuerpo: string,
  datos: Partial<DatosNotificacionSmartFence> = {}
): Promise<string | null> {
  if (EN_EXPO_GO) return null;
  try {
    const canal = canalParaTipo(tipo);
    const prioridad = prioridadParaTipo(tipo);
    const titulo = tituloParaTipo(tipo);
    const color = colorParaPrioridad(prioridad);

    const datosFull: DatosNotificacionSmartFence = {
      tipo,
      prioridad,
      ...datos,
    };

    // Acciones rápidas (Android + iOS)
    const categoriaId = `sf_${tipo}`;
    await registrarCategoria(categoriaId, tipo);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: cuerpo,
        data: datosFull,
        categoryIdentifier: categoriaId,
        color,               // Android: color del icono pequeño
        badge: 1,
        sound: canal.sonido ? "default" : undefined,
        // Android: icono pequeño monocromático (debe estar en res/drawable)
        // Se configura en app.json via plugin — aquí solo se pasa el nombre
        ...(Platform.OS === "android" && {
          sticky: prioridad === "critica",
        }),
      },
      trigger: null, // inmediata
      ...(Platform.OS === "android" && {
        android: { channelId: canal.id },
      }),
    } as any);

    return id;
  } catch (err) {
    console.warn("[SmartFence] Error enviando notificación:", err);
    return null;
  }
}

// ── Categorías con acciones rápidas ──────────────────────────────────────────
const _categoriasRegistradas = new Set<string>();

async function registrarCategoria(categoriaId: string, tipo: TipoNotificacion) {
  if (_categoriasRegistradas.has(categoriaId)) return;

  const acciones = accionesParaTipo(tipo);
  await Notifications.setNotificationCategoryAsync(categoriaId, acciones);
  _categoriasRegistradas.add(categoriaId);
}

function accionesParaTipo(tipo: TipoNotificacion): Notifications.NotificationAction[] {
  const verMapa: Notifications.NotificationAction = {
    identifier: "ver_mapa",
    buttonTitle: "Ver mapa",
    options: { opensAppToForeground: true },
  };
  const abrirAnimal: Notifications.NotificationAction = {
    identifier: "abrir_animal",
    buttonTitle: "Ver animal",
    options: { opensAppToForeground: true },
  };
  const silenciar: Notifications.NotificationAction = {
    identifier: "silenciar",
    buttonTitle: "Silenciar",
    options: { opensAppToForeground: false, isDestructive: false },
  };
  const marcarAtendida: Notifications.NotificationAction = {
    identifier: "marcar_atendida",
    buttonTitle: "Atendida",
    options: { opensAppToForeground: false, isDestructive: false },
  };

  switch (tipo) {
    case "animal_fuera_cerca":
      return [verMapa, abrirAnimal, silenciar];
    case "animal_regreso":
      return [verMapa, marcarAtendida];
    case "bateria_baja":
      return [abrirAnimal, silenciar];
    case "collar_desconectado":
      return [abrirAnimal, silenciar];
    case "señal_debil":
      return [verMapa, silenciar];
    case "movimiento_inusual":
      return [verMapa, abrirAnimal, silenciar];
    case "gateway_desconectado":
      return [marcarAtendida, silenciar];
    case "reporte_diario":
      return [marcarAtendida];
    case "actualizacion_sistema":
      return [marcarAtendida];
    default:
      return [marcarAtendida, silenciar];
  }
}

// ── Helpers de alto nivel ─────────────────────────────────────────────────────
export function notificarAnimalFueraDeCerca(
  animalNombre: string,
  animalId: string,
  potrero: string,
  collarId?: string
) {
  return enviarNotificacion(
    "animal_fuera_cerca",
    `${animalNombre} salió del ${potrero}`,
    { animalNombre, animalId, potreroNombre: potrero, collarId }
  );
}

export function notificarAnimalRegreso(
  animalNombre: string,
  animalId: string,
  potrero: string
) {
  return enviarNotificacion(
    "animal_regreso",
    `${animalNombre} regresó a ${potrero}`,
    { animalNombre, animalId, potreroNombre: potrero }
  );
}

export function notificarBateriaCollar(
  animalNombre: string,
  animalId: string,
  collarId: string,
  porcentaje: number,
  potrero?: string
) {
  return enviarNotificacion(
    "bateria_baja",
    `${collarId} de ${animalNombre} tiene ${porcentaje}% de batería`,
    { animalNombre, animalId, collarId, porcentajeBateria: porcentaje, potreroNombre: potrero }
  );
}

export function notificarCollarDesconectado(
  animalNombre: string,
  animalId: string,
  collarId: string
) {
  return enviarNotificacion(
    "collar_desconectado",
    `El collar ${collarId} de ${animalNombre} no responde`,
    { animalNombre, animalId, collarId }
  );
}

export function notificarSenalDebil(
  animalNombre: string,
  animalId: string,
  collarId: string
) {
  return enviarNotificacion(
    "señal_debil",
    `Señal LoRa débil en ${collarId} · ${animalNombre}`,
    { animalNombre, animalId, collarId }
  );
}

export function notificarMovimientoInusual(
  animalNombre: string,
  animalId: string,
  potrero: string
) {
  return enviarNotificacion(
    "movimiento_inusual",
    `${animalNombre} presenta actividad inusual en ${potrero}`,
    { animalNombre, animalId, potreroNombre: potrero }
  );
}

export function notificarGatewayDesconectado() {
  return enviarNotificacion(
    "gateway_desconectado",
    "El gateway LoRa no está respondiendo. Verifica la conexión."
  );
}

export function notificarReporteDiario(fecha: string) {
  return enviarNotificacion(
    "reporte_diario",
    `El reporte del ${fecha} ya está disponible en la app.`
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export async function limpiarBadge() {
  if (EN_EXPO_GO) return;
  await Notifications.setBadgeCountAsync(0);
}

export async function cancelarTodas() {
  if (EN_EXPO_GO) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
}

// ── Reporte diario programado ─────────────────────────────────────────────────
const ID_REPORTE_DIARIO = "sf_reporte_diario_trigger";

export async function programarReporteDiario(hora: number = 7, minuto: number = 0): Promise<void> {
  if (EN_EXPO_GO) return;
  // Cancelar cualquier reporte anterior para evitar duplicados
  try {
    await Notifications.cancelScheduledNotificationAsync(ID_REPORTE_DIARIO);
  } catch {
    // No existía — ignorar
  }

  await Notifications.scheduleNotificationAsync({
    identifier: ID_REPORTE_DIARIO,
    content: {
      title: "Reporte diario disponible",
      body: "El resumen de actividad de tu finca ya está listo.",
      data: { tipo: "reporte_diario", prioridad: "informacion" } as any,
      categoryIdentifier: "sf_reporte_diario",
      sound: "default",
      badge: 1,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  } as any);
}

export async function cancelarReporteDiario(): Promise<void> {
  if (EN_EXPO_GO) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(ID_REPORTE_DIARIO);
  } catch {
    // No existía — ignorar
  }
}
