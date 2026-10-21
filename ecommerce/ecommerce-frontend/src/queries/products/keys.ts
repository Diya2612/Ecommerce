/**
 * Product Query Keys
 *
 * Factory for generating consistent, type-safe query keys.
 * Used by TanStack Query hooks and for cache invalidation.
 */

export const productKeys = {
    // Root key for all product queries
    all: ['products'] as const,

    // Product lists
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: object) => [...productKeys.lists(), filters] as const,

    // Product details
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,

    // By slug (most common)
    bySlug: (slug: string) => [...productKeys.all, 'slug', slug] as const,

    // Related/similar products
    related: (id: string) => [...productKeys.detail(id), 'related'] as const,
    similar: (id: string) => [...productKeys.detail(id), 'similar'] as const,

    // Reviews
    reviews: (id: string) => [...productKeys.detail(id), 'reviews'] as const,

    // Bundles
    bundles: (id: string) => [...productKeys.detail(id), 'bundles'] as const,

    // Search
    search: (query: string) => [...productKeys.all, 'search', query] as const,

    // By category
    byCategory: (categoryId: string) => [...productKeys.all, 'category', categoryId] as const,

    // By brand
    byBrand: (brandId: string) => [...productKeys.all, 'brand', brandId] as const,

    // Filters metadata
    filters: (params?: { categories?: string }) => [...productKeys.all, 'filters', params] as const,

    // Featured products
    featured: () => [...productKeys.all, 'featured'] as const,
};
