import React from "react";
import { useSupabaseAuth } from "./SupabaseAuth";
import { Button } from "@/components/ui/button";

const LogoutButton = ({ className }: { className?: string }) => {
  const { signOut } = useSupabaseAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect will happen automatically via auth state change
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');

    // Logout from Auth0
    logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  return (
    <Button
      className={className}
      onClick={handleLogout}
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;
