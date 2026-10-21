'use client';

/**
 * Product Query Hooks
 *
 * TanStack Query hooks wrapping product query functions.
 * Use these in client components that need product data.
 */

import { useQuery } from '@tanstack/react-query';
import {
    productKeys,
    getProductById,
    getProductBySlug,
    getProducts,
    searchProducts,
    getRelatedProducts,
    getSimilarProducts,
    getProductsByCategory,
    getProductsByBrand,
    getProductReviews,
    getProductBundles,
    getFilterOptions,
} from '@/queries/products';
import type {
    ProductDetail,
    PaginatedProducts,
    ReviewsResponse,
    ProductBundle,
    GetProductsParams,
    FilterOptions,
} from '@/queries/products';
import type { Product } from '@/types/home';

// ============================================================================
// Single Product Hooks
// ============================================================================

interface UseProductOptions {
    initialData?: ProductDetail;
    enabled?: boolean;
}

/**
 * Fetch product by ID
 */
export function useProductById(id: string, options: UseProductOptions = {}) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => getProductById(id),
        initialData: options.initialData,
        enabled: options.enabled ?? !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Fetch product by slug (most common)
 */
export function useProduct(slug: string, options: UseProductOptions = {}) {
    return useQuery({
        queryKey: productKeys.bySlug(slug),
        queryFn: () => getProductBySlug(slug),
        initialData: options.initialData,
        enabled: options.enabled ?? !!slug,
        staleTime: 1000 * 60 * 5,
    });
}

// ============================================================================
// Product List Hooks
// ============================================================================

interface UseProductsOptions {
    initialData?: PaginatedProducts;
    enabled?: boolean;
}

/**
 * Fetch products with filters
 */
export function useProducts(params: GetProductsParams = {}, options: UseProductsOptions = {}) {
    return useQuery({
        queryKey: productKeys.list(params),
        queryFn: () => getProducts(params),
        initialData: options.initialData,
        enabled: options.enabled ?? true,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Search products
 */
export function useProductSearch(query: string, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: productKeys.search(query),
        queryFn: () => searchProducts(query),
        enabled: (options.enabled ?? true) && query.length >= 2,
        staleTime: 1000 * 30, // 30 seconds

    });
}

// ============================================================================
// Related Products Hooks
// ============================================================================

interface UseRelatedOptions {
    initialData?: Product[];
    enabled?: boolean;
    limit?: number;
}

/**
 * Fetch related products
 */
export function useRelatedProducts(productId: string, options: UseRelatedOptions = {}) {
    const { limit = 4, ...restOptions } = options;

    return useQuery({
        queryKey: productKeys.related(productId),
        queryFn: () => getRelatedProducts(productId, limit),
        initialData: restOptions.initialData,
        enabled: restOptions.enabled ?? !!productId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Fetch similar products
 */
export function useSimilarProducts(productId: string, options: UseRelatedOptions = {}) {
    const { limit = 4, ...restOptions } = options;

    return useQuery({
        queryKey: productKeys.similar(productId),
        queryFn: () => getSimilarProducts(productId, limit),
        initialData: restOptions.initialData,
        enabled: restOptions.enabled ?? !!productId,
        staleTime: 1000 * 60 * 10,
    });
}

// ============================================================================
// Category & Brand Hooks
// ============================================================================

interface UseCategoryProductsOptions {
    excludeId?: string;
    limit?: number;
    initialData?: Product[];
    enabled?: boolean;
}

/**
 * Fetch products by category
 */
export function useProductsByCategory(categoryId: string, options: UseCategoryProductsOptions = {}) {
    const { excludeId, limit = 6, ...restOptions } = options;

    return useQuery({
        queryKey: productKeys.byCategory(categoryId),
        queryFn: () => getProductsByCategory(categoryId, { excludeId, limit }),
        initialData: restOptions.initialData,
        enabled: restOptions.enabled ?? !!categoryId,
        staleTime: 1000 * 60 * 10,
    });
}

/**
 * Fetch products by brand
 */
export function useProductsByBrand(brandId: string, options: UseCategoryProductsOptions = {}) {
    const { excludeId, limit = 6, ...restOptions } = options;

    return useQuery({
        queryKey: productKeys.byBrand(brandId),
        queryFn: () => getProductsByBrand(brandId, { excludeId, limit }),
        initialData: restOptions.initialData,
        enabled: restOptions.enabled ?? !!brandId,
        staleTime: 1000 * 60 * 10,
    });
}

// ============================================================================
// Reviews Hook
// ============================================================================

interface UseReviewsOptions {
    page?: number;
    limit?: number;
    initialData?: ReviewsResponse;
    enabled?: boolean;
}

/**
 * Fetch product reviews
 */
export function useProductReviews(productId: string, options: UseReviewsOptions = {}) {
    const { page = 1, limit = 10, ...restOptions } = options;

    return useQuery({
        queryKey: [...productKeys.reviews(productId), { page, limit }],
        queryFn: () => getProductReviews(productId, { page, limit }),
        initialData: restOptions.initialData,
        enabled: restOptions.enabled ?? !!productId,
        staleTime: 1000 * 60 * 5,
    });
}

// ============================================================================
// Bundles Hook
// ============================================================================

interface UseBundlesOptions {
    initialData?: ProductBundle[];
    enabled?: boolean;
}

/**
 * Fetch product bundles
 */
export function useProductBundles(productId: string, options: UseBundlesOptions = {}) {
    return useQuery({
        queryKey: productKeys.bundles(productId),
        queryFn: () => getProductBundles(productId),
        initialData: options.initialData,
        enabled: options.enabled ?? !!productId,
        staleTime: 1000 * 60 * 10,
    });
}

// ============================================================================
// Filters Hook
// ============================================================================

interface UseFiltersOptions {
    params?: { categories?: string };
    initialData?: FilterOptions;
    enabled?: boolean;
}

/**
 * Fetch filter options
 */
export function useFilterOptions(options: UseFiltersOptions = {}) {
    const { params = {}, ...restOptions } = options;
    return useQuery({
        queryKey: productKeys.filters(params),
        queryFn: () => getFilterOptions(params),
        initialData: restOptions.initialData,
        enabled: restOptions.enabled ?? true,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
