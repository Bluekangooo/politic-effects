import type { Nutzerprofil } from "../types/fragebogen.js";
import type { Frage } from "../types/fragebogen.js";
import type { VorhabenKatalog } from "../types/vorhaben.js";

const SOLI_FREIGRENZE = 73_000;
const KAPITAL_SCHWELLE = 1_000;

/**
 * Ermittelt Zielgruppen aus Fragebogen-Antworten.
 * Kombiniert einfaches Mapping mit schwellenwertbasierten Regeln.
 */
export function ermittleZielgruppen(
  katalog: VorhabenKatalog,
  profil: Nutzerprofil,
): string[] {
  const ids = new Set<string>();
  const alleAntworten = { ...profil.basisAntworten, ...profil.vorhabenAntworten };

  for (const frage of katalog.fragen) {
    const antwort = alleAntworten[frage.id];
    if (antwort === undefined) continue;

    const gemappt = mappeAntwortZuZielgruppen(frage, antwort);
    for (const id of gemappt) {
      ids.add(id);
    }
  }

  applySoliRegeln(alleAntworten, ids);

  if (ids.size === 0 || (ids.size === 1 && ids.has("nicht-betroffen"))) {
    if (!hatSoliRelevanz(alleAntworten)) {
      ids.clear();
      ids.add("nicht-betroffen");
    }
  }

  return [...ids];
}

function mappeAntwortZuZielgruppen(
  frage: Frage,
  antwort: string | number | boolean | string[],
): string[] {
  const key = Array.isArray(antwort) ? antwort.join(",") : String(antwort);
  return frage.zielgruppenMapping[key] ?? [];
}

function applySoliRegeln(
  antworten: Record<string, string | number | boolean | string[]>,
  ids: Set<string>,
): void {
  const einkommen = Number(antworten["basis-jahreseinkommen"]) || 0;
  const beschaeftigung = String(antworten["basis-beschaeftigung"] ?? "");
  const kapital = Number(antworten["soli-kapitalertraege"]) || 0;

  if (beschaeftigung === "angestellt" && einkommen > SOLI_FREIGRENZE) {
    ids.add("soli-pflichtig-arbeitnehmer");
    ids.delete("nicht-betroffen");
  }

  if (beschaeftigung === "selbststaendig" && einkommen > SOLI_FREIGRENZE) {
    ids.add("soli-pflichtig-selbststaendig");
    ids.delete("nicht-betroffen");
  }

  if (kapital > KAPITAL_SCHWELLE) {
    ids.add("kapitalanleger-soli");
    ids.delete("nicht-betroffen");
  }

  if (
    ids.size === 0 ||
    (!ids.has("soli-pflichtig-arbeitnehmer") &&
      !ids.has("soli-pflichtig-selbststaendig") &&
      !ids.has("kapitalanleger-soli"))
  ) {
    if (beschaeftigung === "nicht-erwerbstaetig" || einkommen <= SOLI_FREIGRENZE) {
      if (kapital <= KAPITAL_SCHWELLE) {
        ids.add("nicht-betroffen");
      }
    }
  }
}

function hatSoliRelevanz(
  antworten: Record<string, string | number | boolean | string[]>,
): boolean {
  const einkommen = Number(antworten["basis-jahreseinkommen"]) || 0;
  const kapital = Number(antworten["soli-kapitalertraege"]) || 0;
  return einkommen > SOLI_FREIGRENZE || kapital > KAPITAL_SCHWELLE;
}

/** Gibt alle für den Katalog relevanten Fragen zurück (Basis + vorhabenspezifisch) */
export function sammleAktiveFragen(katalog: VorhabenKatalog): Frage[] {
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
