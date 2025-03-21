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
    // Get initial session
    supabase.auth
      .getSession()
      .then(async ({ data: { session: supabaseSession } }) => {
        await updateSessionWithProfile(supabaseSession);
        setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, supabaseSession) => {
      await updateSessionWithProfile(supabaseSession);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
