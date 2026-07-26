import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Activity } from "lucide-react-native";
import { Animal } from "@/types";

const COLOR_SALUD: Record<Animal["salud"], string> = {
  Excelente: "#6FAE3A",
  Buena: "#C97A1F",
  Regular: "#C9463C",
};

export default function AnimalCard({
  animal,
  onPress,
}: {
  animal: Animal;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl border border-linea p-3 mb-2"
      activeOpacity={0.7}
    >
      <View className="w-11 h-11 rounded-full bg-verdeLimaSuave items-center justify-center mr-3">
        <Image
          source={require("../../assets/logo.png")}
          style={{ width: 28, height: 28, borderRadius: 14 }}
          resizeMode="contain"
        />
      </View>

      <View className="flex-1">
        <Text className="text-sm font-bold text-texto">{animal.nombre}</Text>
        <Text className="text-xs text-textoGris">{animal.raza} · {animal.peso} kg</Text>
      </View>

      <View className="items-end gap-1">
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: animal.dentroDeCerca ? "#6FAE3A" : "#C9463C" }}
          />
          <Text className="text-xs font-semibold text-texto">
            {animal.dentroDeCerca ? "Dentro" : "Fuera"}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Activity size={11} color={COLOR_SALUD[animal.salud]} strokeWidth={1.8} />
          <Text className="text-[11px]" style={{ color: COLOR_SALUD[animal.salud] }}>
            {animal.salud}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
