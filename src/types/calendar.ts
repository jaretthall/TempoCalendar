export interface CalendarNote {
  id: string;
  date: string; // ISO format date string
  notes: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CalendarComment {
  id: string;
  note_id: string;
  author: string;
  authorId: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
  user_id: string;
}
