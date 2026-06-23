import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AboutPage } from "./pages/AboutPage";
import { AdminPage } from "./pages/AdminPage";
import { CountriesPage } from "./pages/CountriesPage";
import { CountryDetailPage } from "./pages/CountryDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DatasetDetailPage } from "./pages/DatasetDetailPage";
import { DatasetsPage } from "./pages/DatasetsPage";
import { EcsPage } from "./pages/EcsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { TreatyDetailPage } from "./pages/TreatyDetailPage";
import { TreatiesPage } from "./pages/TreatiesPage";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/countries" element={<CountriesPage />} />
        <Route path="/countries/:countryId" element={<CountryDetailPage />} />
        <Route path="/treaties" element={<TreatiesPage />} />
        <Route path="/treaties/:treatyId" element={<TreatyDetailPage />} />
        <Route path="/datasets" element={<DatasetsPage />} />
        <Route path="/datasets/:datasetId" element={<DatasetDetailPage />} />
        <Route path="/ecs" element={<EcsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AppShell>
  );
}
