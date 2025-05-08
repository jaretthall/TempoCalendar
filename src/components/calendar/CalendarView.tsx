import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarToolbar from "./CalendarToolbar";
import MonthView from "./MonthView";
import { useToast } from "@/components/ui/use-toast";
import ShiftDialog from "../shifts/ShiftDialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { expandRecurringShift } from "@/utils/date-utils";
import { useToast } from "@/components/ui/use-toast";

interface CalendarViewProps {
  shifts?: any[];
  providers?: any[];
  clinicTypes?: any[];
  onShiftClick?: (shift: any) => void;
  onAddShift?: (date: Date) => void;
  initialView?: "month" | "side-by-side";
  initialDate?: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  shifts = [],
  providers = [],
  clinicTypes = [],
  onShiftClick = () => {},
  onAddShift = () => {},
  initialView = "month",
  initialDate = new Date(),
}) => {
  const [currentView, setCurrentView] = useState<"month" | "side-by-side">(
    initialView,
  );
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [filteredProviders, setFilteredProviders] = useState<string[]>([]);
  const [filteredClinicTypes, setFilteredClinicTypes] = useState<string[]>([]);
  const [allShifts, setAllShifts] = useState<any[]>(shifts);
  const [allProviders, setAllProviders] = useState<any[]>(providers);
  const [allClinicTypes, setAllClinicTypes] = useState<any[]>(clinicTypes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter shifts based on selected providers and clinic types
  const filteredShifts = useMemo(() => {
    // First expand any recurring shifts
    const expandedShifts = allShifts.flatMap(shift => {
      if (shift.isRecurring && shift.recurrencePattern) {
        return expandRecurringShift(shift);
      }
      return [shift];
    });
    
    // Then apply the filters
    return expandedShifts.filter((shift) => {
      const providerMatch =
        filteredProviders.length === 0 ||
        filteredProviders.includes(shift.providerId);
      const clinicTypeMatch =
        filteredClinicTypes.length === 0 ||
        filteredClinicTypes.includes(shift.clinicTypeId);
      return providerMatch && clinicTypeMatch;
    });
  }, [allShifts, filteredProviders, filteredClinicTypes]);

  // Handle provider filter change
  const handleProviderFilterChange = useCallback((providerIds: string[]) => {
    setFilteredProviders(providerIds);
  }, []);

  // Handle clinic type filter change
  const handleClinicTypeFilterChange = useCallback(
    (clinicTypeIds: string[]) => {
      setFilteredClinicTypes(clinicTypeIds);
    },
    [],
  );

  // Handle date change
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((view: "month" | "side-by-side") => {
    setCurrentView(view);
  }, []);

  // Handle shift click
  const handleShiftClick = useCallback(
    (shift: any) => {
      if (isDialogOpen) return;
      setSelectedShift(shift);
      setIsDialogOpen(true);
      onShiftClick(shift);
    },
    [onShiftClick, isDialogOpen],
  );

  // Handle add shift
  const handleAddShift = useCallback(
    (date: Date) => {
      if (isDialogOpen) return;
      setSelectedDate(date);
      setSelectedShift(null);
      setIsDialogOpen(true);
      onAddShift(date);
    },
    [onAddShift, isDialogOpen],
  );

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedShift(null);
    setSelectedDate(null);
  }, []);

  // Handle shift save
  const handleShiftSave = useCallback(
    async (shiftData: any) => {
      try {
        const newShift = {
          id: shiftData.id || `shift-${Date.now()}`,
          providerId: shiftData.providerId,
          clinicTypeId: shiftData.clinicTypeId,
          startDate: shiftData.startDate,
          endDate: shiftData.endDate,
          isVacation: shiftData.isVacation,
          notes: shiftData.notes,
          isRecurring: shiftData.isRecurring,
          recurrencePattern: shiftData.recurrencePattern,
          recurrenceEndDate: shiftData.recurrenceEndDate,
          seriesId: shiftData.seriesId,
        };

        if (selectedShift) {
          setAllShifts(allShifts.map(s => s.id === selectedShift.id ? newShift : s));
        } else {
          setAllShifts([...allShifts, newShift]);
        }

        toast({
          title: "Success",
          description: selectedShift ? "Shift updated successfully" : "Shift created successfully",
        });

        handleDialogClose();
      } catch (err) {
        console.error("Error saving shift:", err);
        toast({
          title: "Error",
          description: "Failed to save shift",
          variant: "destructive",
        });
      }
    },
    [selectedShift, allShifts, toast],
  );

  // Handle shift delete
  const handleShiftDelete = useCallback(
    async (shiftId: string, deleteType: 'single' | 'future' | 'all') => {
      try {
        if (deleteType === 'single') {
          setAllShifts(allShifts.filter(s => s.id !== shiftId));
        } else {
          const shift = allShifts.find(s => s.id === shiftId);
          if (shift?.seriesId) {
            setAllShifts(allShifts.filter(s => {
              if (s.seriesId !== shift.seriesId) return true;
              if (deleteType === 'future') {
                return new Date(s.startDate) < new Date(shift.startDate);
              }
              return false;
            }));
          }
        }

        toast({
          title: "Success",
          description: "Shift(s) deleted successfully",
        });

        handleDialogClose();
      } catch (err) {
        console.error("Error deleting shift:", err);
        toast({
          title: "Error",
          description: "Failed to delete shift",
          variant: "destructive",
        });
      }
    },
    [allShifts, toast],
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-sm">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CalendarToolbar
        date={currentDate}
        view={currentView}
        providers={allProviders}
        clinicTypes={allClinicTypes}
        selectedProviders={filteredProviders}
        selectedClinicTypes={filteredClinicTypes}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
        onFilterChange={({ providers, clinicTypes }) => {
          handleProviderFilterChange(providers);
          handleClinicTypeFilterChange(clinicTypes);
        }}
        onAddShift={() => handleAddShift(currentDate)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-full p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading calendar data...</span>
        </div>
      ) : (
        <Tabs
          value={currentView}
          onValueChange={(value) =>
            handleViewChange(value as "month" | "side-by-side")
          }
          className="flex-1"
        >
          <TabsContent value="month" className="mt-0 flex-1 h-full">
            <MonthView
              date={currentDate}
              shifts={filteredShifts}
              providers={allProviders}
              clinicTypes={[allClinicTypes[0]]}
              onShiftClick={handleShiftClick}
              onAddShift={handleAddShift}
              currentView={currentView}
            />
          </TabsContent>
          <TabsContent value="side-by-side" className="mt-0 flex-1 h-full">
            <MonthView
              date={currentDate}
              shifts={filteredShifts}
              providers={allProviders}
              clinicTypes={allClinicTypes.slice(0, 2)}
              onShiftClick={handleShiftClick}
              onAddShift={handleAddShift}
              currentView={currentView}
            />
          </TabsContent>
        </Tabs>
      )}

      {showShiftDialog && (
        <ShiftDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          shift={selectedShift}
          initialDate={selectedDate}
          providers={allProviders}
          clinicTypes={allClinicTypes}
          onSave={handleShiftSave}
          onDelete={handleShiftDelete}
          onClose={handleDialogClose}
          isEditing={!!selectedShift}
        />
      )}
    </div>
  );
};

export default CalendarView;