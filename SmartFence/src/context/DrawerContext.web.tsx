import React, { createContext, useContext, useState } from "react";

interface DrawerCtx {
  isOpen: boolean;
  openDrawer: () => void;
  cerrarDrawer: () => void;
}

const DrawerContext = createContext<DrawerCtx>({
  isOpen: false,
  openDrawer: () => {},
  cerrarDrawer: () => {},
});

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
  return useContext(DrawerContext);
}
