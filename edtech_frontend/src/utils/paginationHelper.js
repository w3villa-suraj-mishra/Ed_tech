
import { useMemo } from 'react';

export const DOTS = '...';

/**
 * Calculates compact page range array for pagination UI
 * @param {Object} params
 * @param {number} params.currentPage - Current active page number (1-indexed)
 * @param {number} params.totalPages - Total number of pages
 * @param {number} [params.siblingCount=1] - Number of sibling page buttons beside active page
 * @returns {Array<number|string>} Range array e.g. [1, '...', 14, 15, 16, '...', 20052]
 */
export const getPaginationRange = ({
  currentPage,
  totalPages,
  siblingCount = 1
}) => {
  const totalPageNumbers = siblingCount * 2 + 5; // [1, DOTS, leftSibling, current, rightSibling, DOTS, totalPages]

  // Case 1: Total pages fit without collapsing
  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Case 2: Only right dots needed
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, idx) => idx + 1);
    return [...leftRange, DOTS, lastPageIndex];
  }

  // Case 3: Only left dots needed
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from({ length: rightItemCount }, (_, idx) => totalPages - rightItemCount + idx + 1);
    return [firstPageIndex, DOTS, ...rightRange];
  }

  // Case 4: Both left & right dots needed
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, idx) => leftSiblingIndex + idx
    );
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }

  return [];
};

/**
 * Custom React Hook for memoized pagination range calculation
 */
export const usePagination = ({ currentPage, totalPages, siblingCount = 1 }) => {
  return useMemo(() => {
    return getPaginationRange({ currentPage, totalPages, siblingCount });
  }, [currentPage, totalPages, siblingCount]);
};
