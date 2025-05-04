import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch available banks on component mount
  useEffect(() => {
    const fetchBanks = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        const bankData = await apiClient.banking.getInstitutions("GB");
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
  }, []); // Run only once on mount

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setError(null); // Clear error when a bank is selected
  };

  const handleConnectBank = async () => {
    if (!selectedBank) return;

    setIsConnecting(true);
    setError(null); // Clear previous errors

    try {
      const redirectUrl = `${window.location.origin}/bank-callback`;
      const response = await apiClient.banking.initiateConnection({
        institution_id: selectedBank,
        redirect_url: redirectUrl,
      });

      if (response.link) {
        // Redirect the current window to the bank's auth page
        window.location.href = response.link;
      } else {
        throw new Error("No connection link received from the API");
      }
    } catch (err: any) {
      console.error("Error connecting to bank:", err);
      setError(err.message || "Failed to initiate bank connection");
      setIsConnecting(false);
    }
    // No need to set isConnecting back to false if redirecting
  };

  // Render as a full page, not a dialog
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {/* Header Section */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Connect Your Bank Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your bank account to get personalized financial insights and
            recommendations. Your data is secure and we only have read access.
          </p>
        </div>

        {/* Bank Selection Section */}
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2">Loading available banks...</span>
          </div>
        ) : error && !banks.length ? ( // Show error prominently if loading failed
          <div className="text-center p-4">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()} variant="outline">
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
                    ? "ring-2 ring-referlut-purple shadow-md"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleBankSelect(bank.id)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4 h-full">
                  <div className="relative h-12 w-12 mb-3 flex-shrink-0">
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="object-contain h-full w-full"
                    />
                    {selectedBank === bank.id && (
                      <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-green-500 bg-white rounded-full" />
                    )}
                  </div>
                  <h3 className="font-medium text-center text-sm flex-grow flex items-center">
                    {bank.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Button Section */}
        {error &&
          banks.length > 0 && ( // Show connection error below banks if they loaded
            <div className="text-center text-red-500 mb-4 text-sm">{error}</div>
          )}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleConnectBank}
            disabled={!selectedBank || isConnecting || isLoading}
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
      </div>
    </div>
  );
}
