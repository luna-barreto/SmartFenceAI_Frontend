import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { EventoTelemetria, Alerta } from "@/types";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ??
  (Constants.expoConfig?.extra?.socketUrl as string) ??
  "http://localhost:4000";

let socket: Socket | null = null;

export function conectarSocket(token?: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: token ? { token } : undefined,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
  });

  return socket;
}

export function unirseAFinca(fincaId: string) {
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
export function suscribirTelemetria(cb: (evento: EventoTelemetria) => void) {
  socket?.on("gps:posicion", cb);
  return () => socket?.off("gps:posicion", cb);
}

export function suscribirAlertas(cb: (alerta: Alerta) => void) {
  socket?.on("alerta:nueva", cb);
  return () => socket?.off("alerta:nueva", cb);
}

export default { conectarSocket, desconectarSocket, unirseAFinca, salirDeFinca, suscribirTelemetria, suscribirAlertas };
