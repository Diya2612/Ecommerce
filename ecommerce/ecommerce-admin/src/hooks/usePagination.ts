import { useState } from "react";

export interface UsePaginationOptions {
  initialPage?: number;
  initialRowsPerPage?: number;
}

export interface UsePaginationReturn {
  page: number;
  rowsPerPage: number;
  setPage: (newPage: number) => void;
  setRowsPerPage: (rows: number) => void;
  reset: () => void;
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const getStoredRows = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rowsPerPage');
      return stored ? Number(stored) : 10;
    }
    return 10;
  };

  const { initialPage = 1, initialRowsPerPage = getStoredRows() } = options;

  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(1); // Reset to first page when changing rows per page
  };

  const reset = () => {
    setPage(initialPage);
    setRowsPerPage(initialRowsPerPage);
  };

  return {
    page,
    rowsPerPage,
    setPage: handlePageChange,
    setRowsPerPage: handleRowsPerPageChange,
    reset,
  };
};
