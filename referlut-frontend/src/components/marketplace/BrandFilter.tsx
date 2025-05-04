import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface BrandFilterProps {
  brands: string[];
  onFilterChange: (brand: string | null) => void;
  isLoading?: boolean;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  brands,
  onFilterChange,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      onFilterChange(null);
    }
  };

  const handleBrandSelect = (brand: string) => {
    setSearchTerm(brand);
    onFilterChange(brand);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onFilterChange(null);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isLoading ? "text-gray-300" : "text-gray-400"
          }`}
        />
        <input
          type="text"
          placeholder={isLoading ? "Loading brands..." : "Filter by brand"}
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => !isLoading && setIsOpen(true)}
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none ${
            isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          disabled={isLoading}
          aria-busy={isLoading}
        />
        {searchTerm && !isLoading && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && !isLoading && filteredBrands.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredBrands.map((brand) => (
            <div
              key={brand}
              onClick={() => handleBrandSelect(brand)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {brand}
            </div>
          ))}
        </div>
      )}

      {isOpen && !isLoading && filteredBrands.length === 0 && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No brands found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default BrandFilter;
