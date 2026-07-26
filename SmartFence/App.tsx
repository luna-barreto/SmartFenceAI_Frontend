import "./src/styles/global.css";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "@context/AuthContext";
import { ThemeProvider } from "@context/ThemeContext";
import { AnimalsProvider } from "@context/AnimalsContext";
import { NotificationsProvider } from "@context/NotificationsContext";
import AppNavigator from "@navigation/AppNavigator";
import ToastNotificacion from "@components/ToastNotificacion";

// Mantiene la splash nativa abierta hasta que React esté listo.
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // La ocultamos en cuanto el árbol de componentes se monte.
    SplashScreen.hideAsync();
  
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AnimalsProvider>
            <NotificationsProvider>
              <StatusBar style="dark" />
              <AppNavigator />
              <ToastNotificacion />
            </NotificationsProvider>
            </AnimalsProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
