import React, { useState, useMemo } from "react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Badge } from "../ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
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

interface ThreeMonthViewProps {
  shifts?: Shift[];
  providers?: Provider[];
  clinicTypes?: ClinicType[];
  onShiftClick?: (shift: Shift) => void;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

const ThreeMonthView: React.FC<ThreeMonthViewProps> = ({
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
  onDateClick = () => {},
  selectedDate = new Date(),
}) => {
  const [baseMonth, setBaseMonth] = useState(startOfMonth(selectedDate));

  // Generate mock shifts if none provided
  const mockShifts = useMemo(() => {
    if (shifts.length > 0) return shifts;

    const result: Shift[] = [];
    const startDate = startOfMonth(baseMonth);
    const endDate = endOfMonth(addMonths(baseMonth, 2));

    // Generate some mock shifts for the three month period
    providers.forEach((provider) => {
      clinicTypes.forEach((clinicType) => {
        // Add a shift every 3 days for each provider/clinic combination
        for (let i = 0; i < 90; i += 3) {
          const shiftDate = new Date(startOfMonth(baseMonth));
          shiftDate.setDate(shiftDate.getDate() + i);

          // Skip weekends for some variety
          const day = shiftDate.getDay();
          if (day === 0 || day === 6) continue;

          const shiftStartDate = new Date(shiftDate);
          const shiftEndDate = new Date(shiftDate);

          result.push({
            id: `mock-${provider.id}-${clinicType.id}-${i}`,
            providerId: provider.id,
            clinicTypeId: clinicType.id,
            startDate: shiftStartDate,
            endDate: shiftEndDate,
            isVacation: Math.random() > 0.9, // 10% chance of being vacation
            notes: Math.random() > 0.7 ? "Sample shift notes" : undefined,
          });
        }
      });
    });

    return result;
  }, [shifts, providers, clinicTypes, baseMonth]);

  // Generate the three months to display
  const months = useMemo(() => {
    return [baseMonth, addMonths(baseMonth, 1), addMonths(baseMonth, 2)];
  }, [baseMonth]);

  // Navigate to previous three months
  const goToPreviousMonths = () => {
    setBaseMonth(addMonths(baseMonth, -3));
  };

  // Navigate to next three months
  const goToNextMonths = () => {
    setBaseMonth(addMonths(baseMonth, 3));
  };

  // Go to current month
  const goToCurrentMonth = () => {
    setBaseMonth(startOfMonth(new Date()));
  };

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    return mockShifts.filter((shift) => isSameDay(shift.startDate, date));
  };

