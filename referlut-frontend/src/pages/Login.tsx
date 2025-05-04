import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthenticatedUser = async (session: any) => {
    setIsLoading(true);
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
                user_: user.id,
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
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
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
