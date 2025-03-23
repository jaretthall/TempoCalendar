import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Grid3X3,
  Grid,
  Plus,
  RefreshCw,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface CalendarToolbarProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: "month" | "three-month") => void;
  onAddShift?: () => void;
  onFilterChange?: (filters: {
    providers: string[];
    clinicTypes: string[];
  }) => void;
  providers?: Array<{ id: string; name: string; color: string }>;
  clinicTypes?: Array<{ id: string; name: string; color: string }>;
  view?: "month" | "three-month";
  selectedProviders?: string[];
  selectedClinicTypes?: string[];
}

const CalendarToolbar = ({
  date = new Date(),
  onDateChange = () => {},
  onViewChange = () => {},
  onAddShift = () => {},
  onFilterChange = () => {},
  providers = [],
  clinicTypes = [],
  view = "month",
  selectedProviders: initialSelectedProviders = [],
  selectedClinicTypes: initialSelectedClinicTypes = [],
}: CalendarToolbarProps) => {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    initialSelectedProviders,
  );
  const [selectedClinicTypes, setSelectedClinicTypes] = useState<string[]>(
    initialSelectedClinicTypes,
  );
  const [allProviders, setAllProviders] = useState(providers);
  const [allClinicTypes, setAllClinicTypes] = useState(clinicTypes);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    if (providers.length > 0) {
      setAllProviders(providers);
    }
    if (clinicTypes.length > 0) {
      setAllClinicTypes(clinicTypes);
    }
  }, [providers, clinicTypes]);

  // Initialize selected filters from props
  useEffect(() => {
    if (initialSelectedProviders.length > 0) {
      setSelectedProviders(initialSelectedProviders);
    }
    if (initialSelectedClinicTypes.length > 0) {
      setSelectedClinicTypes(initialSelectedClinicTypes);
    }
  }, [initialSelectedProviders, initialSelectedClinicTypes]);

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch providers
      const { data: providersData, error: providersError } = await supabase
        .from("providers")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (providersError) throw providersError;

      // Fetch clinic types
      const { data: clinicTypesData, error: clinicTypesError } = await supabase
        .from("clinic_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (clinicTypesError) throw clinicTypesError;

      // Format data for the component
      const formattedProviders = providersData.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
      }));

      const formattedClinicTypes = clinicTypesData.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
      }));

      setAllProviders(formattedProviders);
      setAllClinicTypes(formattedClinicTypes);

      toast({
        title: "Data refreshed",
        description: "Calendar data has been updated",
      });
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh calendar data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    // Only fetch if we don't have data already
    if (providers.length === 0 || clinicTypes.length === 0) {
      fetchData();
    }
  }, [providers.length, clinicTypes.length, fetchData]);

  // Navigation handlers
  const handlePrevMonth = () => {
    onDateChange(subMonths(date, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(date, 1));
  };

  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  const handleViewChange = (newView: "month" | "three-month") => {
    onViewChange(newView);
  };

  // Filter handlers
  const handleProviderFilterChange = (providerId: string) => {
    const newSelectedProviders = selectedProviders.includes(providerId)
      ? selectedProviders.filter((id) => id !== providerId)
      : [...selectedProviders, providerId];

    setSelectedProviders(newSelectedProviders);
    onFilterChange({
      providers: newSelectedProviders,
      clinicTypes: selectedClinicTypes,
    });
  };

  const handleClinicTypeFilterChange = (clinicTypeId: string) => {
    const newSelectedClinicTypes = selectedClinicTypes.includes(clinicTypeId)
      ? selectedClinicTypes.filter((id) => id !== clinicTypeId)
      : [...selectedClinicTypes, clinicTypeId];

    setSelectedClinicTypes(newSelectedClinicTypes);
    onFilterChange({
      providers: selectedProviders,
      clinicTypes: newSelectedClinicTypes,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedProviders([]);
    setSelectedClinicTypes([]);
    onFilterChange({
      providers: [],
      clinicTypes: [],
    });
  };

  // Remove a single provider filter
  const removeProviderFilter = (providerId: string) => {
    const newSelectedProviders = selectedProviders.filter(
      (id) => id !== providerId,
    );
    setSelectedProviders(newSelectedProviders);
    onFilterChange({
      providers: newSelectedProviders,
      clinicTypes: selectedClinicTypes,
    });
  };

  // Remove a single clinic type filter
  const removeClinicTypeFilter = (clinicTypeId: string) => {
    const newSelectedClinicTypes = selectedClinicTypes.filter(
      (id) => id !== clinicTypeId,
    );
    setSelectedClinicTypes(newSelectedClinicTypes);
    onFilterChange({
      providers: selectedProviders,
      clinicTypes: newSelectedClinicTypes,
    });
  };

  // Get provider or clinic type by ID
  const getProviderById = (id: string) => {
    return allProviders.find((provider) => provider.id === id);
  };

  const getClinicTypeById = (id: string) => {
    return allClinicTypes.find((clinic) => clinic.id === id);
  };

  // Render active filters
  const renderActiveFilters = () => {
    if (selectedProviders.length === 0 && selectedClinicTypes.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="text-sm text-gray-500">Active filters:</span>
        {selectedProviders.map((providerId) => {
          const provider = getProviderById(providerId);
          if (!provider) return null;
          return (
            <Badge
              key={`provider-${providerId}`}
              variant="outline"
              className="flex items-center gap-1"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: provider.color }}
              />
              {provider.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeProviderFilter(providerId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
        {selectedClinicTypes.map((clinicTypeId) => {
          const clinicType = getClinicTypeById(clinicTypeId);
          if (!clinicType) return null;
          return (
            <Badge
              key={`clinic-${clinicTypeId}`}
              variant="outline"
              className="flex items-center gap-1"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: clinicType.color }}
              />
              {clinicType.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeClinicTypeFilter(clinicTypeId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
        {(selectedProviders.length > 0 || selectedClinicTypes.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={clearAllFilters}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleTodayClick}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold">
            {format(date, "MMMM yyyy")}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("month")}
            >
              <Grid className="mr-2 h-4 w-4" />
              Month
            </Button>
            <Button
              variant={view === "three-month" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("three-month")}
            >
              <Grid3X3 className="mr-2 h-4 w-4" />3 Months
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center space-x-2">
            <Select onValueChange={handleProviderFilterChange}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Providers" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {allProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: provider.color }}
                        />
                        {provider.name}
                      </div>
                      {selectedProviders.includes(provider.id) && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={handleClinicTypeFilterChange}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Clinics" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {allClinicTypes.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: clinic.color }}
                        />
                        {clinic.name}
                      </div>
                      {selectedClinicTypes.includes(clinic.id) && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddShift();
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Shift
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {renderActiveFilters()}
    </div>
  );
};

export default CalendarToolbar;
