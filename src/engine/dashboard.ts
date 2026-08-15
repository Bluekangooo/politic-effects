import type { Zeithorizont } from "../types/zeithorizont.js";
import type { ZielgruppenZuordnung } from "../types/zielgruppe.js";
import type { Untervorhaben, Vorhaben } from "../types/vorhaben.js";
import type { Nutzerprofil } from "../types/fragebogen.js";
import {
  berechneEffekt,
  berechneGesellschaftsEffekt,
  type GesellschaftDaten,
} from "./berechnung.js";

export interface EffektErgebnis {
  zeithorizont: Zeithorizont;
  wert: number;
  einheit: string;
}

export interface KnotenEffekt {
  id: string;
  titel: string;
  typ: "vorhaben" | "untervorhaben";
  persoenlich: EffektErgebnis[];
  gesellschaft?: Partial<
    Record<Zeithorizont, { entlastungGesamt: number; fiskalausfall: number; betroffene: number }>
  >;
  kinder?: KnotenEffekt[];
}

export interface DashboardState {
  ausgewaehlteVorhaben: Set<string>;
  ausgewaehlteUntervorhaben: Set<string>;
}

/** Berechnet persönlichen Effekt für eine Zielgruppen-Zuordnung */
function effektFuerZuordnung(
  zuordnung: ZielgruppenZuordnung,
  nutzerZielgruppen: string[],
  profil: Nutzerprofil,
  zeithorizonte: Zeithorizont[],
): Partial<Record<Zeithorizont, number>> | null {
  if (!nutzerZielgruppen.includes(zuordnung.zielgruppeId)) {
    return null;
  }

  return berechneEffekt(zuordnung.rechenvorschrift, { profil }, zeithorizonte);
}

function summiereEffekte(
  effekte: (Partial<Record<Zeithorizont, number>> | null)[],
  zeithorizonte: Zeithorizont[],
  einheit: string,
): EffektErgebnis[] {
  return zeithorizonte.map((zh) => ({
    zeithorizont: zh,
    wert: effekte.reduce((sum, e) => sum + (e?.[zh] ?? 0), 0),
    einheit,
  }));
}

function effektFuerUntervorhaben(
  uv: Untervorhaben,
  nutzerZielgruppen: string[],
  profil: Nutzerprofil,
  zeithorizonte: Zeithorizont[],
): KnotenEffekt {
  const rohEffekte = uv.zielgruppen.map((zg) =>
    effektFuerZuordnung(zg, nutzerZielgruppen, profil, zeithorizonte),
  );
  const einheit = uv.zielgruppen[0]?.rechenvorschrift.einheit ?? "EUR/Jahr";

  return {
    id: uv.id,
    titel: uv.titel,
    typ: "untervorhaben",
    persoenlich: summiereEffekte(rohEffekte, zeithorizonte, einheit),
  };
}

/** Berechnet die vollständige Effekt-Hierarchie für ausgewählte Knoten */
export function berechneDashboardEffekte(
  vorhaben: Vorhaben,
  nutzerZielgruppen: string[],
  profil: Nutzerprofil,
  zeithorizonte: Zeithorizont[],
  gesellschaft: GesellschaftDaten | undefined,
  state: DashboardState,
): KnotenEffekt | null {
  if (!state.ausgewaehlteVorhaben.has(vorhaben.id)) {
    return null;
  }

  const kinder: KnotenEffekt[] = [];

  for (const uv of vorhaben.untervorhaben ?? []) {
    if (state.ausgewaehlteUntervorhaben.has(uv.id)) {
      kinder.push(effektFuerUntervorhaben(uv, nutzerZielgruppen, profil, zeithorizonte));
    }
  }

  const direktEffekte = (vorhaben.zielgruppen ?? []).map((zg) =>
    effektFuerZuordnung(zg, nutzerZielgruppen, profil, zeithorizonte),
  );

  const einheit =
    vorhaben.zielgruppen?.[0]?.rechenvorschrift.einheit ??
    vorhaben.untervorhaben?.[0]?.zielgruppen[0]?.rechenvorschrift.einheit ??
    "EUR/Jahr";

  const kinderPersoenlich = kinder.flatMap((k) => k.persoenlich);

  const direktSumme = summiereEffekte(direktEffekte, zeithorizonte, einheit);

  const persoenlichGesamt = zeithorizonte.map((zh) => {
    const direkt = direktSumme.find((d) => d.zeithorizont === zh)?.wert ?? 0;
    const kinderSum = kinderPersoenlich
      .filter((p) => p.zeithorizont === zh)
      .reduce((s, p) => s + p.wert, 0);
    return {
      zeithorizont: zh,
      wert: direkt + kinderSum,
      einheit,
    };
  });

  const gesellschaftEffekte = gesellschaft
    ? Object.fromEntries(
        zeithorizonte.map((zh) => [zh, berechneGesellschaftsEffekt(gesellschaft, zh)]),
      )
    : undefined;

  return {
    id: vorhaben.id,
    titel: vorhaben.titel,
    typ: "vorhaben",
    persoenlich: persoenlichGesamt,
    gesellschaft: gesellschaftEffekte,
    kinder: kinder.length > 0 ? kinder : undefined,
  };
}

/** Standard-Auswahl: alles auswählen */
export function defaultAuswahl(vorhaben: Vorhaben[]): DashboardState {
  const ausgewaehlteVorhaben = new Set(vorhaben.map((v) => v.id));
  const ausgewaehlteUntervorhaben = new Set(
    vorhaben.flatMap((v) => (v.untervorhaben ?? []).map((uv) => uv.id)),
  );
  return { ausgewaehlteVorhaben, ausgewaehlteUntervorhaben };
}
