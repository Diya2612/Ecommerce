/**
 * useStockPolling Hook
 * 
 * Polls stock levels for products in an order at a regular interval.
 * Returns a map of product_id -> effective_stock (available - reserved).
 * This enables real-time stock validation in order forms.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { OrderItem } from '../types';

interface StockData {
  product_id: string;
  available_quantity: number;
  reserved_quantity: number;
  effective_stock: number;
}

interface UseStockPollingResult {
  /** Map of product_id -> effective stock (available - reserved) */
  stockMap: Map<string, number>;
  /** Whether stock data is currently being fetched */
  isLoading: boolean;
  /** Whether initial data has been loaded */
  isInitialLoading: boolean;
  /** Error if stock fetch failed */
  error: Error | null;
  /** Force refresh stock data */
  refetch: () => void;
}

/**
 * Hook to poll stock levels for order items
 * 
 * @param items - Order items to fetch stock for
 * @param enabled - Whether polling should be active (default: true)
 * @param intervalMs - Polling interval in milliseconds (default: 10000 = 10s)
 */
export function useStockPolling(
  items: OrderItem[],
  enabled: boolean = true,
  intervalMs: number = 10000
): UseStockPollingResult {
  // Extract unique product IDs from items
  const productIds = [...new Set(items.map(item => item.productId).filter(id => id !== null))];

  console.log('[useStockPolling] productIds:', productIds);
  console.log('[useStockPolling] enabled:', enabled, 'items.length:', items.length);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['stock-batch', productIds],
    queryFn: async () => {
      console.log('[useStockPolling] Fetching stock for:', productIds);
      if (productIds.length === 0) {
        return { stock: [] as StockData[] };
      }
      const result = await orderService.getStockBatch(productIds);
      console.log('[useStockPolling] API Response:', result);
      return result;
    },
    enabled: enabled && productIds.length > 0,
    refetchInterval: intervalMs,
    staleTime: intervalMs / 2, // Mark stale halfway through interval
    gcTime: intervalMs * 2, // Keep in cache for 2 intervals
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  });

  // Build a memoized map for easy lookup (prevents infinite re-renders)
  const stockMap = useMemo(() => {
    const map = new Map<string, number>();
    if (data?.stock) {
      for (const item of data.stock) {
        map.set(item.product_id, item.effective_stock);
      }
    }
    console.log('[useStockPolling] Built stockMap:', Object.fromEntries(map));
    return map;
  }, [data?.stock]);

  return {
    stockMap,
    isLoading: isLoading || isFetching,
    isInitialLoading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get effective stock for a specific item
 * Falls back to item's stored availableStock if not in the live stockMap
 */
export function getEffectiveStock(
  item: OrderItem,
  stockMap: Map<string, number>
): number {
  if (!item.productId) return item.availableStock;
  const liveStock = stockMap.get(item.productId);
  return liveStock !== undefined ? liveStock : item.availableStock;
}
