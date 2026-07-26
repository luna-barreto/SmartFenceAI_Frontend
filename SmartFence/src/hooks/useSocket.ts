import { useEffect, useState } from "react";
import { conectarSocket } from "@/services/socket";
import { useAuth } from "@/context/AuthContext";

/** Expone el estado de la conexión WebSocket con el gateway/backend. */
export function useSocket() {
  const { usuario } = useAuth();
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    const socket = conectarSocket();
    socket.on("connect", () => setConectado(true));
    socket.on("disconnect", () => setConectado(false));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [usuario]);

  return { conectado };
}
