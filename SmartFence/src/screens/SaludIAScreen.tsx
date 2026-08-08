// Mobile stub — esta pantalla solo existe en la vista web.
// En móvil se redirige a la pantalla principal.
import React, { useEffect } from "react";
import { View } from "react-native";
import { navigateTo } from "@navigation/navigationRef";

export default function SaludIAScreen() {
  useEffect(() => { navigateTo("Home"); }, []);
  return <View style={{ flex: 1 }} />;
}
