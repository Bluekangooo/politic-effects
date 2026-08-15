/**
 * Globale Definition einer Zielgruppe.
 * Wird in Vorhaben und Untervorhaben referenziert.
 */
export interface Zielgruppe {
  /** Eindeutige Kennung, z. B. "pendler" */
  id: string;
  /** Anzeigename */
  name: string;
  /** Optionale Beschreibung der Zielgruppe */
  beschreibung?: string;
}

/**
 * Zuordnung einer Zielgruppe zu einem Vorhaben oder Untervorhaben
 * inkl. Fragen zur Mitgliedschaftsermittlung und Rechenvorschrift.
 */
export interface ZielgruppenZuordnung {
  /** Referenz auf eine globale Zielgruppen-Definition */
  zielgruppeId: string;
  /**
   * Fragen-IDs aus dem Fragebogen, die zur Zuordnung
   * des Nutzers zu dieser Zielgruppe herangezogen werden.
   */
  fragenIds: string[];
  /** Rechenvorschrift für die Effektberechnung auf diese Zielgruppe */
  rechenvorschrift: Rechenvorschrift;
}

/**
 * Deklarative Rechenvorschrift für Effekte auf eine Zielgruppe.
 *
 * `variablen` benennt Eingabewerte (aus Nutzerprofil oder Makrodaten).
 * `formeln` enthält Ausdrücke pro Zeithorizont – Auswertung erfolgt
 * in einer späteren Engine-Schicht.
 */
export interface Rechenvorschrift {
  /** Benötigte Eingabevariablen mit optionaler Beschreibung */
  variablen: Record<string, VariablenDefinition>;
  /** Formeln pro Zeithorizont (JavaScript-ähnliche Ausdrücke) */
  formeln: Partial<Record<import("./zeithorizont.js").Zeithorizont, string>>;
  /** Einheit des Ergebnisses, z. B. "EUR/Jahr" oder "Prozent" */
  einheit: string;
  /** Kurze Erläuterung der Berechnungslogik */
  erlaeuterung?: string;
}

export interface VariablenDefinition {
  beschreibung: string;
  /** Quelle der Variable */
  quelle: "nutzerprofil" | "gesellschaft" | "konstante";
  /** Standardwert falls nicht im Profil vorhanden */
  standardwert?: number;
}
