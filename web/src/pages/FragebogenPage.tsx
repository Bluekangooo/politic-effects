import type { Frage } from "@domain/fragebogen";
import { useProfil } from "../context/ProfilContext";
import { useKatalog } from "../context/KatalogContext";
import { ermittleEinkommensklasse, sammleAktiveFragen } from "@engine/zielgruppen";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const EINKOMMENSKLASSEN_LABEL: Record<string, string> = {
  niedrig: "bis 30.000 €",
  mittel: "30.001 – 60.000 €",
  hoch: "60.001 – 100.000 €",
  "sehr-hoch": "über 100.000 €",
};

function FrageEingabe({
  frage,
  wert,
  onChange,
}: {
  frage: Frage;
  wert: number | undefined;
  onChange: (wert: number) => void;
}) {
  const step = frage.einheit === "Jahre" ? 1 : frage.id.includes("einkommen") ? 1000 : 100;

  return (
    <div>
      <div className="number-input-wrap">
        <input
          type="number"
          className="number-input"
          value={wert === undefined ? "" : String(wert)}
          min={0}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return;
            onChange(Number(raw));
          }}
        />
        <span className="input-suffix">{frage.einheit}</span>
      </div>
      {frage.hinweis && <p className="frage-hinweis">{frage.hinweis}</p>}
    </div>
  );
}

export function FragebogenPage() {
  const { katalog } = useKatalog();
  const { profil, setAntwort, speichereProfil, zielgruppenLabels, profilVollstaendig } =
    useProfil();
  const navigate = useNavigate();
  const [fehler, setFehler] = useState<string | null>(null);

  const fragen = sammleAktiveFragen(katalog);
  const alleAntworten = { ...profil.basisAntworten, ...profil.vorhabenAntworten };
  const einkommensklasse = ermittleEinkommensklasse(profil);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilVollstaendig) {
      setFehler("Bitte beantworten Sie alle Pflichtfragen mit konkreten Zahlen (0 ist erlaubt).");
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
          Bitte geben Sie konkrete Zahlen an – keine Klassen oder Kategorien. Die Einordnung
          in Zielgruppen und Einkommensklassen erfolgt automatisch in der Auswertung.
        </p>
      </div>

      <form className="fragebogen-form" onSubmit={handleSubmit}>
        <section className="fragen-block">
          <h2>Basisprofil (numerisch)</h2>
          {fragen.map((frage) => (
            <fieldset key={frage.id} className="frage-field">
              <legend>{frage.text}</legend>
              <FrageEingabe
                frage={frage}
                wert={alleAntworten[frage.id] as number | undefined}
                onChange={(wert) => {
                  setFehler(null);
                  setAntwort(frage.id, wert);
                }}
              />
            </fieldset>
          ))}
        </section>

        {(zielgruppenLabels.length > 0 || profilVollstaendig) && (
          <section className="zielgruppen-preview">
            <h2>Abgeleitete Zuordnung (Vorschau)</h2>
            <p className="preview-hinweis">
              Aus Ihren Zahlen berechnet – nicht im Fragebogen abgefragt:
            </p>
            <div className="preview-tags">
              <span className="tag tag-abgeleitet">
                Einkommensklasse: {EINKOMMENSKLASSEN_LABEL[einkommensklasse]}
              </span>
              {zielgruppenLabels.map((zg) => (
                <span key={zg.id} className="tag">
                  {zg.name}
                </span>
              ))}
            </div>
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
