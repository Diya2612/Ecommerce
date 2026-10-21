import { cache } from 'react';
import type { CrossSellProduct } from './types';

/**
 * Get cross-sell products for cart page
 * 
 * These are displayed in the "Complete Your Setup" carousel
 * Uses React cache for request deduplication
 */
export const getCrossSellProducts = cache(async (): Promise<CrossSellProduct[]> => {
    // Simulating API delay for future compatibility
    await Promise.resolve();

    return [
        {
            id: 201,
            name: "TDS Meter Pro",
            price: 399,
            originalPrice: 899,
            rating: 4.5,
            reviews: 120,
            image: "https://images.unsplash.com/photo-1585834271810-72418e265c71?auto=format&fit=crop&q=80&w=200",
            category: "Accessories",
            inStock: true,
        },
        {
            id: 202,
            name: "Copper Cleaner",
            price: 299,
            originalPrice: 499,
            rating: 4.8,
            reviews: 85,
            image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200",
            category: "Maintenance",
            inStock: true,
        },
        {
            id: 203,
            name: "Water Bottle Set",
            price: 799,
            originalPrice: 1299,
            rating: 4.6,
            reviews: 210,
            image: "https://images.unsplash.com/photo-1602143407151-11115cd30c4b?auto=format&fit=crop&q=80&w=200",
            category: "Lifestyle",
            inStock: true,
        },
        {
            id: 204,
            name: "Filter Wrench",
            price: 199,
            originalPrice: 399,
            rating: 4.3,
            reviews: 45,
            image: "https://images.unsplash.com/photo-1581244277943-fe4a9c77718e?auto=format&fit=crop&q=80&w=200",
            category: "Tools",
            inStock: true,
        }
    ];
});
