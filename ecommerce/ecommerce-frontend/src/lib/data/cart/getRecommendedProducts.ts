import { cache } from 'react';
import type { CartProduct } from './types';

/**
 * Get recommended products for cart drawer carousel
 * 
 * Uses React cache for request deduplication
 * In the future, this can fetch from an API
 */
export const getRecommendedProducts = cache(async (): Promise<CartProduct[]> => {
    // Simulating API delay for future compatibility
    await Promise.resolve();

    return [
        {
            id: 301,
            name: "Advanced RO System",
            tags: ["Premium Quality"],
            price: 1799,
            originalPrice: 2499,
            rating: 4.7,
            reviews: 456,
            image: "https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?auto=format&fit=crop&q=80&w=400",
            label: "BESTSELLER",
            inStock: true,
        },
        {
            id: 302,
            name: "Water Quality Monitor",
            tags: ["Smart Device"],
            price: 3499,
            originalPrice: 4999,
            rating: 4.5,
            reviews: 167,
            image: "https://images.unsplash.com/photo-1585834271810-72418e265c71?auto=format&fit=crop&q=80&w=400",
            isNew: true,
            inStock: true,
        },
        {
            id: 303,
            name: "Alkaline Water Purifier",
            tags: ["Health Plus"],
            price: 5499,
            originalPrice: 7999,
            rating: 4.8,
            reviews: 289,
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=400",
            label: "PREMIUM",
            inStock: true,
        },
        {
            id: 304,
            name: "UV Sterilizer Pro",
            tags: ["Advanced Tech"],
            price: 2999,
            originalPrice: 4499,
            rating: 4.6,
            reviews: 198,
            image: "https://images.unsplash.com/photo-1602143407151-11115cd30c4b?auto=format&fit=crop&q=80&w=400",
            label: "SALE",
            inStock: true,
        },
        {
            id: 305,
            name: "Copper Water Dispenser",
            tags: ["Traditional"],
            price: 4299,
            originalPrice: 5999,
            rating: 4.4,
            reviews: 112,
            image: "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?auto=format&fit=crop&q=80&w=400",
            label: "BESTSELLER",
            inStock: true,
        },
        {
            id: 306,
            name: "Smart Water Tap",
            tags: ["Innovation"],
            price: 6999,
            originalPrice: 9499,
            rating: 4.9,
            reviews: 342,
            image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
            label: "PREMIUM",
            inStock: true,
        }
    ];
});
