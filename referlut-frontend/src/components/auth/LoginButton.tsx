import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

const LoginButton = ({
  className,
  variant,
}: {
  className?: string;
  variant?: string;
}) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      className={`${className} ${variant}`}
      onClick={() => loginWithRedirect()}
    >
      Log In
    </Button>
  );
};

export default LoginButton;
