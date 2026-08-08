import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser, useAuth as useClerkAuth, useSignIn, useClerk } from "@clerk/clerk-expo";
import { Usuario } from "@/types";
import { FincaAPI } from "@/services/api";
import { conectarSocket, desconectarSocket, unirseAFinca } from "@/services/socket";
import { clerkTokenRef } from "@/services/clerkTokenRef";
import { registrarTokenPushEnBackend } from "@notifications/notificationService";

const FINCA_KEY = "sf_finca_id";
const FINCA_NOMBRE_KEY = "sf_finca_nombre";

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

  // Expose Clerk's getToken to the axios interceptor.
  // No cleanup — the ref should always point to the latest getToken, never to null,
  // to avoid a race where the interceptor runs between cleanup and re-assignment.
  useEffect(() => {
    clerkTokenRef.getToken = () => getToken();
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
      // Get token first — it must be ready before any authenticated API call
      const token = await getToken();
      if (!token) return;

      let fincaId = await AsyncStorage.getItem(FINCA_KEY);
      const cachedNombre = await AsyncStorage.getItem(FINCA_NOMBRE_KEY);

      // Mostrar finca guardada localmente de inmediato, sin esperar al API
      if (fincaId) setFincaIdCache(fincaId);
      if (cachedNombre) setFincaNombreCache(cachedNombre);

      try {
        const { data } = await FincaAPI.listar();
        if (data.length > 0) {
          const match = fincaId ? data.find((f) => f.id === fincaId) ?? data[0] : data[0];
          fincaId = match.id;
          await AsyncStorage.setItem(FINCA_KEY, fincaId);
          await AsyncStorage.setItem(FINCA_NOMBRE_KEY, match.nombre);
          setFincaNombreCache(match.nombre);
        } else {
          // Usuario nuevo sin finca — crearla automáticamente
          const { data: nueva } = await FincaAPI.clerkSync();
          fincaId = nueva.id;
          await AsyncStorage.setItem(FINCA_KEY, fincaId);
          await AsyncStorage.setItem(FINCA_NOMBRE_KEY, nueva.nombre);
          setFincaNombreCache(nueva.nombre);
        }
      } catch (e: any) {
        console.warn("[AuthContext] FincaAPI.listar/clerkSync failed:", e?.response?.status, e?.message);
      }

      if (fincaId) setFincaIdCache(fincaId);

      conectarSocket(token);
      if (fincaId) unirseAFinca(fincaId);

      // Registrar token push ahora que el usuario está autenticado y el
      // interceptor de Axios ya tiene el token de Clerk.
      registrarTokenPushEnBackend();
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
    await AsyncStorage.removeItem(FINCA_NOMBRE_KEY);
    setFincaIdCache(null);
    setFincaNombreCache(null);
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

    if (campos.finca !== undefined) {
      setFincaNombreCache(campos.finca ?? null);
      if (campos.finca) await AsyncStorage.setItem(FINCA_NOMBRE_KEY, campos.finca);
      if (usuario.fincaId) {
        FincaAPI.actualizar(usuario.fincaId, { nombre: campos.finca }).catch(() => {});
      }
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
