import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
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

// Override supabase methods for development
const originalFrom = supabase.from;
supabase.from = function (table) {
  // Map table names to our mock data keys
  const tableMap = {
    'shifts': 'shifts',
    'providers': 'providers',
    'clinic_types': 'clinic_types',
    'profiles': 'profiles'
  };
  
  const mappedTable = tableMap[table] || table;
  
  const mockSelect = {
    select: (columns = "*") => ({
      eq: (column, value) => ({
        single: async () => {
          if (mappedTable === "profiles" && column === "id") {
            const profile = MOCK_DATA.profiles.find(p => p.id === value);
            return { data: profile || null, error: profile ? null : { message: "Profile not found" } };
          }
          return { data: null, error: { message: "Not implemented in mock" } };
        },
        async execute() {
          if (mappedTable === "profiles" && column === "id") {
            const profiles = MOCK_DATA.profiles.filter(p => p.id === value);
            return { data: profiles, error: null };
          }
          if (mappedTable === "providers" && column === "id") {
            const providers = MOCK_DATA.providers.filter(p => p.id === value);
            return { data: providers, error: null };
          }
          if (mappedTable === "shifts" && column === "providerId") {
            const shifts = MOCK_DATA.shifts.filter(s => s.providerId === value);
            
            // Map shift data to expected format
            const formattedShifts = shifts.map(s => ({
              id: s.id,
              provider_id: s.providerId,
              clinic_type_id: s.clinicTypeId,
              start_date: s.startDate ? new Date(s.startDate) : new Date(),
              end_date: s.endDate ? new Date(s.endDate) : new Date(),
              is_vacation: s.isVacation || false,
              notes: "",
              location: "",
              is_recurring: s.isRecurring || false,
              recurrence_pattern: s.recurrencePattern || null,
              recurrence_end_date: s.recurrenceEndDate ? new Date(s.recurrenceEndDate) : null,
              series_id: s.seriesId || null,
              created_at: s.createdAt || new Date().toISOString(),
              updated_at: s.updatedAt || new Date().toISOString()
            }));
            
            return { data: formattedShifts, error: null };
          }
          if (mappedTable === "clinic_types" && column === "id") {
            const clinicTypes = MOCK_DATA.clinic_types.filter(c => c.id === value);
            return { data: clinicTypes, error: null };
          }
          return { data: [], error: null };
        }
      }),
      order: (column) => ({
        async execute() {
          if (mappedTable in MOCK_DATA) {
            console.log(`Returning mock data for ${mappedTable}`);
            
            // Format specific tables appropriately
            if (mappedTable === "shifts") {
              const formattedShifts = MOCK_DATA.shifts.map(s => ({
                id: s.id,
                provider_id: s.providerId,
                clinic_type_id: s.clinicTypeId,
                start_date: s.startDate ? new Date(s.startDate) : new Date(),
                end_date: s.endDate ? new Date(s.endDate) : new Date(),
                is_vacation: s.isVacation || false,
                notes: "",
                location: "",
                is_recurring: s.isRecurring || false,
                recurrence_pattern: s.recurrencePattern || null,
                recurrence_end_date: s.recurrenceEndDate ? new Date(s.recurrenceEndDate) : null,
                series_id: s.seriesId || null,
                created_at: s.createdAt || new Date().toISOString(),
                updated_at: s.updatedAt || new Date().toISOString()
              }));
              return { data: formattedShifts, error: null };
            } else if (mappedTable === "providers") {
              const formattedProviders = MOCK_DATA.providers.map(p => ({
                id: p.id,
                name: p.name,
                color: p.color,
                is_active: p.is_active,
                created_at: p.created_at,
                updated_at: p.updated_at
              }));
              return { data: formattedProviders, error: null };
            } else if (mappedTable === "clinic_types") {
              const formattedClinicTypes = MOCK_DATA.clinic_types.map(c => ({
                id: c.id,
                name: c.name,
                color: c.color,
                is_active: c.is_active,
                created_at: c.created_at,
                updated_at: c.updated_at
              }));
              return { data: formattedClinicTypes, error: null };
            }
            
            return { data: MOCK_DATA[mappedTable], error: null };
          }
          console.warn(`No mock data found for table: ${mappedTable}`);
          return { data: [], error: null };
        }
      }),
      async execute() {
        if (mappedTable in MOCK_DATA) {
          console.log(`Returning all mock data for ${mappedTable}`);
          
          // Format specific tables appropriately
          if (mappedTable === "shifts") {
            const formattedShifts = MOCK_DATA.shifts.map(s => ({
              id: s.id,
              provider_id: s.providerId,
              clinic_type_id: s.clinicTypeId,
              start_date: s.startDate ? new Date(s.startDate) : new Date(),
              end_date: s.endDate ? new Date(s.endDate) : new Date(),
              is_vacation: s.isVacation || false,
              notes: "",
              location: "",
              is_recurring: s.isRecurring || false,
              recurrence_pattern: s.recurrencePattern || null,
              recurrence_end_date: s.recurrenceEndDate ? new Date(s.recurrenceEndDate) : null,
              series_id: s.seriesId || null,
              created_at: s.createdAt || new Date().toISOString(),
              updated_at: s.updatedAt || new Date().toISOString()
            }));
            return { data: formattedShifts, error: null };
          } else if (mappedTable === "providers") {
            const formattedProviders = MOCK_DATA.providers.map(p => ({
              id: p.id,
              name: p.name,
              color: p.color,
              is_active: p.is_active,
              created_at: p.created_at,
              updated_at: p.updated_at
            }));
            return { data: formattedProviders, error: null };
          } else if (mappedTable === "clinic_types") {
            const formattedClinicTypes = MOCK_DATA.clinic_types.map(c => ({
              id: c.id,
              name: c.name,
              color: c.color,
              is_active: c.is_active,
              created_at: c.created_at,
              updated_at: c.updated_at
            }));
            return { data: formattedClinicTypes, error: null };
          }
          
          return { data: MOCK_DATA[mappedTable], error: null };
        }
        console.warn(`No mock data found for table: ${mappedTable}`);
        return { data: [], error: null };
      }
    }),
    insert: (data) => ({
      async execute() {
        if (mappedTable in MOCK_DATA) {
          const newItem = { ...data, id: Math.random().toString(36).substring(2, 9) };
          MOCK_DATA[mappedTable].push(newItem);
          return { data: newItem, error: null };
        }
        return { data: null, error: { message: "Table not found" } };
      }
    }),
    update: (data) => ({
      eq: (column, value) => ({
        async execute() {
          if (mappedTable in MOCK_DATA) {
            const index = MOCK_DATA[mappedTable].findIndex(item => item[column] === value);
            if (index !== -1) {
              MOCK_DATA[mappedTable][index] = { ...MOCK_DATA[mappedTable][index], ...data };
              return { data: MOCK_DATA[mappedTable][index], error: null };
            }
          }
          return { data: null, error: { message: "Item not found" } };
        }
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        async execute() {
          if (mappedTable in MOCK_DATA) {
            const index = MOCK_DATA[mappedTable].findIndex(item => item[column] === value);
            if (index !== -1) {
              const deleted = MOCK_DATA[mappedTable].splice(index, 1)[0];
              return { data: deleted, error: null };
            }
          }
          return { data: null, error: { message: "Item not found" } };
        }
      })
    })
  };
  
  try {
    // First try the mock implementation
    console.log(`Using mock implementation for table: ${table} (mapped to ${mappedTable})`);
    return mockSelect;
  } catch (e) {
    // Fall back to the real implementation if needed
    console.warn(`Error in mock implementation for ${table}, falling back to real implementation`, e);
    return originalFrom(table);
  }
};

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
