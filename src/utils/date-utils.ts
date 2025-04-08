import { addDays, addWeeks, isBefore, isEqual, isSameDay, isWithinInterval } from 'date-fns';
import { 
  addMonths, 
  format, 
  startOfDay,
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  subMonths,
  isAfter
} from "date-fns";

/**
 * Normalize a date to start of day (removes time component)
 */
export function normalizeDate(date: Date): Date {
  return startOfDay(date);
}

/**
 * Formats a date for display in the UI (date only)
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDateForDisplay(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Generate recurring shift dates based on a pattern
 * @param startDate - The beginning date
 * @param endDate - The end date for the recurrence (optional)
 * @param pattern - The recurrence pattern (daily, weekly, biweekly)
 * @param maxOccurrences - Maximum number of occurrences to generate (default: 100)
 * @returns Array of dates following the pattern
 */
export function generateRecurringDates(
  startDate: Date,
  endDate: Date | null = null,
  pattern: 'daily' | 'weekly' | 'biweekly' = 'weekly',
  maxOccurrences: number = 100
): Date[] {
  const dates: Date[] = [normalizeDate(startDate)];
  let currentDate = normalizeDate(startDate);
  const maxEndDate = endDate ? normalizeDate(endDate) : addDays(currentDate, 365); // Default to one year if no end date
  
  while (dates.length < maxOccurrences) {
    // Advance to next occurrence based on pattern
    if (pattern === 'daily') {
      currentDate = addDays(currentDate, 1);
    } else if (pattern === 'weekly') {
      currentDate = addDays(currentDate, 7);
    } else if (pattern === 'biweekly') {
      currentDate = addDays(currentDate, 14);
    }
    
    // Stop if we've reached the end date
    if (isBefore(maxEndDate, currentDate) || isEqual(maxEndDate, currentDate)) {
      break;
    }
    
    dates.push(new Date(currentDate));
  }
  
  return dates;
}

/**
 * Expand a recurring shift into multiple individual shifts
 * @param baseShift - The base shift to repeat
 * @returns Array of expanded shifts
 */
export function expandRecurringShift(baseShift: any): any[] {
  if (!baseShift.isRecurring || !baseShift.recurrencePattern) {
    return [baseShift];
  }
  
  const startDate = normalizeDate(new Date(baseShift.startDate));
  const endDate = baseShift.recurrenceEndDate ? normalizeDate(new Date(baseShift.recurrenceEndDate)) : null;
  const pattern = baseShift.recurrencePattern;
  
  const dates = generateRecurringDates(startDate, endDate, pattern);
  
  return dates.map((date, index) => {
    // Create a unique ID for the series
    const seriesId = baseShift.seriesId || `series-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    return {
      ...baseShift,
      id: index === 0 ? baseShift.id : `${baseShift.id}-${index}`,
      startDate: date,
      endDate: date, // For day-level shifts, end date is same as start date
      seriesId: seriesId,
      isPartOfSeries: true,
      seriesIndex: index
    };
  });
}

/**
 * Check if a shift occurs on a specific date
 * @param shift - The shift to check
 * @param date - The date to check against
 * @returns True if the shift occurs on the date
 */
export function doesShiftOccurOnDate(shift: any, date: Date): boolean {
  const shiftStart = normalizeDate(new Date(shift.startDate));
  const shiftEnd = normalizeDate(new Date(shift.endDate));
  const targetDate = normalizeDate(date);
  
  // For single-day shifts
  if (isSameDay(shiftStart, shiftEnd)) {
    return isSameDay(shiftStart, targetDate);
  }
  
  // For multi-day shifts
  return isWithinInterval(targetDate, { start: shiftStart, end: shiftEnd });
}

/**
 * Get all shifts that occur on a specific date
 * @param shifts - Array of shifts
 * @param date - The date to filter by
 * @returns Array of shifts on the date
 */
export function getShiftsForDate(shifts: any[], date: Date): any[] {
  return shifts.filter(shift => doesShiftOccurOnDate(shift, date));
}

/**
 * Formats a date to a string in the format YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Gets all days in a month
 */
export function getDaysInMonth(month: Date): Date[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  return eachDayOfInterval({ start, end });
}

/**
 * Gets all days in a three month period (previous, current, next)
 */
export function getDaysInThreeMonths(month: Date): Date[] {
  const previousMonth = subMonths(month, 1);
  const nextMonth = addMonths(month, 1);
  
  const previousMonthDays = getDaysInMonth(previousMonth);
  const currentMonthDays = getDaysInMonth(month);
  const nextMonthDays = getDaysInMonth(nextMonth);
  
  return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
}

/**
 * Checks if a date falls within a date range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return isWithinInterval(date, { start: startDate, end: endDate }) ||
    isSameDay(date, startDate) || 
    isSameDay(date, endDate);
}

/**
 * Gets the month name from a date
 */
export function getMonthName(date: Date): string {
  return format(date, "MMMM");
}

/**
 * Gets the year from a date
 */
export function getYear(date: Date): number {
  return parseInt(format(date, "yyyy"));
} 