import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Save } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface CalendarNotesDialogProps {
  date: Date;
  notes?: string;
  isAdmin?: boolean;
  onSaveNotes?: (notes: string) => void;
  trigger?: React.ReactNode;
}

const CalendarNotesDialog: React.FC<CalendarNotesDialogProps> = ({
  date,
  notes = "",
  isAdmin = false,
  onSaveNotes = () => {},
  trigger,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Format date as YYYY-MM-DD for database
  const formattedDate = format(date, "yyyy-MM-dd");

  useEffect(() => {
    setEditedNotes(notes);
  }, [notes]);

  // Fetch notes from Supabase when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, formattedDate]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("calendar_notes")
        .select("notes")
        .eq("date", formattedDate)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error fetching notes:", error);
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        });
      }

      if (data) {
        setEditedNotes(data.notes);
      }
    } catch (error) {
      console.error("Error in fetchNotes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsLoading(true);

      // Check if notes already exist for this date
      const { data: existingNote, error: checkError } = await supabase
        .from("calendar_notes")
        .select("id")
        .eq("date", formattedDate)
        .single();

      let result;

      if (existingNote) {
        // Update existing note
        result = await supabase
          .from("calendar_notes")
          .update({
            notes: editedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingNote.id);
      } else {
        // Insert new note
        result = await supabase.from("calendar_notes").insert({
          date: formattedDate,
          notes: editedNotes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      if (result.error) {
        throw result.error;
      }

      onSaveNotes(editedNotes);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Notes saved successfully",
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            View Notes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Notes for {format(date, "MMMM yyyy")}</span>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                {isEditing ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Save" : "Edit Notes"}
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            View and edit notes for this calendar period.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isEditing ? (
            <RichTextEditor
              value={editedNotes}
              onChange={setEditedNotes}
              placeholder="Add notes for the calendar..."
              minHeight="200px"
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-md min-h-[200px]">
              {editedNotes ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: editedNotes }}
                />
              ) : (
                <p className="text-gray-500 italic">
                  No notes available for this period.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedNotes(notes);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNotes} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Notes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarNotesDialog;
