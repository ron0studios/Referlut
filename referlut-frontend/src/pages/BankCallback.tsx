import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

/**
 * This component handles the callback from the bank authentication flow
 * It processes the callback parameters and makes a request to complete the bank connection
 */
export default function BankCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>(
    "Processing your bank connection..."
  );
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processCallback = async () => {
      if (isAuthLoading || !isAuthenticated || !user) {
        return;
      }

      try {
        // Get the ref query parameter (which should be the user's ID)
        const params = new URLSearchParams(location.search);
        const ref = params.get("ref") || user.sub;

        if (!ref) {
          throw new Error("Missing required reference parameter");
        }

        // Call the API to complete the bank connection
        const result = await apiClient.banking.completeConnection(ref);

        if (result.status === "success") {
          // Update the user's bank connection status in Supabase
          await supabase
            .from("users")
            .update({ has_connected_bank: true })
            .eq("auth0_id", user.sub);

          setStatus("success");
          setMessage("Your bank account has been successfully connected!");
        } else {
          throw new Error(
            result.message || "Failed to complete bank connection"
          );
        }
      } catch (error: any) {
        console.error("Error in bank callback:", error);
        setStatus("error");
        setMessage(
          error.message ||
            "An error occurred while processing your bank connection"
        );
      }
    };

    processCallback();
  }, [isAuthLoading, isAuthenticated, user, location.search]);

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const handleRetry = () => {
    navigate("/bank-selection");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <div className="flex flex-col items-center text-center">
          {status === "loading" ? (
            <>
              <Loader2 className="h-16 w-16 text-referlut-purple animate-spin mb-4" />
              <h2 className="text-2xl font-bold mb-2">Processing</h2>
            </>
          ) : status === "success" ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-green-700">
                Success!
              </h2>
            </>
          ) : (
            <>
              <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-red-700">
                Connection Failed
              </h2>
            </>
          )}

          <p className="text-gray-600 mb-6">{message}</p>

          {status === "loading" ? (
            <p className="text-sm text-gray-500">
              This may take a few moments...
            </p>
          ) : status === "success" ? (
            <Button
              onClick={handleContinue}
              className="w-full bg-referlut-purple hover:bg-referlut-purple/90"
            >
              Continue to Dashboard
            </Button>
          ) : (
            <div className="space-y-3 w-full">
              <Button
                onClick={handleRetry}
                className="w-full bg-referlut-purple hover:bg-referlut-purple/90"
              >
                Try Again
              </Button>
              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full"
              >
                Skip for Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
