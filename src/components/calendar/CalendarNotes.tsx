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

  useEffect(() => {
    setEditedNotes(notes);
  }, [notes]);

  useEffect(() => {
    setDisplayComments(comments);
  }, [comments]);

  const handleSaveNotes = () => {
    onSaveNotes(editedNotes);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would be handled by the backend
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        author: currentUser.name,
        authorId: currentUser.id,
        avatarUrl: currentUser.avatarUrl,
        content: newComment,
        createdAt: new Date(),
      };

      setDisplayComments([...displayComments, newCommentObj]);
      onAddComment(newComment);
      setNewComment("");
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
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {notes ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: notes }}
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
                  disabled={!newComment.trim()}
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
