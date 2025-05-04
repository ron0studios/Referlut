import React, { useCallback } from "react";
import { useSupabaseAuth } from "@/components/auth/SupabaseAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SignupButton from "@/components/auth/SignupButton";
import LoginButton from "@/components/auth/LoginButton";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";

const Signup = () => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  const handleAuthenticatedUser = useCallback(
    async (session: any) => {
      try {
        const user = session.user;

        // Check if user exists in Supabase users table
        const { data: userData, error } = await supabase
          .from("user_settings")
          .select("has_connected_bank")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking user status:", error);
          navigate("/profile");
          return;
        }

        // If user doesn't exist or hasn't connected bank, redirect to bank selection
        if (!userData || !userData.has_connected_bank) {
          // Create user if they don't exist
          if (!userData) {
            const { error: insertError } = await supabase
              .from("user_settings")
              .insert([
                {
                  user_id: user.id,
                  has_connected_bank: false,
                },
              ]);
            if (insertError) {
              console.error("Error creating user:", insertError);
            }
          }

          // Check API status as a final confirmation
          try {
            const hasBankConnected = await apiClient.banking.hasConnectedBank();
            if (hasBankConnected) {
              // API says connected, update DB if needed and go to dashboard
              if (userData && !userData.has_connected_bank) {
                await supabase
                  .from("user_settings")
                  .update({ has_connected_bank: true })
                  .eq("user_id", user.id);
              }
              navigate("/dashboard");
            } else {
              // Not connected according to API, redirect to bank selection
              navigate("/bank-selection");
            }
          } catch (apiError) {
            console.error("Error checking bank connection via API:", apiError);
            // API failed, rely on DB check - redirect to bank selection
            navigate("/bank-selection");
          }
          return; // Stop execution after redirection
        }

        // User exists and has_connected_bank is true in DB, double check with API
        try {
          const hasBankConnected = await apiClient.banking.hasConnectedBank();
          if (hasBankConnected) {
            // Confirmed connected, go to dashboard
            navigate("/dashboard");
          } else {
            // DB says connected, but API says no. Update DB and redirect.
            await supabase
              .from("user_settings")
              .update({ has_connected_bank: false })
              .eq("user_id", user.id);
            navigate("/bank-selection");
          }
        } catch (apiError) {
          console.error("Error checking bank connection via API:", apiError);
          // API failed, proceed based on DB info (which is true)
          navigate("/dashboard");
        }
      } catch (e) {
        console.error("Error in handleAuthenticatedUser:", e);
        navigate("/profile");
      }
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center justify-center">
            <div className="h-10 w-10 bg-referlut-purple rounded-lg mr-2"></div>
            <span className="text-2xl font-bold bg-gradient-to-r from-referlut-purple to-referlut-orange bg-clip-text text-transparent">
              Referlut
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Join Referlut to start saving and sharing
          </p>
        </div>

        <div className="space-y-4">
          <SignupButton className="w-full bg-referlut-orange hover:bg-referlut-orange/90 text-white h-12 text-base" />

          <div className="text-center mt-4 text-sm text-gray-600">
            Already have an account?
          </div>

          <LoginButton
            className="w-full border border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10 h-12 text-base"
            variant="outline"
          />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          By signing up, you agree to our{" "}
          <Link
            to="/terms"
            className="font-medium text-referlut-purple hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="font-medium text-referlut-purple hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
