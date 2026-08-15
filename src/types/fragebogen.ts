/**
 * Fragebogen-Typen für die dynamische Zuordnung zu Zielgruppen.
 *
 * Prinzip: Der Fragebogen fragt nur nach konkreten Zahlen (keine Klassen,
 * keine Ja/Nein-Schwellen). Die Einordnung in Zielgruppen und Einkommens-
 * klassen erfolgt nachträglich in der Engine anhand von Schwellenwerten.
 */

export type FrageTyp = "number";

/** Eine einzelne Frage im Nutzerfragebogen – ausschließlich numerisch */
export interface Frage {
  id: string;
  text: string;
  typ: FrageTyp;
  /** Anzeigeeinheit, z. B. "EUR/Jahr" oder "Jahre" */
  einheit: string;
  /** Optionaler Hinweis unter dem Eingabefeld */
  hinweis?: string;
  /**
   * @deprecated Klassifikation erfolgt in der Engine, nicht per Antwort-Mapping.
   * Feld bleibt für Schema-Kompatibilität, sollte leer sein.
   */
  zielgruppenMapping?: Record<string, string[]>;
  /** Optional: nur anzeigen wenn diese Vorhaben/Untervorhaben im Katalog sind */
  kontextIds?: string[];
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
