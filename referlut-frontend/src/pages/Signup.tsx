import React, { useEffect, useState, useCallback } from "react";
import { useSupabaseAuth } from "@/components/auth/SupabaseAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SignupButton from "@/components/auth/SignupButton";
import LoginButton from "@/components/auth/LoginButton";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import BankSelection from "./BankSelection";

const Signup = () => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [showBankSelection, setShowBankSelection] = useState(false);
  const [checkingBankStatus, setCheckingBankStatus] = useState(false);

  const handleAuthenticatedUser = useCallback(
    async (session: any) => {
      try {
        const user = session.user;

        // Check if user exists in Supabase users table
        const { data: userData, error } = await supabase
          .from("users")
          .select("has_connected_bank")
          .eq("auth_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking user status:", error);
          navigate("/profile");
          return;
        }

        // If user doesn't exist in users table yet, create them
        if (!userData) {
          const { error: insertError } = await supabase.from("users").insert([
            {
              auth_id: user.id,
              email: user.email,
              name: user.email?.split("@")[0] || "User",
              has_connected_bank: false,
            },
          ]);

          if (insertError) {
            console.error("Error creating user:", insertError);
          }

          // Show the BankSelection component
          setShowBankSelection(true);
          return;
        }

        // Check if they have connected bank accounts via the API
        try {
          const hasBankConnected = await apiClient.banking.hasConnectedBank();

          if (hasBankConnected) {
            // User has connected banks, redirect to dashboard
            navigate("/dashboard");
          } else if (userData.has_connected_bank) {
            // User has marked as connected in Supabase but no actual accounts found
            // Update Supabase to reflect reality
            await supabase
              .from("users")
              .update({ has_connected_bank: false })
              .eq("auth_id", user.id);

            // Show the BankSelection component
            setShowBankSelection(true);
          } else {
            // User hasn't connected bank, show BankSelection
            setShowBankSelection(true);
          }
        } catch (apiError) {
          console.error("Error checking bank connection via API:", apiError);

          // If API call fails, use the Supabase data as fallback
          if (userData.has_connected_bank) {
            navigate("/dashboard");
          } else {
            setShowBankSelection(true);
          }
        }
      } catch (e) {
        console.error("Error in handleAuthenticatedUser:", e);
        navigate("/profile");
      }
    },
    [navigate]
  );

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isAuthenticated) {
        setCheckingBankStatus(true);
        try {
          // Get current user from Supabase
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            await handleAuthenticatedUser(session);
          }
        } catch (err) {
          console.error("Error checking authentication status:", err);
          navigate("/profile");
        } finally {
          setCheckingBankStatus(false);
        }
      }
    };

    checkAuthStatus();
  }, [isAuthenticated, navigate, handleAuthenticatedUser]);

  const handleBankSelectionClose = () => {
    setShowBankSelection(false);
    navigate("/dashboard");
  };

  if (isLoading || checkingBankStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  // Show the bank selection component when needed
  if (showBankSelection) {
    return (
      <BankSelection forceOpen={true} onClose={handleBankSelectionClose} />
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
