import { createNavigationContainerRef, CommonActions } from "@react-navigation/native";
import { PilaRaiz } from "./types";

/**
 * Referencia global al NavigationContainer.
 * Permite navegar desde componentes que están fuera del árbol de navegación
 * activo (como DrawerMenu, que es sibling del InnerStack.Navigator).
 */
export const navigationRef = createNavigationContainerRef<PilaRaiz>();

/**
 * Navega a cualquier ruta usando la referencia global.
 * Acepta rutas tanto de la pila raíz como de los tabs interiores.
 */
export function navigateTo(name: string, params?: Record<string, unknown>) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({ name, params })
    );
  }
}
