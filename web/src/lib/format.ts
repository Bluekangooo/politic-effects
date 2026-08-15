/** Deutsche Zahlenformatierung mit optionalen Nachkommastellen */
function formatDeZahl(wert: number, nachkommastellen: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: nachkommastellen,
  }).format(wert);
}

/** Vollständiger Geldbetrag für Tooltip/Barrierefreiheit */
export function formatEuroVoll(wert: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(wert);
}

/** Persönliche Beträge – überschaubare Summen in EUR */
export function formatEuroPersoenlich(wert: number): string {
  return formatEuroVoll(wert);
}

/**
 * Gesellschaftliche Beträge – kompakt in Tsd./Mio./Mrd.
 * z. B. 11_304_000_000 → „11,3 Mrd. €“
 */
export function formatEuroGesellschaft(wert: number): string {
  const abs = Math.abs(wert);
  const vorzeichen = wert < 0 ? "−" : "";

  if (abs >= 1_000_000_000) {
    return `${vorzeichen}${formatDeZahl(abs / 1_000_000_000, 1)} Mrd. €`;
  }
  if (abs >= 1_000_000) {
    return `${vorzeichen}${formatDeZahl(abs / 1_000_000, 1)} Mio. €`;
  }
  if (abs >= 10_000) {
    return `${vorzeichen}${formatDeZahl(abs / 1_000, 0)} Tsd. €`;
  }
  return formatEuroVoll(wert);
}

/** Personenzahlen kompakt, z. B. 7_300_000 → „7,3 Mio.“ */
export function formatPersonenanzahl(wert: number): string {
  if (wert >= 1_000_000) {
    return `${formatDeZahl(wert / 1_000_000, 1)} Mio.`;
  }
  if (wert >= 10_000) {
    return `${formatDeZahl(wert / 1_000, 0)} Tsd.`;
  }
  return formatDeZahl(wert, 0);
}
