import { useQuery } from '@tanstack/react-query';
import { getFeaturedProducts, productKeys } from '@/queries/products';
import { Product } from '@/types/home';

/**
 * Hook to fetch featured products using React Query.
 * Can be used in Client Components for dynamic data.
 */
export function useFeaturedProducts() {
    return useQuery<Product[]>({
        queryKey: productKeys.featured(),
        queryFn: () => getFeaturedProducts(),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
