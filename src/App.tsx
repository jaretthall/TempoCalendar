import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProviderManagement from "./components/providers/ProviderManagement";
import ClinicTypeManagement from "./components/clinics/ClinicTypeManagement";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/providers" element={<ProviderManagement />} />
            <Route path="/clinics" element={<ClinicTypeManagement />} />
            <Route
              path="/notes"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Calendar Notes</h1>
                  <p>Notes functionality coming soon.</p>
                </div>
              }
            />
            <Route path="/settings" element={<Settings />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" element={null} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
