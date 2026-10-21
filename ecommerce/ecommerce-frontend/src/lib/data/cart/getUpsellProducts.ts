import { cache } from 'react';
import type { UpsellProduct } from './types';

/**
 * Get upsell products for cart drawer
 * 
 * These are displayed in the "Fancy Something Extra?" section
 * Uses React cache for request deduplication
 */
export const getUpsellProducts = cache(async (): Promise<UpsellProduct[]> => {
    // Simulating API delay for future compatibility
    await Promise.resolve();

    return [
        {
            id: 201,
            name: "Premium Filter Replacement Pack",
            price: 1499,
            originalPrice: 1999,
            image: "https://images.unsplash.com/photo-1585834271810-72418e265c71?auto=format&fit=crop&q=80&w=200",
            badge: "Save ₹500",
            badgeColor: "bg-green-500",
            inStock: true,
        },
        {
            id: 202,
            name: "Water Testing Kit",
            price: 599,
            originalPrice: 799,
            image: "https://images.unsplash.com/photo-1581244277943-fe4a9c77718e?auto=format&fit=crop&q=80&w=200",
            badge: "Essential",
            badgeColor: "bg-[#0B1F51]",
            inStock: true,
        }
    ];
});
