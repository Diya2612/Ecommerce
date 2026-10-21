import { cache } from 'react';
import type { Product } from '@/types/home';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Fallback brand products data
 */
const FALLBACK_BRAND_PRODUCTS: Product[] = [
    {
        id: 101,
        name: "Industrial RO Plant 500LPH",
        tags: ["Commercial", "RO"],
        rating: 4.9,
        reviews: 45,
        price: 85000,
        originalPrice: 95000,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
    },
    {
        id: 102,
        name: "Office Water Station",
        tags: ["Office", "RO", "Hot & Cold"],
        rating: 4.7,
        reviews: 78,
        price: 24999,
        originalPrice: 29999,
        image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 103,
        name: "Kitchen Counter Pro",
        tags: ["Compact", "UV", "UF"],
        rating: 4.8,
        reviews: 156,
        price: 8999,
        originalPrice: 11999,
        image: "https://images.unsplash.com/photo-1625093440280-42de742a496d?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 104,
        name: "Smart Water Softener",
        tags: ["Whole House", "Softener"],
        rating: 4.9,
        reviews: 67,
        price: 32000,
        originalPrice: 38000,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
    },
    {
        id: 105,
        name: "Hot & Cold Dispenser",
        tags: ["Office", "Dispenser"],
        rating: 4.6,
        reviews: 89,
        price: 15499,
        originalPrice: 19999,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
    }
];

/**
 * Fetches products from the same brand
 * Server-side only - called in Server Components
 */
export const getBrandProducts = cache(async (
    brandId: string,
    excludeProductId?: string,
    limit = 6
): Promise<Product[]> => {
    // Helper for fallback
    const getFallback = () => {
        let products = FALLBACK_BRAND_PRODUCTS.slice(0, limit);
        if (excludeProductId) {
            products = products.filter(p => String(p.id) !== excludeProductId);
        }
        return products;
    };

    if (!process.env.API_BASE_URL) {
        return getFallback();
    }

    try {
        const response = await fetch(
            `${process.env.API_BASE_URL}/brands/${brandId}/products?limit=${limit}`,
            {
                next: {
                    revalidate: 3600,
                    tags: [CACHE_TAGS.BRAND_PRODUCTS],
                },
            }
        );

        if (!response.ok) {
            console.warn(`Brand products API returned ${response.status} for brand ${brandId}, using fallback`);
            return getFallback();
        }

        const apiResponse = await response.json();

        // Unwrap API response if needed
        const products: Product[] = apiResponse.data?.products || apiResponse.products || apiResponse.data || apiResponse || [];

        if (excludeProductId) {
            return products.filter(p => String(p.id) !== excludeProductId);
        }

        return products;
    } catch (error) {
        console.error('Error fetching brand products:', error);
        return getFallback();
    }
});
