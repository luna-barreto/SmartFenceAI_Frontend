import React from "react";
import { View, Text, TouchableOpacity, Platform, StatusBar, StyleSheet } from "react-native";
import { Menu, Bell } from "lucide-react-native";
import { useDrawer } from "@context/DrawerContext";

const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_EXTRA_PT = 20;

interface HeaderProps {
  titulo: string;
  conectado?: boolean;
  /** Si se omite, el botón burger abre el DrawerContext automáticamente */
  onPressMenu?: () => void;
  /** Pasar false para ocultar el botón burger */
  mostrarMenu?: boolean;
  onPressCampana?: () => void;
  alertasNoLeidas?: number;
}

export default function Header({
  titulo,
  conectado = true,
  onPressMenu,
  mostrarMenu = true,
  onPressCampana,
  alertasNoLeidas = 0,
}: HeaderProps) {
  const { openDrawer } = useDrawer();

  const handleMenu = onPressMenu ?? openDrawer;

  return (
    <View className="flex-row items-center justify-between px-4 bg-white border-b border-linea" style={s.header}>
      <View className="flex-row items-center gap-3">
        {mostrarMenu && (
          <TouchableOpacity onPress={handleMenu} className="w-9 h-9 rounded-lg bg-crema items-center justify-center">
            <Menu size={18} color="#152417" strokeWidth={1.8} />
          </TouchableOpacity>
        )}
        <Text className="text-lg font-bold text-texto">{titulo}</Text>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-2 bg-verdeLimaSuave px-3 py-1.5 rounded-full">
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: conectado ? "#6FAE3A" : "#C9463C" }}
          />
          <Text className="text-xs font-semibold text-verdeBosque">
            {conectado ? "Conectado" : "Reconectando..."}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onPressCampana}
          className="w-9 h-9 rounded-lg bg-crema items-center justify-center relative"
        >
          <Bell size={18} color="#152417" strokeWidth={1.8} />
          {alertasNoLeidas > 0 && (
            <View className="absolute -top-1 -right-1 bg-rojo rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-[9px] text-white font-bold">{alertasNoLeidas}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingTop: STATUS_BAR_H + HEADER_EXTRA_PT,
    paddingBottom: 12,
  },
});
