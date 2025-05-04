// In AuthGuard.tsx
import { useSupabaseAuth } from "./SupabaseAuth";
import { Navigate, useLocation } from "react-router-dom";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
