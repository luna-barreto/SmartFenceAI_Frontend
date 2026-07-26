import { useWindowDimensions } from "react-native";

export function useBreakpoints() {
  const { width } = useWindowDimensions();
  return {
    width,
    isSm: width < 768,    // móvil / pantalla pequeña
    isMd: width < 1100,   // tablet / laptop pequeño
    isLg: width >= 1100,  // escritorio completo
  };
}
