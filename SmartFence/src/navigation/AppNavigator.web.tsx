import React, { useEffect } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import SplashScreen from "@screens/SplashScreen";
import HomeScreen from "@screens/HomeScreen";
import MapScreen from "@screens/MapScreen";
import AnimalsScreen from "@screens/AnimalsScreen";
import AlertsScreen from "@screens/AlertsScreen";
import ProfileScreen from "@screens/ProfileScreen";
import DevicesScreen from "@screens/DevicesScreen";
import SettingsScreen from "@screens/SettingsScreen";
import AnimalDetailScreen from "@screens/AnimalDetailScreen";
import InfoScreen from "@screens/InfoScreen";
import AdminScreen from "@screens/AdminScreen";

import { DrawerProvider } from "@context/DrawerContext";
import DrawerMenu from "@components/DrawerMenu";
import { useAuth } from "@context/AuthContext";

import { PilaRaiz } from "./types";
import { navigationRef } from "./navigationRef";

const OuterStack = createNativeStackNavigator<PilaRaiz>();

type PilaInterna = Pick<
  PilaRaiz,
  "Main" | "Home" | "Map" | "Animals" | "Alerts" | "Profile" |
  "AnimalDetail" | "Devices" | "Settings" | "Info" | "Admin"
>;
const InnerStack = createNativeStackNavigator<PilaInterna>();

function MainConDrawer() {
  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        <InnerStack.Navigator
          screenOptions={{ headerShown: false, animation: "none" }}
        >
          <InnerStack.Screen name="Main"        component={HomeScreen}        />
          <InnerStack.Screen name="Home"        component={HomeScreen}        />
          <InnerStack.Screen name="Map"         component={MapScreen}         />
          <InnerStack.Screen name="Animals"     component={AnimalsScreen}     />
          <InnerStack.Screen name="Alerts"      component={AlertsScreen}      />
          <InnerStack.Screen name="Profile"     component={ProfileScreen}     />
          <InnerStack.Screen name="Devices"     component={DevicesScreen}     />
          <InnerStack.Screen name="Settings"    component={SettingsScreen}    />
          <InnerStack.Screen name="Info"        component={InfoScreen}        />
          <InnerStack.Screen name="Admin"       component={AdminScreen}       />
          <InnerStack.Screen
            name="AnimalDetail"
            component={AnimalDetailScreen}
            options={{ headerShown: true, title: "Detalle del animal" }}
          />
        </InnerStack.Navigator>

        <DrawerMenu />
      </View>
    </DrawerProvider>
  );
}

// Escucha cambios de sesión y redirige sin reiniciar la app
function RootRedirector() {
  const { usuario, cargando } = useAuth();
  const nav = navigationRef;

  useEffect(() => {
    if (cargando) return;
    const ruta = nav.current?.getCurrentRoute()?.name;
    if (!usuario && ruta !== "Auth" && ruta !== "Splash") {
      nav.current?.reset({ index: 0, routes: [{ name: "Auth" }] });
    }
    if (usuario && (ruta === "Auth" || ruta === "Login" || ruta === "Splash")) {
      nav.current?.reset({ index: 0, routes: [{ name: "Main" }] });
    }
  }, [usuario, cargando]);

  return null;
}

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootRedirector />
      <OuterStack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
        <OuterStack.Screen name="Splash" component={SplashScreen} />
        <OuterStack.Screen name="Auth"   component={AuthNavigator} />
        <OuterStack.Screen name="Main"   component={MainConDrawer} />
      </OuterStack.Navigator>
    </NavigationContainer>
  );
}
