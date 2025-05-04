import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Link,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current session from Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Not authenticated, redirect to login
          navigate("/login");
          return;
        }

        // Save user data
        setUser(session.user);

        // Get access token
        const token = session.access_token;

        // Get user profile from backend API
        const profile = await apiClient.users.getProfile();
        setUserProfile(profile);

        // If user hasn't yet connected a bank account, redirect to bank selection
        if (!profile.has_connected_bank && profile.exists) {
          // Double-check with the /banking/status endpoint
          const bankStatus = await apiClient.banking.getBankStatus();

          if (
            !bankStatus.has_connected_bank &&
            window.location.pathname === "/profile"
          ) {
            navigate("/bank-selection");
          }
        }
      } catch (err: any) {
        console.error("Error loading user profile:", err);
        setError(err.message || "Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleConnectBank = () => {
    navigate("/bank-selection");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Show loader while data is being fetched
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-referlut-purple" />
      </div>
    );
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-referlut-purple hover:bg-referlut-purple/90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Create user initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        <div className="grid gap-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 items-start">
              <Avatar className="h-24 w-24 border">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.user_metadata?.name || "User"}
                />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>

              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Name</h3>
                  <p className="font-medium">
                    {user?.user_metadata?.name || user?.email?.split("@")[0]}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Email</h3>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Bank Account
                  </h3>
                  <div className="flex items-center gap-2">
                    {userProfile?.has_connected_bank ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-700">
                          Connected
                        </span>
                        <span className="text-sm text-gray-500">
                          ({userProfile.accounts_count || 0} accounts)
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-700">
                          Not Connected
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {!userProfile?.has_connected_bank && (
                <Button
                  onClick={handleConnectBank}
                  className="w-full sm:w-auto justify-start"
                  variant="outline"
                >
                  <Link className="mr-2 h-4 w-4" />
                  Connect Bank Account
                </Button>
              )}
              {userProfile?.has_connected_bank && (
                <Button
                  onClick={handleConnectBank}
                  className="w-full sm:w-auto justify-start"
                  variant="outline"
                >
                  <Link className="mr-2 h-4 w-4" />
                  Manage Bank Connections
                </Button>
              )}
              <Button
                onClick={() => navigate("/settings")}
                className="w-full sm:w-auto justify-start"
                variant="outline"
              >
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
              <Button
                onClick={handleLogout}
                className="w-full sm:w-auto justify-start"
                variant="outline"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
