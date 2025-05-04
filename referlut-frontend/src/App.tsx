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

// Add PublicRoute to redirect logged-in users away from public pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  // Redirect the user to the dashboard page if they are already logged in and have connected their bank account

  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header /> {/* Render Header here */}
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
            <Route path="/profile" element={<Profile />} />
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
                <AuthGuard>
                  <BankCallback />
                </AuthGuard>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SupabaseAuthProvider>
  </QueryClientProvider>
);

export default App;
