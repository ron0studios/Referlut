import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

const LogoutButton = ({ className }: { className?: string }) => {
  const { logout } = useAuth0();

  return (
    <Button
      className={className}
      onClick={() =>
        logout({
          logoutParams: { returnTo: window.location.origin },
        })
      }
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;
