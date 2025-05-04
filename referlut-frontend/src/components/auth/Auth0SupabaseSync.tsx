import { useEffect } from "react";
import { useSupabaseAuth } from "@/components/auth/SupabaseAuth";
import {
  supabase,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
} from "@/lib/supabaseClient";

/**
 * This component syncs Supabase user data with your database
 * It should be rendered once at the app root level
 */
export function Auth0SupabaseSync() {
  // Get authentication state from Supabase
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();

  useEffect(() => {
    // Create or update user in database when authenticated
    async function syncUserData() {
      if (isLoading || !isAuthenticated || !user) return;

      try {
        // Check if user exists in the profiles table
        const { data: existingUser, error: fetchError } = await getUserProfile(
          user.id
        );

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 is the "no rows returned" error, any other error should be logged
          console.error("Error checking for existing user:", fetchError);
          return;
        }

        if (!existingUser) {
          // Create new user profile if they don't exist
          const { error: insertError } = await createUserProfile(user.id, {
            email: user.email,
            name:
              user.user_metadata?.full_name || user.email?.split("@")[0] || "",
            avatar_url: user.user_metadata?.avatar_url || "",
          });

          if (insertError) {
            console.error("Error creating new user profile:", insertError);
          } else {
            console.log("Created new user profile");
          }
        } else {
          // Update existing user's profile data
          const { error: updateError } = await updateUserProfile(user.id, {
            last_login: new Date().toISOString(),
            email: user.email || existingUser.email,
            // Only update these fields if they exist in user metadata
            ...(user.user_metadata?.full_name && {
              name: user.user_metadata.full_name,
            }),
            ...(user.user_metadata?.avatar_url && {
              avatar_url: user.user_metadata.avatar_url,
            }),
          });

          if (updateError) {
            console.error("Error updating user profile:", updateError);
          } else {
            console.log("Updated existing user profile");
          }
        }
      } catch (error) {
        console.error("Error syncing user data:", error);
      }
    }

    syncUserData();
  }, [user, isAuthenticated, isLoading]);

  // This component doesn't render anything
  return null;
}
