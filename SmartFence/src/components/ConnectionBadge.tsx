import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { tiempoRelativo } from "@/utils/format";

export default function ConnectionBadge({
  conectado,
  ultimaSync,
}: {
  conectado: boolean;
  ultimaSync: Date;
}) {
  const [, forzarRender] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forzarRender((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View className="flex-row items-center gap-2 bg-verdeLimaSuave self-start px-3 py-1.5 rounded-full">
      <View
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: conectado ? "#6FAE3A" : "#C9463C" }}
      />
      <Text className="text-xs font-semibold text-verdeBosque">
        {conectado ? `Sincronizado · ${tiempoRelativo(ultimaSync.toISOString())}` : "Reconectando con el gateway..."}
      </Text>
    </View>
  );
}
