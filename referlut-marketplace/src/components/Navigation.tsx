import React from 'react';
import { PlusCircle } from 'lucide-react';

interface NavigationProps {
  activeTab: 'referral' | 'loyalty' | 'charity';
  onTabChange: (tab: 'referral' | 'loyalty' | 'charity') => void;
  onCreateClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onCreateClick,
}) => {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onTabChange('referral')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'referral'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Referrals
            </button>
            
            <span className="text-gray-400">•</span>
            
            <button
              onClick={() => onTabChange('loyalty')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'loyalty'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Loyalty Cards
            </button>
            
            <span className="text-gray-400">•</span>
            
            <button
              onClick={() => onTabChange('charity')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'charity'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Charity
            </button>
          </div>
          
          <button
            onClick={onCreateClick}
            className="flex items-center px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;