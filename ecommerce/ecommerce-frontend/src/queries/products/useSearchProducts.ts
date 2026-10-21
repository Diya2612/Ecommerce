/**
 * useSearchProducts Hook
 *
 * Custom hook for searching products.
 * Uses TanStack Query for caching and state management.
 */

import { useQuery } from '@tanstack/react-query';
import { searchProducts } from './queries';
import { productKeys } from './keys';

export function useSearchProducts(query: string, enabled = true) {
    return useQuery({
        queryKey: productKeys.search(query),
        queryFn: () => searchProducts(query),
        enabled: enabled && query.length >= 2,
        staleTime: 1000 * 60, // Cache results for 1 minute
    });
}
