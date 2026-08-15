import { Link } from "react-router-dom";
import { useProfil } from "../context/ProfilContext";

export function StartPage() {
  const { profilVollstaendig } = useProfil();

  return (
    <div className="start-page">
      <div className="hero">
        <p className="eyebrow">Wirkungsanalyse politischer Vorhaben</p>
        <h1>Was bedeutet Politik für Sie – und für die Gesellschaft?</h1>
        <p className="lead">
          Beantworten Sie zunächst einen Fragebogen, um Ihre Zielgruppen-Zugehörigkeit
          zu ermitteln. Anschließend sehen Sie im Dashboard die geschätzten Effekte
          politischer Vorhaben auf Sie persönlich und auf die Gesamtgesellschaft.
        </p>
        <div className="hero-actions">
          <Link to="/fragebogen" className="btn btn-primary">
            {profilVollstaendig ? "Fragebogen bearbeiten" : "Fragebogen starten"}
          </Link>
          {profilVollstaendig && (
            <Link to="/dashboard" className="btn btn-secondary">
              Zum Dashboard
            </Link>
          )}
        </div>
      </div>

      <section className="demo-hinweis">
        <h2>Demo: Abschaffung des Solidaritätszuschlags</h2>
        <p>
          Als erstes politisches Vorhaben modellieren wir die vollständige Abschaffung
          des Solidaritätszuschlags – aufgeteilt in Wegfall für Arbeitseinkommen und
          Wegfall auf Kapitalerträge.
        </p>
        <ol className="workflow-steps">
          <li>Fragebogen: Erwerbsstatus, Einkommen, Kapitalerträge</li>
          <li>Zielgruppen: Soli-pflichtige Arbeitnehmer, Selbstständige, Kapitalanleger</li>
          <li>Dashboard: Hierarchische Auswahl und Effekte in drei Zeithorizonten</li>
        </ol>
      </section>
    </div>
  );
}
