import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Edit, Save } from "lucide-react";

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

  const handleSaveNotes = () => {
    onSaveNotes(editedNotes);
    setIsEditing(false);
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
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Add notes for the calendar..."
              className="min-h-[200px]"
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-md min-h-[200px]">
              {notes ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: notes }}
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
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNotes}>Save Notes</Button>
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
