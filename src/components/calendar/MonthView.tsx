import React, { useState } from "react";
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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import CalendarNotes from "./CalendarNotes";

interface Shift {
  id: string;
  providerId: string;
  clinicTypeId: string;
  startDate: Date;
  endDate: Date;
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

interface MonthViewProps {
  shifts?: Shift[];
  providers?: Provider[];
  clinicTypes?: ClinicType[];
  onShiftClick?: (shift: Shift) => void;
  onAddShift?: (date: Date) => void;
  onNavigate?: (date: Date) => void;
  currentDate?: Date;
}

const MonthView: React.FC<MonthViewProps> = ({
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
  onNavigate = () => {},
  currentDate = new Date(),
}) => {
  const [viewDate, setViewDate] = useState<Date>(currentDate);

  // Generate days for the current month view
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate days from previous month to fill the first week
  const startDay = getDay(monthStart);

  // Navigate to previous/next month
  const prevMonth = () => {
    const newDate = subMonths(viewDate, 1);
    setViewDate(newDate);
    onNavigate(newDate);
  };

  const nextMonth = () => {
    const newDate = addMonths(viewDate, 1);
    setViewDate(newDate);
    onNavigate(newDate);
  };

  // Mock shifts data for demonstration
  const mockShifts: Shift[] =
    shifts.length > 0
      ? shifts
      : [
          {
            id: "1",
            providerId: "1",
            clinicTypeId: "1",
            startDate: new Date(
              viewDate.getFullYear(),
              viewDate.getMonth(),
              10,
            ),
            endDate: new Date(viewDate.getFullYear(), viewDate.getMonth(), 10),
            isVacation: false,
            notes: "Regular shift",
          },
          {
            id: "2",
            providerId: "2",
            clinicTypeId: "2",
            startDate: new Date(
              viewDate.getFullYear(),
              viewDate.getMonth(),
              15,
            ),
            endDate: new Date(viewDate.getFullYear(), viewDate.getMonth(), 15),
            isVacation: false,
            notes: "Specialty clinic",
          },
          {
            id: "3",
            providerId: "3",
            clinicTypeId: "3",
            startDate: new Date(
              viewDate.getFullYear(),
              viewDate.getMonth(),
              20,
            ),
            endDate: new Date(viewDate.getFullYear(), viewDate.getMonth(), 20),
            isVacation: false,
          },
          {
            id: "4",
            providerId: "1",
            clinicTypeId: "1",
            startDate: new Date(viewDate.getFullYear(), viewDate.getMonth(), 5),
            endDate: new Date(viewDate.getFullYear(), viewDate.getMonth(), 5),
            isVacation: true,
            notes: "Vacation day",
          },
        ];

  // Get shifts for a specific day
  const getShiftsForDay = (day: Date) => {
    return mockShifts.filter((shift) => {
      const shiftDate = new Date(shift.startDate);
      return (
        shiftDate.getDate() === day.getDate() &&
        shiftDate.getMonth() === day.getMonth() &&
        shiftDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Get provider by ID
  const getProvider = (providerId: string) => {
    return (
      providers.find((provider) => provider.id === providerId) || {
        id: providerId,
        name: "Unknown Provider",
        color: "#6b7280",
        isActive: true,
      }
    );
  };

  // Get clinic type by ID
  const getClinicType = (clinicTypeId: string) => {
    return (
      clinicTypes.find((clinic) => clinic.id === clinicTypeId) || {
        id: clinicTypeId,
        name: "Unknown Clinic",
        color: "#6b7280",
        isActive: true,
      }
    );
  };

  // Render shift pill
  const renderShift = (shift: Shift, index: number, totalShifts: number) => {
    const provider = getProvider(shift.providerId);
    const clinicType = getClinicType(shift.clinicTypeId);

    // Determine if we should show compact view (squares) based on number of shifts
    const isCompact = totalShifts > 4;

    return (
      <TooltipProvider key={shift.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "cursor-pointer mb-1",
                isCompact
                  ? "inline-block mr-1 rounded-sm"
                  : "rounded-md text-xs truncate",
                shift.isVacation
                  ? "bg-purple-200 border-2 border-purple-500 border-dashed"
                  : "text-white",
              )}
              style={{
                backgroundColor: shift.isVacation ? undefined : provider.color,
                borderLeft: !shift.isVacation
                  ? `4px solid ${clinicType.color}`
                  : undefined,
                width: isCompact ? "20px" : "auto",
                height: isCompact ? "20px" : "auto",
                padding: isCompact ? "0" : "0.25rem 0.5rem",
              }}
              onClick={() => onShiftClick(shift)}
            >
              {!isCompact && (
                <>
                  <span className="font-medium">
                    {shift.isVacation ? "🏖️ Vacation" : provider.name}
                  </span>
                </>
              )}
              {isCompact && shift.isVacation && (
                <span className="flex items-center justify-center h-full text-xs">
                  🏖️
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <div className="font-bold">{provider.name}</div>
              <div>{clinicType.name}</div>
              {shift.isVacation && (
                <div className="mt-1 font-semibold text-purple-600">
                  Vacation
                </div>
              )}
              {shift.notes && <div className="mt-1 text-xs">{shift.notes}</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render day cell
  const renderDay = (day: Date, index: number) => {
    const isCurrentMonth = isSameMonth(day, viewDate);
    const isTodayDate = isToday(day);
    const dayShifts = getShiftsForDay(day);

    return (
      <div
        key={index}
        className={cn(
          "border h-32 p-1 overflow-hidden",
          !isCurrentMonth && "bg-gray-50 text-gray-400",
          isTodayDate && "bg-blue-50",
        )}
      >
        <div className="flex justify-between items-start">
          <span
            className={cn(
              "inline-flex items-center justify-center w-6 h-6 text-sm",
              isTodayDate && "bg-blue-500 text-white rounded-full",
            )}
          >
            {format(day, "d")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAddShift(day)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
          <div className={dayShifts.length > 4 ? "flex flex-wrap" : ""}>
            {dayShifts.map((shift, index) =>
              renderShift(shift, index, dayShifts.length),
            )}
          </div>
        </div>
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
              <Button variant="outline" size="sm" onClick={prevMonth}>
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
              <Button variant="outline" size="sm" onClick={nextMonth}>
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
          notes="<p>This is the schedule for all providers this month. Please check with the clinic before making any changes to your personal schedule.</p><p>Reminder: All vacation requests must be submitted at least 2 weeks in advance.</p>"
          comments={[
            {
              id: "1",
              author: "Dr. Smith",
              authorId: "1",
              content: "I'll be attending the medical conference on the 15th.",
              createdAt: new Date(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                5,
              ),
            },
            {
              id: "2",
              author: "Admin",
              authorId: "admin1",
              content:
                "Please note that the clinic will be closed for maintenance on the last weekend of the month.",
              createdAt: new Date(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                10,
              ),
            },
          ]}
          isAdmin={true}
        />
      </div>
    </div>
  );
};

export default MonthView;
