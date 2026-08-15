import type { Nutzerprofil } from "../types/fragebogen.js";
import type { Frage } from "../types/fragebogen.js";
import type { VorhabenKatalog } from "../types/vorhaben.js";
import { leseAntwort } from "./steuerlast.js";

const SOLI_FREIGRENZE = 73_000;
const KAPITAL_SCHWELLE = 1_000;

export function ermittleZielgruppen(
  _katalog: VorhabenKatalog,
  profil: Nutzerprofil,
): string[] {
  const ids = new Set<string>();

  const einkommenAngestellt = leseAntwort(profil, "basis-einkommen-angestellt");
  const einkommenSelbst = leseAntwort(profil, "basis-einkommen-selbststaendig");
  const kapital = leseAntwort(profil, "basis-kapitalertraege");

  if (einkommenAngestellt > SOLI_FREIGRENZE) {
    ids.add("soli-pflichtig-arbeitnehmer");
  }

  if (einkommenSelbst > SOLI_FREIGRENZE) {
    ids.add("soli-pflichtig-selbststaendig");
  }

  if (kapital > KAPITAL_SCHWELLE) {
    ids.add("kapitalanleger-soli");
  }

  if (ids.size === 0) {
    ids.add("nicht-betroffen");
  }

  return [...ids];
}

/** Erzeugt dynamische Kinder-Fragen basierend auf basis-kinder-anzahl */
export function erzeugeKinderFragen(anzahl: number): Frage[] {
  return Array.from({ length: anzahl }, (_, i) => ({
    id: `kind-${i + 1}-alter`,
    text: `Alter des ${i + 1}. Kindes`,
    typ: "number" as const,
    einheit: "Jahre",
    hinweis: "Ganzzahl in Jahren",
    dynamisch: true,
  }));
}

/** Alle Fragen inkl. dynamischer Kinder-Fragen */
export function sammleAktiveFragen(
  katalog: VorhabenKatalog,
  profil: Nutzerprofil,
): Frage[] {
  const kinderAnzahl = leseAntwort(profil, "basis-kinder-anzahl");
  return [...katalog.fragen, ...erzeugeKinderFragen(kinderAnzahl)];
}

/** Pflichtfragen-IDs für Validierung */
export function sammlePflichtFragen(profil: Nutzerprofil): string[] {
  const basis = [
    "basis-alter",
    "basis-erwachsene-steuerlich",
    "basis-einkommen-angestellt",
    "basis-einkommen-selbststaendig",
    "basis-partner-einkommen",
    "basis-kinder-anzahl",
    "basis-kapitalertraege",
    "basis-kirchensteuer",
    "basis-steuerlast-gesamt",
  ];

  const kinderAnzahl = leseAntwort(profil, "basis-kinder-anzahl");
  const kinder = Array.from({ length: kinderAnzahl }, (_, i) => `kind-${i + 1}-alter`);

  return [...basis, ...kinder];
}

export function istProfilVollstaendig(profil: Nutzerprofil): boolean {
  const alle = { ...profil.basisAntworten, ...profil.vorhabenAntworten };
  return sammlePflichtFragen(profil).every(
    (id) => typeof alle[id] === "number" && Number.isFinite(alle[id]),
  );
}

export function zielgruppenNamen(
  katalog: VorhabenKatalog,
  ids: string[],
): { id: string; name: string }[] {
  return ids.map((id) => {
    const zg = katalog.zielgruppen.find((z) => z.id === id);
    return { id, name: zg?.name ?? id };
  });
}

export function ermittleEinkommensklasse(
  profil: Nutzerprofil,
): "niedrig" | "mittel" | "hoch" | "sehr-hoch" {
  const gesamt =
    leseAntwort(profil, "basis-einkommen-angestellt") +
    leseAntwort(profil, "basis-einkommen-selbststaendig") +
    leseAntwort(profil, "basis-partner-einkommen");

  if (gesamt <= 30_000) return "niedrig";
  if (gesamt <= 60_000) return "mittel";
  if (gesamt <= 100_000) return "hoch";
  return "sehr-hoch";
}
