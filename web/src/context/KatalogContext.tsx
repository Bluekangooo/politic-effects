import { createContext, useContext, useMemo, type ReactNode } from "react";
import katalogData from "@data/katalog.json";
import type { VorhabenKatalog } from "@domain/vorhaben";

interface KatalogContextValue {
  katalog: VorhabenKatalog;
}

const KatalogContext = createContext<KatalogContextValue | null>(null);

export function KatalogProvider({ children }: { children: ReactNode }) {
  const katalog = useMemo(() => katalogData as VorhabenKatalog, []);
  return (
    <KatalogContext.Provider value={{ katalog }}>{children}</KatalogContext.Provider>
  );
}

export function useKatalog() {
  const ctx = useContext(KatalogContext);
  if (!ctx) throw new Error("useKatalog außerhalb von KatalogProvider");
  return ctx;
}
