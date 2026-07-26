import React, { createContext, useContext } from "react";

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
  return (
    <DrawerContext.Provider value={{ isOpen: false, openDrawer: () => {}, cerrarDrawer: () => {} }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
