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

interface ShiftFormValues {
  providerId: string;
  clinicTypeId: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  isVacation: boolean;
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly" | "biweekly";
  recurrenceEndDate?: Date;
  notes?: string;
  location?: string;
}

interface Provider {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface ClinicType {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

const Calendar: React.FC = () => {
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
  const [providers, setProviders] = useState<Provider[]>([
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
  const [clinicTypes, setClinicTypes] = useState<ClinicType[]>([
    { id: "1", name: "Clinica Medicos", color: "#4CAF50", isActive: true },
    { id: "2", name: "Urgent Care", color: "#FF9800", isActive: true },
  ]);

  // Mock data for shifts
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: "1",
      providerId: "1",
      clinicTypeId: "1",
      startDate: new Date(new Date().setHours(9, 0, 0, 0)),
      endDate: new Date(new Date().setHours(17, 0, 0, 0)),
      isVacation: false,
      notes: "Regular shift at Clinica Medicos",
      location: "Main Clinic",
    },
    {
      id: "2",
      providerId: "2",
      clinicTypeId: "1",
      startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      isVacation: false,
      notes: "Clinica Medicos shift",
      location: "Main Clinic",
    },
    {
      id: "3",
      providerId: "3",
      clinicTypeId: "1",
      startDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      isVacation: false,
      notes: "Clinica Medicos shift",
      location: "Main Clinic",
    },
    {
      id: "4",
      providerId: "1",
      clinicTypeId: "1",
      startDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      isVacation: true,
      notes: "Vacation day",
      location: "",
    },
  ]);

  // State for monthly notes
  const [monthlyNotes, setMonthlyNotes] = useState<any[]>([]);

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
    if (!isAdmin) return; // Only allow admins to edit
    setSelectedShift(shift);
    setIsEditing(true);
    setShiftDialogOpen(true);
  };

  // Handle adding a new shift
  const handleAddShift = (date: Date) => {
    if (!isAdmin) return; // Only allow admins to add
    setSelectedDate(date);
    setSelectedShift(null);
    setIsEditing(false);
    setShiftDialogOpen(true);
  };

  // Handle saving a shift
  const handleSaveShift = (formValues: ShiftFormValues) => {
    // Convert form values to shift object
    const startDate = new Date(formValues.startDate);
    const [startHours, startMinutes] = formValues.startTime
      .split(":")
      .map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(formValues.endDate);
    const [endHours, endMinutes] = formValues.endTime.split(":").map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);

    if (isEditing && selectedShift) {
      // Update existing shift
      const updatedShifts = shifts.map((shift) =>
        shift.id === selectedShift.id
          ? {
              ...shift,
              providerId: formValues.providerId,
              clinicTypeId: formValues.clinicTypeId,
              startDate,
              endDate,
              isVacation: formValues.isVacation,
              notes: formValues.notes,
              location: formValues.location,
            }
          : shift,
      );
      setShifts(updatedShifts);
    } else {
      // Create new shift
      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        providerId: formValues.providerId,
        clinicTypeId: formValues.clinicTypeId,
        startDate,
        endDate,
        isVacation: formValues.isVacation,
        notes: formValues.notes,
        location: formValues.location,
      };
      setShifts([...shifts, newShift]);
    }

    // Close dialog
    setShiftDialogOpen(false);
  };

  // Convert selected shift to form values for the dialog
  const selectedShiftToFormValues = (): ShiftFormValues | undefined => {
    if (!selectedShift) return undefined;

    return {
      providerId: selectedShift.providerId,
      clinicTypeId: selectedShift.clinicTypeId,
      startDate: new Date(selectedShift.startDate),
      endDate: new Date(selectedShift.endDate),
      startTime: `${selectedShift.startDate.getHours().toString().padStart(2, "0")}:${selectedShift.startDate.getMinutes().toString().padStart(2, "0")}`,
      endTime: `${selectedShift.endDate.getHours().toString().padStart(2, "0")}:${selectedShift.endDate.getMinutes().toString().padStart(2, "0")}`,
      isVacation: selectedShift.isVacation,
      isRecurring: false,
      notes: selectedShift.notes,
      location: selectedShift.location || "",
    };
  };

  // Handle importing data
  const handleImportData = (data: any) => {
    if (data.providers) {
      // Replace or merge providers
      // For simplicity, we're replacing the entire array
      setProviders(data.providers);
    }

    if (data.clinicTypes) {
      // Replace or merge clinic types
      setClinicTypes(data.clinicTypes);
    }

    if (data.shifts) {
      // Replace or merge shifts
      setShifts(data.shifts);
    }

    if (data.monthlyNotes) {
      // Replace or merge monthly notes
      setMonthlyNotes(data.monthlyNotes);
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
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        <main className="flex-1 overflow-auto bg-gray-50">
          {!session.user && <ReadOnlyBanner />}
          <div className="p-4 flex justify-end">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
            )}
          </div>
          <CalendarView
            shifts={shifts}
            providers={providers}
            clinicTypes={clinicTypes}
            onShiftClick={handleShiftClick}
            onAddShift={handleAddShift}
            initialDate={selectedDate}
          />
        </main>
      </div>

      {/* Shift Dialog for creating/editing shifts */}
      <ShiftDialog
        open={shiftDialogOpen}
        onOpenChange={setShiftDialogOpen}
        onSave={handleSaveShift}
        shift={selectedShiftToFormValues()}
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
