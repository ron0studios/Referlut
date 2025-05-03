import React from "react";
import OfferCard from "./OfferCard";
import { Offer } from "../types";

interface OffersGridProps {
  offers: Offer[];
  onOfferClick: (offer: Offer) => void;
}

const OffersGrid: React.FC<OffersGridProps> = ({ offers, onOfferClick }) => {
  const featuredOffers = offers.filter((offer) => offer.featured);
  const regularOffers = offers.filter((offer) => !offer.featured);

  return (
    <div>
      {featuredOffers.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 grid-flow-dense">
            {featuredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                featured
                onClick={() => onOfferClick(offer)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 grid-flow-dense">
        {regularOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onClick={() => onOfferClick(offer)}
          />
        ))}
      </div>

      {offers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-600">No offers found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or create a new offer.
          </p>
        </div>
      )}
    </div>
  );
};

export default OffersGrid;
