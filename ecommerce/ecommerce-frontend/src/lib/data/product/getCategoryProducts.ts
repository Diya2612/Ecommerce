import { cache } from 'react';
import type { Product } from '@/types/home';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Fallback category products data
 */
const FALLBACK_CATEGORY_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Anant Pure Z3",
        tags: ["RO", "UV", "UF"],
        rating: 4.8,
        reviews: 187,
        price: 11999,
        originalPrice: 16999,
        image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
    },
    {
        id: 2,
        name: "Crystal Clear Pro",
        tags: ["RO", "Mineralizer"],
        rating: 4.7,
        reviews: 134,
        price: 14999,
        originalPrice: 19999,
        image: "https://images.unsplash.com/photo-1544198841-10f34f31f8dd?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 3,
        name: "Aqua Shield Elite",
        tags: ["RO", "UV", "Alkaline"],
        rating: 4.9,
        reviews: 203,
        price: 17999,
        originalPrice: 23999,
        image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 4,
        name: "Pure Home 7",
        tags: ["UV", "UF"],
        rating: 4.5,
        reviews: 98,
        price: 6999,
        originalPrice: 9999,
        image: "https://images.unsplash.com/photo-1625093440280-42de742a496d?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 5,
        name: "EcoSaver RO",
        tags: ["Energy Saver", "RO"],
        rating: 4.6,
        reviews: 76,
        price: 10999,
        originalPrice: 14999,
        image: "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: 6,
        name: "Wall Mount Elite",
        tags: ["Wall Mount", "UV"],
        rating: 4.7,
        reviews: 118,
        price: 12999,
        originalPrice: 17999,
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
    }
];

/**
 * Fetches products from the same category
 * Server-side only - called in Server Components
 */
export const getCategoryProducts = cache(async (
    categoryId: string,
    excludeProductId?: string,
    limit = 6
): Promise<Product[]> => {
    const getFallback = () => {
        let products = FALLBACK_CATEGORY_PRODUCTS.slice(0, limit);
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
            `${process.env.API_BASE_URL}/collections/${categoryId}/products?limit=${limit}`,
            {
                next: {
                    revalidate: 3600,
                    tags: [CACHE_TAGS.CATEGORY_PRODUCTS],
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch category products: ${response.status}`);
        }

        const apiResponse = await response.json();

        // Unwrap API response if needed
        const products: Product[] = apiResponse.data?.products || apiResponse.products || apiResponse.data || apiResponse || [];

        if (excludeProductId) {
            return products.filter(p => String(p.id) !== excludeProductId);
        }

        return products;
    } catch (error) {
        console.error('Error fetching category products:', error);
        return getFallback();
    }
});
