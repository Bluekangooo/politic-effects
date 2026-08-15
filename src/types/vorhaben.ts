import type { ZielgruppenZuordnung } from "./zielgruppe.js";

/**
 * Untervorhaben: eine konkrete Maßnahme innerhalb eines politischen Vorhabens.
 * Kann eigene Zielgruppen und Rechenvorschriften haben.
 */
export interface Untervorhaben {
  id: string;
  titel: string;
  beschreibung?: string;
  /** Betroffene Zielgruppen mit Rechenvorschriften */
  zielgruppen: ZielgruppenZuordnung[];
}

/**
 * Politisches Vorhaben auf oberster Ebene.
 *
 * Ein Vorhaben muss mindestens eine der folgenden Angaben haben:
 * - eigene Zielgruppen (wenn keine Untervorhaben nötig sind), oder
 * - Untervorhaben (jeweils mit eigenen Zielgruppen).
 *
 * Beides gleichzeitig ist möglich: das Vorhaben kann gesamtgesellschaftliche
 * Effekte direkt modellieren und gleichzeitig in Untervorhaben aufgeteilt sein.
 */
export interface Vorhaben {
  id: string;
  titel: string;
  beschreibung?: string;
  /** Metadaten */
  metadata?: VorhabenMetadata;
  /**
   * Direkte Zielgruppen des Vorhabens (ohne Untervorhaben-Ebene).
   * Relevant wenn das Vorhaben als Ganzes betrachtet wird.
   */
  zielgruppen?: ZielgruppenZuordnung[];
  /**
   * Optionale Aufteilung in Untervorhaben.
   * Nicht jedes Vorhaben benötigt Untervorhaben.
   */
  untervorhaben?: Untervorhaben[];
}

export interface VorhabenMetadata {
  /** Quelle / Referenz, z. B. Gesetzesentwurf */
  quelle?: string;
  /** Status der Modellierung */
  status?: "entwurf" | "modelliert" | "verifiziert";
  /** Erstellungsdatum (ISO 8601) */
  erstelltAm?: string;
  /** Letzte Aktualisierung (ISO 8601) */
  aktualisiertAm?: string;
}

/** Makrodaten für gesellschaftliche Effektberechnung */
export interface GesellschaftDaten {
  anzahl_soli_pflichtige: number;
  durchschnitt_entlastung_arbeit: number;
  anzahl_kapitalanleger_soli: number;
  durchschnitt_entlastung_kapital: number;
  gesamt_fiskalausfall_mrd: number;
}

/** Sammlung aller politischen Vorhaben */
export interface VorhabenKatalog {
  version: string;
  zielgruppen: import("./zielgruppe.js").Zielgruppe[];
  fragen: import("./fragebogen.js").Frage[];
  vorhaben: Vorhaben[];
  gesellschaft?: GesellschaftDaten;
}
