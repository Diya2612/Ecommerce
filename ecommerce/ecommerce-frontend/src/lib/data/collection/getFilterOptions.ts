import { cache } from 'react';
import type { FilterOptions } from '@/types/collection';
import { CACHE_TAGS } from '@/lib/cache/tags';

// ============================================================================
// Fallback Filter Options
// ============================================================================

const FALLBACK_OPTIONS: FilterOptions = {
    categories: [
        { id: 'residential', label: 'Residential Purifiers', count: 24 },
        { id: 'commercial', label: 'Commercial Systems', count: 12 },
        { id: 'industrial', label: 'Industrial Plants', count: 8 },
        { id: 'accessories', label: 'Accessories & Spares', count: 35 },
    ],
    technologies: [
        { id: 'ro', label: 'RO (Reverse Osmosis)', count: 28 },
        { id: 'uv', label: 'UV Purification', count: 22 },
        { id: 'uf', label: 'UF (Ultra Filtration)', count: 18 },
        { id: 'alkaline', label: 'Alkaline', count: 10 },
        { id: 'copper', label: 'Copper Infusion', count: 8 },
        { id: 'mineralizer', label: 'Mineralizer', count: 6 },
    ],
    ratings: [
        { value: '4', count: 45 },
        { value: '3', count: 12 },
        { value: '2', count: 3 },
    ],
    priceRange: { min: 0, max: 200000 },
};

// ============================================================================
// Data Fetcher
// ============================================================================

/**
 * Fetches available filter options (categories, technologies, ratings)
 * Uses React cache() for request deduplication
 */
export const getFilterOptions = cache(async (): Promise<FilterOptions> => {
    // Check if API is configured
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.warn('API URL not configured for filters, using fallback');
        return FALLBACK_OPTIONS;
    }

    try {
        const response = await fetch(
            `${apiUrl}/products/filters`,
            {
                next: {
                    revalidate: 3600, // 1 hour - filter options don't change often
                    tags: [CACHE_TAGS.COLLECTION_FILTERS],
                },
            }
        );

        if (!response.ok) throw new Error('Fetch failed');

        const apiResponse = await response.json();

        // If backend wraps response in { success, message, data }, unwrap it
        // Otherwise use the response directly
        return apiResponse.data || apiResponse;
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return FALLBACK_OPTIONS;
    }
});
