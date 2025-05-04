import React, { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  User,
  ExternalLink,
  CreditCard,
  Send,
} from "lucide-react";
import { Offer } from "../../types/marketplace/marketplace";
import { useToast } from "@/hooks/use-toast";
import { useAuth0 } from "@auth0/auth0-react";
import {
  generateRandomUser,
  addMessage,
  addAIResponse,
} from "../../utils/messages";

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
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [userAvatars, setUserAvatars] = useState<string[]>([]);
  const { user } = useAuth0();
  const { toast } = useToast();

  const isLoyalty = offer.type === "loyalty";

  // Generate random avatars when the modal opens
  useEffect(() => {
    if (isOpen && !isLoyalty) {
      generateRandomAvatars(offer.used);
    }
  }, [isOpen, offer.used, isLoyalty]);

  // Function to generate random avatars
  const generateRandomAvatars = (count: number) => {
    const avatars: string[] = [];

    // Sample avatar URLs from Pexels (consistent with your existing image sources)
    const sampleAvatarUrls = [
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      // ...rest of the avatar URLs
    ];

    // For additional variety, we can use UI Avatars API for some avatars
    const generateUIAvatar = (index: number) => {
      const colors = [
        "1abc9c",
        "2ecc71",
        "3498db",
        "9b59b6",
        "f1c40f",
        "e67e22",
        "e74c3c",
        "95a5a6",
      ];
      const colorIndex = Math.floor(Math.random() * colors.length);
      const names = [
        "Alex",
        "Jamie",
        "Taylor",
        "Jordan",
        "Casey",
        "Riley",
        "Morgan",
        "Quinn",
      ];
      const name = names[index % names.length];
      return `https://ui-avatars.com/api/?name=${name}&background=${colors[colorIndex]}&color=fff&size=128`;
    };

    // Create the required number of avatars
    for (let i = 0; i < count; i++) {
      // 70% chance of using a sample avatar, 30% chance of using a generated one
      if (Math.random() < 0.7 && sampleAvatarUrls.length > 0) {
        const randomIndex = Math.floor(Math.random() * sampleAvatarUrls.length);
        avatars.push(sampleAvatarUrls[randomIndex]);
      } else {
        avatars.push(generateUIAvatar(i));
      }
    }

    setUserAvatars(avatars);
  };

  // Decode HTML entities and make it safe for rendering
  const decodeHTML = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;

    // Create a user object from the auth0 user
    const currentUser = {
      id: user?.sub || "anonymous",
      name: user?.name || "Anonymous User",
      avatar: user?.picture || "https://via.placeholder.com/100",
      unreadMessages: 0,
    };

    // Generate a random user as the offer owner
    const offerOwner = generateRandomUser();

    // Add the message to conversations
    const conversation = addMessage(
      currentUser,
      offerOwner,
      messageText,
      offer,
    );

    // Show toast notification
    toast({
      title: "Message Sent",
      description: `Your message to ${offerOwner.name} has been sent. Check your messages for a response soon.`,
    });

    // Generate and add AI response (simulate delay)
    setTimeout(() => {
      // Call the async function without awaiting it
      addAIResponse(conversation, currentUser, offer).catch((error) => {
        console.error("Error generating AI response:", error);
        toast({
          title: "Response Error",
          description:
            "There was an error generating a response. Please try again later.",
          variant: "destructive",
        });
      });
    }, 2000);

    // Clear message and close modal
    setMessageText("");
    setIsMessageModalOpen(false);
    onMessageOwner();
  };

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
              <div
                className="text-gray-600 html-content"
                dangerouslySetInnerHTML={{
                  __html: decodeHTML(offer.description),
                }}
              />
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
                  <>
                    {offer.instructions ? (
                      // Display actual instructions if available
                      <div
                        className="text-gray-700 mb-4 html-content"
                        dangerouslySetInnerHTML={{
                          __html: decodeHTML(offer.instructions),
                        }}
                      />
                    ) : (
                      // Fallback to generic steps
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Pay the referral fee (£{offer.price})</li>
                        <li>Receive the unique referral code</li>
                        <li>Sign up using the referral code</li>
                        <li>
                          Complete any required actions to qualify for the
                          reward
                        </li>
                      </ol>
                    )}
                  </>
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
                  {/* Map through our generated avatars instead of using a generic placeholder */}
                  {userAvatars.map((avatar, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                    >
                      <img
                        src={avatar}
                        alt={`User ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
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
                onClick={() => setIsMessageModalOpen(true)}
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

      {/* Message Composition Modal */}
      {isMessageModalOpen && (
        <div
          className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">
                Message to {offer.brand} Referral Owner
              </h3>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={`Hi there! I'm interested in your ${offer.brand} ${offer.type} offer...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              ></textarea>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  className={`px-4 py-2 rounded-md flex items-center ${messageText.trim() ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-300 text-white cursor-not-allowed"}`}
                  disabled={!messageText.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetailsModal;
