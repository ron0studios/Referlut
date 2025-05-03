import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import BrandFilter from "./components/BrandFilter";
import OffersGrid from "./components/OffersGrid";
import MessagesPanel from "./components/MessagesPanel";
import CreateOfferModal from "./components/CreateOfferModal";
import OfferDetailsModal from "./components/OfferDetailsModal";
import { getFilteredOffers, getAllBrands, currentUser } from "./data/mockData";
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

  useEffect(() => {
    setBrands(getAllBrands());
    const filteredOffers = getFilteredOffers(activeTab, brandFilter);
    setOffers(filteredOffers);
  }, [activeTab, brandFilter]);

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

  const handleMessageOwner = () => {
    // This will be called after sending a message
    console.log("Message sent to owner");
    // In a real app, you might want to show a notification or update the UI
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
          <div className="mb-6">
            <BrandFilter brands={brands} onFilterChange={handleFilterChange} />
          </div>

          <OffersGrid offers={offers} onOfferClick={handleOfferClick} />
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
          onMessageOwner={handleMessageOwner}
        />
      )}
    </div>
  );
}

export default App;
