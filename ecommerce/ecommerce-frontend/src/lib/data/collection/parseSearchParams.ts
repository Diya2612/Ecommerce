import type { CollectionFilters } from '@/types/collection';

// ============================================================================
// Search Params Type
// ============================================================================

/**
 * URL search params type matching Next.js searchParams
 */
export interface SearchParams {
    category?: string;
    technology?: string;
    rating?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
    page?: string;
}

// ============================================================================
// Parser
// ============================================================================

/**
 * Parses URL search params into a CollectionFilters object
 * Provides safe defaults for all filter values
 * 
 * @param params - URL search params from Next.js page
 * @returns CollectionFilters object with parsed values
 */
export function parseSearchParams(params: SearchParams): CollectionFilters {
    return {
        categories: params.category ? params.category.split(',').filter(Boolean) : [],
        technologies: params.technology ? params.technology.split(',').filter(Boolean) : [],
        ratings: params.rating ? params.rating.split(',').filter(Boolean) : [],
        priceRange: [
            Number(params.minPrice) || 0,
            Number(params.maxPrice) || 200000,
        ],
        sort: isValidSort(params.sort) ? params.sort : 'newest',
        search: params.search || undefined,
        page: Math.max(1, Number(params.page) || 1),
        limit: 6, // Items per page (matches old ProductGrid)
    };
}

// ============================================================================
// Helpers
// ============================================================================

const VALID_SORTS = ['newest', 'price-asc', 'price-desc', 'rating'] as const;
type ValidSort = typeof VALID_SORTS[number];

function isValidSort(sort: string | undefined): sort is ValidSort {
    return VALID_SORTS.includes(sort as ValidSort);
}
