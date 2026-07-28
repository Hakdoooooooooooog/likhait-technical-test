/**
 * Utility functions for pagination calculations
 */

export interface PaginationResult<T> {
  currentItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Returns paginated items and page calculations for a given array.
 */
export function paginate<T>(
  items: T[],
  currentPage: number = 1,
  pageSize: number = 10
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page stays within valid bounds [1, totalPages]
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = items.slice(startIndex, endIndex);

  return {
    currentItems,
    currentPage: validPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  };
}
