import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";

interface Bank {
  id: string;
  name: string;
  logo: string;
}

export default function BankSelection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // Check if user has already connected a bank account
  useEffect(() => {
    const checkUserOnboarding = async () => {
      if (!isAuthLoading && isAuthenticated && user) {
        try {
          // Check if the user has already connected a bank account
          const { data, error } = await supabase
            .from("users")
            .select("has_connected_bank")
            .eq("auth0_id", user.sub)
            .single();

          if (error) {
            console.error("Error checking user status:", error);
            return;
          }

          // If user exists but hasn't connected a bank, show the modal
          if (data && !data.has_connected_bank) {
            setIsOpen(true);
          } else if (!data) {
            // If user doesn't exist in our database yet, create them
            const { error: insertError } = await supabase.from("users").insert([
              {
                auth0_id: user.sub,
                email: user.email,
                name: user.name,
                has_connected_bank: false,
              },
            ]);

            if (insertError) {
              console.error("Error creating user:", insertError);
              return;
            }

            setIsOpen(true);
          } else {
            // User already has a connected bank, redirect to dashboard
            navigate("/dashboard");
          }
        } catch (err) {
          console.error("Error in checkUserOnboarding:", err);
        }
      }
    };

    checkUserOnboarding();
  }, [isAuthLoading, isAuthenticated, user, navigate]);

  // Fetch available banks when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const fetchBanks = async () => {
        setIsLoading(true);
        try {
          // Use the apiClient to fetch available banks
          const bankData = await apiClient.banking.getInstitutions("GB");

          // Transform the data to our Bank interface format
          const formattedBanks = bankData.map((bank: any) => ({
            id: bank.id,
            name: bank.name,
            logo:
              bank.logo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                bank.name
              )}&background=random`,
          }));

          setBanks(formattedBanks);
        } catch (err: any) {
          console.error("Error fetching banks:", err);
          setError(err.message || "Failed to load available banks");
        } finally {
          setIsLoading(false);
        }
      };

      fetchBanks();
    }
  }, [isOpen]);

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
  };

  const handleConnectBank = async () => {
    if (!selectedBank || !user) return;

    setIsConnecting(true);

    try {
      // Generate redirect URL for the callback
      const redirectUrl = `${window.location.origin}/bank-callback`;

      // Call API to initiate bank connection
      const response = await apiClient.banking.initiateConnection({
        institution_id: selectedBank,
        user_id: user.sub as string,
        redirect_url: redirectUrl,
      });

      if (response.link) {
        // Open the consent link in a new window
        window.open(response.link, "_blank");

        // Show a message that we're waiting for the user to complete authentication
        // We'll keep the modal open, but update the UI to show we're waiting
        setIsConnecting(false);
        setError(
          "Please complete the authentication process in the new window. This page will update once you're done."
        );
      } else {
        throw new Error("No connection link received from the API");
      }
    } catch (err: any) {
      console.error("Error connecting to bank:", err);
      setError(err.message || "Failed to initiate bank connection");
      setIsConnecting(false);
    }
  };

  const handleSkip = async () => {
    // We'll update the database to mark that the user has seen this step
    // even if they chose to skip it
    if (user) {
      await supabase
        .from("users")
        .update({ has_connected_bank: true })
        .eq("auth0_id", user.sub);
    }

    setIsOpen(false);
    navigate("/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Connect Your Bank Account</DialogTitle>
          <DialogDescription>
            Connect your bank account to get personalized financial insights and
            recommendations. Your data is secure and we only have read access.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2">Loading available banks...</span>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={() => setError(null)} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {banks.map((bank) => (
              <Card
                key={bank.id}
                className={`cursor-pointer transition-all ${
                  selectedBank === bank.id
                    ? "ring-2 ring-blue-500 shadow-md"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleBankSelect(bank.id)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <div className="relative h-12 w-12 mb-3">
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="object-contain h-full w-full"
                    />
                    {selectedBank === bank.id && (
                      <CheckCircle2 className="absolute -top-2 -right-2 h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <h3 className="font-medium text-center text-sm">
                    {bank.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button
            onClick={handleConnectBank}
            disabled={!selectedBank || isConnecting || !!error}
            className="bg-referlut-purple hover:bg-referlut-purple/90"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Bank"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
