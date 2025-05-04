// In AuthGuard.tsx
import { useSupabaseAuth } from "./SupabaseAuth";
import { Navigate, useLocation } from "react-router-dom";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading, // Renamed for clarity
    hasConnectedBank,
    isCheckingBankStatus,
  } = useSupabaseAuth();
  const location = useLocation();

  // Show loading indicator while checking auth or bank status
  if (isAuthLoading || isCheckingBankStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, but bank not connected, redirect to bank selection
  // unless already on the bank selection or bank callback page.
  if (
    isAuthenticated &&
    hasConnectedBank === false &&
    location.pathname !== "/bank-selection" &&
    location.pathname !== "/bank-callback" // <-- Ensure this condition is present
  ) {
    return <Navigate to="/bank-selection" state={{ from: location }} replace />;
  }

  // If authenticated and bank is connected (or status is null/loading - handled above),
  // allow access to the requested child component.
  return <>{children}</>;
};

export default AuthGuard;
