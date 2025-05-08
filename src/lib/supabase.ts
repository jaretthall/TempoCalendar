import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { mockData } from "./mock-data";

// Force mock mode in WebContainer environment
const useMockData = true;
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
    const getMockData = () => {
      return MOCK_DATA[table] || [];
    };

    const buildQuery = (data: any[]) => {
      let filteredData = [...data];
      let queryChain = {
        data: filteredData,
        filters: [] as any[],
        orderBy: null as any,

        eq: function(column: string, value: any) {
          this.filters.push((item: any) => item[column] === value);
          return this;
        },

        like: function(column: string, pattern: string) {
          const regex = new RegExp(pattern.replace(/%/g, '.*'));
          this.filters.push((item: any) => regex.test(item[column]));
          return this;
        },

        order: function(column: string, { ascending = true } = {}) {
          this.orderBy = { column, ascending };
          return this;
        },

        single: function() {
          const result = this.execute();
          return {
            data: result.data?.[0] || null,
            error: null
          };
        },

        execute: function() {
          let result = this.data;

          // Apply all filters
          for (const filter of this.filters) {
            result = result.filter(filter);
          }

          // Apply ordering if specified
          if (this.orderBy) {
            result.sort((a: any, b: any) => {
              const aVal = a[this.orderBy.column];
              const bVal = b[this.orderBy.column];
              return this.orderBy.ascending ? 
                (aVal > bVal ? 1 : -1) : 
                (aVal < bVal ? 1 : -1);
            });
          }

          return { data: result, error: null };
        }
      };

      return queryChain;
    };

    return {
      select: (columns = "*") => buildQuery(getMockData()),
      insert: (data: any) => ({
        select: () => ({
          data: [{ ...data, id: `mock-${Date.now()}` }],
          error: null
        }),
        execute: () => ({
          data: [{ ...data, id: `mock-${Date.now()}` }],
          error: null
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          execute: () => ({ data: [data], error: null })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          execute: () => ({ data: null, error: null })
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