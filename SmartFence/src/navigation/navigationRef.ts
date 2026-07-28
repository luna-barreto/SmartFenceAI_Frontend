import { createNavigationContainerRef } from "@react-navigation/native";
import { PilaRaiz } from "./types";

export const navigationRef = createNavigationContainerRef<PilaRaiz>();

export function navigateTo(name: string, params?: Record<string, unknown>) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}
