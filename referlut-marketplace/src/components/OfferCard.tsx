import React from 'react';
import { Star, Bookmark } from 'lucide-react';
import { Offer } from '../types';

interface OfferCardProps {
  offer: Offer;
  featured?: boolean;
  onClick: () => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, featured = false, onClick }) => {
  const availabilityRatio = `${offer.used}/${offer.total}`;
  const availabilityPercentage = (offer.used / offer.total) * 100;
  
  const getAvailabilityColor = () => {
    if (availabilityPercentage < 50) return 'bg-green-500';
    if (availabilityPercentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div 
      onClick={onClick}
      className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1 cursor-pointer ${
        featured ? 'md:col-span-2 lg:col-span-2' : ''
      }`}
    >
      {offer.featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-amber-400 text-xs font-bold px-2 py-1 rounded-full text-amber-800 flex items-center">
            <Star className="w-3 h-3 mr-1" />
            FEATURED
          </div>
        </div>
      )}
      
      <div className="relative h-32 overflow-hidden">
        <img 
          src={offer.logo || 'https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
          alt={offer.brand} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-bold text-lg">{offer.brand}</h3>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800">{offer.title}</h3>
          <button 
            className="text-gray-400 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              // Handle bookmark
            }}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 flex-1">{offer.description}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-500">Availability</span>
            <span className="text-sm font-medium">{availabilityRatio}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full ${getAvailabilityColor()}`}
              style={{ width: `${Math.min(100, (offer.used / offer.total) * 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">
              {offer.price > 0 ? `£${offer.price}` : 'FREE'}
            </span>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard