/** Zeiträume für die Effektprojektion */
export type Zeithorizont = "kurz" | "mittel" | "lang";

export const ZEITHORIZONTE: readonly Zeithorizont[] = ["kurz", "mittel", "lang"] as const;

/** Beschreibung eines Zeithorizonts in Jahren */
export interface ZeithorizontDefinition {
  kurz: { label: string; jahre: number };
  mittel: { label: string; jahre: number };
  lang: { label: string; jahre: number };
}

export const STANDARD_ZEITHORIZONTE: ZeithorizontDefinition = {
  kurz: { label: "Kurzfristig", jahre: 2 },
  mittel: { label: "Mittelfristig", jahre: 5 },
  lang: { label: "Langfristig", jahre: 10 },
};
