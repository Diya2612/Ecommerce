/**
 * TablePagination Component
 * Pagination controls for table footer
 */

import { memo } from 'react';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TABLE_HEIGHTS } from '../utils/constants';

export interface TablePaginationProps {
  /** Current page (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Rows per page */
  rowsPerPage: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items on current page */
  currentPageSize: number;
  /** Available rows per page options */
  rowsPerPageOptions?: number[];
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when rows per page changes */
  onRowsPerPageChange: (rows: number) => void;
}

/**
 * Table pagination footer
 */
const TablePaginationComponent: React.FC<TablePaginationProps> = ({
  page,
  totalPages,
  rowsPerPage,
  totalItems,
  currentPageSize,
  rowsPerPageOptions = [10, 25, 50],
  onPageChange,
  onRowsPerPageChange,
}) => {
  const goPrev = () => {
    console.log('[TablePagination] goPrev called. Current page:', page);
    if (page > 1) onPageChange(page - 1);
  };

  const goNext = () => {
    console.log('[TablePagination] goNext clicked:', {
      page,
      totalPages,
      pageType: typeof page,
      totalPagesType: typeof totalPages,
      willTrigger: page < totalPages
    });
    if (page < totalPages) {
      onPageChange(page + 1);
    } else {
      console.warn('[TablePagination] goNext blocked: page >= totalPages');
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    const val = Number(value);
    onRowsPerPageChange(val);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('rowsPerPage', String(val));
    }
  };

  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalItems);

  return (
    <div
      className="border-t border-gray-100 px-6 flex items-center justify-between"
      style={{ height: TABLE_HEIGHTS.footer }}
    >
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="hidden sm:inline">Rows per page</span>
        <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
          <SelectTrigger className="h-9 w-[70px] rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rowsPerPageOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="hidden md:inline text-sm text-gray-500">
          {currentPageSize > 0
            ? `Showing ${start}-${end} of ${totalItems}`
            : 'Showing 0 of 0'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goPrev}
          disabled={page <= 1}
          className="w-10 h-10 rounded-lg"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </Button>

        <span className="text-sm text-gray-500">
          Page {page} of {Math.max(totalPages, 1)}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goNext}
          disabled={page >= totalPages}
          className="w-10 h-10 rounded-lg"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
};

// Export memoized version
export const TablePagination = memo(TablePaginationComponent);

TablePagination.displayName = 'TablePagination';
