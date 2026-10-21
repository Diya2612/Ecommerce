import { cache } from 'react';
import type { UpsellProduct } from './types';
import { getFeaturedProducts } from '../home/getFeaturedProducts';

/**
 * Fetch recommended upsell products for checkout
 * 
 * Server-side data fetching with caching
 * Revalidates every 1 hour
 */
export const getUpsellProducts = cache(async (): Promise<UpsellProduct[]> => {
    try {
        const featuredProducts = await getFeaturedProducts();

        return featuredProducts.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description || 'Premium water purifier component',
            price: product.price,
            originalPrice: product.originalPrice || Math.round(product.price * 1.2),
            image: product.image,
            tag: product.isNew ? 'New Arrival' : 'Best Seller'
        }));
    } catch (error) {
        console.error('Error fetching upsell products:', error);
        return [];
    }
});
