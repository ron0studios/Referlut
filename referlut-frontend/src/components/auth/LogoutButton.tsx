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

  return (
    <Button className={className} variant="outline" onClick={handleSignOut}>
      Log Out
    </Button>
  );
};

export default LogoutButton;
