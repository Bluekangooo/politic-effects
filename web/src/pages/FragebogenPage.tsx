import type { Frage } from "@domain/fragebogen";
import { useProfil } from "../context/ProfilContext";
import { useKatalog } from "../context/KatalogContext";
import { sammleAktiveFragen } from "@engine/zielgruppen";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function FrageEingabe({
  frage,
  wert,
  onChange,
}: {
  frage: Frage;
  wert: string | number | boolean | undefined;
  onChange: (wert: string | number | boolean) => void;
}) {
  switch (frage.typ) {
    case "boolean":
      return (
        <div className="choice-row">
          <label className="choice-chip">
            <input
              type="radio"
              name={frage.id}
              checked={wert === true}
              onChange={() => onChange(true)}
            />
            Ja
          </label>
          <label className="choice-chip">
            <input
              type="radio"
              name={frage.id}
              checked={wert === false}
              onChange={() => onChange(false)}
            />
            Nein
          </label>
        </div>
      );

    case "single-choice":
      return (
        <div className="choice-col">
          {frage.optionen?.map((opt) => (
            <label key={opt.value} className="choice-chip wide">
              <input
                type="radio"
                name={frage.id}
                checked={wert === opt.value}
                onChange={() => onChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );

    case "number":
      return (
        <div className="number-input-wrap">
          <input
            type="number"
            className="number-input"
            value={wert === undefined ? "" : String(wert)}
            min={0}
            step={frage.id.includes("einkommen") ? 1000 : 100}
            placeholder={frage.id.includes("einkommen") ? "z. B. 65000" : "z. B. 500"}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <span className="input-suffix">EUR/Jahr</span>
        </div>
      );

    default:
      return null;
  }
}

export function FragebogenPage() {
  const { katalog } = useKatalog();
  const { profil, setAntwort, speichereProfil, zielgruppenLabels, profilVollstaendig } =
    useProfil();
  const navigate = useNavigate();
  const [fehler, setFehler] = useState<string | null>(null);

  const fragen = sammleAktiveFragen(katalog);
  const alleAntworten = { ...profil.basisAntworten, ...profil.vorhabenAntworten };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilVollstaendig) {
      setFehler("Bitte beantworten Sie alle Pflichtfragen.");
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
          Ihre Antworten bestimmen, welchen Zielgruppen Sie zugeordnet werden. Der
          Fragebogen erweitert sich automatisch mit neuen politischen Vorhaben.
        </p>
      </div>

      <form className="fragebogen-form" onSubmit={handleSubmit}>
        <section className="fragen-block">
          <h2>Basisprofil</h2>
          {fragen.map((frage) => (
            <fieldset key={frage.id} className="frage-field">
              <legend>{frage.text}</legend>
              <FrageEingabe
                frage={frage}
                wert={alleAntworten[frage.id] as string | number | boolean | undefined}
                onChange={(wert) => {
                  setFehler(null);
                  if (wert !== "") setAntwort(frage.id, wert);
                }}
              />
            </fieldset>
          ))}
        </section>

        {zielgruppenLabels.length > 0 && (
          <section className="zielgruppen-preview">
            <h2>Ihre Zielgruppen (Vorschau)</h2>
            <ul>
              {zielgruppenLabels.map((zg) => (
                <li key={zg.id} className="tag">
                  {zg.name}
                </li>
              ))}
            </ul>
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
