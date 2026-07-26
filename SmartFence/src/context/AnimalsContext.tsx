import React, { createContext, useCallback, useContext, useState } from "react";
import { useAnimals } from "@hooks/useAnimals";
import { Alerta, Animal, Cerca } from "@/types";

interface AnimalsContextValue {
  animales: Animal[];
  conectado: boolean;
  ultimaSync: Date;
  cerca: Cerca | null;
  alertas: Alerta[];
  recargar: () => void;
}

const AnimalsContext = createContext<AnimalsContextValue>({
  animales: [],
  conectado: false,
  ultimaSync: new Date(),
  cerca: null,
  alertas: [],
  recargar: () => undefined,
});

export function AnimalsProvider({ children }: { children: React.ReactNode }) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const onNuevaAlerta = useCallback(
    (a: Alerta) => setAlertas((p) => [a, ...p].slice(0, 30)),
    []
  );
  const { animales, conectado, ultimaSync, cerca, recargar } = useAnimals({ onNuevaAlerta });

  return (
    <AnimalsContext.Provider value={{ animales, conectado, ultimaSync, cerca, alertas, recargar }}>
      {children}
    </AnimalsContext.Provider>
  );
}

export function useAnimalsCtx() {
  return useContext(AnimalsContext);
}
