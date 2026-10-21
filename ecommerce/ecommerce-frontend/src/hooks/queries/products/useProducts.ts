import { useQuery } from '@tanstack/react-query';
import {
    getAllProducts,
    getProductById,
    getProductBySlug,
    getSimilarProducts,
} from '@/queries';

export const PRODUCT_KEYS = {
    all: ['products'] as const,
    lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...PRODUCT_KEYS.lists(), params] as const,
    details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
    similar: (id: string) => [...PRODUCT_KEYS.detail(id), 'similar'] as const,
};

export function useProductsQuery(params?: Record<string, string | number>) {
    return useQuery({
        queryKey: PRODUCT_KEYS.list(params || {}),
        queryFn: () => getAllProducts(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useProductDetailQuery(id: string) {
    return useQuery({
        queryKey: PRODUCT_KEYS.detail(id),
        queryFn: () => getProductById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useProductBySlugQuery(slug: string) {
    return useQuery({
        queryKey: [...PRODUCT_KEYS.details(), 'slug', slug],
        queryFn: () => getProductBySlug(slug),
        enabled: !!slug,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useSimilarProductsQuery(id: string) {
    return useQuery({
        queryKey: PRODUCT_KEYS.similar(id),
        queryFn: () => getSimilarProducts(id),
        enabled: !!id,
    });
}
