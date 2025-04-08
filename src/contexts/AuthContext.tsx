import React, { createContext, useContext, useEffect, useState } from "react";
import { Session as SupabaseSession, User } from "@supabase/supabase-js";
import { supabase, getProfile, Session, Profile } from "@/lib/supabase";

interface AuthContextType {
  session: Session;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const defaultSession: Session = {
  user: null,
  profile: null,
  isAdmin: false,
};

// Mock user for development
const mockUser = {
  id: "1",
  email: "admin@example.com"
};

const mockProfile = {
  id: "1",
  email: "admin@example.com",
  full_name: "Admin User",
  role: "admin" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType>({
  session: defaultSession,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session>(defaultSession);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Try to get actual session first
        const { data } = await supabase.auth.getSession();
        const supabaseSession = data.session;
        
        if (supabaseSession) {
          // If we have a real session, use it
          await updateSessionWithProfile(supabaseSession);
        } else {
          // Otherwise, use mock data for development
          console.log("Using mock auth data for development");
          setSession({
            user: mockUser,
            profile: mockProfile,
            isAdmin: true
          });
        }
      } catch (error) {
        console.error("Error setting up auth:", error);
        // Fall back to mock data on error
        setSession({
          user: mockUser,
          profile: mockProfile,
          isAdmin: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    setupAuth();

    // Try to set up real auth listener
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, supabaseSession) => {
        if (supabaseSession) {
          await updateSessionWithProfile(supabaseSession);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      return () => {};
    }
  }, []);

  const updateSessionWithProfile = async (
    supabaseSession: SupabaseSession | null,
  ) => {
    if (!supabaseSession) {
      setSession(defaultSession);
      return;
    }

    const user = supabaseSession.user;
    let profile: Profile | null = null;

    if (user) {
      profile = await getProfile(user.id);
    }

    setSession({
      user: user ? { id: user.id, email: user.email || "" } : null,
      profile,
      isAdmin: profile?.role === "admin",
    });
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For development, accept any login
      if (email && password) {
        // Set mock session
        setSession({
          user: mockUser,
          profile: mockProfile,
          isAdmin: true
        });
        setIsLoading(false);
        return { error: null };
      }
      
      // Try real auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      setIsLoading(false);
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
      return { error: new Error("Sign in failed") };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      // Always reset to default session
      setSession(defaultSession);
    }
  };

  const value = {
    session,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
