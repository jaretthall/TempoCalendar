import { z } from "zod";

// Provider schema
export const providerSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  isActive: z.boolean(),
});

export type Provider = z.infer<typeof providerSchema>;

// Clinic type schema
export const clinicTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  isActive: z.boolean(),
});

export type ClinicType = z.infer<typeof clinicTypeSchema>;

// Shift schema
export const shiftSchema = z.object({
  id: z.string().optional(),
  providerId: z.string(),
  clinicTypeId: z.string(),
  startTime: z.string(), // ISO string format
  endTime: z.string(), // ISO string format
  isVacation: z.boolean(),
  notes: z.string().optional(),
  location: z.string().optional(),
});

export type ShiftImport = z.infer<typeof shiftSchema>;

// Monthly notes schema
export const commentSchema = z.object({
  id: z.string(),
  author: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.string(), // ISO string format
  avatarUrl: z.string().optional(),
});

export type Comment = z.infer<typeof commentSchema>;

export const monthlyNoteSchema = z.object({
  month: z.string(), // Format: YYYY-MM
  notes: z.string(), // HTML content
  comments: z.array(commentSchema).optional(),
});

export type MonthlyNote = z.infer<typeof monthlyNoteSchema>;

// Complete import data schema
export const importDataSchema = z.object({
  providers: z.array(providerSchema),
  clinicTypes: z.array(clinicTypeSchema),
  shifts: z.array(shiftSchema),
  monthlyNotes: z.array(monthlyNoteSchema).optional(),
});

export type ImportData = z.infer<typeof importDataSchema>;

// Function to validate import data
export function validateImportData(data: unknown): ImportData {
  return importDataSchema.parse(data);
}

// Function to process imported shifts (convert string dates to Date objects)
export function processImportedShifts(shifts: ShiftImport[]): any[] {
  return shifts.map((shift) => ({
    ...shift,
    id:
      shift.id ||
      `shift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startTime: new Date(shift.startTime),
    endTime: new Date(shift.endTime),
  }));
}

// Function to process imported comments (convert string dates to Date objects)
export function processImportedComments(comments: Comment[] = []): any[] {
  return comments.map((comment) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
  }));
}

// Function to process monthly notes
export function processMonthlyNotes(monthlyNotes: MonthlyNote[] = []): any[] {
  return monthlyNotes.map((note) => ({
    ...note,
    comments: processImportedComments(note.comments),
  }));
}

// Example template data
export const templateData: ImportData = {
  providers: [
    { id: "1", name: "Dr. Smith", color: "#4f46e5", isActive: true },
    { id: "2", name: "Dr. Johnson", color: "#10b981", isActive: true },
    { id: "3", name: "Dr. Williams", color: "#f59e0b", isActive: true },
    { id: "4", name: "Dr. Brown", color: "#ec4899", isActive: true },
    { id: "5", name: "Dr. Davis", color: "#6366f1", isActive: false },
  ],
  clinicTypes: [
    { id: "1", name: "Primary Care", color: "#3b82f6", isActive: true },
    { id: "2", name: "Specialty", color: "#ec4899", isActive: true },
    { id: "3", name: "Urgent Care", color: "#ef4444", isActive: true },
    { id: "4", name: "Pediatrics", color: "#8b5cf6", isActive: true },
    { id: "5", name: "Geriatrics", color: "#f97316", isActive: false },
  ],
  shifts: [
    {
      id: "1",
      providerId: "1",
      clinicTypeId: "1",
      startTime: new Date().toISOString(),
      endTime: new Date(
        new Date().setHours(new Date().getHours() + 8),
      ).toISOString(),
      isVacation: false,
      notes: "Regular shift",
      location: "Main Clinic",
    },
    {
      id: "2",
      providerId: "2",
      clinicTypeId: "2",
      startTime: new Date(
        new Date().setDate(new Date().getDate() + 1),
      ).toISOString(),
      endTime: new Date(
        new Date().setDate(new Date().getDate() + 1),
      ).toISOString(),
      isVacation: false,
      notes: "Specialty clinic",
      location: "North Branch",
    },
  ],
};
