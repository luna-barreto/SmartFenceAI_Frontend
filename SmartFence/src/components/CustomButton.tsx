import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

type Variante = "primario" | "secundario" | "peligro";

interface Props {
  titulo: string;
  onPress?: () => void;
  variante?: Variante;
  icono?: LucideIcon;
  cargando?: boolean;
  deshabilitado?: boolean;
  ancho?: "completo" | "auto";
}

const ESTILOS: Record<Variante, { bg: string; texto: string; borde?: string }> = {
  primario:   { bg: "#1F5C26", texto: "#FFFFFF" },
  secundario: { bg: "#F5F8F1", texto: "#152417", borde: "#DFE8D8" },
  peligro:    { bg: "#C9463C", texto: "#FFFFFF" },
};

export default function CustomButton({
  titulo,
  onPress,
  variante = "primario",
  icono: Icono,
  cargando = false,
  deshabilitado = false,
  ancho = "completo",
}: Props) {
  const estilo = ESTILOS[variante];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={deshabilitado || cargando}
      activeOpacity={0.8}
      style={{
        backgroundColor: estilo.bg,
        borderWidth: estilo.borde ? 1 : 0,
        borderColor: estilo.borde,
        opacity: deshabilitado ? 0.5 : 1,
        width: ancho === "completo" ? "100%" : undefined,
      }}
      className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 px-5"
    >
      {cargando ? (
        <ActivityIndicator color={estilo.texto} size="small" />
      ) : (
        <View className="flex-row items-center gap-2">
          {Icono && <Icono size={17} color={estilo.texto} strokeWidth={1.8} />}
          <Text style={{ color: estilo.texto }} className="font-semibold text-sm">
            {titulo}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
