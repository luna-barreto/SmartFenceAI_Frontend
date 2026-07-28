import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Usuario } from "@/types";
import { AuthAPI, FincaAPI } from "@/services/api";
import { conectarSocket, desconectarSocket, unirseAFinca } from "@/services/socket";

const PERFIL_KEY = "sf_perfil_extra";
const FINCA_KEY  = "sf_finca_id";

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
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("sf_token");
      if (!token) {
        setCargando(false);
        return;
      }

      // Restaurar desde caché inmediatamente para no bloquear la splash
      const extra = await cargarExtra();
      const fincaIdGuardado = await AsyncStorage.getItem(FINCA_KEY);
      if (extra.nombre || extra.email) {
        const u: Usuario = {
          id: "",
          nombre: extra.nombre ?? "",
          email: extra.email ?? "",
          correo: extra.email ?? "",
          rol: "ganadero" as Usuario["rol"],
          finca: extra.finca,
          fincaId: extra.fincaId ?? fincaIdGuardado ?? undefined,
          avatarUrl: extra.avatarUrl,
          telefono: extra.telefono,
          direccion: extra.direccion,
          departamento: extra.departamento,
        };
        setUsuario(u);
        setCargando(false);

        // Validar token en segundo plano
        AuthAPI.perfil()
          .then(({ data: perfil }) => {
            const fincaId = perfil.fincaId ?? u.fincaId;
            setUsuario((prev) =>
              prev ? { ...prev, id: perfil.id, rol: perfil.rol as Usuario["rol"], fincaId } : null
            );
            if (fincaId) {
              unirseAFinca(fincaId);
              AsyncStorage.setItem(FINCA_KEY, fincaId);
            }
            conectarSocket(token);
          })
          .catch(async () => {
            await SecureStore.deleteItemAsync("sf_token");
            setUsuario(null);
          });
      } else {
        // Sin caché — esperar API (primera vez con token sin datos guardados)
        try {
          const { data: perfil } = await AuthAPI.perfil();
          const u: Usuario = {
            id: perfil.id,
            nombre: "",
            email: "",
            correo: "",
            rol: perfil.rol as Usuario["rol"],
            fincaId: fincaIdGuardado ?? undefined,
          };
          setUsuario(u);
          conectarSocket(token);
        } catch {
          await SecureStore.deleteItemAsync("sf_token");
        }
        setCargando(false);
      }
    })();
  }, []);

  async function cargarExtra(): Promise<Partial<Usuario>> {
    try {
      const raw = await AsyncStorage.getItem(PERFIL_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* sin datos */ }
    return {};
  }

  async function iniciarSesion(correo: string, contrasena: string) {
    try {
      const { data } = await AuthAPI.login(correo, contrasena);

      await SecureStore.setItemAsync("sf_token", data.tokenAcceso);

      const u: Usuario = {
        ...data.usuario,
        correo: data.usuario.email,
        fincaId: data.usuario.fincaId ?? undefined,
        finca: data.usuario.finca ?? undefined,
      };

      const extra: Partial<Usuario> = {
        nombre: u.nombre,
        email: u.email,
        fincaId: u.fincaId ?? undefined,
        finca: u.finca,
      };
      await AsyncStorage.setItem(PERFIL_KEY, JSON.stringify(extra));
      if (u.fincaId) await AsyncStorage.setItem(FINCA_KEY, u.fincaId);

      setUsuario(u);
      conectarSocket(data.tokenAcceso);
      if (u.fincaId) unirseAFinca(u.fincaId);
    } catch (err: any) {
      // Relanzar el error para que la pantalla de login pueda mostrarlo al usuario
      const mensaje =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? "Credenciales incorrectas" : null) ||
        (err?.response?.status === 409 ? "El correo ya está registrado" : null) ||
        "No se pudo conectar al servidor. Verifica tu conexión.";
      throw new Error(mensaje);
    }
  }

  async function cerrarSesion() {
    await SecureStore.deleteItemAsync("sf_token");
    desconectarSocket();
    setUsuario(null);
  }

  async function actualizarUsuario(campos: Partial<Usuario>) {
    if (!usuario) return;
    const actualizado = { ...usuario, ...campos };
    setUsuario(actualizado);

    // Persistir localmente para sobrevivir reinicios
    const extra = await cargarExtra();
    await AsyncStorage.setItem(PERFIL_KEY, JSON.stringify({ ...extra, ...campos }));

    // Sincronizar con el backend (modo demo = id "demo" → solo local)
    if (usuario.id && usuario.id !== "demo") {
      // Campos personales del usuario
      const camposUsuario: Parameters<typeof AuthAPI.actualizarPerfil>[0] = {};
      if (campos.nombre      !== undefined) camposUsuario.nombre       = campos.nombre;
      if (campos.contrasena  !== undefined) camposUsuario.contrasena   = campos.contrasena;
      if (campos.telefono    !== undefined) camposUsuario.telefono     = campos.telefono;
      if (campos.direccion   !== undefined) camposUsuario.direccion    = campos.direccion;
      if (campos.departamento !== undefined) camposUsuario.departamento = campos.departamento;

      if (Object.keys(camposUsuario).length > 0) {
        AuthAPI.actualizarPerfil(camposUsuario).catch(() => {
          // Sin conexión — los cambios quedaron en caché local
        });
      }

      // Nombre de la finca
      if (campos.finca !== undefined && usuario.fincaId && usuario.fincaId !== "demo") {
        FincaAPI.actualizar(usuario.fincaId, { nombre: campos.finca }).catch(() => {});
      }
    }

    // Si actualizaron el fincaId, unirse a esa sala WebSocket
    if (campos.fincaId && campos.fincaId !== usuario.fincaId) {
      unirseAFinca(campos.fincaId);
      await AsyncStorage.setItem(FINCA_KEY, campos.fincaId);
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
