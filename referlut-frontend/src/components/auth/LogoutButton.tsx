import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

const LogoutButton = ({ className }: { className?: string }) => {
  const { logout } = useAuth0();

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
