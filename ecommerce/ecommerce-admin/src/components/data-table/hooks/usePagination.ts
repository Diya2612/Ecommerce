/**
 * usePagination Hook
 * Manages pagination state with localStorage persistence
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { PAGINATION_DEFAULTS } from '../utils/constants';
import { isValidPage, isValidRowsPerPage } from '../utils/validation';

export interface UsePaginationOptions {
  /** Total number of items */
  totalItems: number;
  /** Initial page number (1-indexed) */
  initialPage?: number;
  /** Initial rows per page */
  initialRowsPerPage?: number;
  /** Available rows per page options */
  rowsPerPageOptions?: number[];
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when rows per page changes */
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /** Enable localStorage persistence */
  persistInLocalStorage?: boolean;
  /** Storage key for persistence */
  storageKey?: string;
}

export interface UsePaginationReturn {
  /** Current page (1-indexed) */
  page: number;
  /** Rows per page */
  rowsPerPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Go to a specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  goToNextPage: () => void;
  /** Go to previous page */
  goToPreviousPage: () => void;
  /** Change rows per page */
  changeRowsPerPage: (rows: number) => void;
  /** Check if on first page */
  isFirstPage: boolean;
  /** Check if on last page */
  isLastPage: boolean;
  /** Get index range for current page */
  getPageRange: () => { start: number; end: number };
  /** Reset to first page */
  resetToFirstPage: () => void;
}

/**
 * Hook for managing table pagination
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  initialRowsPerPage = PAGINATION_DEFAULTS.defaultRowsPerPage,
  rowsPerPageOptions = [...PAGINATION_DEFAULTS.rowsPerPageOptions],
  onPageChange,
  onRowsPerPageChange,
  persistInLocalStorage = true,
  storageKey = PAGINATION_DEFAULTS.storageKey,
}: UsePaginationOptions): UsePaginationReturn {
  // Load persisted value from localStorage if available
  const getPersistedRowsPerPage = useCallback((): number => {
    if (!persistInLocalStorage || typeof window === 'undefined') {
      return initialRowsPerPage;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (isValidRowsPerPage(parsed, rowsPerPageOptions)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load pagination from localStorage:', error);
    }

    return initialRowsPerPage;
  }, [initialRowsPerPage, persistInLocalStorage, storageKey, rowsPerPageOptions]);

  const [page, setPage] = useState<number>(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState<number>(getPersistedRowsPerPage);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / rowsPerPage));
  }, [totalItems, rowsPerPage]);

  // Ensure current page is valid when totalPages changes
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      onPageChange?.(totalPages);
    }
  }, [page, totalPages, onPageChange]);

  /**
   * Go to a specific page
   */
  const goToPage = useCallback(
    (newPage: number) => {
      if (!isValidPage(newPage, totalPages)) {
        console.warn(`Invalid page number: ${newPage}. Must be between 1 and ${totalPages}`);
        return;
      }

      setPage(newPage);
      onPageChange?.(newPage);
    },
    [totalPages, onPageChange]
  );

  /**
   * Go to next page
   */
  const goToNextPage = useCallback(() => {
    if (page < totalPages) {
      goToPage(page + 1);
    }
  }, [page, totalPages, goToPage]);

  /**
   * Go to previous page
   */
  const goToPreviousPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [page, goToPage]);

  /**
   * Change rows per page
   */
  const changeRowsPerPage = useCallback(
    (newRowsPerPage: number) => {
      if (!isValidRowsPerPage(newRowsPerPage, rowsPerPageOptions)) {
        console.warn(`Invalid rows per page: ${newRowsPerPage}`);
        return;
      }

      setRowsPerPage(newRowsPerPage);
      onRowsPerPageChange?.(newRowsPerPage);

      // Persist to localStorage if enabled
      if (persistInLocalStorage && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, String(newRowsPerPage));
        } catch (error) {
          console.warn('Failed to persist pagination to localStorage:', error);
        }
      }

      // Reset to page 1 when changing rows per page
      setPage(1);
      onPageChange?.(1);
    },
    [rowsPerPageOptions, onRowsPerPageChange, persistInLocalStorage, storageKey, onPageChange]
  );

  /**
   * Get start and end indices for current page
   */
  const getPageRange = useCallback((): { start: number; end: number } => {
    const start = (page - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, totalItems);
    return { start, end };
  }, [page, rowsPerPage, totalItems]);

  /**
   * Reset to first page
   */
  const resetToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  return {
    page,
    rowsPerPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changeRowsPerPage,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
    getPageRange,
    resetToFirstPage,
  };
}
