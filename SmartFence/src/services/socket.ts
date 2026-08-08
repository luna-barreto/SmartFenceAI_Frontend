import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { EventoTelemetria, Alerta } from "@/types";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ??
  (Constants.expoConfig?.extra?.socketUrl as string) ??
  "http://localhost:4000";

let socket: Socket | null = null;
// Última sala a la que el cliente se unió — se reenvía tras reconexión.
let _fincaActual: string | null = null;

// Callbacks registrados antes de que se cree el socket (race condition al montar).
// Se adjuntan al socket en cuanto conectarSocket() lo instancia.
const _pendingTelemetria: ((e: EventoTelemetria) => void)[] = [];
const _pendingAlertas:    ((a: Alerta) => void)[]           = [];

export function conectarSocket(token?: string): Socket {
  if (socket?.connected) return socket;

  // Codespaces/proxies requieren polling como transporte inicial; socket.io
  // hace upgrade a websocket automáticamente si el servidor lo soporta.
  const isSecure = SOCKET_URL.startsWith("https://");
  socket = io(SOCKET_URL, {
    transports: isSecure ? ["polling", "websocket"] : ["websocket"],
    auth: token ? { token } : undefined,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
  });

  // Re-unirse automáticamente a la sala de la finca tras reconexión.
  socket.on("connect", () => {
    if (_fincaActual) socket?.emit("finca:unirse", _fincaActual);
  });

  // Adjuntar callbacks que llegaron antes que el socket existiera.
  for (const cb of _pendingTelemetria) socket.on("gps:posicion", cb);
  for (const cb of _pendingAlertas)    socket.on("alerta:nueva", cb);
  _pendingTelemetria.length = 0;
  _pendingAlertas.length    = 0;

  return socket;
}

export function unirseAFinca(fincaId: string) {
  _fincaActual = fincaId;
  socket?.emit("finca:unirse", fincaId);
}

export function salirDeFinca(fincaId: string) {
  socket?.emit("finca:salir", fincaId);
}

export function desconectarSocket() {
  socket?.disconnect();
  socket = null;
}

// El backend emite "gps:posicion" (no "telemetria:collar")
export function suscribirTelemetria(cb: (evento: EventoTelemetria) => void): () => void {
  if (socket) {
    socket.on("gps:posicion", cb);
  } else {
    _pendingTelemetria.push(cb);
  }
  return () => {
    socket?.off("gps:posicion", cb);
    const idx = _pendingTelemetria.indexOf(cb);
    if (idx !== -1) _pendingTelemetria.splice(idx, 1);
  };
}

export function suscribirAlertas(cb: (alerta: Alerta) => void): () => void {
  if (socket) {
    socket.on("alerta:nueva", cb);
  } else {
    _pendingAlertas.push(cb);
  }
  return () => {
    socket?.off("alerta:nueva", cb);
    const idx = _pendingAlertas.indexOf(cb);
    if (idx !== -1) _pendingAlertas.splice(idx, 1);
  };
}

export default { conectarSocket, desconectarSocket, unirseAFinca, salirDeFinca, suscribirTelemetria, suscribirAlertas };
