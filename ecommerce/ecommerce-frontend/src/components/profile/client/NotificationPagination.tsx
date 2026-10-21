'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NotificationPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function NotificationPagination({
    currentPage,
    totalPages,
    onPageChange,
}: NotificationPaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Show max 7 page numbers
    const getVisiblePages = (): (number | string)[] => {
        if (totalPages <= 7) return pages;

        if (currentPage <= 4) {
            return [...pages.slice(0, 5), '...', totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [1, '...', ...pages.slice(totalPages - 5)];
        }

        return [
            1,
            '...',
            currentPage - 1,
            currentPage,
            currentPage + 1,
            '...',
            totalPages,
        ];
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {/* Previous Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-input border-[#CBD5E1] dark:border-gray-700 disabled:opacity-30"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page Numbers */}
            {visiblePages.map((page, index) =>
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                        ...
                    </span>
                ) : (
                    <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => onPageChange(page as number)}
                        className={`w-10 h-10 rounded-input ${
                            currentPage === page
                                ? 'bg-[#0B1F51] dark:bg-blue-600 text-white hover:bg-[#152C6B] dark:hover:bg-blue-700'
                                : 'border-[#CBD5E1] dark:border-gray-700 hover:border-[#00C4CC] dark:hover:border-blue-500'
                        }`}
                    >
                        {page}
                    </Button>
                )
            )}

            {/* Next Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-input border-[#CBD5E1] dark:border-gray-700 disabled:opacity-30"
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
