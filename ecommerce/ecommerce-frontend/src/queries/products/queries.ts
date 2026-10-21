/**
 * Product Query Functions
 *
 * Pure async functions for fetching product data.
 * Works in both Server Components and Client Components.
 *
 * @example
 * ```ts
 * // Server Component
 * const product = await getProductBySlug('water-purifier-x1');
 *
 * // TanStack Query hook
 * useQuery({ queryKey: productKeys.bySlug(slug), queryFn: () => getProductBySlug(slug) });
 * ```
 */

import { api, buildQueryString } from '@/api';
import { CACHE_TAGS, productTag, reviewsTag } from '@/lib/cache/tags';
import type {
    ProductDetail,
    ProductsResponse,
    ProductReview,
    ReviewsResponse,
    ProductBundle,
    GetProductsParams,
    PaginatedProducts,
    FilterOptions,
} from './types';
import type { Product } from '@/types/home';

// ============================================================================
// Single Product Queries
// ============================================================================

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<ProductDetail> {
    return api<ProductDetail>(`/products/${id}`, {
        revalidate: 3600,
        tags: [CACHE_TAGS.PRODUCT, productTag(id)],
    });
}

/**
 * Get product by slug (most common)
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail> {
    return api<ProductDetail>(`/products/slug/${slug}`, {
        revalidate: 3600,
        tags: [CACHE_TAGS.PRODUCT, `product-slug-${slug}`],
    });
}

// ============================================================================
// Product List Queries
// ============================================================================

/**
 * Get products with filters and pagination
 */
export async function getProducts(params: GetProductsParams = {}): Promise<PaginatedProducts> {
    const queryString = buildQueryString(params as Record<string, string | number | boolean>);

    const response = await api<ProductsResponse>(`/products${queryString}`, {
        revalidate: 60,
        tags: [CACHE_TAGS.PRODUCTS],
    });

    return {
        products: response.products,
        total: response.total,
        page: params.page || 1,
        limit: params.limit || 12,
        totalPages: Math.ceil(response.total / (params.limit || 12)),
    };
}

/**
 * Get all products (simple list, no pagination metadata)
 */
export async function getAllProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
    const queryString = buildQueryString(params as Record<string, string | number | boolean>);

    return api<ProductsResponse>(`/products${queryString}`, {
        revalidate: 60,
        tags: [CACHE_TAGS.PRODUCTS],
    });
}

/**
 * Search products by query string
 */
export async function searchProducts(query: string, limit = 10): Promise<PaginatedProducts> {
    if (!query || query.length < 2) {
        return {
            products: [],
            total: 0,
            page: 1,
            limit,
            totalPages: 0
        };
    }

    return api<PaginatedProducts>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        revalidate: false, // No cache for search
    });
}

// ============================================================================
// Featured Products
// ============================================================================

/**
 * Get featured products
 */
export async function getFeaturedProducts(): Promise<Product[]> {
    try {
        const products = await api<Product[]>('/products/featured', {
            revalidate: 0, // Disable cache to ensure fresh data after seeding
            tags: [CACHE_TAGS.PRODUCTS, 'featured-products'],
        });
        // Log success for debugging
        if (Array.isArray(products)) {
            console.log(`[getFeaturedProducts] Fetched ${products.length} products`);
        }
        return products;
    } catch (error) {
        console.error('[getFeaturedProducts] Primary fetch failed:', error);

        // Fallback: explicit IPv4 loopback
        try {
            console.log('[getFeaturedProducts] Retrying with 127.0.0.1...');
            const fallbackRes = await fetch('http://127.0.0.1:8000/api/products/featured', {
                next: { revalidate: 3600, tags: ['products', 'featured-products'] }
            });

            if (fallbackRes.ok) {
                const json = await fallbackRes.json();
                const data = json.data || json;
                if (Array.isArray(data)) {
                    console.log('[getFeaturedProducts] Fallback fetch successful:', data.length);
                    return data as Product[];
                }
            }
        } catch (retryError) {
            console.error('[getFeaturedProducts] Fallback fetch failed:', retryError);
        }

        return [];
    }
}

// ============================================================================
// Related/Similar Products
// ============================================================================

/**
 * Get related products for a product
 */
export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    return api<Product[]>(`/products/${productId}/related?limit=${limit}`, {
        revalidate: 3600,
        tags: [CACHE_TAGS.RELATED_PRODUCTS],
    });
}

/**
 * Get similar products (alias for related)
 */
export async function getSimilarProducts(productId: string, limit = 4): Promise<Product[]> {
    return api<Product[]>(`/products/${productId}/similar?limit=${limit}`, {
        revalidate: 3600,
        tags: [CACHE_TAGS.RELATED_PRODUCTS],
    });
}

// ============================================================================
// Category & Brand Products
// ============================================================================

/**
 * Get products by category
 */
export async function getProductsByCategory(
    categoryId: string,
    options: { excludeId?: string; limit?: number } = {}
): Promise<Product[]> {
    const { excludeId, limit = 6 } = options;
    let products = await api<Product[]>(`/categories/${categoryId}/products?limit=${limit}`, {
        revalidate: 3600,
        tags: [CACHE_TAGS.CATEGORY_PRODUCTS],
    });

    if (excludeId) {
        products = products.filter((p) => String(p.id) !== excludeId);
    }

    return products;
}

/**
 * Get products by brand
 */
export async function getProductsByBrand(
    brandId: string,
    options: { excludeId?: string; limit?: number } = {}
): Promise<Product[]> {
    const { excludeId, limit = 6 } = options;
    let products = await api<Product[]>(`/brands/${brandId}/products?limit=${limit}`, {
        revalidate: 3600,
        tags: [CACHE_TAGS.BRAND_PRODUCTS],
    });

    if (excludeId) {
        products = products.filter((p) => String(p.id) !== excludeId);
    }

    return products;
}

// ============================================================================
// Reviews
// ============================================================================

/**
 * Get product reviews with pagination
 */
export async function getProductReviews(
    productId: string,
    options: { page?: number; limit?: number } = {}
): Promise<ReviewsResponse> {
    const { page = 1, limit = 10 } = options;

    return api<ReviewsResponse>(
        `/products/${productId}/reviews?page=${page}&limit=${limit}`,
        {
            revalidate: 1800,
            tags: [CACHE_TAGS.PRODUCT_REVIEWS, reviewsTag(productId)],
        }
    );
}

// ============================================================================
// Bundles
// ============================================================================

/**
 * Get available bundles for a product
 */
export async function getProductBundles(productId: string): Promise<ProductBundle[]> {
    return api<ProductBundle[]>(`/products/${productId}/bundles`, {
        revalidate: 3600,
        tags: [CACHE_TAGS.PRODUCT_BUNDLES],
    });
}

// ============================================================================
// Filters
// ============================================================================

/**
 * Get filter options for collection pages
 */
export async function getFilterOptions(params: { categories?: string } = {}): Promise<FilterOptions> {
    const queryString = buildQueryString(params);
    return api<FilterOptions>(`/products/filters${queryString}`, {
        revalidate: 3600,
        tags: [CACHE_TAGS.COLLECTION_FILTERS],
    });
}
