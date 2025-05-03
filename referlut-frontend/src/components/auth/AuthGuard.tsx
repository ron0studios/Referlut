// In AuthGuard.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useLocation } from "react-router-dom";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  // Add console logs to debug
  console.log("AuthGuard - isAuthenticated:", isAuthenticated);
  console.log("AuthGuard - isLoading:", isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Make sure this redirect is working correctly
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
