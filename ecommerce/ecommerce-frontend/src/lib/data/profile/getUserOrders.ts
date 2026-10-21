/**
 * Get User Orders
 * 
 * Server-side data fetcher for user orders.
 * Uses React cache() for request deduplication within a render.
 */

import { cache } from 'react';
import { serverApi } from '@/api/server';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { Order } from './types';
import { getCurrentUserId } from './getCurrentUserId';

interface OrdersResponse {
    data: Order[];
    total?: number;
    page?: number;
    limit?: number;
}

/**
 * Fetches the authenticated user's orders
 * 
 * Backend response already matches frontend format:
 * - id, date, status, total, deliveryDate, trackingNumber, items[]
 * 
 * Returns empty array if user not authenticated
 */
export const getUserOrders = cache(async (): Promise<Order[]> => {
    // Get the authenticated user's public.users ID
    const userId = await getCurrentUserId();

    const response = await serverApi<OrdersResponse>(
        `/users/${userId}/orders?limit=50`,
        {
            auth: true,
            revalidate: 60, // 1 minute (orders can change frequently)
            tags: [CACHE_TAGS.USER_ORDERS],
        }
    );

    return response.data || [];
});
