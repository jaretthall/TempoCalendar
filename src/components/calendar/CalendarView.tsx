import React, { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarToolbar from "./CalendarToolbar";
import MonthView from "./MonthView";
import ThreeMonthView from "./ThreeMonthView";

interface Shift {
  id: string;
  providerId: string;
  clinicTypeId: string;
  startTime: Date;
  endTime: Date;
  isVacation: boolean;
  notes?: string;
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

interface CalendarViewProps {
  shifts?: Shift[];
  providers?: Provider[];
  clinicTypes?: ClinicType[];
  onShiftClick?: (shift: Shift) => void;
  onAddShift?: (date: Date) => void;
  initialView?: "month" | "three-month";
  initialDate?: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  shifts = [],
  providers = [
    { id: "1", name: "Dr. Smith", color: "#4f46e5", isActive: true },
    { id: "2", name: "Dr. Johnson", color: "#10b981", isActive: true },
    { id: "3", name: "Dr. Williams", color: "#f59e0b", isActive: true },
  ],
  clinicTypes = [
    { id: "1", name: "Primary Care", color: "#3b82f6", isActive: true },
    { id: "2", name: "Specialty", color: "#ec4899", isActive: true },
    { id: "3", name: "Urgent Care", color: "#ef4444", isActive: true },
  ],
  onShiftClick = () => {},
  onAddShift = () => {},
  initialView = "month",
  initialDate = new Date(),
}) => {
  const [currentView, setCurrentView] = useState<"month" | "three-month">(
    initialView,
  );
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [filteredProviders, setFilteredProviders] = useState<string[]>([]);
  const [filteredClinicTypes, setFilteredClinicTypes] = useState<string[]>([]);

  // Filter shifts based on selected providers and clinic types
  const filteredShifts = shifts.filter((shift) => {
    const providerMatch =
      filteredProviders.length === 0 ||
      filteredProviders.includes(shift.providerId);
    const clinicMatch =
      filteredClinicTypes.length === 0 ||
      filteredClinicTypes.includes(shift.clinicTypeId);
    return providerMatch && clinicMatch;
  });

  // Handle date change from toolbar
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Handle view change from toolbar
  const handleViewChange = useCallback((view: "month" | "three-month") => {
    setCurrentView(view);
  }, []);

  // Handle filter change from toolbar
  const handleFilterChange = useCallback(
    (filters: { providers: string[]; clinicTypes: string[] }) => {
      setFilteredProviders(filters.providers);
      setFilteredClinicTypes(filters.clinicTypes);
    },
    [],
  );

  // Handle adding a new shift
  const handleAddShift = useCallback(
    (date: Date = currentDate) => {
      onAddShift(date);
    },
    [currentDate, onAddShift],
  );

  // Handle clicking on a shift
  const handleShiftClick = useCallback(
    (shift: Shift) => {
      onShiftClick(shift);
    },
    [onShiftClick],
  );

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <CalendarToolbar
        date={currentDate}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
        onAddShift={() => handleAddShift(currentDate)}
        onFilterChange={handleFilterChange}
        providers={providers.map(({ id, name, color }) => ({
          id,
          name,
          color,
        }))}
        clinicTypes={clinicTypes.map(({ id, name, color }) => ({
          id,
          name,
          color,
        }))}
        view={currentView}
      />

      <div className="flex-1 overflow-auto p-4">
        <Tabs
          value={currentView}
          onValueChange={(value) =>
            setCurrentView(value as "month" | "three-month")
          }
        >
          <TabsContent value="month" className="h-full mt-0">
            <MonthView
              shifts={filteredShifts}
              providers={providers}
              clinicTypes={clinicTypes}
              onShiftClick={handleShiftClick}
              onAddShift={handleAddShift}
              onNavigate={handleDateChange}
              currentDate={currentDate}
            />
          </TabsContent>
          <TabsContent value="three-month" className="h-full mt-0">
            <ThreeMonthView
              shifts={filteredShifts}
              providers={providers}
              clinicTypes={clinicTypes}
              onShiftClick={handleShiftClick}
              onDateClick={handleAddShift}
              selectedDate={currentDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarView;
