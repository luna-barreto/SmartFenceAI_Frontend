import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser, useAuth as useClerkAuth, useSignIn, useClerk } from "@clerk/clerk-expo";
import { Usuario } from "@/types";
import { FincaAPI } from "@/services/api";
import { conectarSocket, desconectarSocket, unirseAFinca } from "@/services/socket";
import { clerkTokenRef } from "@/services/clerkTokenRef";

const FINCA_KEY = "sf_finca_id";

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: (campos: Partial<Usuario>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useClerkAuth();
  const { signIn, setActive } = useSignIn();
  const clerk = useClerk();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [fincaIdCache, setFincaIdCache] = useState<string | null>(null);
  const [fincaNombreCache, setFincaNombreCache] = useState<string | null>(null);

  // Expose Clerk's getToken to the axios interceptor
  useEffect(() => {
    clerkTokenRef.getToken = () => getToken();
    return () => { clerkTokenRef.getToken = null; };
  }, [getToken]);

  // Build the usuario object whenever Clerk's user changes
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setUsuario(null);
      return;
    }

    const meta = (user.publicMetadata ?? {}) as Record<string, string>;
    const u: Usuario = {
      id: user.id,
      nombre: [user.firstName, user.lastName].filter(Boolean).join(" "),
      email: user.primaryEmailAddress?.emailAddress ?? "",
      correo: user.primaryEmailAddress?.emailAddress ?? "",
      rol: (meta.rol as Usuario["rol"]) ?? "GANADERO",
      fincaId: fincaIdCache ?? undefined,
      finca: fincaNombreCache ?? undefined,
    };
    setUsuario(u);
  }, [isLoaded, isSignedIn, user, fincaIdCache, fincaNombreCache]);

  // After sign-in: restore fincaId from cache (or fetch from backend) + connect socket
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    (async () => {
      let fincaId = await AsyncStorage.getItem(FINCA_KEY);

      try {
        const { data } = await FincaAPI.listar();
        if (data.length > 0) {
          const match = fincaId ? data.find((f) => f.id === fincaId) ?? data[0] : data[0];
          fincaId = match.id;
          await AsyncStorage.setItem(FINCA_KEY, fincaId);
          setFincaNombreCache(match.nombre);
        }
      } catch {}

      if (fincaId) setFincaIdCache(fincaId);

      const token = await getToken();
      if (token) {
        conectarSocket(token);
        if (fincaId) unirseAFinca(fincaId);
      }
    })();
  }, [isLoaded, isSignedIn]);

  async function iniciarSesion(correo: string, contrasena: string) {
    if (!signIn || !setActive) throw new Error("Clerk no está listo");

    const result = await signIn.create({
      identifier: correo,
      password: contrasena,
    }).catch((err: any) => {
      const msg =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        "Credenciales incorrectas";
      throw new Error(msg);
    });

    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
    } else {
      throw new Error("No se pudo completar el inicio de sesión");
    }
  }

  async function cerrarSesion() {
    desconectarSocket();
    await AsyncStorage.removeItem(FINCA_KEY);
    setFincaIdCache(null);
    await clerk.signOut();
  }

  async function actualizarUsuario(campos: Partial<Usuario>) {
    if (!usuario) return;
    const actualizado = { ...usuario, ...campos };
    setUsuario(actualizado);

    if (campos.fincaId && campos.fincaId !== usuario.fincaId) {
      setFincaIdCache(campos.fincaId);
      await AsyncStorage.setItem(FINCA_KEY, campos.fincaId);
      unirseAFinca(campos.fincaId);
    }

    if (campos.finca !== undefined && usuario.fincaId) {
      FincaAPI.actualizar(usuario.fincaId, { nombre: campos.finca }).catch(() => {});
    }
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando: !isLoaded,
      iniciarSesion,
      cerrarSesion,
      actualizarUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
