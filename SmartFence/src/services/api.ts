import axios from "axios";
import Constants from "expo-constants";
import { Alerta, Animal, Cerca, Collar, RespuestaLogin, Usuario } from "@/types";
import { clerkTokenRef } from "@/services/clerkTokenRef";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string) ??
  "http://localhost:4000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await clerkTokenRef.getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("[api] interceptor: no Clerk token — request to", config.url, "will be unauthenticated");
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  // No login/registro/perfil — Clerk handles all auth. Keep as empty namespace for compatibility.
};

// ── Finca ─────────────────────────────────────────────────────────────────────
export const FincaAPI = {
  listar: () => api.get<{ id: string; nombre: string }[]>("/fincas"),
  // Obtiene o crea la finca del usuario autenticado (idempotente)
  clerkSync: (nombre?: string) =>
    api.post<{ id: string; nombre: string }>("/fincas/clerk-sync", nombre ? { nombre } : {}),
  actualizar: (id: string, data: { nombre?: string }) =>
    api.put<{ id: string; nombre: string }>(`/fincas/${id}`, data),
};

// ── Animales ──────────────────────────────────────────────────────────────────
export const AnimalesAPI = {
  listar: (fincaId?: string) =>
    api.get<Animal[]>("/animales", { params: fincaId ? { fincaId } : undefined }),
  obtener: (id: string) => api.get<Animal>(`/animales/${id}`),
  crear: (data: { codigo?: string; nombre: string; raza?: string; peso?: number; fincaId?: string }) =>
    api.post<Animal>("/animales", data),
  // Crea animal + collar + vincula en una sola operación
  crearConCollar: (data: {
    nombre: string; raza?: string; peso?: number; fincaId?: string; collarSerial: string;
  }) => api.post<{ animal: Animal; collar: Collar }>("/animales/con-collar", data),
  actualizar: (id: string, data: Partial<Pick<Animal, "nombre" | "raza" | "peso" | "salud" | "estado">>) =>
    api.patch<Animal>(`/animales/${id}`, data),
};

// ── Collares ──────────────────────────────────────────────────────────────────
export const CollaresAPI = {
  listar: (fincaId?: string) =>
    api.get<Collar[]>("/collares", { params: fincaId ? { fincaId } : undefined }),
  // Collares registrados en BD sin animal asignado (para el selector del modal)
  disponibles: (fincaId?: string) =>
    api.get<Collar[]>("/collares/disponibles", { params: fincaId ? { fincaId } : undefined }),
  registrar: (data: { serial: string; fincaId?: string }) =>
    api.post<Collar>("/collares", data),
  vincularAnimal: (id: string, animalId: string) =>
    api.put<Collar>(`/collares/${id}/vincular-animal`, { animalId }),
};

// ── Geocercas ─────────────────────────────────────────────────────────────────
export const CercasAPI = {
  listar: (fincaId?: string) =>
    api.get<Cerca[]>("/geocercas", { params: fincaId ? { fincaId } : undefined }),
  crear: (data: {
    fincaId?: string;
    nombre: string;
    coordenadas: { lat: number; lng: number }[];
    // Ubicación del dispositivo en el momento de crear la geocerca.
    // El backend la usa para inicializar el centro del mapa de la finca
    // si aún no tiene uno (primer uso). No participa en la validación de cerca.
    latitudDispositivo?: number;
    longitudDispositivo?: number;
  }) => api.post<Cerca>("/geocercas", data),
  actualizar: (id: string, data: { nombre?: string; coordenadas?: { lat: number; lng: number }[]; activa?: boolean }) =>
    api.put<Cerca>(`/geocercas/${id}`, data),
  eliminar: (id: string) => api.delete(`/geocercas/${id}`),
};

// ── Alertas ───────────────────────────────────────────────────────────────────
export const AlertasAPI = {
  listar: (fincaId?: string, estado?: string) =>
    api.get<Alerta[]>("/alertas", { params: { fincaId, estado } }),
  marcarLeida: (id: string) => api.put<Alerta>(`/alertas/${id}/leida`),
  marcarResuelta: (id: string) => api.put<Alerta>(`/alertas/${id}/resolver`),
  eliminar: (id: string) => api.delete(`/alertas/${id}`),
};

// ── GPS ───────────────────────────────────────────────────────────────────────
// El endpoint /gps/vivo devuelve { lat, lng } (ya normalizado en el backend).
// El endpoint /gps/historial devuelve { latitud, longitud } (campos Prisma crudos).
type PosicionVivo = { lat: number; lng: number; dentroDeCerca: boolean; fecha: string };
type HistorialRaw = { collarId: string; latitud: number; longitud: number; bateria?: number; fecha: string };

export const GpsAPI = {
  vivo: (fincaId: string) =>
    api.get<{ collar: Collar; posicion: PosicionVivo | null }[]>("/gps/vivo", { params: { fincaId } })
      .then((r) => ({
        ...r,
        data: r.data.map((d) => ({
          collar: d.collar,
          posicion: d.posicion
            ? { lat: d.posicion.lat, lng: d.posicion.lng, dentroDeCerca: d.posicion.dentroDeCerca, fecha: d.posicion.fecha }
            : null,
        })),
      })),
  historial: (collarId: string, desde?: string, hasta?: string) =>
    api.get<HistorialRaw[]>("/gps/historial", { params: { collarId, desde, hasta } })
      .then((r) => ({
        ...r,
        data: r.data.map((p) => ({ collarId: p.collarId, lat: p.latitud, lng: p.longitud, bateria: p.bateria, fecha: p.fecha })),
      })),
};

// ── Notificaciones push ───────────────────────────────────────────────────────
export const PushAPI = {
  registrarToken: (token: string, plataforma: string) =>
    api.post("/tokens-push", { token, plataforma }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export type FincaAdmin = {
  id: string; nombre: string;
  propietario: { id: string; nombre: string; email: string };
  _count: { animales: number; collares: number; geocercas: number };
};
export type UsuarioAdmin = {
  id: string; nombre: string; email: string;
  rol: string; activo: boolean; fechaCreacion: string;
  fincas: { id: string; nombre: string }[];
  _count: { fincas: number };
};

export const AdminAPI = {
  // Usuarios
  listarUsuarios: () => api.get<UsuarioAdmin[]>("/admin/usuarios"),
  crearUsuario: (data: { nombre: string; email: string; contrasena: string; rol?: string; fincaId?: string }) =>
    api.post<UsuarioAdmin>("/admin/usuarios", data),
  actualizarUsuario: (id: string, data: { nombre?: string; email?: string; contrasena?: string; rol?: string; fincaId?: string | null }) =>
    api.patch<UsuarioAdmin>(`/admin/usuarios/${id}`, data),
  eliminarUsuario: (id: string) => api.delete(`/admin/usuarios/${id}`),
  // Fincas
  listarFincas: () => api.get<FincaAdmin[]>("/admin/fincas"),
  crearFinca: (data: { nombre: string; propietarioId?: string }) =>
    api.post<FincaAdmin>("/admin/fincas", data),
  actualizarFinca: (id: string, data: { nombre?: string; propietarioId?: string }) =>
    api.patch<FincaAdmin>(`/admin/fincas/${id}`, data),
  eliminarFinca: (id: string) => api.delete(`/admin/fincas/${id}`),
};

export default api;
