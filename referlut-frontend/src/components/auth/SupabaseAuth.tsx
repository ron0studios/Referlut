import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  supabase,
  signIn,
  signUp,
  signOut as supabaseSignOut,
  getCurrentUser,
  getSession,
} from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { apiClient } from "@/lib/apiClient"; // Import apiClient

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean; // Initial auth loading
  isCheckingBankStatus: boolean; // Loading state for bank status check
  isAuthenticated: boolean;
  hasConnectedBank: boolean | null; // Store bank connection status (null initially)
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
  refreshBankStatus: () => Promise<void>; // Add function to manually refresh status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial auth check
  const [isCheckingBankStatus, setIsCheckingBankStatus] = useState(true); // Separate loading for bank status
  const [hasConnectedBank, setHasConnectedBank] = useState<boolean | null>(
    null
  );

  const checkBankConnectionStatus = useCallback(
    async (currentSession: Session | null) => {
      if (!currentSession) {
        setHasConnectedBank(false);
        setIsCheckingBankStatus(false);
        return false;
      }

      setIsCheckingBankStatus(true);

      // Add a timeout to prevent the check from hanging indefinitely
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Bank status check timed out"));
        }, 5000); // 5 second timeout
      });

      try {
        // Race the actual check against the timeout
        return await Promise.race([
          (async () => {
            try {
              // First check Supabase DB
              const { data: userData, error: dbError } = await supabase
                .from("user_settings")
                .select("has_connected_bank")
                .eq("user_id", currentSession.user.id)
                .single();

              if (dbError && dbError.code !== "PGRST116") {
                console.error(
                  "Error fetching user bank status from DB:",
                  dbError
                );
                // Fallback to API check
              } else if (userData?.has_connected_bank) {
                // DB says connected, trust it for now
                setHasConnectedBank(true);
                setIsCheckingBankStatus(false);
                return true;
              }

              // If DB check inconclusive or shows not connected, verify with API
              const bankStatus = await apiClient.banking.getBankStatus();
              const connected = bankStatus.has_connected_bank;
              setHasConnectedBank(connected);

              // Optionally update DB if API differs and user exists in DB
              if (userData && connected !== userData.has_connected_bank) {
                await supabase
                  .from("user_settings")
                  .update({ has_connected_bank: connected })
                  .eq("user_id", currentSession.user.id);
              }
              return connected;
            } catch (error) {
              console.error("Error checking bank connection status:", error);
              setHasConnectedBank(false); // Assume not connected on error
              return false;
            } finally {
              setIsCheckingBankStatus(false);
            }
          })(),
          timeoutPromise,
        ]);
      } catch (error) {
        console.error("Bank status check failed or timed out:", error);
        // If we timeout or any other error occurs, treat as not connected
        // but still allow the app to continue functioning
        setHasConnectedBank(false);
        setIsCheckingBankStatus(false);
        return false;
      }
    },
    []
  );

  // Initialize auth state and bank status
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      setIsCheckingBankStatus(true);
      try {
        const { data: sessionData } = await getSession();
        const currentSession = sessionData?.session || null;
        setSession(currentSession);

        if (currentSession) {
          const { data: userData } = await getCurrentUser();
          setUser(userData.user);
          await checkBankConnectionStatus(currentSession);
        } else {
          setUser(null);
          setHasConnectedBank(false);
          setIsCheckingBankStatus(false); // No session, so bank check is done (false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setHasConnectedBank(false);
        setIsCheckingBankStatus(false);
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
        // Re-check bank status when auth state changes (login/logout)
        await checkBankConnectionStatus(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [checkBankConnectionStatus]);

  // Sign in with email/password
  const handleSignIn = async (email: string, password: string) => {
    // Sign in logic remains the same, onAuthStateChange will trigger bank status check
    return await signIn(email, password);
  };

  // Sign up with email/password
  const handleSignUp = async (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => {
    // Sign up logic remains the same, onAuthStateChange will trigger bank status check
    return await signUp(email, password, metadata);
  };

  // Sign out
  const handleSignOut = async () => {
    // Sign out logic remains the same, onAuthStateChange will trigger bank status check
    return await supabaseSignOut();
  };

  // Get the current access token
  const getToken = async (): Promise<string | null> => {
    const { data } = await getSession();
    return data.session?.access_token || null;
  };

  // Function to manually refresh bank status if needed (e.g., after connecting)
  const refreshBankStatus = useCallback(async () => {
    const { data: sessionData } = await getSession();
    await checkBankConnectionStatus(sessionData?.session || null);
  }, [checkBankConnectionStatus]);

  // Compute authentication state
  const isAuthenticated = !!user && !!session;

  const value = {
    user,
    session,
    isLoading,
    isCheckingBankStatus, // Expose new loading state
    isAuthenticated,
    hasConnectedBank, // Expose bank status
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    getToken,
    refreshBankStatus, // Expose refresh function
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
