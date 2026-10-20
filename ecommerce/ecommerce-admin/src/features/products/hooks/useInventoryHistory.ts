/**
 * useInventoryHistory Hook
 * 
 * Fetches inventory adjustment history for a product with pagination support.
 */

import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { productKeys } from './useProducts';
import type { InventoryHistoryItem } from '../types';

interface UseInventoryHistoryOptions {
    productId: string | undefined;
    page?: number;
    limit?: number;
    enabled?: boolean;
}

interface UseInventoryHistoryReturn {
    data: InventoryHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    } | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useInventoryHistory({
    productId,
    page = 1,
    limit = 20,
    enabled = true,
}: UseInventoryHistoryOptions): UseInventoryHistoryReturn {
    const query = useQuery({
        queryKey: productKeys.inventoryHistory(productId!, page, limit),
        queryFn: () => productService.getProductInventoryHistory(productId!, { page, limit }),
        enabled: enabled && !!productId,
        staleTime: 30 * 1000, // 30 seconds
    });

    return {
        data: query.data?.items ?? [],
        pagination: query.data?.pagination ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
