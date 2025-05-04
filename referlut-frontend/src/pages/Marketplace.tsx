// src/pages/Marketplace.tsx
import { useState, useEffect, useCallback } from "react";
import { useSupabaseAuth } from "@/components/auth/SupabaseAuth";
import Header from "@/components/Header"; // Using main application header
import Navigation from "@/components/marketplace/Navigation";
import BrandFilter from "@/components/marketplace/BrandFilter";
import OffersGrid from "@/components/marketplace/OffersGrid";
import MessagesPanel from "@/components/marketplace/MessagesPanel";
import CreateOfferModal from "@/components/marketplace/CreateOfferModal";
import OfferDetailsModal from "@/components/marketplace/OfferDetailsModal";
import LoadingIndicator from "@/components/marketplace/LoadingIndicator";
import Pagination from "@/components/marketplace/Pagination";
import {
  getFilteredOffers,
  getAllBrands,
  isDataLoading,
  isLoadingPage,
  dataLoadingPromise,
  loadPage,
  currentPage,
  totalPages,
} from "@/data/marketplaceData";
import { Offer } from "@/types/marketplace/marketplace";

function Marketplace() {
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<
    "referral" | "loyalty" | "charity"
  >("referral");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [dataReady, setDataReady] = useState(!isDataLoading);
  const [loading, setLoading] = useState(isDataLoading);
  const [page, setPage] = useState(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initial data load effect
  useEffect(() => {
    const loadData = async () => {
      if (isDataLoading) {
        setLoading(true);
        await dataLoadingPromise;
        setDataReady(true);
        setLoading(false);
        setBrands(getAllBrands());
      }
    };

    loadData();
  }, []);

  // Function to handle page changes
  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (activeTab === "referral") {
        setLoading(true);
        const pageOffers = await loadPage(newPage);
        setOffers(pageOffers);
        setPage(newPage);
        setLoading(false);
      }
    },
    [activeTab]
  ); // Dependencies for useCallback

  // Effect to handle tab changes
  useEffect(() => {
    if (dataReady) {
      setBrands(getAllBrands());
      // Reset to first page when tab changes
      setPage(0);
      // Either use filtered offers for loyalty/charity tabs, or load page 0 for referrals
      if (activeTab !== "referral") {
        const filteredOffers = getFilteredOffers(activeTab, brandFilter);
        setOffers(filteredOffers);
      } else {
        handlePageChange(0);
      }
    }
  }, [activeTab, brandFilter, dataReady, handlePageChange]); // Added handlePageChange

  const handleTabChange = (tab: "referral" | "loyalty" | "charity") => {
    setActiveTab(tab);
    setBrandFilter(null);
  };

  const handleFilterChange = (brand: string | null) => {
    setBrandFilter(brand);
  };

  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include the main Header component */}
      <Header />

      <main className="pt-16">
        {" "}
        {/* Added padding to account for main header */}
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <LoadingIndicator
              message="Loading offers..."
              subMessage="Please wait while we fetch the latest offers."
            />
          ) : (
            <>
              <div className="mb-6">
                <BrandFilter
                  brands={brands}
                  onFilterChange={handleFilterChange}
                  isLoading={isLoadingPage}
                />
              </div>

              <OffersGrid offers={offers} onOfferClick={handleOfferClick} />

              {/* Only show pagination for referral tab and if there are multiple pages */}
              {activeTab === "referral" && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isLoadingPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MessagesPanel
        user={
          user
            ? {
                ...user,
                name: user.email || "Anonymous",
                avatar: user.user_metadata?.avatar_url || "/default-avatar.png",
                unreadMessages: 0,
              }
            : null
        }
      />

      <CreateOfferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        activeTab={activeTab}
      />

      {selectedOffer && (
        <OfferDetailsModal
          offer={selectedOffer}
          isOpen={!!selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onMessageOwner={() => console.log("Message sent")}
        />
      )}
    </div>
  );
}

export default Marketplace;
