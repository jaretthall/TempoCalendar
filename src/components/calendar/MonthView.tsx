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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import CalendarNotes from "./CalendarNotes";
import { supabase } from "@/lib/supabase";
import { formatDateForDisplay, doesShiftOccurOnDate, getShiftsForDate as getShiftsForDateUtil } from "@/utils/date-utils";
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
  const [viewDate, setViewDate] = useState<Date>(date);
  const [calendarNotes, setCalendarNotes] = useState("");
  const [calendarComments, setCalendarComments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true); // Default to true for now
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

  // Fetch user profile and check if admin
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: user.id,
            name: profile.full_name || user.email,
            avatarUrl: undefined,
          });

          setIsAdmin(profile.role === "admin");
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch notes and comments for the current month
  useEffect(() => {
    const fetchNotesAndComments = async () => {
      try {
        const formattedDate = format(viewDate, "yyyy-MM");
        const firstDayOfMonth = format(startOfMonth(viewDate), "yyyy-MM-dd");

        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from("calendar_notes")
          .select("*")
          .like("date", `${formattedDate}%`)
          .order("date", { ascending: true });

        if (notesError) {
          console.error("Error fetching notes:", notesError);
          return;
        }

        if (notesData && notesData.length > 0) {
          // Just use the first note for this month
          setCalendarNotes(notesData[0].notes || "");
        } else {
          // If no notes exist, create a default note for this month
          const defaultNote =
            "<p>This is the schedule for all providers this month. Please check with the clinic before making any changes to your personal schedule.</p><p>Reminder: All vacation requests must be submitted at least 2 weeks in advance.</p>";
          setCalendarNotes(defaultNote);

          // Create default note in database if admin
          if (isAdmin) {
            await supabase
              .from("calendar_notes")
              .insert({
                date: firstDayOfMonth,
                notes: defaultNote,
                user_id: currentUser.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .single();
          }
        }

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("calendar_comments")
          .select("*")
          .like("date", `${formattedDate}%`)
          .order("created_at", { ascending: true });

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          return;
        }

        if (commentsData && commentsData.length > 0) {
          const formattedComments = commentsData.map((comment) => ({
            id: comment.id,
            author: comment.author || "Unknown User",
            authorId: comment.author_id || "unknown",
            avatarUrl: comment.avatar_url,
            content: comment.content || "",
            createdAt: new Date(comment.created_at || Date.now()),
          }));
          setCalendarComments(formattedComments);
        } else {
          // Empty array if no comments exist
          setCalendarComments([]);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      }
    };

    fetchNotesAndComments();

    // Set up realtime subscriptions
    const formattedMonth = format(viewDate, "yyyy-MM");

    const notesSubscription = supabase
      .channel(`month_notes_${formattedMonth}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_notes",
          filter: `date=like.${formattedMonth}%`,
        },
        fetchNotesAndComments,
      )
      .subscribe();

    const commentsSubscription = supabase
      .channel(`month_comments_${formattedMonth}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_comments",
          filter: `date=like.${formattedMonth}%`,
        },
        fetchNotesAndComments,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notesSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, [viewDate, isAdmin, currentUser.id]);

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

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    return getShiftsForDateUtil(shifts, date);
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

  // Handle saving notes
  const handleSaveNotes = async (notes: string) => {
    setCalendarNotes(notes);
    // Actual saving is handled in the CalendarNotes component
  };

  // Handle adding a comment
  const handleAddComment = async (comment: string) => {
    // Actual saving is handled in the CalendarNotes component
  };

  // Function to get provider color by ID
  const getProviderColor = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.color || "#888888";
  };

  // Render a shift in the calendar cell with special styling for vacations
  const renderShift = (shift: Shift, index: number) => {
    const provider = getProvider(shift.providerId);
    const clinicType = getClinicType(shift.clinicTypeId);
    const color = shift.isVacation ? undefined : getProviderColor(shift.providerId);

    return (
      <div
        key={`${shift.id}-${index}`}
        className={cn(
          "calendar-shift",
          shift.isVacation && "calendar-shift-vacation"
        )}
        style={color ? { backgroundColor: color } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onShiftClick(shift);
        }}
      >
        {provider?.name} - {clinicType?.name}
        {shift.isVacation && " (Vacation)"}
      </div>
    );
  };

  // Render individual day cell
  const renderDay = (day: Date, index: number) => {
    const isCurrentMonth = isSameMonth(day, viewDate);
    const isCurrentDay = isToday(day);
    const shiftsForDay = getShiftsForDate(day);

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
        {shiftsForDay.map((shift, idx) => renderShift(shift, idx))}
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
          notes={calendarNotes}
          comments={calendarComments}
          isAdmin={isAdmin}
          currentUser={currentUser}
          onSaveNotes={handleSaveNotes}
          onAddComment={handleAddComment}
        />
      </div>
    </div>
  );
};

export default MonthView;
