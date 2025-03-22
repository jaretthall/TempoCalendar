import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format, addDays, addWeeks } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Repeat,
  X,
  AlertCircle,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

// Define the form schema with zod
const shiftFormSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  clinicTypeId: z.string().min(1, "Clinic type is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isVacation: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.enum(["daily", "weekly", "biweekly"]).optional(),
  recurrenceEndDate: z.date().optional().nullable(),
  notes: z.string().optional(),
  location: z.string().optional(),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: any) => void;
  onDelete?: (shiftId: string) => void;
  onClose?: () => void;
  shift?: any;
  isEditing?: boolean;
  initialDate?: Date | null;
  providers?: any[];
  clinicTypes?: any[];
}

const ShiftDialog = ({
  open = true,
  onOpenChange,
  onSave,
  onDelete,
  onClose,
  shift,
  isEditing = false,
  initialDate = null,
  providers: propProviders = [],
  clinicTypes: propClinicTypes = [],
}: ShiftDialogProps) => {
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [clinicTypes, setClinicTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  // Format time from Date object or create default time
  const formatTimeFromDate = (date?: Date): string => {
    if (!date) return "09:00";
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  // Default values for the form
  const defaultValues: Partial<ShiftFormValues> = {
    providerId: shift?.providerId || "",
    clinicTypeId: shift?.clinicTypeId || "",
    startDate: shift?.startDate || initialDate || new Date(),
    endDate: shift?.endDate || initialDate || new Date(),
    startTime: formatTimeFromDate(shift?.startDate) || "09:00",
    endTime: formatTimeFromDate(shift?.endDate) || "17:00",
    isVacation: shift?.isVacation || false,
    isRecurring: shift?.isRecurring || false,
    recurrencePattern: shift?.recurrencePattern || "weekly",
    recurrenceEndDate: shift?.recurrenceEndDate || null,
    notes: shift?.notes || "",
    location: shift?.location || "",
  };

  // Initialize form with validation
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues,
  });

  // Watch for changes to isRecurring field
  const watchIsRecurring = form.watch("isRecurring");

  // Update recurrence options visibility when isRecurring changes
  useEffect(() => {
    setShowRecurrenceOptions(watchIsRecurring);
  }, [watchIsRecurring]);

  // Use providers and clinic types from props or fetch them if not provided
  useEffect(() => {
    if (propProviders.length > 0) {
      setProviders(propProviders);
    } else {
      const fetchProviders = async () => {
        try {
          const { data, error } = await supabase
            .from("providers")
            .select("*")
            .order("name");

          if (error) throw error;
          setProviders(data || []);
        } catch (error) {
          console.error("Error fetching providers:", error);
          toast({
            title: "Error",
            description: "Failed to load providers",
            variant: "destructive",
          });
        }
      };
      fetchProviders();
    }

    if (propClinicTypes.length > 0) {
      setClinicTypes(propClinicTypes);
    } else {
      const fetchClinicTypes = async () => {
        try {
          const { data, error } = await supabase
            .from("clinic_types")
            .select("*")
            .order("name");

          if (error) throw error;
          setClinicTypes(data || []);
        } catch (error) {
          console.error("Error fetching clinic types:", error);
          toast({
            title: "Error",
            description: "Failed to load clinic types",
            variant: "destructive",
          });
        }
      };
      fetchClinicTypes();
    }
  }, [toast, propProviders, propClinicTypes]);

  // Create a combined date and time
  const combineDateAndTime = (date: Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  // Generate recurring shifts based on pattern
  const generateRecurringShifts = async (
    baseShift: any,
    pattern: string,
    endDate?: Date,
  ) => {
    try {
      const shifts = [];
      let currentDate = new Date(baseShift.start_date);
      const endRecurrence = endDate || addDays(currentDate, 90); // Default to 90 days if no end date

      while (currentDate <= endRecurrence) {
        // Skip the first occurrence as it's already created
        if (shifts.length > 0) {
          const shiftData = {
            provider_id: baseShift.provider_id,
            clinic_type_id: baseShift.clinic_type_id,
            start_date: currentDate.toISOString(),
            end_date: new Date(
              currentDate.getTime() +
                (new Date(baseShift.end_date).getTime() -
                  new Date(baseShift.start_date).getTime()),
            ).toISOString(),
            is_vacation: baseShift.is_vacation,
            notes: baseShift.notes,
            location: baseShift.location,
          };
          shifts.push(shiftData);
        }

        // Advance to next occurrence based on pattern
        if (pattern === "daily") {
          currentDate = addDays(currentDate, 1);
        } else if (pattern === "weekly") {
          currentDate = addDays(currentDate, 7);
        } else if (pattern === "biweekly") {
          currentDate = addDays(currentDate, 14);
        }
      }

      // Insert all recurring shifts in a batch
      if (shifts.length > 0) {
        const { error } = await supabase.from("shifts").insert(shifts);
        if (error) throw error;
      }

      return shifts.length;
    } catch (error) {
      console.error("Error generating recurring shifts:", error);
      throw error;
    }
  };

  // Form submission handler
  const onSubmit = async (data: ShiftFormValues) => {
    try {
      setIsLoading(true);
      setFormError(null);

      // Combine date and time
      const startDateTime = combineDateAndTime(data.startDate, data.startTime);
      const endDateTime = combineDateAndTime(data.endDate, data.endTime);

      // Validate end date is not before start date
      if (endDateTime < startDateTime) {
        setFormError("End date/time cannot be before start date/time");
        return;
      }

      // Prepare shift data for Supabase
      const shiftData = {
        provider_id: data.providerId,
        clinic_type_id: data.clinicTypeId,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        is_vacation: data.isVacation,
        notes: data.notes || null,
        location: data.location || null,
      };

      let result;
      let shiftId;

      // Update or insert shift
      if (isEditing && shift?.id) {
        result = await supabase
          .from("shifts")
          .update(shiftData)
          .eq("id", shift.id);
        shiftId = shift.id;
      } else {
        result = await supabase.from("shifts").insert(shiftData).select();
        shiftId = result.data?.[0]?.id;
      }

      if (result.error) {
        throw result.error;
      }

      // Handle recurring shifts
      let recurringCount = 0;
      if (data.isRecurring && !isEditing && data.recurrencePattern) {
        recurringCount = await generateRecurringShifts(
          { ...shiftData, id: shiftId },
          data.recurrencePattern,
          data.recurrenceEndDate || undefined,
        );
      }

      // Call onSave callback with the form data
      if (onSave) {
        onSave({
          ...data,
          id: shiftId,
          startDate: startDateTime,
          endDate: endDateTime,
        });
      }

      // Show success message
      toast({
        title: "Success",
        description: isEditing
          ? "Shift updated successfully"
          : `Shift created successfully${recurringCount > 0 ? ` with ${recurringCount} recurring instances` : ""}`,
      });

      // Close dialog
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      setFormError(
        error instanceof Error ? error.message : "Failed to save shift",
      );
      toast({
        title: "Error",
        description: "Failed to save shift",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Shift" : "Create New Shift"}
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Selection */}
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers.length > 0 ? (
                          providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: provider.color }}
                                />
                                {provider.name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading providers...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Clinic Type Selection */}
              <FormField
                control={form.control}
                name="clinicTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinic type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clinicTypes.length > 0 ? (
                          clinicTypes.map((clinic) => (
                            <SelectItem key={clinic.id} value={clinic.id}>
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: clinic.color }}
                                />
                                {clinic.name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading clinic types...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vacation Toggle */}
              <FormField
                control={form.control}
                name="isVacation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Vacation</FormLabel>
                      <FormDescription>
                        Mark this shift as vacation time
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Recurring Shift Options */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Shift</FormLabel>
                    <FormDescription>
                      Set up a recurring pattern for this shift
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isEditing} // Disable for editing existing shifts
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {showRecurrenceOptions && (
              <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Recurrence Settings</h4>
                  <Repeat className="h-4 w-4 text-gray-400" />
                </div>

                {/* Recurrence Pattern */}
                <FormField
                  control={form.control}
                  name="recurrencePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pattern</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Biweekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Recurrence End Date */}
                <FormField
                  control={form.control}
                  name="recurrenceEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Recurrence</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mb-2 text-xs"
                              onClick={() => {
                                field.onChange(null);
                              }}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Clear date
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave empty for indefinite recurrence (max 90 days)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add any additional notes"
                      {...field}
                      className="h-20"
                      component="textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between">
              <div>
                {isEditing && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (shift?.id && onDelete) {
                        onDelete(shift.id);
                      }
                    }}
                    disabled={isLoading}
                  >
                    Delete Shift
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}{" "}
                  Shift
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDialog;
