import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { supabase } from "@/lib/supabaseClient";
import { pocketbase } from "@/lib/pocketbaseClient";
import { useNavigate } from "react-router-dom";

/**
 * This component synchronizes Auth0 user data with Supabase and Pocketbase
 * It should be used near the root of your application to ensure
 * the user's data is properly synced after authentication
 */
export default function Auth0SupabaseSync() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip if Auth0 is still loading or user is not authenticated
    if (isLoading || !isAuthenticated || !user) return;

    // Function to sync Auth0 user with other auth systems
    const syncUserWithAuthSystems = async () => {
      try {
        // Get Auth0 token to use for other auth systems
        const token = await getAccessTokenSilently();

        // Store token in localStorage for API requests
        localStorage.setItem('token', token);

        // 1. Sync with Supabase
        await syncWithSupabase(token);

        // 2. Sync with Pocketbase
        await syncWithPocketbase(token);

        // 3. Check if user needs to connect a bank
        await checkBankConnection();
      } catch (error) {
        console.error("Error in Auth0 sync:", error);
        // Clear token on error
        localStorage.removeItem('token');
      }
    };

    // Function to sync with Supabase
    const syncWithSupabase = async (token: string) => {
      try {
        // Set Supabase auth session with the Auth0 token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token, // Using the same token as refresh for simplicity
        });

        if (sessionError) {
          console.error("Error setting Supabase session:", sessionError);
          return;
        }

        // Check if user exists in Supabase users table
        const { data: existingUser, error: queryError } = await supabase
          .from("users")
          .select("id, has_connected_bank")
          .eq("auth0_id", user.sub)
          .single();

        if (queryError && queryError.code !== "PGRST116") {
          // PGRST116 is "not found"
          console.error(
            "Error checking if user exists in Supabase:",
            queryError
          );
          return;
        }

        if (!existingUser) {
          // User doesn't exist in our database, create them
          const { error: insertError } = await supabase.from("users").insert([
            {
              auth0_id: user.sub,
              email: user.email,
              name: user.name,
              avatar_url: user.picture,
              has_connected_bank: false,
            },
          ]);

          if (insertError) {
            console.error("Error creating user in Supabase:", insertError);
            return;
          }

          console.log("User created in Supabase successfully");
        }
      } catch (error) {
        console.error("Error syncing with Supabase:", error);
      }
    };

    // Function to sync with Pocketbase
    const syncWithPocketbase = async (token: string) => {
      try {
        if (!pocketbase) {
          console.warn("Pocketbase client not initialized");
          return;
        }

        try {
          // Try to authenticate with the token
          await pocketbase
            .collection("users")
            .authWithOAuth2Code("auth0", token, token, null, {
              // Create the user if they don't exist
              createData: {
                email: user.email,
                name: user.name,
                avatar: user.picture,
                emailVisibility: true,
              },
            });

          console.log("User authenticated/created in Pocketbase successfully");
        } catch (error) {
          console.error("Error authenticating with Pocketbase:", error);
        }
      } catch (error) {
        console.error("Error syncing with Pocketbase:", error);
      }
    };

    // Function to check if user has connected a bank and redirect if needed
    const checkBankConnection = async () => {
      try {
        // Check if user has any connected bank accounts
        const { data: userData } = await supabase
          .from("users")
          .select("has_connected_bank")
          .eq("auth0_id", user.sub)
          .single();

        if (userData && !userData.has_connected_bank) {
          // Redirect to bank selection if user hasn't connected a bank
          // Using a small delay to allow the database operation to complete
          setTimeout(() => {
            navigate("/bank-selection");
          }, 500);
        }
      } catch (error) {
        console.error("Error checking user bank connection status:", error);
      }
    };

    // Execute the synchronization
    syncUserWithAuthSystems();
  }, [isLoading, isAuthenticated, user, getAccessTokenSilently, navigate]);

  // This component doesn't render anything
  return null;
}
