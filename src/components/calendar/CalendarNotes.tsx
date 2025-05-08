import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Edit, Save, MessageSquare, Send } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  author: string;
  authorId: string;
  avatarUrl?: string;
  content: string;
  createdAt: Date;
}

interface CalendarNotesProps {
  date: Date;
  notes?: string;
  comments?: Comment[];
  isAdmin?: boolean;
  currentUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  onSaveNotes?: (notes: string) => void;
  onAddComment?: (comment: string) => void;
}

const CalendarNotes: React.FC<CalendarNotesProps> = ({
  date,
  notes = "",
  comments = [],
  isAdmin = false,
  currentUser = {
    id: "user1",
    name: "Guest User",
  },
  onSaveNotes = () => {},
  onAddComment = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes);
  const [newComment, setNewComment] = useState("");
  const [displayComments, setDisplayComments] = useState<Comment[]>(comments);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Format date as YYYY-MM-DD for database
  const formattedDate = format(date, "yyyy-MM-dd");

  // Fetch notes and comments from Supabase
  const fetchNotesAndComments = async () => {
    try {
      setIsLoading(true);

      // Fetch notes using maybeSingle() to handle no results
      const { data: notesData, error: notesError } = await supabase
        .from("calendar_notes")
        .select("*")
        .eq("date", formattedDate)
        .maybeSingle();

      if (notesError) {
        console.error("Error fetching notes:", notesError);
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        });
      }

      // Set notes if data exists, otherwise set empty string
      setEditedNotes(notesData?.notes || "");

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("calendar_comments")
        .select("*")
        .eq("date", formattedDate)
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
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
        setDisplayComments(formattedComments);
      } else {
        setDisplayComments([]);
      }
    } catch (error) {
      console.error("Error in fetchNotesAndComments:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndComments();

    // Set up realtime subscription for comments
    const commentsSubscription = supabase
      .channel("calendar_comments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_comments",
          filter: `date=eq.${formattedDate}`,
        },
        fetchNotesAndComments,
      )
      .subscribe();

    // Set up realtime subscription for notes
    const notesSubscription = supabase
      .channel("calendar_notes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_notes",
          filter: `date=eq.${formattedDate}`,
        },
        fetchNotesAndComments,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(notesSubscription);
    };
  }, [formattedDate]);

  useEffect(() => {
    setEditedNotes(notes);
  }, [notes]);

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
          user_id: currentUser.id,
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

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        setIsLoading(true);

        const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Insert comment into Supabase
        const { error } = await supabase.from("calendar_comments").insert({
          id: commentId,
          date: formattedDate,
          author: currentUser.name,
          author_id: currentUser.id,
          avatar_url: currentUser.avatarUrl,
          content: newComment,
          created_at: new Date().toISOString(),
          user_id: currentUser.id,
        });

        if (error) {
          throw error;
        }

        // We don't need to manually add the comment to the state
        // as the realtime subscription will handle this
        // But we'll clear the input and notify the user
        onAddComment(newComment);
        setNewComment("");
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
      } catch (error) {
        console.error("Error adding comment:", error);
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <div>Notes for {format(date, "MMMM yyyy")}</div>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Notes Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            {isEditing ? (
              <div className="space-y-2">
                <RichTextEditor
                  value={editedNotes}
                  onChange={setEditedNotes}
                  placeholder="Add notes for the calendar..."
                  minHeight="150px"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedNotes(notes);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {editedNotes ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: editedNotes }}
                  />
                ) : (
                  <p className="text-gray-500 italic">
                    No notes available for this month.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 mr-2 text-gray-500" />
              <h3 className="text-md font-medium">Comments</h3>
            </div>

            {/* Comment List */}
            {displayComments.length > 0 ? (
              <div className="space-y-4 mb-4">
                {displayComments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      {comment.avatarUrl && (
                        <AvatarImage
                          src={comment.avatarUrl}
                          alt={comment.author}
                        />
                      )}
                      <AvatarFallback>
                        {getInitials(comment.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline">
                        <span className="font-medium text-sm">
                          {comment.author}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {format(
                            new Date(comment.createdAt),
                            "MMM d, yyyy h:mm a",
                          )}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm mb-4">
                No comments yet. Be the first to comment!
              </p>
            )}

            {/* Add Comment Form */}
            <Separator className="my-4" />
            <div className="flex space-x-2">
              <Avatar className="h-8 w-8">
                {currentUser.avatarUrl && (
                  <AvatarImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                  />
                )}
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarNotes;