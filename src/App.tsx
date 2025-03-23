import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import { AuthProvider } from "./contexts/AuthContext";
import ProviderManagement from "./components/providers/ProviderManagement";
import ClinicTypeManagement from "./components/clinics/ClinicTypeManagement";

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Calendar />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/providers" element={<ProviderManagement />} />
          <Route path="/clinics" element={<ClinicTypeManagement />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/settings" element={<Settings />} />
          {import.meta.env.VITE_TEMPO && (
            <Route path="/tempobook/*" element={null} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
