import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
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
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import CalendarNotes from "./CalendarNotes";
import { supabase } from "@/lib/supabase";
import { formatDateForDisplay, doesShiftOccurOnDate, getShiftsForDate, getVacationProviders } from "@/utils/date-utils";
import "./calendar.css";

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

export interface MonthViewProps {
  date: Date;
  shifts: Shift[];
  providers: Provider[];
  clinicTypes: ClinicType[];
  onShiftClick: (shift: Shift) => void;
  onAddShift: (date: Date) => void;
  onNavigate?: (date: Date) => void;
  currentDate?: Date;
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  shifts = [],
  providers = [],
  clinicTypes = [],
  onShiftClick = () => {},
  onAddShift = () => {},
  onNavigate = () => {},
  currentDate = new Date(),
}) => {
  const [viewDate, setViewDate] = useState<Date>(date);
  const [calendarNotes, setCalendarNotes] = useState("");
  const [calendarComments, setCalendarComments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>({
    id: "user1",
    name: "Guest User",
  });

  // Generate days for the current month view
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate days from previous month to fill the first week
  const startDay = getDay(monthStart);

  // Get provider by ID
  const getProvider = (providerId: string) => {
    return providers.find((p) => p.id === providerId) || { name: "Unknown", color: "#888888" };
  };

  // Get clinic type by ID
  const getClinicType = (clinicTypeId: string) => {
    return clinicTypes.find((c) => c.id === clinicTypeId) || { name: "Unknown", color: "#888888" };
  };

  // Render shifts with vacation styling
  const renderShift = (shift: Shift, index: number) => {
    const provider = getProvider(shift.providerId);
    const clinicType = getClinicType(shift.clinicTypeId);
    
    // Don't render vacation shifts here - they'll be shown in the vacation bar
    if (shift.isVacation) return null;

    const tooltip = `${provider?.name} - ${clinicType?.name}`;
    
    return (
      <div
        key={`${shift.id}-${index}`}
        className="calendar-shift"
        style={{ backgroundColor: provider?.color }}
        data-tooltip={tooltip}
        onClick={(e) => {
          e.stopPropagation();
          onShiftClick(shift);
        }}
      />
    );
  };

  // Render individual day cell
  const renderDay = (day: Date, index: number) => {
    const isCurrentMonth = isSameMonth(day, viewDate);
    const isCurrentDay = isToday(day);
    const shiftsForDay = getShiftsForDate(shifts, day);
    const vacationProviders = getVacationProviders(shifts, providers, day);
    
    return (
      <div
        key={index}
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
          {shiftsForDay
            .filter(shift => !shift.isVacation)
            .map((shift, idx) => renderShift(shift, idx))}
        </div>
        
        {vacationProviders.length > 0 && (
          <div className="calendar-vacation-bar">
            {vacationProviders.join(", ")}
          </div>
        )}
      </div>
    );
  };

  // Create array for day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate total cells needed (previous month days + current month days)
  const totalCells = [];

  // Add previous month days
  for (let i = 0; i < startDay; i++) {
    const prevMonthDay = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      -startDay + i + 1,
    );
    totalCells.push(prevMonthDay);
  }

  // Add current month days
  monthDays.forEach((day) => totalCells.push(day));

  // Add next month days to complete the grid (6 rows x 7 columns = 42 cells)
  const remainingCells = 42 - totalCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDay = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      i,
    );
    totalCells.push(nextMonthDay);
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="w-full flex-1 bg-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {format(viewDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => {
                const newDate = subMonths(viewDate, 1);
                setViewDate(newDate);
                onNavigate(newDate);
              }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setViewDate(today);
                  onNavigate(today);
                }}
              >
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const newDate = addMonths(viewDate, 1);
                setViewDate(newDate);
                onNavigate(newDate);
              }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-0">
            {/* Day names header */}
            {dayNames.map((day, index) => (
              <div key={index} className="text-center py-2 font-medium text-sm">
                {day}
              </div>
            ))}

            {/* Calendar grid */}
            {totalCells.map((day, index) => renderDay(day, index))}
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <div className="mt-4">
        <CalendarNotes
          date={viewDate}
          notes={calendarNotes}
          comments={calendarComments}
          isAdmin={isAdmin}
          currentUser={currentUser}
          onSaveNotes={(notes) => setCalendarNotes(notes)}
          onAddComment={() => {}}
        />
      </div>
    </div>
  );
};

export default MonthView;