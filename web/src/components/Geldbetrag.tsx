import { formatEuroGesellschaft, formatEuroPersoenlich, formatEuroVoll, formatPersonenanzahl } from "../lib/format";

interface GeldbetragProps {
  wert: number;
  modus?: "persoenlich" | "gesellschaft";
  gross?: boolean;
  className?: string;
}

/** Geldbetrag mit kompakter Darstellung und vollem Wert als Tooltip */
export function Geldbetrag({ wert, modus = "persoenlich", gross, className = "" }: GeldbetragProps) {
  const formatiert =
    modus === "gesellschaft" ? formatEuroGesellschaft(wert) : formatEuroPersoenlich(wert);
  const voll = formatEuroVoll(wert);
  const zeigeTooltip = formatiert !== voll;
  const klassen = ["effekt-wert", gross && "gross", modus === "gesellschaft" && "gesellschaft", className]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={klassen} title={zeigeTooltip ? voll : undefined}>
      {formatiert}
    </p>
  );
}

export { formatPersonenanzahl };
