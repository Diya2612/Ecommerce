import { cache } from 'react';
import type { Product } from '@/types/home';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Fallback related products data
 */
const FALLBACK_RELATED: Product[] = [
    {
        id: 101,
        name: "Anant Pure X2 Max",
        tags: ["RO", "UV", "Copper"],
        rating: 4.9,
        reviews: 156,
        price: 15999,
        originalPrice: 21999,
        image: "https://images.unsplash.com/photo-1613688270362-8b26189c0782?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 102,
        name: "Smart IoT Purifier Pro",
        tags: ["IoT", "RO", "Alkaline"],
        rating: 4.8,
        reviews: 89,
        price: 22999,
        originalPrice: 28999,
        image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 103,
        name: "Copper Boost Elite",
        tags: ["Copper", "UV"],
        rating: 4.7,
        reviews: 124,
        price: 13999,
        originalPrice: 18999,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
    },
    {
        id: 104,
        name: "Compact Desktop Pro",
        tags: ["Portable", "UV"],
        rating: 4.6,
        reviews: 98,
        price: 9999,
        originalPrice: 13999,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
    }
];

/**
 * Fetches related/similar products
 * Server-side only - called in Server Components
 */
export const getRelatedProducts = cache(async (
    productId: string,
    limit = 4
): Promise<Product[]> => {
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        return FALLBACK_RELATED.slice(0, limit);
    }

    try {
        const response = await fetch(
            `${apiUrl}/products/${productId}/related?limit=${limit}`,
            {
                next: {
                    revalidate: 3600,
                    tags: [CACHE_TAGS.RELATED_PRODUCTS],
                },
            }
        );

        if (!response.ok) {
            console.warn(`Related products API returned ${response.status} for product ${productId}, using fallback`);
            return FALLBACK_RELATED.slice(0, limit);
        }

        const apiResponse = await response.json();

        // Unwrap and transform API response
        const data = apiResponse.data || apiResponse;

        if (Array.isArray(data) && data.length > 0) {
            const { transformSimplifiedProduct } = await import('@/lib/transformers');
            return data.map(transformSimplifiedProduct);
        }

        return FALLBACK_RELATED.slice(0, limit);
    } catch (error) {
        console.error('Error fetching related products:', error);
        return FALLBACK_RELATED.slice(0, limit);
    }
});
