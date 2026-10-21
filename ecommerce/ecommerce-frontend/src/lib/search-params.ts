import {
    createSearchParamsCache,
    parseAsArrayOf,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum
} from 'nuqs/server';

// Parser definitions shared between client and server
export const searchParamsParsers = {
    // Pagination
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(9), // Default limit for product grid

    // Sort
    sort: parseAsStringEnum(['newest', 'price-asc', 'price-desc', 'rating']).withDefault('newest'),

    // Filters
    search: parseAsString.withDefault(''),

    // Array filters - comma separated in URL
    categories: parseAsArrayOf(parseAsString).withDefault([]),
    technologies: parseAsArrayOf(parseAsString).withDefault([]),
    ratings: parseAsArrayOf(parseAsString).withDefault([]),

    // Price Range (min, max)
    minPrice: parseAsInteger.withDefault(0),
    maxPrice: parseAsInteger.withDefault(200000),
};


// Server-side cache helper
export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

interface ParsedParams {
    page: number;
    limit: number;
    sort: string;
    search: string;
    categories: string[];
    technologies: string[];
    ratings: string[];
    minPrice: number;
    maxPrice: number;
}

/**
 * Normalizes parsed search params into a stable CollectionFilters object.
 * This ensures consistency between Server (initial load) and Client (hydration).
 */
export function normalizeFilters(parsedParams: ParsedParams): import('@/types/collection').CollectionFilters {
    return {
        categories: parsedParams.categories || [],
        technologies: parsedParams.technologies || [],
        ratings: parsedParams.ratings || [],
        // Combine min/max into stable tuple
        priceRange: [
            parsedParams.minPrice ?? 0,
            parsedParams.maxPrice ?? 200000
        ],
        sort: (parsedParams.sort as any) || 'newest',
        search: parsedParams.search || undefined,
        page: parsedParams.page || 1,
        limit: parsedParams.limit || 9,
    };
}

