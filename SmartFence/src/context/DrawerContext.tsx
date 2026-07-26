import React, { createContext, useContext, useState } from "react";

interface DrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  cerrarDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  function openDrawer() {
    setIsOpen(true);
  }

  function cerrarDrawer() {
    setIsOpen(false);
  }

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, cerrarDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer debe usarse dentro de <DrawerProvider>");
  return ctx;
}
