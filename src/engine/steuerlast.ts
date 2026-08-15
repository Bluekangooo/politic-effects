import type { Nutzerprofil } from "../types/fragebogen.js";
import type { GesellschaftDaten } from "../types/vorhaben.js";

export function leseAntwort(
  profil: Nutzerprofil,
  key: string,
): number {
  const alle = { ...profil.basisAntworten, ...profil.vorhabenAntworten };
  const val = alle[key];
  return typeof val === "number" && Number.isFinite(val) ? val : 0;
}

/** Liest Alter aller Kinder aus dynamischen Feldern kind-N-alter */
export function leseKinderAlter(profil: Nutzerprofil): number[] {
  const anzahl = leseAntwort(profil, "basis-kinder-anzahl");
  const alter: number[] = [];
  for (let i = 1; i <= anzahl; i++) {
    alter.push(leseAntwort(profil, `kind-${i}-alter`));
  }
  return alter;
}

export interface SteuerprofilErgebnis {
  steuerlast: number;
  steueranteil: number;
  quelle: "direkt" | "geschaetzt";
  details: {
    einkommensteuer: number;
    soli: number;
    kapitalsteuer: number;
    kirchensteuer: number;
  };
}

const GRUNDFREIBETRAG = 11_784;
const KINDERFREIBETRAG = 6_612;
const ALLEINERZIEHEND_ENTLASTUNG = 4_260;
const SOLI_FREIGRENZE = 73_000;

/** Vereinfachte zu versteuerndes Einkommen aus Brutto */
function bruttoZuZvEinkommen(brutto: number): number {
  return brutto * 0.72;
}

function schaetzeEinkommensteuer(zvEinkommen: number): number {
  const steuerpflichtig = Math.max(0, zvEinkommen - GRUNDFREIBETRAG);
  if (steuerpflichtig <= 0) return 0;
  if (zvEinkommen <= 17_000) return steuerpflichtig * 0.14;
  if (zvEinkommen <= 66_760) return steuerpflichtig * 0.24;
  if (zvEinkommen <= 277_825) return steuerpflichtig * 0.32;
  return steuerpflichtig * 0.42;
}

/**
 * Schätzt die jährliche Gesamtsteuerlast (ESt, Soli, AbgSt, KiSt)
 * oder nutzt die direkte Angabe des Nutzers.
 */
export function berechneSteuerprofil(
  profil: Nutzerprofil,
  gesellschaft?: GesellschaftDaten,
): SteuerprofilErgebnis {
  const direkt = leseAntwort(profil, "basis-steuerlast-gesamt");
  const steueraufkommenGesamt =
    (gesellschaft?.steueraufkommen_gesamt_mrd ?? 900) * 1_000_000_000;

  if (direkt > 0) {
    return {
      steuerlast: direkt,
      steueranteil: direkt / steueraufkommenGesamt,
      quelle: "direkt",
      details: { einkommensteuer: 0, soli: 0, kapitalsteuer: 0, kirchensteuer: 0 },
    };
  }

  const eigenAngestellt = leseAntwort(profil, "basis-einkommen-angestellt");
  const eigenSelbst = leseAntwort(profil, "basis-einkommen-selbststaendig");
  const partnerEinkommen = leseAntwort(profil, "basis-partner-einkommen");
  const erwachsene = Math.min(2, Math.max(1, leseAntwort(profil, "basis-erwachsene-steuerlich") || 1));
  const kapital = leseAntwort(profil, "basis-kapitalertraege");
  const kirchensteuerPflicht = leseAntwort(profil, "basis-kirchensteuer") >= 1;
  const kinderAlter = leseKinderAlter(profil);

  const eigenBrutto = eigenAngestellt + eigenSelbst;
  const zusammenVeranlagt = erwachsene >= 2;

  let zvEinkommen = bruttoZuZvEinkommen(
    zusammenVeranlagt ? eigenBrutto + partnerEinkommen : eigenBrutto,
  );

  const kinderFreibetrag = kinderAlter.filter((a) => a > 0 && a < 25).length * KINDERFREIBETRAG;
  zvEinkommen = Math.max(0, zvEinkommen - kinderFreibetrag);

  if (erwachsene === 1 && kinderAlter.length > 0) {
    zvEinkommen = Math.max(0, zvEinkommen - ALLEINERZIEHEND_ENTLASTUNG);
  }

  let einkommensteuer = schaetzeEinkommensteuer(zvEinkommen);
  if (zusammenVeranlagt) {
    einkommensteuer *= 0.9;
  }

  const bruttoGesamt = zusammenVeranlagt ? eigenBrutto + partnerEinkommen : eigenBrutto;
  const soli = bruttoGesamt > SOLI_FREIGRENZE ? einkommensteuer * 0.055 : 0;
  const kapitalsteuer = kapital * 0.26375;
  const kirchensteuer = kirchensteuerPflicht ? einkommensteuer * 0.09 : 0;

  const steuerlast = einkommensteuer + soli + kapitalsteuer + kirchensteuer;

  return {
    steuerlast,
    steueranteil: steuerlast / steueraufkommenGesamt,
    quelle: "geschaetzt",
    details: { einkommensteuer, soli, kapitalsteuer, kirchensteuer },
  };
}
