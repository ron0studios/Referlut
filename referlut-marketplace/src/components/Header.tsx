import React from 'react';
import { User, Settings, LayoutDashboard } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">ShareSpot</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <LayoutDashboard className="w-6 h-6 text-gray-700" />
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <Settings className="w-6 h-6 text-gray-700" />
          </button>
          
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-200">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;