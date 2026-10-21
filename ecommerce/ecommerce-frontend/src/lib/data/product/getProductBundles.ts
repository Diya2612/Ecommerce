import { cache } from 'react';
import type { ProductBundle } from '@/types/product';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Fallback bundles data - generated based on main product
 */
const createFallbackBundles = (mainProductPrice: number): ProductBundle[] => [
    {
        id: 101,
        name: "Complete Protection Kit",
        items: [
            {
                id: "b1-i1",
                name: "Extra Filter Kit (Set of 3)",
                image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
                price: 2499,
                originalPrice: 3499
            }
        ],
        totalPrice: mainProductPrice + 2499,
        originalPrice: mainProductPrice + 3499 + 6000,
        discount: 15
    },
    {
        id: 102,
        name: "Smart Kitchen Bundle",
        items: [
            {
                id: "b2-i1",
                name: "Premium Copper Bottle Set",
                image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
                price: 999,
                originalPrice: 1999
            }
        ],
        totalPrice: mainProductPrice + 999,
        originalPrice: mainProductPrice + 1999 + 6000,
        discount: 20
    },
    {
        id: 103,
        name: "Ultimate Care Package",
        items: [
            {
                id: "b3-i1",
                name: "2 Year Extended Warranty",
                image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
                price: 1999,
                originalPrice: 3999
            },
            {
                id: "b3-i2",
                name: "Annual Maintenance Kit",
                image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
                price: 1499,
                originalPrice: 2499
            }
        ],
        totalPrice: mainProductPrice + 3498,
        originalPrice: mainProductPrice + 6498 + 6000,
        discount: 25
    }
];

/**
 * Fetches available bundles for a product
 * Server-side only - called in Server Components
 */
export const getProductBundles = cache(async (
    productId: string,
    mainProductPrice = 12999
): Promise<ProductBundle[]> => {
    if (!process.env.API_BASE_URL) {
        return createFallbackBundles(mainProductPrice);
    }

    try {
        const response = await fetch(
            `${process.env.API_BASE_URL}/bundles?product_id=${productId}`,
            {
                next: {
                    revalidate: 3600,
                    tags: [CACHE_TAGS.PRODUCT_BUNDLES],
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch bundles: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching bundles:', error);
        return createFallbackBundles(mainProductPrice);
    }
});
