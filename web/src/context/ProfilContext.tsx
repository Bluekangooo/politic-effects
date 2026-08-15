import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Nutzerprofil } from "@domain/fragebogen";
import {
  ermittleEinkommensklasse,
  ermittleZielgruppen,
  istProfilVollstaendig,
  zielgruppenNamen,
} from "@engine/zielgruppen";
import { berechneSteuerprofil, type SteuerprofilErgebnis } from "@engine/steuerlast";
import { useKatalog } from "./KatalogContext";

const STORAGE_KEY = "politic-effects-profil";

interface ProfilContextValue {
  profil: Nutzerprofil;
  zielgruppenIds: string[];
  zielgruppenLabels: { id: string; name: string }[];
  profilVollstaendig: boolean;
  einkommensklasse: ReturnType<typeof ermittleEinkommensklasse> | null;
  steuerprofil: SteuerprofilErgebnis | null;
  setAntwort: (frageId: string, wert: number) => void;
  speichereProfil: () => void;
  loescheProfil: () => void;
}

const ProfilContext = createContext<ProfilContextValue | null>(null);

const LEERES_PROFIL: Nutzerprofil = {
  basisAntworten: {},
  vorhabenAntworten: {},
};

function ladeProfil(): Nutzerprofil {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Nutzerprofil;
  } catch {
    /* ignore */
  }
  return { ...LEERES_PROFIL };
}

export function ProfilProvider({ children }: { children: ReactNode }) {
  const { katalog } = useKatalog();
  const [profil, setProfil] = useState<Nutzerprofil>(ladeProfil);

  const zielgruppenIds = useMemo(
    () => ermittleZielgruppen(katalog, profil),
    [katalog, profil],
  );

  const zielgruppenLabels = useMemo(
    () => zielgruppenNamen(katalog, zielgruppenIds),
    [katalog, zielgruppenIds],
  );

  const profilVollstaendig = useMemo(() => istProfilVollstaendig(profil), [profil]);

  const einkommensklasse = useMemo(() => {
    const alle = { ...profil.basisAntworten, ...profil.vorhabenAntworten };
    if (typeof alle["basis-einkommen-angestellt"] !== "number") return null;
    return ermittleEinkommensklasse(profil);
  }, [profil]);

  const steuerprofil = useMemo(() => {
    if (!profilVollstaendig && !hatBasisEingaben(profil)) return null;
    return berechneSteuerprofil(profil, katalog.gesellschaft);
  }, [profil, profilVollstaendig, katalog.gesellschaft]);

  const setAntwort = useCallback((frageId: string, wert: number) => {
    setProfil((prev) => ({
      ...prev,
      basisAntworten: { ...prev.basisAntworten, [frageId]: wert },
    }));
  }, []);

  const speichereProfil = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profil));
  }, [profil]);

  const loescheProfil = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfil({ ...LEERES_PROFIL });
  }, []);

  return (
    <ProfilContext.Provider
      value={{
        profil,
        zielgruppenIds,
        zielgruppenLabels,
        profilVollstaendig,
        einkommensklasse,
        steuerprofil,
        setAntwort,
        speichereProfil,
        loescheProfil,
      }}
    >
      {children}
    </ProfilContext.Provider>
  );
}

function hatBasisEingaben(profil: Nutzerprofil): boolean {
  const alle = { ...profil.basisAntworten, ...profil.vorhabenAntworten };
  return (
    typeof alle["basis-einkommen-angestellt"] === "number" ||
    typeof alle["basis-einkommen-selbststaendig"] === "number"
  );
}

export function useProfil() {
  const ctx = useContext(ProfilContext);
  if (!ctx) throw new Error("useProfil außerhalb von ProfilProvider");
  return ctx;
}
