import { Link } from "react-router-dom";
import { useProfil } from "../context/ProfilContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { profilVollstaendig, loescheProfil } = useProfil();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">PE</span>
            <span className="brand-text">Politic Effects</span>
          </Link>
          <nav className="nav">
            <Link to="/fragebogen">Fragebogen</Link>
            {profilVollstaendig && <Link to="/dashboard">Dashboard</Link>}
            {profilVollstaendig && (
              <button type="button" className="link-btn" onClick={loescheProfil}>
                Profil zurücksetzen
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
