import { useWindowDimensions } from "react-native";

export function useLayout() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isTablet: width >= 768,
    isSmall: width < 380,
    col2: (padding = 32, gap = 8) => (width - padding - gap) / 2,
    col3: (padding = 35, gap = 8) => (width - padding - gap * 2) / 3,
    mapH: () => width * 0.88,
  };
}
