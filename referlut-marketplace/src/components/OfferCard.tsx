import React from "react";
import { Bookmark, CreditCard } from "lucide-react";
import { Offer } from "../types";

interface OfferCardProps {
  offer: Offer;
  onClick: () => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onClick }) => {
  const isLoyalty = offer.type === "loyalty";
  const isFeatured = offer.featured;

  // The availability ratio is only meaningful for referral / charity
  const availabilityRatio = `${offer.used}/${offer.total}`;
  const availabilityPercentage = (offer.used / offer.total) * 100;
  const getAvailabilityColor = () => {
    if (availabilityPercentage < 50) return "bg-green-500";
    if (availabilityPercentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Decode HTML entities and make it safe for rendering
  const decodeHTML = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1 cursor-pointer ${
        isFeatured
          ? "ring-4 ring-amber-300" // Yellow border for featured offers
          : "ring-1 ring-gray-100"
      }`}
    >
      {/* Top section with brand name and icon */}
      <div className="relative p-4 border-b">
        {/* Image as rounded square in top right */}
        <div className="absolute top-2 right-2 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm">
          <img
            src={
              offer.logo ||
              "https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            }
            alt={offer.brand}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Brand name */}
        <div className="flex items-center pr-20">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{offer.brand}</h3>
            <div className="text-xs text-gray-500 capitalize">
              {offer.type} offer
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          {/* Title with loading state */}
          <h3
            className={`font-semibold text-gray-800 line-clamp-1 ${offer.isTitleLoading ? "animate-pulse blur-sm" : ""}`}
          >
            {offer.title}
          </h3>
          <button
            className="text-gray-400 hover:text-blue-500 flex-shrink-0 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              // Handle bookmark
            }}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Description with fade effect */}
        <div className="relative flex-1 mb-4">
          <div
            className="text-gray-600 text-sm overflow-hidden max-h-[4.5rem] html-content"
            dangerouslySetInnerHTML={{ __html: decodeHTML(offer.description) }}
          />

          {/* Fade-out gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>

        <div className="mt-auto">
          {!isLoyalty && (
            <>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-500">
                  Availability
                </span>
                {/* Total with loading state */}
                <span
                  className={`text-sm font-medium ${offer.isTotalLoading ? "animate-pulse blur-sm" : ""}`}
                >
                  {availabilityRatio}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full ${getAvailabilityColor()} ${offer.isTotalLoading ? "animate-pulse opacity-50" : ""}`}
                  style={{
                    width: `${Math.min(100, (offer.used / offer.total) * 100)}%`,
                  }}
                ></div>
              </div>
            </>
          )}

          {isLoyalty && (
            <div className="flex items-center mb-4 text-blue-600">
              <CreditCard className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Loyalty Program</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">
              {isLoyalty
                ? offer.price > 0
                  ? `£${offer.price}/mo`
                  : "FREE"
                : offer.price > 0
                  ? `£${offer.price}`
                  : "FREE"}
            </span>
            <button
              className={`${isLoyalty ? "bg-purple-500 hover:bg-purple-600" : "bg-blue-500 hover:bg-blue-600"} text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200`}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {isLoyalty ? "Learn More" : "View Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
