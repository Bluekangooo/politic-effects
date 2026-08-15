import type { Vorhaben } from "./vorhaben.js";

/**
 * Prüft ob ein Vorhaben strukturell gültig ist:
 * mindestens Zielgruppen ODER Untervorhaben müssen vorhanden sein.
 */
export function istVorhabenGueltig(vorhaben: Vorhaben): boolean {
  const hatZielgruppen =
    Array.isArray(vorhaben.zielgruppen) && vorhaben.zielgruppen.length > 0;
  const hatUntervorhaben =
    Array.isArray(vorhaben.untervorhaben) && vorhaben.untervorhaben.length > 0;

  if (!hatZielgruppen && !hatUntervorhaben) {
    return false;
  }

  if (hatUntervorhaben) {
    return vorhaben.untervorhaben!.every(
      (uv) => Array.isArray(uv.zielgruppen) && uv.zielgruppen.length > 0,
    );
  }

  return true;
}

/** Sammelt alle Fragen-IDs aus einem Vorhaben (direkt und über Untervorhaben). */
export function sammleFragenIds(vorhaben: Vorhaben): string[] {
  const ids = new Set<string>();

  for (const zg of vorhaben.zielgruppen ?? []) {
    for (const id of zg.fragenIds) {
      ids.add(id);
    }
  }

  for (const uv of vorhaben.untervorhaben ?? []) {
    for (const zg of uv.zielgruppen) {
      for (const id of zg.fragenIds) {
        ids.add(id);
      }
    }
  }

  return [...ids];
}
