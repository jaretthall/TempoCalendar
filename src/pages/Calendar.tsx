import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import CalendarView from "@/components/calendar/CalendarView";
import ShiftDialog from "@/components/shifts/ShiftDialog";

interface Shift {
  id: string;
  providerId: string;
  clinicTypeId: string;
  startTime: Date;
  endTime: Date;
  isVacation: boolean;
  notes?: string;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for providers
  const providers: Provider[] = [
    { id: "1", name: "Dr. Smith", color: "#4f46e5", isActive: true },
    { id: "2", name: "Dr. Johnson", color: "#10b981", isActive: true },
    { id: "3", name: "Dr. Williams", color: "#f59e0b", isActive: true },
    { id: "4", name: "Dr. Brown", color: "#ec4899", isActive: true },
    { id: "5", name: "Dr. Davis", color: "#6366f1", isActive: false },
  ];

  // Mock data for clinic types
  const clinicTypes: ClinicType[] = [
    { id: "1", name: "Primary Care", color: "#3b82f6", isActive: true },
    { id: "2", name: "Specialty", color: "#ec4899", isActive: true },
    { id: "3", name: "Urgent Care", color: "#ef4444", isActive: true },
    { id: "4", name: "Pediatrics", color: "#8b5cf6", isActive: true },
    { id: "5", name: "Geriatrics", color: "#f97316", isActive: false },
  ];

  // Mock data for shifts
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: "1",
      providerId: "1",
      clinicTypeId: "1",
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      endTime: new Date(new Date().setHours(17, 0, 0, 0)),
      isVacation: false,
      notes: "Regular shift",
    },
    {
      id: "2",
      providerId: "2",
      clinicTypeId: "2",
      startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      endTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      isVacation: false,
      notes: "Specialty clinic",
    },
    {
      id: "3",
      providerId: "3",
      clinicTypeId: "3",
      startTime: new Date(new Date().setDate(new Date().getDate() + 3)),
      endTime: new Date(new Date().setDate(new Date().getDate() + 3)),
      isVacation: false,
    },
    {
      id: "4",
      providerId: "1",
      clinicTypeId: "1",
      startTime: new Date(new Date().setDate(new Date().getDate() + 5)),
      endTime: new Date(new Date().setDate(new Date().getDate() + 5)),
      isVacation: true,
      notes: "Vacation day",
    },
  ]);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, this would handle authentication logout
    console.log("User logged out");
    // Redirect to login page
    navigate("/");
  };

  // Handle shift click to edit
  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsEditing(true);
    setShiftDialogOpen(true);
  };

  // Handle adding a new shift
  const handleAddShift = (date: Date) => {
    setSelectedDate(date);
    setSelectedShift(null);
    setIsEditing(false);
    setShiftDialogOpen(true);
  };

  // Handle saving a shift
  const handleSaveShift = (formValues: ShiftFormValues) => {
    // Convert form values to shift object
    const startTime = new Date(formValues.startDate);
    const [startHours, startMinutes] = formValues.startTime
      .split(":")
      .map(Number);
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date(formValues.endDate);
    const [endHours, endMinutes] = formValues.endTime.split(":").map(Number);
    endTime.setHours(endHours, endMinutes, 0, 0);

    if (isEditing && selectedShift) {
      // Update existing shift
      const updatedShifts = shifts.map((shift) =>
        shift.id === selectedShift.id
          ? {
              ...shift,
              providerId: formValues.providerId,
              clinicTypeId: formValues.clinicTypeId,
              startTime,
              endTime,
              isVacation: formValues.isVacation,
              notes: formValues.notes,
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
        startTime,
        endTime,
        isVacation: formValues.isVacation,
        notes: formValues.notes,
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
      startDate: new Date(selectedShift.startTime),
      endDate: new Date(selectedShift.endTime),
      startTime: `${selectedShift.startTime.getHours().toString().padStart(2, "0")}:${selectedShift.startTime.getMinutes().toString().padStart(2, "0")}`,
      endTime: `${selectedShift.endTime.getHours().toString().padStart(2, "0")}:${selectedShift.endTime.getMinutes().toString().padStart(2, "0")}`,
      isVacation: selectedShift.isVacation,
      isRecurring: false,
      notes: selectedShift.notes,
      location: "",
    };
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        userName="Admin User"
        userRole="admin"
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        <main className="flex-1 overflow-auto bg-gray-50">
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
    </div>
  );
};

export default Calendar;
