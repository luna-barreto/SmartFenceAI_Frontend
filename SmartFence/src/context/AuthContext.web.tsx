import React, { createContext, useContext, useState } from "react";
import { Usuario } from "@/types";

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: (campos: Partial<Usuario>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  async function iniciarSesion(correo: string, _contrasena: string) {
    const nombre = correo.trim() || "Usuario Demo";
    setUsuario({
      id: "demo-001",
      nombre,
      email: correo || "demo@smartfence.ai",
      correo: correo || "demo@smartfence.ai",
      rol: "GANADERO",
      fincaId: "demo-finca-001",
      finca: "Finca Demo SmartFence",
    });
  }

  async function cerrarSesion() {
    setUsuario(null);
  }

  async function actualizarUsuario(campos: Partial<Usuario>) {
    if (!usuario) return;
    setUsuario({ ...usuario, ...campos });
  }

  return (
    <AuthContext.Provider
      value={{ usuario, cargando: false, iniciarSesion, cerrarSesion, actualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
