import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Extract project ID to build the storage key for auth token
const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helper functions
export const signUp = async (
  email: string,
  password: string,
  metadata?: Record<string, any>
) => {
  const creds = {
    email,
    password,
    options: {
      data: metadata,
    },
  };

  const { data, error } = await supabase.auth.signUp(creds);

  // Create user profile in the database after successful signup
  if (data.user && !error) {
    await createUserProfile(data.user.id, {
      email: data.user.email,
      display_name:
        metadata?.display_name ||
        `${metadata?.firstName || ""} ${metadata?.lastName || ""}`.trim(),
      ...metadata,
    });
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

// Handle token refresh
export const setupTokenRefresh = () => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "TOKEN_REFRESHED" && session) {
      console.log("Token refreshed");
      // You could dispatch an event or update a global state here
    }
  });
};

// Get the JWT token with auto-refresh if needed
export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await getSession();

  if (!data.session) {
    return null;
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const tokenExpiresAt = new Date((data.session.expires_at || 0) * 1000);
  const isExpiringSoon = tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000;

  if (isExpiringSoon) {
    try {
      // Force a token refresh
      const { data: refreshData, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return refreshData.session?.access_token || null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return data.session.access_token;
    }
  }

  return data.session.access_token;
};

// Check if the user is authenticated
export const isAuthenticated = async () => {
  const { data } = await getSession();
  return !!data.session;
};

// Handle user profile in the database
export const createUserProfile = async (
  userId: string,
  profileData: Record<string, any>
) => {
  const { error } = await supabase.from("user_settings").upsert({
    user_id: userId,
    avatar_url: profileData.avatar_url,
  });

  if (error) {
    console.error("Error creating user profile:", error);
  }

  return { error };
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  profileData: Record<string, any>
) => {
  const { data, error } = await supabase
    .from("user_settings")
    .update({
      ...profileData,
    })
    .eq("user_id", userId);

  return { data, error };
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { data, error };
};

// Subscribe to auth state changes
export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Get the JWT access token stored by Supabase in localStorage
export const getToken = (): string | null => {
  const storageKey = `sb-${supabaseProjectId}-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = sessionDataString ? JSON.parse(sessionDataString) : null;
  return sessionData?.access_token || null;
};
