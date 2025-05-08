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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { normalizeDate } from "@/utils/date-utils";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  seriesId: z.string().optional(),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: any) => void;
  onDelete?: (shiftId: string, deleteType?: 'single' | 'future' | 'all') => void;
  onClose?: () => void;
  shift?: any;
  isEditing?: boolean;
  initialDate?: Date | null;
  providers?: any[];
  clinicTypes?: any[];
  shifts?: any[];
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
  shifts = [],
}: ShiftDialogProps) => {
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
    seriesId: shift?.seriesId || undefined,
  };

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues,
  });

  const watchIsRecurring = form.watch("isRecurring");
  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");
  const watchIsVacation = form.watch("isVacation");
  const watchSeriesId = form.watch("seriesId");

  useEffect(() => {
    setShowRecurrenceOptions(watchIsRecurring);
  }, [watchIsRecurring]);

  useEffect(() => {
    if (watchStartDate && !watchIsVacation) {
      form.setValue("endDate", watchStartDate);
    }
  }, [watchStartDate, watchIsVacation, form]);

  // Load providers and clinic types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let providersData = propProviders;
        let clinicTypesData = propClinicTypes;

        if (propProviders.length === 0) {
          const { data, error } = await supabase
            .from("providers")
            .select("*")
            .order("name");

          if (error) throw error;
          providersData = data || [];
        }

        if (propClinicTypes.length === 0) {
          const { data, error } = await supabase
            .from("clinic_types")
            .select("*")
            .order("name");

          if (error) throw error;
          clinicTypesData = data || [];
        }

        setProviders(providersData);
        setClinicTypes(clinicTypesData);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setFormError(error.message || "Failed to load providers and clinic types");
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [propProviders, propClinicTypes, toast]);

  const handleDelete = async (deleteType: 'single' | 'future' | 'all') => {
    if (!shift?.id) return;

    try {
      setIsLoading(true);
      setFormError(null);

      if (deleteType === 'single') {
        await supabase.from("shifts").delete().eq("id", shift.id);
      } else if (deleteType === 'future') {
        await supabase
          .from("shifts")
          .delete()
          .eq("seriesId", watchSeriesId)
          .gte("startDate", shift.startDate);
      } else if (deleteType === 'all') {
        await supabase.from("shifts").delete().eq("seriesId", watchSeriesId);
      }

      toast({
        title: "Shift Deleted",
        description: "The shift(s) have been deleted successfully",
      });

      if (onDelete) onDelete(shift.id, deleteType);
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error deleting shift:", error);
      setFormError(error.message || "An error occurred while deleting");
      toast({
        title: "Error",
        description: error.message || "Failed to delete shift(s)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const onSubmit = async (data: ShiftFormValues) => {
    try {
      setIsLoading(true);
      setFormError(null);

      // Check for double booking
      const isDoubleBooked = shifts.some(
        existingShift => 
          existingShift.providerId === data.providerId &&
          format(new Date(existingShift.startDate), "yyyy-MM-dd") === format(data.startDate, "yyyy-MM-dd") &&
          existingShift.id !== shift?.id &&
          !existingShift.isVacation
      );

      if (isDoubleBooked && !data.isVacation) {
        const confirmDouble = window.confirm(
          "This provider is already scheduled for this day. Do you want to continue?"
        );
        if (!confirmDouble) {
          setIsLoading(false);
          return;
        }
      }

      const normalizedStartDate = normalizeDate(data.startDate);
      const normalizedEndDate = data.isVacation 
        ? normalizeDate(data.endDate) 
        : normalizeDate(data.startDate);

      const seriesId = data.isRecurring 
        ? (shift?.seriesId || `series-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
        : undefined;

      const shiftData = {
        provider_id: data.providerId,
        clinic_type_id: data.clinicTypeId,
        start_date: normalizedStartDate.toISOString(),
        end_date: normalizedEndDate.toISOString(),
        is_vacation: data.isVacation,
        notes: data.notes || null,
        location: data.location || null,
        is_recurring: data.isRecurring,
        recurrence_pattern: data.recurrencePattern,
        series_id: seriesId,
      };

      if (isEditing && shift?.id) {
        // Update options for recurring shifts
        if (shift.seriesId) {
          const updateType = await new Promise<'single' | 'future' | 'all'>((resolve) => {
            const dialog = document.createElement('div');
            dialog.innerHTML = `
              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white p-6 rounded-lg">
                  <h3 class="text-lg font-bold mb-4">Update Recurring Shift</h3>
                  <div class="space-y-4">
                    <button class="w-full p-2 bg-blue-500 text-white rounded" 
                            onclick="this.closest('div.fixed').remove(); window.tempResolve('single')">
                      This occurrence only
                    </button>
                    <button class="w-full p-2 bg-blue-500 text-white rounded" 
                            onclick="this.closest('div.fixed').remove(); window.tempResolve('future')">
                      This and future occurrences
                    </button>
                    <button class="w-full p-2 bg-blue-500 text-white rounded" 
                            onclick="this.closest('div.fixed').remove(); window.tempResolve('all')">
                      All occurrences
                    </button>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(dialog);
            (window as any).tempResolve = resolve;
          });

          if (updateType === 'single') {
            await supabase.from("shifts").update(shiftData).eq("id", shift.id);
          } else if (updateType === 'future') {
            await supabase
              .from("shifts")
              .update(shiftData)
              .eq("series_id", shift.seriesId)
              .gte("start_date", shift.startDate);
          } else {
            await supabase
              .from("shifts")
              .update(shiftData)
              .eq("series_id", shift.seriesId);
          }
        } else {
          await supabase.from("shifts").update(shiftData).eq("id", shift.id);
        }
      } else {
        await supabase.from("shifts").insert(shiftData);

        if (data.isRecurring && data.recurrencePattern) {
          const recurrenceEnd = data.recurrenceEndDate || addDays(data.startDate, 90);
          let currentDate = addDays(data.startDate, 1);

          while (currentDate <= recurrenceEnd) {
            const recurringShift = {
              ...shiftData,
              start_date: currentDate.toISOString(),
              end_date: currentDate.toISOString(),
            };

            await supabase.from("shifts").insert(recurringShift);

            // Advance to next occurrence
            const days = data.recurrencePattern === 'daily' ? 1 
              : data.recurrencePattern === 'weekly' ? 7 
              : 14;
            currentDate = addDays(currentDate, days);
          }
        }
      }

      toast({
        title: isEditing ? "Shift Updated" : "Shift Created",
        description: "Changes saved successfully",
      });

      if (onSave) onSave(data);
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error saving shift:", error);
      setFormError(error.message || "An error occurred while saving");
      toast({
        title: "Error",
        description: error.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Shift" : "Create New Shift"}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                                style={{ backgroundColor: provider.color }}
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

              <FormField
                control={form.control}
                name="clinicTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinic type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clinicTypes.map((clinicType) => (
                          <SelectItem key={clinicType.id} value={clinicType.id}>
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: clinicType.color }}
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

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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

              <FormField
                control={form.control}
                name="isVacation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Vacation</FormLabel>
                      <FormDescription>
                        Mark this as a vacation day
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

              {watchIsVacation && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
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
                        For multi-day vacations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isEditing && (
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Recurring Shift
                        </FormLabel>
                        <FormDescription>
                          Set up a recurring pattern
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
              )}

              {showRecurrenceOptions && (
                <div className="space-y-4 rounded-md border p-4">
                  <FormField
                    control={form.control}
                    name="recurrencePattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence Pattern</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="recurrenceEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Recurrence</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
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
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) => date <= watchStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Defaults to 90 days if not set
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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

              <DialogFooter className="gap-2 sm:gap-0">
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
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
                    {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              {shift?.seriesId ? (
                "How would you like to delete this recurring shift?"
              ) : (
                "Are you sure you want to delete this shift?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {shift?.seriesId ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete('single')}
                >
                  This occurrence
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete('future')}
                >
                  This and future
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete('all')}
                >
                  All occurrences
                </Button>
              </>
            ) : (
              <Button
                variant="destructive"
                onClick={() => handleDelete('single')}
              >
                Delete
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShiftDialog;