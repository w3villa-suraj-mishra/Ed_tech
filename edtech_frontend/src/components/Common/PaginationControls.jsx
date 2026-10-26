import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { usePagination, DOTS } from '../../utils/paginationHelper';

/**
 * Enterprise-Grade Reusable Pagination Component
 * Memory-efficient, accessible, responsive, and handles 200,000+ pages smoothly.
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  siblingCount = 1,
  className = ""
}) {
  const paginationRange = usePagination({
    currentPage,
    totalPages,
    siblingCount
  });

  if (totalPages <= 1 || paginationRange.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6 ${className}`}>
      {/* Information Label */}
      <div className="text-xs text-gray-500 font-medium">
        Showing page <span className="font-bold text-gray-900">{currentPage.toLocaleString()}</span> of{' '}
        <span className="font-bold text-gray-900">{totalPages.toLocaleString()}</span>
        {totalItems !== undefined && (
          <span> ({totalItems.toLocaleString()} total items)</span>
        )}
      </div>

      {/* Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous Page"
          title="Previous Page"
        >
          <FiChevronLeft className="text-sm" />
        </button>

        {/* Dynamic Compact Page Items */}
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            const isLeftDots = index === 1;
            return (
              <button
                key={`dots-${index}`}
                onClick={() =>
                  onPageChange(
                    isLeftDots
                      ? Math.max(1, currentPage - 5)
                      : Math.min(totalPages, currentPage + 5)
                  )
                }
                className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-bold select-none"
                title={isLeftDots ? "Jump back 5 pages" : "Jump forward 5 pages"}
              >
                &#8230;
              </button>
            );
          }

          const isCurrent = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`min-w-[36px] h-9 px-2.5 inline-flex items-center justify-center text-xs font-bold rounded-xl transition-all ${
                isCurrent
                  ? 'bg-[#3BA7F2] text-white shadow-xs scale-105'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {pageNumber.toLocaleString()}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next Page"
          title="Next Page"
        >
          <FiChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}
