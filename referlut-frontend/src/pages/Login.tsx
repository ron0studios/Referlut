import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import BankSelection from "./BankSelection";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingBankStatus, setCheckingBankStatus] = useState(false);
  const [showBankSelection, setShowBankSelection] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    const checkCurrentSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await handleAuthenticatedUser(session);
      }
    };

    checkCurrentSession();
  }, [location]);

  const handleAuthenticatedUser = async (session: any) => {
    setCheckingBankStatus(true);
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

        // Show the BankSelection component instead of redirecting
        setShowBankSelection(true);
        setCheckingBankStatus(false);
        return;
      }

      // Now check if they have connected bank accounts via the API
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
      console.error("Error in checkUserStatus:", e);
      navigate("/profile");
    } finally {
      setCheckingBankStatus(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        await handleAuthenticatedUser(data.session);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-16 w-auto"
            src="/referlut.png"
            alt="Referlut"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-referlut-purple hover:text-referlut-purple/90"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <Label htmlFor="email-address">Email address</Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-referlut-purple hover:text-referlut-purple/90"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-referlut-purple hover:bg-referlut-purple/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
