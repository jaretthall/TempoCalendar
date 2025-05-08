import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarToolbar from "./CalendarToolbar";
import MonthView from "./MonthView";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import ShiftDialog from "../shifts/ShiftDialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { expandRecurringShift } from "@/utils/date-utils";

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
      setSelectedShift(shift);
      setShowShiftDialog(true);
      onShiftClick(shift);
    },
    [onShiftClick],
  );

  // Handle add shift
  const handleAddShift = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setSelectedShift(null);
      setShowShiftDialog(true);
      onAddShift(date);
    },
    [onAddShift],
  );

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setShowShiftDialog(false);
    setSelectedShift(null);
    setSelectedDate(null);
  }, []);

  // Handle shift save
  const handleShiftSave = useCallback(
    async (shiftData: any) => {
      try {
        if (selectedShift) {
          // Update existing shift
          const { error } = await supabase
            .from("shifts")
            .update({
              provider_id: shiftData.providerId,
              clinic_type_id: shiftData.clinicTypeId,
              start_date: shiftData.startDate.toISOString(),
              end_date: shiftData.endDate.toISOString(),
              is_vacation: shiftData.isVacation,
              notes: shiftData.notes || null,
              location: shiftData.location || null,
            })
            .eq("id", selectedShift.id);

          if (error) throw error;

          toast({
            title: "Success",
            description: "Shift updated successfully",
          });
        } else {
          // Create new shift
          const { error } = await supabase.from("shifts").insert({
            provider_id: shiftData.providerId,
            clinic_type_id: shiftData.clinicTypeId,
            start_date: shiftData.startDate.toISOString(),
            end_date: shiftData.endDate.toISOString(),
            is_vacation: shiftData.isVacation,
            notes: shiftData.notes || null,
            location: shiftData.location || null,
          });

          if (error) throw error;

          toast({
            title: "Success",
            description: "Shift created successfully",
          });
        }

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
    [selectedShift, toast, handleDialogClose],
  );

  // Handle shift delete
  const handleShiftDelete = useCallback(
    async (shiftId: string) => {
      try {
        const { error } = await supabase
          .from("shifts")
          .delete()
          .eq("id", shiftId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Shift deleted successfully",
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
    [toast, handleDialogClose],
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
        onAddShift={() => onAddShift(currentDate)}
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
          open={showShiftDialog}
          onOpenChange={setShowShiftDialog}
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