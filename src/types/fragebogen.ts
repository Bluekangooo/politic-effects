/**
 * Fragebogen-Typen für die dynamische Zuordnung zu Zielgruppen.
 * Fragen werden aus Vorhaben/Untervorhaben abgeleitet und erweitern
 * sich automatisch mit neuen politischen Vorhaben.
 */

export type FrageTyp = "boolean" | "number" | "single-choice" | "multi-choice";

/** Eine einzelne Frage im Nutzerfragebogen */
export interface Frage {
  id: string;
  text: string;
  typ: FrageTyp;
  /** Bei Auswahlfragen: mögliche Antworten */
  optionen?: FrageOption[];
  /**
   * Zuordnung von Antworten zu Zielgruppen-IDs.
   * Schlüssel: Antwortwert ("true"/"false" bei boolean, Optionswert bei choice).
   * Wert: Zielgruppen-IDs, die bei dieser Antwort zutreffen.
   */
  zielgruppenMapping: Record<string, string[]>;
  /** Optional: nur anzeigen wenn diese Vorhaben/Untervorhaben ausgewählt sind */
  kontextIds?: string[];
}

export interface FrageOption {
  value: string;
  label: string;
}

/** Antworten eines Nutzers auf den Fragebogen */
export interface Nutzerprofil {
  /** Basisfragen (demografisch / sozioökonomisch) */
  basisAntworten: Record<string, string | number | boolean | string[]>;
  /** Dynamische Antworten aus politischen Vorhaben */
  vorhabenAntworten: Record<string, string | number | boolean | string[]>;
}

/** Ermittelte Zielgruppen-Zugehörigkeit eines Nutzers */
export interface NutzerZielgruppen {
  zielgruppeIds: string[];
  /** Wann die Zuordnung zuletzt berechnet wurde */
  berechnetAm: string;
}
