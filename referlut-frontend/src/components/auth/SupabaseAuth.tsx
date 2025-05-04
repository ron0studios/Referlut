import { createContext, useContext, useEffect, useState } from "react";
import {
  supabase,
  signIn,
  signUp,
  signOut as supabaseSignOut,
  getCurrentUser,
  getSession,
} from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  signUp: (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from session
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Get current session
        const { data: sessionData } = await getSession();
        setSession(sessionData?.session || null);

        if (sessionData?.session) {
          const { data } = await getCurrentUser();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in with email/password
  const handleSignIn = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  // Sign up with email/password
  const handleSignUp = async (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => {
    return await signUp(email, password, metadata);
  };

  // Sign out
  const handleSignOut = async () => {
    return await supabaseSignOut();
  };

  // Get the current access token
  const getToken = async (): Promise<string | null> => {
    const { data } = await getSession();
    return data.session?.access_token || null;
  };

  // Compute authentication state
  const isAuthenticated = !!user && !!session;

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  }
  return context;
}
