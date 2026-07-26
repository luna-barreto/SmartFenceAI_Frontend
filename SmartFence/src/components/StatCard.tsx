import React from "react";
import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface Props {
  icono: LucideIcon;
  valor: string | number;
  etiqueta: string;
  colorFondo: string;
  colorIcono: string;
}

export default function StatCard({ icono: Icono, valor, etiqueta, colorFondo, colorIcono }: Props) {
  return (
    <View className="bg-white rounded-2xl border border-linea p-4 flex-1 min-w-[45%] gap-2">
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: colorFondo }}
      >
        <Icono size={17} color={colorIcono} strokeWidth={1.8} />
      </View>
      <Text className="text-2xl font-bold text-texto">{valor}</Text>
      <Text className="text-xs text-textoGris font-medium">{etiqueta}</Text>
    </View>
  );
}
