import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarToolbar from "./CalendarToolbar";
import MonthView from "./MonthView";
import ThreeMonthView from "./ThreeMonthView";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import ShiftDialog from "../shifts/ShiftDialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { expandRecurringShift } from "@/utils/date-utils";

interface Shift {
  id: string;
  providerId: string;
  clinicTypeId: string;
  startDate: Date;
  endDate: Date;
  isVacation: boolean;
  notes?: string;
  location?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
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
  providers = [],
  clinicTypes = [],
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
  const [allShifts, setAllShifts] = useState<Shift[]>(shifts);
  const [allProviders, setAllProviders] = useState<Provider[]>(providers);
  const [allClinicTypes, setAllClinicTypes] =
    useState<ClinicType[]>(clinicTypes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  // Fetch data from Supabase
  const fetchCalendarData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch providers
      const { data: providersData, error: providersError } = await supabase
        .from("providers")
        .select("*")
        .order("name");

      if (providersError) {
        console.error("Error fetching providers:", providersError);
        // Fall back to mock data if database tables don't exist yet
        setAllProviders(providers);
      } else if (providersData && providersData.length > 0) {
        // Format data for the component
        const formattedProviders = providersData.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          isActive: p.is_active,
        }));
        setAllProviders(formattedProviders);
      } else {
        // Use props data if no database data
        setAllProviders(providers);
      }

      // Fetch clinic types
      const { data: clinicTypesData, error: clinicTypesError } = await supabase
        .from("clinic_types")
        .select("*")
        .order("name");

      if (clinicTypesError) {
        console.error("Error fetching clinic types:", clinicTypesError);
        // Fall back to mock data if database tables don't exist yet
        setAllClinicTypes(clinicTypes);
      } else if (clinicTypesData && clinicTypesData.length > 0) {
        const formattedClinicTypes = clinicTypesData.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          isActive: c.is_active,
        }));
        setAllClinicTypes(formattedClinicTypes);
      } else {
        // Use props data if no database data
        setAllClinicTypes(clinicTypes);
      }

      // Fetch shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shifts")
        .select("*")
        .order("start_date");

      if (shiftsError) {
        console.error("Error fetching shifts:", shiftsError);
        // Fall back to mock data if database tables don't exist yet
        setAllShifts(shifts);
      }

      // Format shifts data if available
      if (shiftsData && shiftsData.length > 0) {
        const formattedShifts = shiftsData.map((s) => ({
          id: s.id,
          providerId: s.provider_id || s.providerId,
          clinicTypeId: s.clinic_type_id || s.clinicTypeId,
          startDate: new Date(s.start_date || s.startDate),
          endDate: new Date(s.end_date || s.endDate),
          isVacation: s.is_vacation || s.isVacation || false,
          notes: s.notes || "",
          location: s.location || "",
          isRecurring: s.is_recurring || s.isRecurring || false,
          recurrencePattern: s.recurrence_pattern || s.recurrencePattern || "",
        }));
        setAllShifts(formattedShifts);
      } else {
        // Use props data if no database data
        setAllShifts(shifts);
      }
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError("Failed to load calendar data. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchCalendarData();

    // Set up real-time subscriptions for providers
    const providersSubscription = supabase
      .channel("providers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "providers" },
        (payload) => {
          console.log("Providers change received:", payload);
          fetchCalendarData();
        },
      )
      .subscribe();

    // Set up real-time subscriptions for clinic types
    const clinicTypesSubscription = supabase
      .channel("clinic-types-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clinic_types" },
        (payload) => {
          console.log("Clinic types change received:", payload);
          fetchCalendarData();
        },
      )
      .subscribe();

    // Set up real-time subscriptions for shifts
    const shiftsSubscription = supabase
      .channel("shifts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts" },
        (payload) => {
          console.log("Shifts change received:", payload);
          fetchCalendarData();
        },
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(providersSubscription);
      supabase.removeChannel(clinicTypesSubscription);
      supabase.removeChannel(shiftsSubscription);
    };
  }, [fetchCalendarData]);

  // Filter shifts based on selected providers and clinic types
  const filteredShifts = useMemo(() => {
    // First expand any recurring shifts
    const expandedShifts = allShifts.flatMap(shift => {
      // Only process shifts with recurrence data
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
  const handleViewChange = useCallback((view: "month" | "three-month") => {
    setCurrentView(view);
  }, []);

  // Handle shift click
  const handleShiftClick = useCallback(
    (shift: Shift) => {
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
    async (shiftData: Omit<Shift, "id">) => {
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
            handleViewChange(value as "month" | "three-month")
          }
          className="flex-1"
        >
          <TabsContent value="month" className="mt-0 flex-1 h-full">
            <MonthView
              date={currentDate}
              shifts={filteredShifts}
              providers={allProviders}
              clinicTypes={allClinicTypes}
              onShiftClick={handleShiftClick}
              onAddShift={handleAddShift}
            />
          </TabsContent>
          <TabsContent value="three-month" className="mt-0 flex-1 h-full">
            <ThreeMonthView
              date={currentDate}
              shifts={filteredShifts}
              providers={allProviders}
              clinicTypes={allClinicTypes}
              onShiftClick={handleShiftClick}
              onAddShift={handleAddShift}
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
