import { Suspense } from "react";
import { Routes, Route, Navigate, useRoutes } from "react-router-dom";
import Home from "./components/home";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import { AuthProvider } from "./contexts/AuthContext";
import ProviderManagement from "./components/providers/ProviderManagement";
import ClinicTypeManagement from "./components/clinics/ClinicTypeManagement";

function App() {
  // Get the base path from the environment or default to empty string
  const basePath = import.meta.env.BASE_URL || "/";

  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path={`${basePath}`} element={<Calendar />} />
          <Route path={`${basePath}calendar`} element={<Calendar />} />
          <Route path={`${basePath}home`} element={<Home />} />
          <Route path={`${basePath}login`} element={<Login />} />
          <Route
            path={`${basePath}providers`}
            element={<ProviderManagement />}
          />
          <Route
            path={`${basePath}clinics`}
            element={<ClinicTypeManagement />}
          />
          <Route path={`${basePath}notes`} element={<Notes />} />
          <Route path={`${basePath}settings`} element={<Settings />} />
          <Route path={`${basePath}tempobook/*`} element={null} />
          <Route path="*" element={<Navigate to={basePath} replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
