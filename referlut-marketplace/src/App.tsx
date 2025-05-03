import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import BrandFilter from "./components/BrandFilter";
import OffersGrid from "./components/OffersGrid";
import MessagesPanel from "./components/MessagesPanel";
import CreateOfferModal from "./components/CreateOfferModal";
import OfferDetailsModal from "./components/OfferDetailsModal";
import LoadingIndicator from "./components/LoadingIndicator";
import Pagination from "./components/Pagination"; // You'll need to create this
import {
  getFilteredOffers,
  getAllBrands,
  currentUser,
  isDataLoading,
  isLoadingPage,
  dataLoadingPromise,
  loadPage,
  currentPage,
  totalPages,
} from "./data/mockData";
import { Offer } from "./types";

function App() {
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
  }, [activeTab, brandFilter, dataReady]);

  useEffect(() => {
    // Only run this effect when we have offers and when in the referral tab
    if (offers.length > 0 && activeTab === "referral") {
      // Check if any offers are still loading content
      const hasLoadingContent = offers.some(
        (offer) => offer.isTitleLoading || offer.isTotalLoading,
      );

      if (hasLoadingContent) {
        // Set up an interval to periodically update the UI as content loads
        const intervalId = setInterval(() => {
          // Create a new array reference to force a re-render
          // This will reflect any updates that happened in the background processes
          setOffers([...offers]);

          // Log progress for debugging
          const loadingCount = offers.filter(
            (o) => o.isTitleLoading || o.isTotalLoading,
          ).length;
          console.log(`Still loading content for ${loadingCount} offers...`);

          // If everything has finished loading, we can clear the interval
          if (!offers.some((o) => o.isTitleLoading || o.isTotalLoading)) {
            console.log("All content loaded!");
          }
        }, 500); // Check every 500ms

        // Clean up the interval when the component unmounts or dependencies change
        return () => {
          clearInterval(intervalId);
          console.log("Cleared update interval");
        };
      }

      // If nothing is loading, no need for an interval
      console.log("All offer content is already loaded");
    }
  }, [offers, activeTab]); // Dependencies: re-run if offers array or active tab changes

  // Function to handle page changes
  const handlePageChange = async (newPage: number) => {
    if (activeTab === "referral") {
      setLoading(true);
      const pageOffers = await loadPage(newPage);
      setOffers(pageOffers);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} />

      <main>
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

      <MessagesPanel user={currentUser} />

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

export default App;
