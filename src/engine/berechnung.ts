import type { Rechenvorschrift } from "../types/zielgruppe.js";
import type { Zeithorizont } from "../types/zeithorizont.js";
import type { Nutzerprofil } from "../types/fragebogen.js";

/** Makrodaten für gesellschaftliche Effektberechnung */
export interface GesellschaftDaten {
  anzahl_soli_pflichtige: number;
  durchschnitt_entlastung_arbeit: number;
  anzahl_kapitalanleger_soli: number;
  durchschnitt_entlastung_kapital: number;
  gesamt_fiskalausfall_mrd: number;
}

/** Kontext für die Formelauswertung */
export interface BerechnungsKontext {
  profil: Nutzerprofil;
  gesellschaft?: GesellschaftDaten;
}

/** Löst Variablenwerte aus dem Berechnungskontext auf */
export function loeseVariablen(
  vorschrift: Rechenvorschrift,
  kontext: BerechnungsKontext,
): Record<string, number> {
  const werte: Record<string, number> = {};
  const alleAntworten = {
    ...kontext.profil.basisAntworten,
    ...kontext.profil.vorhabenAntworten,
  };

  for (const [name, def] of Object.entries(vorschrift.variablen)) {
    switch (def.quelle) {
      case "nutzerprofil": {
        const roh = alleAntworten[name] ?? alleAntworten[mapProfilKey(name)];
        werte[name] =
          typeof roh === "number" ? roh : Number(roh) || (def.standardwert ?? 0);
        break;
      }
      case "gesellschaft": {
        const g = kontext.gesellschaft as Record<string, number> | undefined;
        werte[name] = g?.[name] ?? def.standardwert ?? 0;
        break;
      }
      case "konstante":
        werte[name] = def.standardwert ?? 0;
        break;
    }
  }

  return werte;
}

/** Mappt Rechenvorschrift-Variablennamen auf Fragebogen-Felder */
function mapProfilKey(varName: string): string {
  const mapping: Record<string, string> = {
    jahreseinkommen: "basis-jahreseinkommen",
    kapitalertraege: "soli-kapitalertraege",
  };
  return mapping[varName] ?? varName;
}

/** Wertet eine einzelne Formel sicher aus */
export function werteFormelAus(
  formel: string,
  variablen: Record<string, number>,
): number {
  const keys = Object.keys(variablen);
  const values = Object.values(variablen);
  try {
    const fn = new Function(...keys, `"use strict"; return (${formel});`);
    const ergebnis = fn(...values);
    return typeof ergebnis === "number" && Number.isFinite(ergebnis) ? ergebnis : 0;
  } catch {
    return 0;
  }
}

/** Berechnet Effekte für alle angegebenen Zeithorizonte */
export function berechneEffekt(
  vorschrift: Rechenvorschrift,
  kontext: BerechnungsKontext,
  zeithorizonte: Zeithorizont[],
): Partial<Record<Zeithorizont, number>> {
  const variablen = loeseVariablen(vorschrift, kontext);
  const ergebnis: Partial<Record<Zeithorizont, number>> = {};

  for (const zh of zeithorizonte) {
    const formel = vorschrift.formeln[zh];
    if (formel) {
      ergebnis[zh] = werteFormelAus(formel, variablen);
    }
  }

  return ergebnis;
}

/** Gesellschaftliche Aggregation für das Soli-Vorhaben */
export function berechneGesellschaftsEffekt(
  gesellschaft: GesellschaftDaten,
  zeithorizont: Zeithorizont,
): { entlastungGesamt: number; fiskalausfall: number; betroffene: number } {
  const faktor = zeithorizont === "kurz" ? 1 : zeithorizont === "mittel" ? 1.05 : 1.1;

  const entlastungArbeit =
    gesellschaft.anzahl_soli_pflichtige * gesellschaft.durchschnitt_entlastung_arbeit;
  const entlastungKapital =
    gesellschaft.anzahl_kapitalanleger_soli * gesellschaft.durchschnitt_entlastung_kapital;
  const entlastungGesamt = (entlastungArbeit + entlastungKapital) * faktor;

  return {
    entlastungGesamt,
    fiskalausfall: gesellschaft.gesamt_fiskalausfall_mrd * 1_000_000_000 * faktor,
    betroffene:
      gesellschaft.anzahl_soli_pflichtige + gesellschaft.anzahl_kapitalanleger_soli,
  };
}
