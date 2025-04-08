import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { mockData } from "./mock-data";

// Check if we should use mock mode
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
console.log("Using mock data:", useMockData);

// Get environment variables with fallbacks to prevent runtime errors
let supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co";
let supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockKey";

// Log warnings if environment variables are missing
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn(
    "Missing VITE_SUPABASE_URL environment variable, using fallback",
  );
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "Missing VITE_SUPABASE_ANON_KEY environment variable, using fallback",
  );
}

// Create a valid Supabase client with real or mock credentials
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// MOCK DATA for development when Supabase is not available
const MOCK_DATA = mockData;

// Only override Supabase methods if we're using mock data
if (useMockData) {
  const mockFrom = (table: keyof Database['public']['Tables']) => {
    return {
      select: (columns = "*") => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          execute: () => Promise.resolve({ data: [], error: null })
        }),
        order: (column: string) => ({
          execute: () => Promise.resolve({ data: [], error: null })
        }),
        execute: () => Promise.resolve({ data: [], error: null })
      }),
      insert: (data: any) => ({
        execute: () => Promise.resolve({ data: null, error: null })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          execute: () => Promise.resolve({ data: null, error: null })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          execute: () => Promise.resolve({ data: null, error: null })
        })
      })
    };
  };

  // Override the from method with our mock implementation
  supabase.from = mockFrom as any;
}

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "viewer";
  created_at: string;
  updated_at: string;
};

export type Session = {
  user: {
    id: string;
    email: string;
  } | null;
  profile: Profile | null;
  isAdmin: boolean;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const profile = MOCK_DATA.profiles.find(p => p.id === userId);
    if (profile) return profile as Profile;
    
    // Fall back to Supabase if mock doesn't have the profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile;
  } catch (e) {
    console.error("Error in getProfile:", e);
    return null;
  }
}

export interface Database {
  public: {
    Tables: {
      shifts: {
        Row: {
          id: string;
          provider_id: string;
          clinic_type_id: string;
          start_date: string;
          end_date: string;
          is_vacation: boolean;
          notes: string;
          location: string | null;
          is_recurring: boolean | null;
          recurrence_pattern: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          clinic_type_id: string;
          start_date: string;
          end_date: string;
          is_vacation?: boolean;
          notes?: string;
          location?: string;
          is_recurring?: boolean;
          recurrence_pattern?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          clinic_type_id?: string;
          start_date?: string;
          end_date?: string;
          is_vacation?: boolean;
          notes?: string;
          location?: string;
          is_recurring?: boolean;
          recurrence_pattern?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... other tables ...
    };
  };
}
