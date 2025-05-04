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
import { getCookie } from "@/lib/cookies"; // Add this import
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
import { useLocation } from "react-router-dom";

function Marketplace() {
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<
    "referral" | "loyalty" | "charity"
  >("referral");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userOffers, setUserOffers] = useState<Offer[]>([]); // Add this new state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [dataReady, setDataReady] = useState(!isDataLoading);
  const [loading, setLoading] = useState(isDataLoading);
  const [page, setPage] = useState(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const location = useLocation();

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

  // Effect to handle tab changes
  // Add this effect to load user offers from cookies
  useEffect(() => {
    const loadUserOffers = () => {
      const userOffersCookie = getCookie("userOffers");
      if (userOffersCookie) {
        try {
          const parsedOffers = JSON.parse(userOffersCookie);
          // Convert date strings back to Date objects
          const processedOffers = parsedOffers.map((offer: any) => ({
            ...offer,
            createdAt: new Date(offer.createdAt),
          }));
          setUserOffers(processedOffers);
        } catch (error) {
          console.error("Error parsing user offers from cookie:", error);
        }
      }
    };

    loadUserOffers();
    // Also listen for storage events (in case offers are added in another tab)
    window.addEventListener("storage", loadUserOffers);
    return () => window.removeEventListener("storage", loadUserOffers);
  }, []);

  // Effect to handle tab changes and include user offers
  useEffect(() => {
    if (dataReady) {
      // Include brands from user offers
      const allBrands = new Set([
        ...getAllBrands(),
        ...userOffers.map((offer) => offer.brand),
      ]);
      setBrands(Array.from(allBrands));

      // Reset to first page when tab changes
      setPage(0);

      if (activeTab !== "referral") {
        const filteredOffers = getFilteredOffers(activeTab, brandFilter);
        // Add user offers of the current tab type, filtered by brand if needed
        const filteredUserOffers = userOffers.filter(
          (offer) =>
            offer.type === activeTab &&
            (!brandFilter ||
              offer.brand.toLowerCase().includes(brandFilter.toLowerCase())),
        );
        // Combine system and user offers
        setOffers([...filteredOffers, ...filteredUserOffers]);
      } else {
        handlePageChange(0);
      }
    }
  }, [activeTab, brandFilter, dataReady, userOffers]);

  // Effect to check for loading offers
  useEffect(() => {
    if (offers.length > 0 && activeTab === "referral") {
      const hasLoadingContent = offers.some(
        (offer) => offer.isTitleLoading || offer.isTotalLoading,
      );

      if (hasLoadingContent) {
        const intervalId = setInterval(() => {
          setOffers([...offers]);

          if (!offers.some((o) => o.isTitleLoading || o.isTotalLoading)) {
            console.log("All content loaded!");
          }
        }, 500);

        return () => {
          clearInterval(intervalId);
        };
      }
    }
  }, [offers, activeTab]);

  // Function to handle page changes - modified to include user offers
  const handlePageChange = async (newPage: number) => {
    if (activeTab === "referral") {
      setLoading(true);
      const pageOffers = await loadPage(newPage);

      // Apply brand filter to API-loaded offers if needed
      const filteredPageOffers = brandFilter
        ? pageOffers.filter((offer) =>
            offer.brand.toLowerCase().includes(brandFilter.toLowerCase()),
          )
        : pageOffers;

      // Add user referral offers, filtered by brand if needed
      const userReferralOffers = userOffers.filter(
        (offer) =>
          offer.type === "referral" &&
          (!brandFilter ||
            offer.brand.toLowerCase().includes(brandFilter.toLowerCase())),
      );

      setOffers([...filteredPageOffers, ...userReferralOffers]);
      setPage(newPage);
      setLoading(false);
    }
  };

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

  // Use offers from navigation state if present
  const offersToShow = location.state?.offers || offers;

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

              {/* Top Pagination - Added here */}
              {activeTab === "referral" && totalPages > 1 && (
                <div className="mb-6 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isLoadingPage}
                  />
                </div>
              )}

              <OffersGrid offers={offersToShow} onOfferClick={handleOfferClick} />

              {/* Bottom Pagination - Already exists */}
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
