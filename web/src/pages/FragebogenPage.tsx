import type { Frage } from "@domain/fragebogen";
import { useProfil } from "../context/ProfilContext";
import { useKatalog } from "../context/KatalogContext";
import { sammleAktiveFragen } from "@engine/zielgruppen";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatEuroPersoenlich } from "../lib/format";

const EINKOMMENSKLASSE_LABELS: Record<string, string> = {
  niedrig: "Niedrig (≤ 30.000 €)",
  mittel: "Mittel (30.001 – 60.000 €)",
  hoch: "Hoch (60.001 – 100.000 €)",
  "sehr-hoch": "Sehr hoch (> 100.000 €)",
};

function eingabeSchritt(frageId: string): number {
  if (frageId.includes("einkommen") || frageId.includes("steuerlast")) return 1000;
  if (frageId.includes("kapital")) return 100;
  return 1;
}

function eingabeMax(frageId: string): number | undefined {
  if (frageId === "basis-erwachsene-steuerlich") return 2;
  if (frageId === "basis-kirchensteuer") return 1;
  return undefined;
}

function FrageEingabe({
  frage,
  wert,
  onChange,
}: {
  frage: Frage;
  wert: number | undefined;
  onChange: (wert: number) => void;
}) {
  return (
    <div className="number-input-wrap">
      <input
        type="number"
        className="number-input"
        value={wert === undefined ? "" : String(wert)}
        min={0}
        max={eingabeMax(frage.id)}
        step={eingabeSchritt(frage.id)}
        placeholder="0"
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? 0 : Number(raw));
        }}
      />
      <span className="input-suffix">{frage.einheit}</span>
      {frage.hinweis && <p className="frage-hinweis">{frage.hinweis}</p>}
    </div>
  );
}

export function FragebogenPage() {
  const { katalog } = useKatalog();
  const {
    profil,
    setAntwort,
    speichereProfil,
    zielgruppenLabels,
    profilVollstaendig,
    einkommensklasse,
    steuerprofil,
  } = useProfil();
  const navigate = useNavigate();
  const [fehler, setFehler] = useState<string | null>(null);

  const fragen = sammleAktiveFragen(katalog, profil);
  const alleAntworten = { ...profil.basisAntworten, ...profil.vorhabenAntworten };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilVollstaendig) {
      setFehler("Bitte beantworten Sie alle Pflichtfragen (Zahlenwerte).");
      return;
    }
    speichereProfil();
    navigate("/dashboard");
  };

  return (
    <div className="fragebogen-page">
      <div className="page-header">
        <h1>Fragebogen</h1>
        <p>
          Bitte geben Sie nur Zahlen ein. Zielgruppen, Einkommensklasse und Steueranteil
          werden automatisch berechnet.
        </p>
      </div>

      <form className="fragebogen-form" onSubmit={handleSubmit}>
        <section className="fragen-block">
          <h2>Basisprofil</h2>
          {fragen.map((frage) => (
            <div key={frage.id} className="frage-field">
              <p className="frage-text">{frage.text}</p>
              <FrageEingabe
                frage={frage}
                wert={alleAntworten[frage.id] as number | undefined}
                onChange={(wert) => {
                  setFehler(null);
                  setAntwort(frage.id, wert);
                }}
              />
            </div>
          ))}
        </section>

        {(zielgruppenLabels.length > 0 || steuerprofil) && (
          <section className="zielgruppen-preview">
            <h2>Vorschau</h2>
            {zielgruppenLabels.length > 0 && (
              <div className="preview-block">
                <h3>Zielgruppen</h3>
                <ul>
                  {zielgruppenLabels.map((zg) => (
                    <li key={zg.id} className="tag">
                      {zg.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {einkommensklasse && (
              <p className="preview-meta">
                Einkommensklasse:{" "}
                <strong>{EINKOMMENSKLASSE_LABELS[einkommensklasse] ?? einkommensklasse}</strong>
              </p>
            )}
            {steuerprofil && (
              <p className="preview-meta">
                Geschätzte Steuerlast:{" "}
                <strong>{formatEuroPersoenlich(steuerprofil.steuerlast)}</strong>
                {steuerprofil.quelle === "geschaetzt" && (
                  <span className="preview-hint"> (automatisch geschätzt)</span>
                )}
                {steuerprofil.quelle === "direkt" && (
                  <span className="preview-hint"> (Ihre Angabe)</span>
                )}
              </p>
            )}
          </section>
        )}

        {fehler && <p className="fehler">{fehler}</p>}

        <button type="submit" className="btn btn-primary">
          Speichern und zum Dashboard
        </button>
      </form>
    </div>
  );
}
