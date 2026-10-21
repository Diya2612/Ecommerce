import { cache } from 'react';
import type { AboutFeaturedProduct } from '@/types/about';

/**
 * Fetches featured products for the About page products section
 * Server-side only - called in Server Components
 * Uses React cache() for request deduplication
 * 
 * Note: This is separate from home page featured products to allow for
 * different product selection on each page if needed in the future.
 * For now, the data is the same.
 */
export const getAboutFeaturedProducts = cache(async (): Promise<AboutFeaturedProduct[]> => {
    try {
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await fetch(
        //   `${process.env.API_BASE_URL}/products/featured?limit=4`,
        //   {
        //     next: {
        //       revalidate: 3600, // Cache for 1 hour
        //       tags: ['about-featured-products', 'products'],
        //     },
        //   }
        // );
        //
        // if (!response.ok) {
        //   throw new Error('Failed to fetch featured products');
        // }
        //
        // return response.json();

        // Static data - migrated from AboutFeaturedProducts.tsx
        return [
            {
                id: 1,
                name: "Anant Pure X1 Pro",
                price: 12999,
                originalPrice: 15999,
                rating: 4.8,
                reviews: 128,
                tags: ["Best Seller"],
                image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
            },
            {
                id: 2,
                name: "EcoSoft Water Softener",
                price: 8499,
                originalPrice: 9999,
                rating: 4.9,
                reviews: 84,
                tags: ["New"],
                image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&q=80&w=400",
            },
            {
                id: 3,
                name: "Alkaline Boost Kit",
                price: 2499,
                originalPrice: 3299,
                rating: 4.7,
                reviews: 256,
                tags: ["Trending"],
                image: "/assets/d0ecf442a41eba8025e1c4e406416a4fc5cccc81.png",
            },
            {
                id: 4,
                name: "Smart UV Filter",
                price: 4999,
                originalPrice: 6500,
                rating: 4.6,
                reviews: 112,
                tags: ["Smart"],
                image: "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?auto=format&fit=crop&q=80&w=400",
            },
        ];
    } catch (error) {
        console.error('Error fetching about featured products:', error);
        return [];
    }
});
