import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import SplashScreen from "@screens/SplashScreen";
import HomeScreen from "@screens/HomeScreen";
import MapScreen from "@screens/MapScreen";
import AnimalsScreen from "@screens/AnimalsScreen";
import AlertsScreen from "@screens/AlertsScreen";
import ProfileScreen from "@screens/ProfileScreen";
import SettingsScreen from "@screens/SettingsScreen";
import AnimalDetailScreen from "@screens/AnimalDetailScreen";
import InfoScreen from "@screens/InfoScreen";
import AdminScreen from "@screens/AdminScreen";
import SaludIAScreen from "@screens/SaludIAScreen";

import { DrawerProvider } from "@context/DrawerContext";
import { DemoSimProvider } from "@context/DemoSimContext";
import DrawerMenu from "@components/DrawerMenu";
import { useAuth } from "@context/AuthContext";

import { PilaRaiz } from "./types";
import { navigationRef } from "./navigationRef";

const OuterStack = createNativeStackNavigator<PilaRaiz>();

type PilaInterna = Pick<
  PilaRaiz,
  "Home" | "Map" | "Animals" | "Alerts" | "Profile" |
  "AnimalDetail" | "Settings" | "Info" | "Admin" | "SaludIA"
>;
const InnerStack = createNativeStackNavigator<PilaInterna>();

function MainConDrawer() {
  return (
    <View style={{ flex: 1 }}>
      <InnerStack.Navigator
        screenOptions={{ headerShown: false, animation: "none" }}
      >
        <InnerStack.Screen name="Home"        component={HomeScreen}        />
        <InnerStack.Screen name="Map"         component={MapScreen}         />
        <InnerStack.Screen name="Animals"     component={AnimalsScreen}     />
        <InnerStack.Screen name="Alerts"      component={AlertsScreen}      />
        <InnerStack.Screen name="Profile"     component={ProfileScreen}     />
<InnerStack.Screen name="Settings"    component={SettingsScreen}    />
        <InnerStack.Screen name="Info"        component={InfoScreen}        />
        <InnerStack.Screen name="Admin"       component={AdminScreen}       />
        <InnerStack.Screen name="SaludIA"     component={SaludIAScreen}     />
        <InnerStack.Screen
          name="AnimalDetail"
          component={AnimalDetailScreen}
          options={{ headerShown: true, title: "Detalle del animal" }}
        />
      </InnerStack.Navigator>
    </View>
  );
}

// Escucha cambios de sesión y redirige sin reiniciar la app
function RootRedirector({ navReady }: { navReady: boolean }) {
  const { usuario, cargando } = useAuth();
  const nav = navigationRef;

  useEffect(() => {
    if (cargando || !navReady) return;
    const ruta = nav.current?.getCurrentRoute()?.name as string | undefined;
    if (!ruta) return;
    if (!usuario && ruta !== "Auth" && ruta !== "Splash") {
      nav.current?.reset({ index: 0, routes: [{ name: "Auth" }] });
    }
    if (usuario && (ruta === "Auth" || ruta === "Login" || ruta === "Splash")) {
      nav.current?.reset({ index: 0, routes: [{ name: "Main" }] });
    }
  }, [usuario, cargando, navReady]);

  return null;
}

export default function AppNavigator() {
  const [navReady, setNavReady] = React.useState(false);

  return (
    <DemoSimProvider>
    <DrawerProvider>
      <View style={st.root}>
        <NavigationContainer ref={navigationRef} onReady={() => setNavReady(true)}>
          <RootRedirector navReady={navReady} />
          <OuterStack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
            <OuterStack.Screen name="Splash" component={SplashScreen} />
            <OuterStack.Screen name="Auth"   component={AuthNavigator} />
            <OuterStack.Screen name="Main"   component={MainConDrawer} />
          </OuterStack.Navigator>
        </NavigationContainer>

        {/* DrawerMenu at root level so its position:absolute covers the full viewport */}
        <DrawerMenu />
      </View>
    </DrawerProvider>
    </DemoSimProvider>
  );
}

const st = StyleSheet.create({
  root: {
    flex: 1,
  },
});
