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

export interface Shift {
  id: string;
  provider_id: string;
  clinic_type_id: string;
  start_date: string; // ISO format date string
  end_date: string; // ISO format date string
  is_vacation: boolean;
  notes?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
}

export interface ClinicType {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
}
