import React from "react";
import { X, MessageCircle, User, ExternalLink, CreditCard } from "lucide-react";
import { Offer } from "../types";

interface OfferDetailsModalProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
  onMessageOwner: () => void;
}

const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  offer,
  isOpen,
  onClose,
  onMessageOwner,
}) => {
  if (!isOpen) return null;

  const isLoyalty = offer.type === "loyalty";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">
            {offer.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-6">
            <img
              src={offer.logo}
              alt={offer.brand}
              className="w-16 h-16 rounded-lg object-cover mr-4"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {offer.brand}
              </h3>
              <p className="text-gray-600">
                {isLoyalty ? (
                  <span className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-1" />
                    Loyalty Program
                  </span>
                ) : (
                  `${offer.type.charAt(0).toUpperCase() + offer.type.slice(1)} Offer`
                )}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">
                {isLoyalty ? "Program Details" : "Offer Details"}
              </h4>
              <p className="text-gray-600">{offer.description}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">
                {isLoyalty ? "Benefits" : "How it works"}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {isLoyalty && (
                  <ul className="list-disc list-inside space-y-2">
                    <li>Earn points with every purchase</li>
                    <li>Exclusive member-only offers and deals</li>
                    <li>Early access to new products and promotions</li>
                    <li>Special birthday rewards and anniversary bonuses</li>
                  </ul>
                )}
                {offer.type === "referral" && (
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Pay the referral fee (£{offer.price})</li>
                    <li>Receive the unique referral code</li>
                    <li>Sign up using the referral code</li>
                    <li>
                      Complete any required actions to qualify for the reward
                    </li>
                  </ol>
                )}
                {offer.type === "charity" && (
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Join the charity pool</li>
                    <li>Contribute your share</li>
                    <li>Track the collective donation impact</li>
                    <li>Receive updates on the charitable cause</li>
                  </ol>
                )}
              </div>
            </div>

            {!isLoyalty && (
              <div>
                <h4 className="text-lg font-semibold mb-2">
                  Current Participants
                </h4>
                <div className="flex -space-x-2">
                  {[...Array(offer.used)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  ))}
                  {offer.total - offer.used > 0 && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        +{offer.total - offer.used}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-6 flex justify-between items-center">
          {isLoyalty ? (
            <div>
              <p className="text-sm text-gray-600">Membership fee</p>
              <p className="text-lg font-semibold">
                {offer.price > 0 ? `£${offer.price}/month` : "FREE"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600">Spots Available</p>
              <p className="text-lg font-semibold">
                {offer.total - offer.used} of {offer.total}
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            {!isLoyalty && (
              <button
                onClick={onMessageOwner}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message Owner
              </button>
            )}
            <button
              className={`px-6 py-2 ${isLoyalty ? "bg-purple-500 hover:bg-purple-600" : "bg-blue-500 hover:bg-blue-600"} text-white rounded-lg`}
            >
              {isLoyalty ? (
                <span className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </span>
              ) : (
                "Join Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailsModal;