  // Get provider by ID
  const getProvider = (providerId: string) => {
    return (
      providers.find((p) => p.id === providerId) || {
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
      clinicTypes.find((c) => c.id === clinicTypeId) || {
        id: clinicTypeId,
        name: "Unknown Clinic",
        color: "#6b7280",
        isActive: true,
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 rounded-lg shadow-sm w-full flex-1 overflow-auto">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonths}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentMonth}
              className="h-8 px-2 flex items-center space-x-1"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Today</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonths}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold">
            {format(months[0], "MMMM yyyy")} - {format(months[2], "MMMM yyyy")}
          </h2>
        </div>

        {/* Three Month Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {months.map((month, monthIndex) => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const days = eachDayOfInterval({
              start: monthStart,
              end: monthEnd,
            });

            // Calculate days from previous month to fill the first week
            const firstDayOfMonth = monthStart.getDay();
            const prevMonthDays = [];
            for (let i = 0; i < firstDayOfMonth; i++) {
              const prevDay = new Date(monthStart);
              prevDay.setDate(prevDay.getDate() - (firstDayOfMonth - i));
              prevMonthDays.push(prevDay);
            }

            return (
              <Card key={monthIndex} className="p-4 bg-white">
                <h3 className="text-lg font-medium mb-4 text-center">
                  {format(month, "MMMM yyyy")}
                </h3>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => (
                      <div
                        key={index}
                        className="text-center text-sm font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Previous month days */}
                  {prevMonthDays.map((day, index) => (
                    <div
                      key={`prev-${index}`}
                      className="h-16 p-1 text-gray-400 text-xs border border-gray-100 bg-gray-50"
                      onClick={() => onDateClick(day)}
                    >
                      {format(day, "d")}
                    </div>
                  ))}

                  {/* Current month days */}
                  {days.map((day, dayIndex) => {
                    const dayShifts = getShiftsForDate(day);
                    const isSelected =
                      selectedDate && isSameDay(day, selectedDate);

                    return (
                      <div
                        key={dayIndex}
                        className={`h-16 p-1 text-xs border ${isToday(day) ? "bg-blue-50 border-blue-200" : "border-gray-100"} 
                          ${isSelected ? "ring-2 ring-blue-500" : ""} 
                          hover:bg-gray-50 cursor-pointer overflow-hidden`}
                        onClick={() => onDateClick(day)}
                      >
                        <div className="flex justify-between">
                          <span
                            className={`font-medium ${isToday(day) ? "text-blue-600" : ""}`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>

                        {/* Shifts for this day */}
                        <div className="mt-1 overflow-hidden">
                          <div className="flex flex-wrap gap-1">
                            {dayShifts.map((shift, shiftIndex) => {
                              const provider = getProvider(shift.providerId);
                              const clinicType = getClinicType(
                                shift.clinicTypeId,
                              );
                              // Use compact squares for all shifts in three-month view
                              const isCompact = true;

                              return (
                                <TooltipProvider key={shiftIndex}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={`${isCompact ? "w-3 h-3" : "text-[9px] truncate px-1 py-0.5"} rounded cursor-pointer ${shift.isVacation ? "bg-purple-200 border border-purple-500 border-dashed" : ""}`}
                                        style={{
                                          backgroundColor: shift.isVacation
                                            ? undefined
                                            : provider.color,
                                          borderLeft:
                                            !shift.isVacation && !isCompact
                                              ? `2px solid ${clinicType.color}`
                                              : undefined,
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onShiftClick(shift);
                                        }}
                                      >
                                        {!isCompact && provider.name}
                                        {isCompact && shift.isVacation && (
                                          <span className="flex items-center justify-center h-full text-[6px]">
                                            🏖️
                                          </span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="p-2">
                                        <p className="font-medium">
                                          {provider.name}
                                        </p>
                                        <p className="text-sm">
                                          {clinicType.name}
                                        </p>
                                        <p className="text-xs">
                                          {format(shift.startDate, "MMM d")} -{" "}
                                          {format(shift.endDate, "MMM d")}
                                        </p>
                                        {shift.isVacation && (
                                          <Badge
                                            variant="outline"
                                            className="mt-1 bg-purple-100 text-purple-800 border-purple-300"
                                          >
                                            Vacation
                                          </Badge>
                                        )}
                                        {shift.notes && (
                                          <p className="text-xs mt-1">
                                            {shift.notes}
                                          </p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Next month days to fill the grid */}
                  {(() => {
                    const lastDayOfMonth = monthEnd.getDay();
                    const nextMonthDays = [];
                    for (let i = 1; i < 7 - lastDayOfMonth; i++) {
                      const nextDay = new Date(monthEnd);
                      nextDay.setDate(nextDay.getDate() + i);
                      nextMonthDays.push(nextDay);
                    }

                    return nextMonthDays.map((day, index) => (
                      <div
                        key={`next-${index}`}
                        className="h-16 p-1 text-gray-400 text-xs border border-gray-100 bg-gray-50"
                        onClick={() => onDateClick(day)}
                      >
                        {format(day, "d")}
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-4">
        <CalendarNotes
          date={months[0]}
          notes="<p>This is the quarterly schedule overview. Please refer to the month view for detailed daily schedules.</p><p>Important dates for this quarter:</p><ul><li>Staff meeting: First Monday of each month</li><li>Inventory check: Last Friday of each month</li><li>Quarterly review: Last week of the quarter</li></ul>"
          comments={[
            {
              id: "1",
              author: "Dr. Johnson",
              authorId: "2",
              content:
                "I'll be attending a conference during the second week of next month.",
              createdAt: new Date(
                months[0].getFullYear(),
                months[0].getMonth(),
                3,
              ),
            },
            {
              id: "2",
              author: "Dr. Williams",
              authorId: "3",
              content:
                "Can we reschedule the staff meeting next month? I have a conflict.",
              createdAt: new Date(
                months[0].getFullYear(),
                months[0].getMonth(),
                7,
              ),
            },
          ]}
          isAdmin={true}
        />
      </div>
    </div>
  );
};

export default ThreeMonthView;
