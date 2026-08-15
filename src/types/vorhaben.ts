import type { ZielgruppenZuordnung } from "./zielgruppe.js";

export interface Untervorhaben {
  id: string;
  titel: string;
  beschreibung?: string;
  zielgruppen: ZielgruppenZuordnung[];
}

/**
 * Beschreibt, wie sich eine Maßnahme auf den Staatshaushalt auswirkt
 * und wie der Anteil auf Steuerzahler umgelegt wird.
 */
export interface Staatsfinanzierung {
  /** Feld in `gesellschaft` mit Fiskaleffekt in Mrd. EUR */
  fiskalausfall_feld: "gesamt_fiskalausfall_mrd";
  /**
   * belastung: Staat verliert Einnahmen → Nutzer finanzieren anteilig
   * entlastung: Staat spart → Nutzer profitieren anteilig
   */
  richtung: "belastung" | "entlastung";
}

export interface Vorhaben {
  id: string;
  titel: string;
  beschreibung?: string;
  metadata?: VorhabenMetadata;
  zielgruppen?: ZielgruppenZuordnung[];
  untervorhaben?: Untervorhaben[];
  staatsfinanzierung?: Staatsfinanzierung;
}

export interface VorhabenMetadata {
  quelle?: string;
  status?: "entwurf" | "modelliert" | "verifiziert";
  erstelltAm?: string;
  aktualisiertAm?: string;
}

export interface GesellschaftDaten {
  anzahl_soli_pflichtige: number;
  durchschnitt_entlastung_arbeit: number;
  anzahl_kapitalanleger_soli: number;
  durchschnitt_entlastung_kapital: number;
  gesamt_fiskalausfall_mrd: number;
  /** Gesamtsteueraufkommen Bund+Länder+Kommunen (Schätzung) */
  steueraufkommen_gesamt_mrd: number;
}

export interface VorhabenKatalog {
  version: string;
  zielgruppen: import("./zielgruppe.js").Zielgruppe[];
  fragen: import("./fragebogen.js").Frage[];
  vorhaben: Vorhaben[];
  gesellschaft?: GesellschaftDaten;
}
