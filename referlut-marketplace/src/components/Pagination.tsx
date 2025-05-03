import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If total pages is small, show all pages
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include current page
      pages.push(currentPage);

      // Add pages before current page
      for (let i = 1; i <= 2; i++) {
        if (currentPage - i >= 0) {
          pages.unshift(currentPage - i);
        }
      }

      // Add pages after current page
      for (let i = 1; i <= 2; i++) {
        if (currentPage + i < totalPages) {
          pages.push(currentPage + i);
        }
      }

      // If we're missing pages at the start, add more at the end
      while (
        pages.length < maxPagesToShow &&
        pages[pages.length - 1] < totalPages - 1
      ) {
        pages.push(pages[pages.length - 1] + 1);
      }

      // If we're missing pages at the end, add more at the start
      while (pages.length < maxPagesToShow && pages[0] > 0) {
        pages.unshift(pages[0] - 1);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || isLoading}
        className={`p-2 rounded ${
          currentPage === 0 || isLoading
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          disabled={isLoading}
          className={`w-10 h-10 rounded-full ${
            pageNumber === currentPage
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {pageNumber + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1 || isLoading}
        className={`p-2 rounded ${
          currentPage === totalPages - 1 || isLoading
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
