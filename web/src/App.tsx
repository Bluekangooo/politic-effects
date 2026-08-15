import { Routes, Route, Navigate } from "react-router-dom";
import { KatalogProvider } from "./context/KatalogContext";
import { ProfilProvider, useProfil } from "./context/ProfilContext";
import { Layout } from "./components/Layout";
import { FragebogenPage } from "./pages/FragebogenPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StartPage } from "./pages/StartPage";

function ProfilGuard({ children }: { children: React.ReactNode }) {
  const { profilVollstaendig } = useProfil();
  if (!profilVollstaendig) {
    return <Navigate to="/fragebogen" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <KatalogProvider>
      <ProfilProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/fragebogen" element={<FragebogenPage />} />
            <Route
              path="/dashboard"
              element={
                <ProfilGuard>
                  <DashboardPage />
                </ProfilGuard>
              }
            />
          </Routes>
        </Layout>
      </ProfilProvider>
    </KatalogProvider>
  );
}
