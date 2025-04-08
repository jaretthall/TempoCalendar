import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
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
import { normalizeDate } from "@/utils/date-utils";
import { Separator } from "@/components/ui/separator";

// Define the form schema with zod
const shiftFormSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  clinicTypeId: z.string().min(1, "Clinic type is required"),
  startDate: z.date({ required_error: "Date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  isVacation: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.enum(["daily", "weekly", "biweekly"]).optional(),
  recurrenceEndDate: z.date().optional().nullable(),
  notes: z.string().optional(),
  location: z.string().optional(),
});

// Define the form values type
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

  // Default values for the form
  const defaultValues: Partial<ShiftFormValues> = {
    providerId: shift?.providerId || "",
    clinicTypeId: shift?.clinicTypeId || "",
    startDate: shift?.startDate || initialDate || new Date(),
    endDate: shift?.endDate || initialDate || new Date(),
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
  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");
  const watchIsVacation = form.watch("isVacation");

  // Update recurrence options visibility when isRecurring changes
  useEffect(() => {
    setShowRecurrenceOptions(watchIsRecurring);
  }, [watchIsRecurring]);

  // Sync end date with start date when start date changes (for single day shifts)
  useEffect(() => {
    if (watchStartDate && !watchIsVacation) {
      form.setValue("endDate", watchStartDate);
    }
  }, [watchStartDate, watchIsVacation, form]);

  // Load providers and clinic types
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use props data if available
        if (propProviders.length > 0) {
          setProviders(propProviders);
        } else {
          // Fetch from Supabase
          const { data: providersData, error: providersError } = await supabase
            .from("providers")
            .select("*")
            .order("name");

          if (providersError) throw providersError;
          setProviders(providersData || []);
        }

        // Use props data for clinic types if available
        if (propClinicTypes.length > 0) {
          setClinicTypes(propClinicTypes);
        } else {
          // Fetch from Supabase
          const { data: clinicTypesData, error: clinicTypesError } =
            await supabase.from("clinic_types").select("*").order("name");

          if (clinicTypesError) throw clinicTypesError;
          setClinicTypes(clinicTypesData || []);
        }
      } catch (error) {
        console.error("Error fetching providers and clinic types:", error);
        toast({
          title: "Error",
          description:
            "Failed to load providers and clinic types. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [propProviders, propClinicTypes, toast]);

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
            start_date: normalizeDate(currentDate).toISOString(),
            end_date: normalizeDate(currentDate).toISOString(),
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

      // Validate end date is not before start date for multi-day vacation
      if (data.isVacation && data.endDate < data.startDate) {
        setFormError("End date cannot be before start date");
        return;
      }

      // For non-vacation shifts, always set end date equal to start date (single day shifts)
      const normalizedStartDate = normalizeDate(data.startDate);
      const normalizedEndDate = data.isVacation 
        ? normalizeDate(data.endDate) 
        : normalizeDate(data.startDate);

      // Prepare shift data for Supabase
      const shiftData = {
        provider_id: data.providerId,
        clinic_type_id: data.clinicTypeId,
        start_date: normalizedStartDate.toISOString(),
        end_date: normalizedEndDate.toISOString(),
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
          startDate: normalizedStartDate,
          endDate: normalizedEndDate,
        });
      }

      // Show success message
      toast({
        title: isEditing ? "Shift Updated" : "Shift Created",
        description: isEditing
          ? "The shift has been updated successfully"
          : `${
              data.isRecurring
                ? `Created ${recurringCount + 1} shifts based on recurrence pattern`
                : "The shift has been created successfully"
            }`,
      });

      // Close the dialog
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error saving shift:", error);
      setFormError(
        error.message || "An error occurred while saving the shift",
      );
      toast({
        title: "Error",
        description: error.message || "Failed to save shift",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete the shift
  const handleDelete = async () => {
    if (!shift?.id) return;

    try {
      setIsLoading(true);
      setFormError(null);

      const { error } = await supabase
        .from("shifts")
        .delete()
        .eq("id", shift.id);

      if (error) throw error;

      toast({
        title: "Shift Deleted",
        description: "The shift has been deleted successfully",
      });

      if (onDelete) onDelete(shift.id);
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error deleting shift:", error);
      setFormError(
        error.message || "An error occurred while deleting the shift",
      );
      toast({
        title: "Error",
        description: error.message || "Failed to delete shift",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
            {/* Provider selection */}
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
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: provider.color || "#888888",
                              }}
                            />
                            {provider.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinic Type */}
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
                      {clinicTypes.map((clinicType) => (
                        <SelectItem
                          key={clinicType.id}
                          value={clinicType.id}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor:
                                  clinicType.color || "#888888",
                              }}
                            />
                            {clinicType.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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

            {/* Vacation toggle */}
            <FormField
              control={form.control}
              name="isVacation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Vacation</FormLabel>
                    <FormDescription>
                      Mark this as a vacation day instead of a shift
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

            {/* End Date - Only shown for vacations */}
            {watchIsVacation && (
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
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick an end date</span>
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
                          disabled={(date) => date < watchStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      For multi-day vacations, select the last day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Optional fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recurring shift toggle */}
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
                              variant={"outline"}
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
                              onClick={() => field.onChange(null)}
                              className="w-full justify-start text-left font-normal mb-2"
                            >
                              No end date
                            </Button>
                            <Separator className="my-2" />
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) => date <= watchStartDate}
                              initialFocus
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        If not set, will default to 90 days
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update"
                    : "Create"}
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
