import React, { useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";

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
}

const CalendarToolbar = ({
  date = new Date(),
  onDateChange = () => {},
  onViewChange = () => {},
  onAddShift = () => {},
  onFilterChange = () => {},
  providers = [
    { id: "1", name: "Dr. Smith", color: "#4CAF50" },
    { id: "2", name: "Dr. Johnson", color: "#2196F3" },
    { id: "3", name: "Dr. Williams", color: "#FF9800" },
  ],
  clinicTypes = [
    { id: "1", name: "Primary Care", color: "#E91E63" },
    { id: "2", name: "Specialty", color: "#9C27B0" },
    { id: "3", name: "Urgent Care", color: "#F44336" },
  ],
  view = "month",
}: CalendarToolbarProps) => {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedClinicTypes, setSelectedClinicTypes] = useState<string[]>([]);

  const handlePrevMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  const handleViewChange = (newView: "month" | "three-month") => {
    onViewChange(newView);
  };

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

  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white border-b border-gray-200 gap-4">
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
        <div className="text-lg font-semibold">{format(date, "MMMM yyyy")}</div>
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

        <div className="flex items-center space-x-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter Providers" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: provider.color }}
                    />
                    {provider.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter Clinics" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {clinicTypes.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: clinic.color }}
                    />
                    {clinic.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAddShift}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>

        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
