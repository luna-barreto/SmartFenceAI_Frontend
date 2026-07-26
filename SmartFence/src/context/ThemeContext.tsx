import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Tema = "claro" | "oscuro";

interface ThemeContextType {
  tema: Tema;
  oscuro: boolean;
  alternarTema: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const TEMA_KEY = "sf_tema";

// ─── Paleta claro ──────────────────────────────────────────────────────────────
export const PALETA_CLARO = {
  fondo:       "#F6FAF6",
  fondoSec:    "#FFFFFF",
  card:        "#FFFFFF",
  cardElevada: "#F4F8F4",
  borde:       "#E8EDEA",

  verde:       "#76C043",
  verdeMain:   "#76C043",
  verdeBrillo: "#8FE25C",
  verdeOscuro: "#4F9E2C",
  verdeAlfa:   "rgba(118,192,67,0.13)",
  verdeLuz:    "rgba(118,192,67,0.13)",
  verdeMuy:    "rgba(118,192,67,0.07)",

  txtMain:     "#111827",
  txtSec:      "#6B7280",
  txtTer:      "#9CA3AF",

  rojo:        "#EF4444",
  rojoBg:      "#FEE2E2",
  naranja:     "#F59E0B",
  naranjaBg:   "#FEF3C7",
  azul:        "#3B82F6",
  azulBg:      "#DBEAFE",

  header:      "#FFFFFF",
  headerBtn:   "#F3F4F6",
};

// ─── Paleta oscuro ─────────────────────────────────────────────────────────────
export const PALETA_OSCURO = {
  fondo:       "#0B0F0E",
  fondoSec:    "#111716",
  card:        "#161C1B",
  cardElevada: "#1A211F",
  borde:       "#242C29",

  verde:       "#76C043",
  verdeMain:   "#76C043",
  verdeBrillo: "#8FE25C",
  verdeOscuro: "#4F9E2C",
  verdeAlfa:   "rgba(118,192,67,0.12)",
  verdeLuz:    "rgba(118,192,67,0.10)",
  verdeMuy:    "rgba(118,192,67,0.06)",

  txtMain:     "#F4F5F5",
  txtSec:      "#A5AFAB",
  txtTer:      "#707A76",

  rojo:        "#FF5757",
  rojoBg:      "rgba(255,87,87,0.15)",
  naranja:     "#F4B740",
  naranjaBg:   "rgba(244,183,64,0.14)",
  azul:        "#5B9CF6",
  azulBg:      "rgba(91,156,246,0.14)",

  header:      "#0B0F0E",
  headerBtn:   "#161C1B",
};

export type Paleta = typeof PALETA_CLARO;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("claro");

  useEffect(() => {
    AsyncStorage.getItem(TEMA_KEY).then((v) => {
      // Only restore if the user explicitly chose a theme (versioned key)
      if (v === "claro_v2" || v === "oscuro_v2") {
        setTema(v === "oscuro_v2" ? "oscuro" : "claro");
      }
      // Any old value ("claro" / "oscuro" without _v2) is ignored → defaults to "claro"
    });
  }, []);

  async function alternarTema() {
    const nuevo: Tema = tema === "claro" ? "oscuro" : "claro";
    setTema(nuevo);
    await AsyncStorage.setItem(TEMA_KEY, nuevo === "oscuro" ? "oscuro_v2" : "claro_v2");
  }

  return (
    <ThemeContext.Provider value={{ tema, oscuro: tema === "oscuro", alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTema debe usarse dentro de <ThemeProvider>");
  return ctx;
}

/** Devuelve la paleta de colores del tema activo */
export function useT(): Paleta {
  const { oscuro } = useTema();
  return oscuro ? PALETA_OSCURO : PALETA_CLARO;
}
