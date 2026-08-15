import type { Nutzerprofil } from "../types/fragebogen.js";
import type { VorhabenKatalog } from "../types/vorhaben.js";

/** Schwellenwerte für die Soli-Klassifikation (Engine, nicht im Fragebogen) */
const SOLI_FREIGRENZE = 73_000;
const KAPITAL_SCHWELLE = 1_000;

function num(antworten: Record<string, unknown>, key: string): number {
  const val = antworten[key];
  return typeof val === "number" && Number.isFinite(val) ? val : 0;
}

/**
 * Ermittelt Zielgruppen aus numerischen Fragebogen-Antworten.
 * Klassifikation (Einkommensklassen, Soli-Pflicht etc.) erfolgt hier –
 * nicht über Kategorien im Fragebogen.
 */
export function ermittleZielgruppen(
  _katalog: VorhabenKatalog,
  profil: Nutzerprofil,
): string[] {
  const antworten = { ...profil.basisAntworten, ...profil.vorhabenAntworten };
  const ids = new Set<string>();

  const einkommenAngestellt = num(antworten, "basis-einkommen-angestellt");
  const einkommenSelbststaendig = num(antworten, "basis-einkommen-selbststaendig");
  const kapitalertraege = num(antworten, "basis-kapitalertraege");

  if (einkommenAngestellt > SOLI_FREIGRENZE) {
    ids.add("soli-pflichtig-arbeitnehmer");
  }

  if (einkommenSelbststaendig > SOLI_FREIGRENZE) {
    ids.add("soli-pflichtig-selbststaendig");
  }

  if (kapitalertraege > KAPITAL_SCHWELLE) {
    ids.add("kapitalanleger-soli");
  }

  if (ids.size === 0) {
    ids.add("nicht-betroffen");
  }

  return [...ids];
}

/** Gibt alle für den Katalog relevanten Fragen zurück */
export function sammleAktiveFragen(katalog: VorhabenKatalog) {
  return katalog.fragen;
}

/** Findet Zielgruppen-Namen aus dem Katalog */
export function zielgruppenNamen(
  katalog: VorhabenKatalog,
  ids: string[],
): { id: string; name: string }[] {
  return ids.map((id) => {
    const zg = katalog.zielgruppen.find((z) => z.id === id);
    return { id, name: zg?.name ?? id };
  });
}

/** Leitet aus numerischen Antworten eine Einkommensklasse ab (für Anzeige/Auswertung) */
export function ermittleEinkommensklasse(
  profil: Nutzerprofil,
): "niedrig" | "mittel" | "hoch" | "sehr-hoch" {
  const antworten = { ...profil.basisAntworten, ...profil.vorhabenAntworten };
  const gesamt =
    num(antworten, "basis-einkommen-angestellt") +
    num(antworten, "basis-einkommen-selbststaendig");

  if (gesamt <= 30_000) return "niedrig";
  if (gesamt <= 60_000) return "mittel";
  if (gesamt <= 100_000) return "hoch";
  return "sehr-hoch";
}
