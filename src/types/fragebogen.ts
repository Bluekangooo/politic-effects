/**
 * Fragebogen-Typen – nur numerische Eingaben.
 * Klassifikation (Zielgruppen, Steueranteil) erfolgt in der Engine.
 */

export type FrageTyp = "number";

export interface Frage {
  id: string;
  text: string;
  typ: FrageTyp;
  einheit: string;
  hinweis?: string;
  /** Dynamische Frage (z. B. Kinder-Alter), nicht im statischen Katalog */
  dynamisch?: boolean;
  kontextIds?: string[];
}

export interface Nutzerprofil {
  basisAntworten: Record<string, string | number | boolean | string[]>;
  vorhabenAntworten: Record<string, string | number | boolean | string[]>;
}

export interface NutzerZielgruppen {
  zielgruppeIds: string[];
  berechnetAm: string;
}
