import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

const LoginButton = ({ className }: { className?: string }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button className={className} onClick={() => loginWithRedirect()}>
      Log In
    </Button>
  );
};

export default LoginButton;
