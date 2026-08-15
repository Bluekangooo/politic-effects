import type { Zeithorizont } from "../types/zeithorizont.js";
import type { Nutzerprofil } from "../types/fragebogen.js";
import type { GesellschaftDaten, Staatsfinanzierung, Vorhaben } from "../types/vorhaben.js";
import { berechneGesellschaftsEffekt } from "./berechnung.js";
import { berechneSteuerprofil } from "./steuerlast.js";

export interface StaatsumlegungErgebnis {
  umlegung: number;
  steueranteilProzent: number;
  steuerlast: number;
  fiskaleffekt: number;
}

/**
 * Legt den Fiskaleffekt einer Maßnahme proportional zur Steuerlast
 * auf den Nutzer um.
 */
export function berechneStaatsumlegung(
  profil: Nutzerprofil,
  gesellschaft: GesellschaftDaten,
  staatsfinanzierung: Staatsfinanzierung,
  zeithorizont: Zeithorizont,
): StaatsumlegungErgebnis {
  const gesEffekt = berechneGesellschaftsEffekt(gesellschaft, zeithorizont);
  const fiskalausfallMrd = gesellschaft[staatsfinanzierung.fiskalausfall_feld];
  const faktor = zeithorizont === "kurz" ? 1 : zeithorizont === "mittel" ? 1.05 : 1.1;
  const fiskaleffekt = fiskalausfallMrd * 1_000_000_000 * faktor;

  const { steuerlast, steueranteil } = berechneSteuerprofil(profil, gesellschaft);
  const anteilBetrag = fiskaleffekt * steueranteil;

  const umlegung =
    staatsfinanzierung.richtung === "belastung" ? -anteilBetrag : anteilBetrag;

  return {
    umlegung,
    steueranteilProzent: steueranteil * 100,
    steuerlast,
    fiskaleffekt: gesEffekt.fiskalausfall,
  };
}

/** Kumuliert Staatsumlegung über ausgewählte Vorhaben */
export function berechneGesamtStaatsumlegung(
  profil: Nutzerprofil,
  vorhaben: Vorhaben[],
  ausgewaehlteIds: Set<string>,
  gesellschaft: GesellschaftDaten,
  zeithorizont: Zeithorizont,
): StaatsumlegungErgebnis | null {
  const mitFinanzierung = vorhaben.filter(
    (v) => ausgewaehlteIds.has(v.id) && v.staatsfinanzierung,
  );

  if (mitFinanzierung.length === 0) return null;

  let umlegung = 0;
  let steueranteilProzent = 0;
  let steuerlast = 0;
  let fiskaleffekt = 0;

  for (const v of mitFinanzierung) {
    const ergebnis = berechneStaatsumlegung(
      profil,
      gesellschaft,
      v.staatsfinanzierung!,
      zeithorizont,
    );
    umlegung += ergebnis.umlegung;
    steueranteilProzent = ergebnis.steueranteilProzent;
    steuerlast = ergebnis.steuerlast;
    fiskaleffekt += ergebnis.fiskaleffekt;
  }

  return { umlegung, steueranteilProzent, steuerlast, fiskaleffekt };
}
