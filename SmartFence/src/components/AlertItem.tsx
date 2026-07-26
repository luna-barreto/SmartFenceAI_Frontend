import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react-native";
import { Alerta } from "@/types";
import { tiempoRelativo } from "@/utils/format";

type IconComponent = typeof AlertTriangle;

const CONFIG: Record<Alerta["tipo"], { bg: string; color: string; Icono: IconComponent }> = {
  critica:     { bg: "#FBE8E6", color: "#C9463C", Icono: AlertTriangle },
  advertencia: { bg: "#FAF0DC", color: "#C97A1F", Icono: ShieldAlert   },
  informativa: { bg: "#E3F0FA", color: "#2F6FA8", Icono: Info          },
};

export default function AlertItem({
  alerta,
  onResolver,
}: {
  alerta: Alerta;
  onResolver?: (id: string) => void;
}) {
  const { bg, color, Icono } = CONFIG[alerta.tipo];
  return (
    <View className="flex-row items-start gap-3 py-3 border-b border-linea">
      <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: bg }}>
        <Icono size={15} color={color} strokeWidth={1.8} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-texto">{alerta.titulo}</Text>
        <Text className="text-xs text-textoGris mt-0.5">{alerta.detalle}</Text>
        <Text className="text-[11px] text-textoTenue mt-1">{tiempoRelativo(alerta.fecha)}</Text>
      </View>
      {!alerta.resuelta && onResolver && (
        <TouchableOpacity
          onPress={() => onResolver(alerta.id)}
          className="bg-crema border border-linea rounded-lg px-2.5 py-1.5"
        >
          <Text className="text-[11px] font-semibold text-texto">Resolver</Text>
        </TouchableOpacity>
      )}
      {alerta.resuelta && (
        <View className="bg-verdeLimaSuave rounded-lg px-2.5 py-1.5">
          <Text className="text-[11px] font-semibold text-verdeBosque">Resuelta</Text>
        </View>
      )}
    </View>
  );
}
