/**
 * Get User Wishlist
 * 
 * Server-side data fetcher for user wishlist.
 * Uses React cache() for request deduplication within a render.
 */

import { cache } from 'react';
import { serverApi } from '@/api/server';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { WishlistItem } from './types';
import { getCurrentUserId } from './getCurrentUserId';

/**
 * Fetches the authenticated user's wishlist
 * 
 * Backend response already matches frontend format:
 * - id (UUID), name, price, originalPrice, rating, reviews, image, inStock
 * 
 * Returns empty array if user not authenticated
 */
// Define backend response types locally to match what get-wishlist.ts returns
interface BackendWishlistItem {
    product_id: string;
    product_name: string;
    product_image: string;
    selling_price: number;
    compare_at_price: number;
    sku: string;
    inStock: boolean;
    availableStock: number;
    notes: string | null;
    added_at: string;
    added_to_cart_at: string | null;
    purchased_at: string | null;
    rating: number;
    reviews: number;
}

interface BackendWishlistResponse {
    id: string;
    access_token: string | null;
    items: BackendWishlistItem[];
    itemCount: number;
}

export const getUserWishlist = cache(async (): Promise<WishlistItem[]> => {
    try {
        // Get the authenticated user's public.users ID
        const userId = await getCurrentUserId();

        const response = await serverApi<BackendWishlistResponse>(
            `/wishlist/${userId}/wishlist`,
            {
                auth: true,
                revalidate: 30, // 30 seconds (wishlist changes frequently)
                tags: [CACHE_TAGS.USER_WISHLIST],
            }
        );

        if (!response || !response.items) {
            return [];
        }

        // Map backend items to frontend WishlistItem interface
        return response.items.map(item => ({
            id: item.product_id,
            name: item.product_name,
            price: Number(item.selling_price),
            originalPrice: Number(item.compare_at_price),
            rating: Number(item.rating),
            reviews: Number(item.reviews),
            image: item.product_image,
            inStock: item.inStock,
            total_stock: item.availableStock,
            url: `/collections/${item.product_id}` // Construct URL if needed
        }));
    } catch (error) {
        console.error("Error fetching user wishlist:", error);
        return [];
    }
});
