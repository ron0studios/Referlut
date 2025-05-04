import React, { useState } from "react";
import { X } from "lucide-react";
import { setCookie, getCookie } from "../../lib/cookies";
import { Offer } from "../../types/marketplace/marketplace";
import { useToast } from "@/hooks/use-toast";

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "referral" | "loyalty" | "charity";
}

const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  isOpen,
  onClose,
  activeTab,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    brand: "",
    title: "",
    description: "",
    total: 1,
    price: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value, 10) || 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new offer object
    const newOffer: Offer = {
      id: `user-${Date.now()}`, // Generate a unique ID
      brand: formData.brand,
      type: activeTab,
      title: formData.title,
      description: formData.description,
      used: 0,
      total: formData.total,
      price: formData.price,
      logo: "https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg", // Default logo
      createdAt: new Date(),
    };

    // Get existing user offers from cookies or initialize empty array
    const existingOffersCookie = getCookie("userOffers");
    let existingOffers: Offer[] = [];

    if (existingOffersCookie) {
      try {
        const parsed = JSON.parse(existingOffersCookie);
        // Make sure dates are properly converted back to Date objects
        existingOffers = parsed.map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt),
        }));
      } catch (error) {
        console.error("Error parsing cookie data:", error);
      }
    }

    // Add new offer to array
    const updatedOffers = [...existingOffers, newOffer];

    // Save updated offers array to cookie
    setCookie("userOffers", JSON.stringify(updatedOffers));

    // Show success toast
    toast({
      title: "Offer Created!",
      description:
        "Your offer has been successfully created and will appear in the marketplace.",
      variant: "default",
    });

    // Close modal and reset form
    onClose();
    setFormData({
      brand: "",
      title: "",
      description: "",
      total: 1,
      price: 0,
    });
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (activeTab) {
      case "referral":
        return "Create New Referral";
      case "loyalty":
        return "Create New Loyalty Card Share";
      case "charity":
        return "Create New Charity Pool";
      default:
        return "Create New Offer";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Brand Name
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Offer Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="total"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Spots
                </label>
                <input
                  type="number"
                  id="total"
                  name="total"
                  min="1"
                  value={formData.total}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price (£)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfferModal;
