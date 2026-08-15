import { useEffect, useMemo, useState } from "react";
import { ZEITHORIZONTE, STANDARD_ZEITHORIZONTE } from "@domain/zeithorizont";
import type { Zeithorizont } from "@domain/zeithorizont";
import type { Vorhaben } from "@domain/vorhaben";
import {
  berechneDashboardEffekte,
  berechneGesamtStaatsumlegung,
  berechneGesellschaftsEffekt,
  defaultAuswahl,
  type DashboardState,
} from "@engine/index";
import { useKatalog } from "../context/KatalogContext";
import { useProfil } from "../context/ProfilContext";
import { Geldbetrag, formatPersonenanzahl } from "../components/Geldbetrag";
import { formatEuroGesellschaft, formatEuroVoll } from "../lib/format";

const STAATSUMLEGUNG_KEY = "politic-effects-staatsumlegung";

function ladeStaatsumlegungAktiv(): boolean {
  try {
    const raw = localStorage.getItem(STAATSUMLEGUNG_KEY);
    if (raw === null) return true;
    return raw === "true";
  } catch {
    return true;
  }
}

function VorhabenBaum({
  vorhaben,
  state,
  onToggleVorhaben,
  onToggleUntervorhaben,
}: {
  vorhaben: Vorhaben[];
  state: DashboardState;
  onToggleVorhaben: (id: string) => void;
  onToggleUntervorhaben: (id: string) => void;
}) {
  return (
    <ul className="vorhaben-tree">
      {vorhaben.map((v) => (
        <li key={v.id}>
          <label className="tree-node vorhaben-node">
            <input
              type="checkbox"
              checked={state.ausgewaehlteVorhaben.has(v.id)}
              onChange={() => onToggleVorhaben(v.id)}
            />
            <span className="node-title">{v.titel}</span>
          </label>
          {v.beschreibung && <p className="node-desc">{v.beschreibung}</p>}
          {(v.untervorhaben?.length ?? 0) > 0 && (
            <ul className="untervorhaben-list">
              {v.untervorhaben!.map((uv) => (
                <li key={uv.id}>
                  <label className="tree-node unter-node">
                    <input
                      type="checkbox"
                      checked={state.ausgewaehlteUntervorhaben.has(uv.id)}
                      disabled={!state.ausgewaehlteVorhaben.has(v.id)}
                      onChange={() => onToggleUntervorhaben(uv.id)}
                    />
                    <span className="node-title">{uv.titel}</span>
                  </label>
                  {uv.beschreibung && <p className="node-desc">{uv.beschreibung}</p>}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function EffektTabelle({
  titel,
  persoenlich,
  gesellschaft,
  zeithorizont,
}: {
  titel: string;
  persoenlich: { zeithorizont: Zeithorizont; wert: number; einheit: string }[];
  gesellschaft?: Partial<
    Record<Zeithorizont, { entlastungGesamt: number; fiskalausfall: number; betroffene: number }>
  >;
  zeithorizont: Zeithorizont;
}) {
  const pers = persoenlich.find((p) => p.zeithorizont === zeithorizont);
  const ges = gesellschaft?.[zeithorizont];
  const zhLabel = STANDARD_ZEITHORIZONTE[zeithorizont].label;

  return (
    <div className="effekt-karte">
      <h3 className="effekt-titel">{titel}</h3>
      <div className="effekt-grid">
        <div className="effekt-spalte persoenlich">
          <h4>Auf mich</h4>
          {pers ? (
            <Geldbetrag
              wert={pers.wert}
              modus="persoenlich"
              className={(pers.wert ?? 0) > 0 ? "positiv" : "neutral"}
            />
          ) : (
            <p className="effekt-wert neutral">–</p>
          )}
          <p className="effekt-meta">{pers?.einheit ?? "EUR/Jahr"} · {zhLabel}</p>
        </div>
        {ges && (
          <div className="effekt-spalte gesellschaft">
            <h4>Gesellschaft</h4>
            <Geldbetrag wert={ges.entlastungGesamt} modus="gesellschaft" className="positiv" />
            <p className="effekt-meta">
              Gesamtentlastung · {formatPersonenanzahl(ges.betroffene)} Betroffene
            </p>
            <p className="effekt-meta fiskal" title={formatEuroVoll(ges.fiskalausfall)}>
              Fiskalausfall: {formatEuroGesellschaft(ges.fiskalausfall)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { katalog } = useKatalog();
  const { profil, zielgruppenLabels } = useProfil();
  const [zeithorizont, setZeithorizont] = useState<Zeithorizont>("kurz");
  const [staatsumlegungAktiv, setStaatsumlegungAktiv] = useState(ladeStaatsumlegungAktiv);
  const [state, setState] = useState<DashboardState>(() =>
    defaultAuswahl(katalog.vorhaben),
  );

  useEffect(() => {
    localStorage.setItem(STAATSUMLEGUNG_KEY, String(staatsumlegungAktiv));
  }, [staatsumlegungAktiv]);

  const effekte = useMemo(
    () =>
      katalog.vorhaben
        .map((v) =>
          berechneDashboardEffekte(
            v,
            zielgruppenLabels.map((z) => z.id),
            profil,
            [...ZEITHORIZONTE],
            katalog.gesellschaft,
            state,
          ),
        )
        .filter(Boolean),
    [katalog, zielgruppenLabels, profil, state],
  );

  const gesellschaftGesamt = katalog.gesellschaft
    ? berechneGesellschaftsEffekt(katalog.gesellschaft, zeithorizont)
    : undefined;

  const persoenlichGesamt = effekte.reduce((sum, e) => {
    const p = e!.persoenlich.find((x) => x.zeithorizont === zeithorizont);
    return sum + (p?.wert ?? 0);
  }, 0);

  const staatsumlegung = useMemo(() => {
    if (!staatsumlegungAktiv || !katalog.gesellschaft) return null;
    return berechneGesamtStaatsumlegung(
      profil,
      katalog.vorhaben,
      state.ausgewaehlteVorhaben,
      katalog.gesellschaft,
      zeithorizont,
    );
  }, [staatsumlegungAktiv, katalog, profil, state.ausgewaehlteVorhaben, zeithorizont]);

  const nettoInklStaat = persoenlichGesamt + (staatsumlegung?.umlegung ?? 0);

  const toggleVorhaben = (id: string) => {
    setState((prev) => {
      const next = new Set(prev.ausgewaehlteVorhaben);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { ...prev, ausgewaehlteVorhaben: next };
    });
  };

  const toggleUntervorhaben = (id: string) => {
    setState((prev) => {
      const next = new Set(prev.ausgewaehlteUntervorhaben);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, ausgewaehlteUntervorhaben: next };
    });
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Effekte-Dashboard</h1>
        <p>Wählen Sie Vorhaben und Untervorhaben, um Auswirkungen zu vergleichen.</p>
      </div>

      <div className="zielgruppen-bar">
        <span className="label">Ihre Zielgruppen:</span>
        {zielgruppenLabels.map((zg) => (
          <span key={zg.id} className="tag">
            {zg.name}
          </span>
        ))}
      </div>

      <div className="zeithorizont-tabs">
        {ZEITHORIZONTE.map((zh) => (
          <button
            key={zh}
            type="button"
            className={`tab ${zeithorizont === zh ? "active" : ""}`}
            onClick={() => setZeithorizont(zh)}
          >
            {STANDARD_ZEITHORIZONTE[zh].label}
            <span className="tab-sub">{STANDARD_ZEITHORIZONTE[zh].jahre} Jahre</span>
          </button>
        ))}
      </div>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <h2>Politische Vorhaben</h2>
          <VorhabenBaum
            vorhaben={katalog.vorhaben}
            state={state}
            onToggleVorhaben={toggleVorhaben}
            onToggleUntervorhaben={toggleUntervorhaben}
          />
          <label className="staatsumlegung-toggle">
            <input
              type="checkbox"
              checked={staatsumlegungAktiv}
              onChange={(e) => setStaatsumlegungAktiv(e.target.checked)}
            />
            <span>Effekte auf den Staatshaushalt umlegen</span>
          </label>
          <p className="staatsumlegung-hinweis">
            Ihr Anteil am Fiskaleffekt wird proportional zur geschätzten Steuerlast berechnet.
          </p>
        </aside>

        <section className="effekte-panel">
          <div className="gesamt-karte">
            <h2>Gesamteffekt (Auswahl)</h2>
            <div className="effekt-grid">
              <div className="effekt-spalte persoenlich">
                <h4>Auf mich (direkt)</h4>
                <Geldbetrag
                  wert={persoenlichGesamt}
                  modus="persoenlich"
                  gross
                  className={persoenlichGesamt > 0 ? "positiv" : "neutral"}
                />
                <p className="effekt-meta">jährliche Entlastung (geschätzt)</p>
              </div>
              {gesellschaftGesamt && (
                <div className="effekt-spalte gesellschaft">
                  <h4>Gesellschaft</h4>
                  <Geldbetrag
                    wert={gesellschaftGesamt.entlastungGesamt}
                    modus="gesellschaft"
                    gross
                    className="positiv"
                  />
                  <p className="effekt-meta">
                    {formatPersonenanzahl(gesellschaftGesamt.betroffene)} Betroffene
                  </p>
                </div>
              )}
            </div>

            {staatsumlegungAktiv && staatsumlegung && (
              <div className="staatsumlegung-zeilen">
                <div className="staatsumlegung-zeile">
                  <span className="staatsumlegung-label">Staatsumlegung</span>
                  <Geldbetrag
                    wert={staatsumlegung.umlegung}
                    modus="persoenlich"
                    className={staatsumlegung.umlegung < 0 ? "negativ" : "neutral"}
                  />
                  <span className="effekt-meta">
                    Anteil: {staatsumlegung.steueranteilProzent.toFixed(4)} % der Steuereinnahmen
                  </span>
                </div>
                <div className="staatsumlegung-zeile netto">
                  <span className="staatsumlegung-label">Netto inkl. Staatshaushalt</span>
                  <Geldbetrag
                    wert={nettoInklStaat}
                    modus="persoenlich"
                    gross
                    className={nettoInklStaat > 0 ? "positiv" : nettoInklStaat < 0 ? "negativ" : "neutral"}
                  />
                </div>
              </div>
            )}
          </div>

          {effekte.map((e) => (
            <div key={e!.id} className="vorhaben-effekte">
              <EffektTabelle
                titel={e!.titel}
                persoenlich={e!.persoenlich}
                gesellschaft={e!.gesellschaft}
                zeithorizont={zeithorizont}
              />
              {e!.kinder?.map((kind) => (
                <EffektTabelle
                  key={kind.id}
                  titel={`↳ ${kind.titel}`}
                  persoenlich={kind.persoenlich}
                  zeithorizont={zeithorizont}
                />
              ))}
            </div>
          ))}

          {effekte.length === 0 && (
            <p className="leer-hinweis">Bitte wählen Sie mindestens ein Vorhaben aus.</p>
          )}
        </section>
      </div>
    </div>
  );
}
