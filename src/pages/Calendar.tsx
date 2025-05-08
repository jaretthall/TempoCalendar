import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import CalendarView from "@/components/calendar/CalendarView";
import ShiftDialog from "@/components/shifts/ShiftDialog";
import ImportDataDialog from "@/components/import/ImportDataDialog";
import ReadOnlyBanner from "@/components/layout/ReadOnlyBanner";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Shift {
  id: string;
  providerId: string;
  clinicTypeId: string;
  startDate: Date;
  endDate: Date;
  isVacation: boolean;
  notes?: string;
  location?: string;
}

const Calendar = () => {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const isAdmin = session.isAdmin;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Provider data with state management
  const [providers, setProviders] = useState<any[]>([
    { id: "1", name: "Bibiana Patrick", color: "#8BC34A", isActive: true },
    { id: "2", name: "Joy Ferro", color: "#FF9800", isActive: true },
    { id: "3", name: "Julia Friederich", color: "#E91E63", isActive: true },
    { id: "4", name: "John Pound", color: "#607D8B", isActive: true },
    { id: "5", name: "Jim Knox", color: "#9E9D24", isActive: true },
    { id: "6", name: "Ludjelie Manigat", color: "#673AB7", isActive: true },
    { id: "7", name: "Tiffany Good", color: "#00BCD4", isActive: true },
    { id: "8", name: "Elizabeth Swaggerty", color: "#4CAF50", isActive: true },
    { id: "9", name: "Philip Sutherland", color: "#2196F3", isActive: true },
    { id: "10", name: "Carlos Mondragon", color: "#795548", isActive: true },
    { id: "11", name: "Olivia Gonzales", color: "#689F38", isActive: true },
    { id: "12", name: "Heidi Kelly", color: "#F48FB1", isActive: true },
  ]);

  // Clinic type data with state management
  const [clinicTypes, setClinicTypes] = useState<any[]>([
    { id: "1", name: "Clinica Medicos", color: "#4CAF50", isActive: true },
    { id: "2", name: "Urgent Care", color: "#FF9800", isActive: true },
  ]);

  // Mock data for shifts
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Handle shift click to edit
  const handleShiftClick = (shift: Shift) => {
    if (!isAdmin) return;
    setSelectedShift(shift);
    setIsEditing(true);
    setShiftDialogOpen(true);
  };

  // Handle adding a new shift
  const handleAddShift = (date: Date) => {
    if (!isAdmin) return;
    setSelectedDate(date);
    setSelectedShift(null);
    setIsEditing(false);
    setShiftDialogOpen(true);
  };

  // Handle importing data
  const handleImportData = (data: any) => {
    if (data.providers) {
      setProviders(data.providers);
    }
    if (data.clinicTypes) {
      setClinicTypes(data.clinicTypes);
    }
    if (data.shifts) {
      setShifts(data.shifts);
    }
    console.log("Data imported successfully:", data);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        userName={session.user ? "Admin User" : undefined}
        userRole={session.user ? "admin" : "public"}
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
      >
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="ml-auto flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        )}
      </Header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        <main className="flex-1 overflow-auto bg-gray-50">
          {!session.user && <ReadOnlyBanner />}
          <div className="h-full">
            <CalendarView
              shifts={shifts}
              providers={providers}
              clinicTypes={clinicTypes}
              onShiftClick={handleShiftClick}
              onAddShift={handleAddShift}
              initialDate={selectedDate}
            />
          </div>
        </main>
      </div>

      {/* Shift Dialog for creating/editing shifts */}
      <ShiftDialog
        open={shiftDialogOpen}
        onOpenChange={setShiftDialogOpen}
        onSave={handleImportData}
        shift={selectedShift}
        isEditing={isEditing}
      />

      <ImportDataDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportData={handleImportData}
      />
    </div>
  );
};

export default Calendar;