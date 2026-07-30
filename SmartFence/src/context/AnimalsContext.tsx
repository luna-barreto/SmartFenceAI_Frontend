import React, { createContext, useCallback, useContext, useState } from "react";
import { useAnimals } from "@hooks/useAnimals";
import { Alerta, Animal, Cerca } from "@/types";
import { sonarAlarma } from "@services/alarma";

interface AnimalsContextValue {
  animales: Animal[];
  conectado: boolean;
  ultimaSync: Date;
  cerca: Cerca | null;
  cargandoCerca: boolean;
  alertas: Alerta[];
  recargar: () => void;
}

const AnimalsContext = createContext<AnimalsContextValue>({
  animales: [],
  conectado: false,
  ultimaSync: new Date(),
  cerca: null,
  cargandoCerca: true,
  alertas: [],
  recargar: () => undefined,
});

export function AnimalsProvider({ children }: { children: React.ReactNode }) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const onNuevaAlerta = useCallback((a: Alerta) => {
    setAlertas((p) => [a, ...p].slice(0, 30));
    if (a.tipo === "ANIMAL_SALIO" || a.severidad === "CRITICA") {
      sonarAlarma();
    }
  }, []);
  const { animales, conectado, ultimaSync, cerca, cargandoCerca, recargar } = useAnimals({ onNuevaAlerta });

  return (
    <AnimalsContext.Provider value={{ animales, conectado, ultimaSync, cerca, cargandoCerca, alertas, recargar }}>
      {children}
    </AnimalsContext.Provider>
  );
}

export function useAnimalsCtx() {
  return useContext(AnimalsContext);
}
