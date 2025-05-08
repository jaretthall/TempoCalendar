import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { 
  formatDateForDisplay, 
  doesShiftOccurOnDate, 
  getShiftsForDate,
  getVacationProviders,
  checkDoubleBooking 
} from "@/utils/date-utils";
import "./calendar.css";

interface MonthViewProps {
  date: Date;
  shifts: any[];
  providers: any[];
  clinicTypes: any[];
  onShiftClick: (shift: any) => void;
  onAddShift: (date: Date) => void;
  currentView?: string;
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  shifts = [],
  providers = [],
  clinicTypes = [],
  onShiftClick,
  onAddShift,
  currentView = "month",
}) => {
  const [selectedClinicTypes] = useState(clinicTypes.slice(0, 2));

  // Generate days for the current month view
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const renderShift = (shift: any, clinicType: any) => {
    const provider = providers.find(p => p.id === shift.providerId);
    if (!provider) return null;

    const tooltip = `${provider.name} - ${clinicType.name}${shift.isVacation ? ' (Vacation)' : ''}`;

    return (
      <TooltipProvider key={shift.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="calendar-shift"
              style={{ backgroundColor: provider.color }}
              onClick={(e) => {
                e.stopPropagation();
                onShiftClick(shift);
              }}
              data-tooltip={tooltip}
            />
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderDay = (day: Date, clinicType: any) => {
    const isCurrentMonth = isSameMonth(day, date);
    const isCurrentDay = isToday(day);
    const dayShifts = getShiftsForDate(shifts, day).filter(
      shift => shift.clinicTypeId === clinicType.id
    );
    const vacationProviders = getVacationProviders(shifts, providers, day);

    return (
      <div
        key={day.toISOString()}
        className={cn(
          "calendar-cell",
          !isCurrentMonth && "calendar-cell-other-month",
          isCurrentDay && "calendar-cell-today"
        )}
        onClick={() => onAddShift(day)}
      >
        <span className="calendar-day-number">
          {format(day, "d")}
        </span>
        <div className="calendar-shifts-grid">
          {dayShifts.map(shift => renderShift(shift, clinicType))}
        </div>
        {vacationProviders.length > 0 && (
          <div className="calendar-vacation-bar">
            {vacationProviders.join(", ")} - Vacation
          </div>
        )}
      </div>
    );
  };

  const renderMonth = (clinicType: any) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totalCells = [];

    // Add previous month days
    for (let i = 0; i < startDay; i++) {
      const prevMonthDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        -startDay + i + 1,
      );
      totalCells.push(prevMonthDay);
    }

    // Add current month days
    monthDays.forEach((day) => totalCells.push(day));

    // Add next month days
    const remainingCells = 42 - totalCells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        i,
      );
      totalCells.push(nextMonthDay);
    }

    return (
      <div className={cn(
        "calendar-month w-full",
        currentView === "month" && "h-full"
      )}>
        <div className="calendar-clinic-type">
          <div 
            className="calendar-clinic-type-indicator"
            style={{ backgroundColor: clinicType.color }}
          />
          {clinicType.name}
        </div>
        <div className="grid grid-cols-7 gap-0 h-full">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center py-2 font-medium text-sm">
              {day}
            </div>
          ))}
          {totalCells.map((day) => renderDay(day, clinicType))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className={cn(
        "calendar-container h-full",
        currentView === "month" ? "grid-cols-1" : "grid-cols-2"
      )}>
        {selectedClinicTypes.map((clinicType: any) => (
          <Card key={clinicType.id} className="w-full h-full bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                {format(date, "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {renderMonth(clinicType)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MonthView;