import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check for missing environment variables and provide fallbacks for development
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");

  // Use empty strings as fallbacks to prevent runtime errors
  // The application will still show appropriate errors for missing credentials
  if (!supabaseUrl) {
    console.warn("Using fallback Supabase URL");
    supabaseUrl = "https://placeholder-url.supabase.co";
  }
  if (!supabaseAnonKey) {
    console.warn("Using fallback Supabase Anon Key");
    supabaseAnonKey = "placeholder-key";
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
}
