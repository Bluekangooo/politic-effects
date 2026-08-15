import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Nutzerprofil } from "@domain/fragebogen";
import { ermittleZielgruppen, zielgruppenNamen } from "@engine/zielgruppen";
import { useKatalog } from "./KatalogContext";

const STORAGE_KEY = "politic-effects-profil";

interface ProfilContextValue {
  profil: Nutzerprofil;
  zielgruppenIds: string[];
  zielgruppenLabels: { id: string; name: string }[];
  profilVollstaendig: boolean;
  setAntwort: (frageId: string, wert: string | number | boolean) => void;
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

const PFLICHT_FRAGEN = [
  "basis-alter",
  "basis-einkommen-angestellt",
  "basis-einkommen-selbststaendig",
  "basis-kapitalertraege",
];

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

  const profilVollstaendig = useMemo(() => {
    const alle = { ...profil.basisAntworten, ...profil.vorhabenAntworten };
    return PFLICHT_FRAGEN.every(
      (id) => typeof alle[id] === "number" && Number.isFinite(alle[id]),
    );
  }, [profil]);

  const setAntwort = useCallback((frageId: string, wert: string | number | boolean) => {
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
        setAntwort,
        speichereProfil,
        loescheProfil,
      }}
    >
      {children}
    </ProfilContext.Provider>
  );
}

export function useProfil() {
  const ctx = useContext(ProfilContext);
  if (!ctx) throw new Error("useProfil außerhalb von ProfilProvider");
  return ctx;
}
