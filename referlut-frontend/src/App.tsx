import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  SupabaseAuthProvider,
  useSupabaseAuth,
} from "./components/auth/SupabaseAuth";
import Header from "./components/Header"; // Import Header
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Dashboard from "./pages/dashboard/Dashboard";
import Marketplace from "./pages/Marketplace"; // Import the new Marketplace page
import BankSelection from "./pages/BankSelection"; // Import BankSelection page
import AuthGuard from "./components/auth/AuthGuard";
import BankCallback from "./pages/BankCallback";
import FullScreenLoader from "./components/FullScreenLoader"; // Import the loader

// Add PublicRoute to redirect logged-in users away from public pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const location = useLocation();

  // Show loader within PublicRoute as well if needed, or rely on AppContent's loader
  if (isLoading) {
    // Return null or a minimal loader, as AppContent handles the main one
    return null;
    // Or return a smaller loader if preferred:
    // return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-referlut-purple"></div></div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

// New component to handle the main app structure and loading state
const AppContent = () => {
  // Use both isLoading (initial auth) and isCheckingBankStatus
  const { isLoading: isAuthLoading, isCheckingBankStatus } = useSupabaseAuth();
  // Combine loading states: show loader if either initial auth or bank status check is happening
  const isAppLoading = isAuthLoading || isCheckingBankStatus;

  return (
    <BrowserRouter>
      {/* Show FullScreenLoader if the app is loading */}
      {isAppLoading && <FullScreenLoader />}
      {/* Apply fade-in effect to the main content once loading is done */}
      <div
        className={
          isAppLoading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-500 ease-in-out"
        }
      >
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Index />
              </PublicRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/marketplace"
            element={
              <AuthGuard>
                <Marketplace />
              </AuthGuard>
            }
          />
          {/* Add BankSelection route */}
          <Route
            path="/bank-selection"
            element={
              <AuthGuard>
                <BankSelection />
              </AuthGuard>
            }
          />
          <Route
            path="/bank-callback"
            element={
              // AuthGuard is still needed here to ensure user context is available,
              // but the redirect logic inside AuthGuard is now modified to allow this route.
              <AuthGuard>
                <BankCallback />
              </AuthGuard>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent /> {/* Use the new AppContent component */}
      </TooltipProvider>
    </SupabaseAuthProvider>
  </QueryClientProvider>
);

export default App;
