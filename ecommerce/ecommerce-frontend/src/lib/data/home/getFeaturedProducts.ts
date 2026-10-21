import { cache } from 'react';
import type { Product } from '@/types/home';
import { HOME_PAGE_CACHE } from '@/lib/cache/strategies';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Fetches featured products for the home page
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 */
export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/featured`,
            {
                next: {
                    ...HOME_PAGE_CACHE.featuredProducts,
                    tags: [CACHE_TAGS.FEATURED_PRODUCTS],
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch featured products');
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
});
