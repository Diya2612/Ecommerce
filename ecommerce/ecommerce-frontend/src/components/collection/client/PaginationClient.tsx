'use client';

import { useQueryState } from 'nuqs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationClientProps } from '@/types/collection';
import { searchParamsParsers } from '@/lib/search-params';

/**
 * PaginationClient - Client Component
 * 
 * Pagination controls matching old ProductGrid exactly.
 * Updates URL search params for page navigation using nuqs.
 */
export function PaginationClient({ currentPage, totalPages }: PaginationClientProps) {
    const [, setPage] = useQueryState('page', searchParamsParsers.page.withOptions({
        shallow: true,
        history: 'push'
    }));

    const handlePageChange = (page: number) => {
        setPage(page);

        // Scroll to top of products like old version
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            {/* Previous Button */}
            <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-input border-[#CBD5E1] disabled:opacity-30"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-input ${currentPage === page
                        ? "bg-[#0B1F51] text-white hover:bg-[#152C6B]"
                        : "border-[#CBD5E1] hover:border-[#00C4CC]"
                        }`}
                >
                    {page}
                </Button>
            ))}

            {/* Next Button */}
            <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-input border-[#CBD5E1] disabled:opacity-30"
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
