/**
 * Product Types (Query Layer)
 *
 * Re-exports and extends types for the product domain.
 * Import from here in query functions and hooks.
 */

// Re-export from central types
export type {
    Product,
    ProductSpecs,
    ProductDetail,
    ProductReview,
    ReviewsResponse,
    ProductBundle,
    BundleItem,
    ProductsResponse,
} from '@/types/product';

// ============================================================================
// Query-specific Types
// ============================================================================

/**
 * Parameters for product list queries
 */
export interface GetProductsParams {
    page?: number;
    limit?: number;
    category?: string;
    categories?: string; // Comma-separated for collection filters
    brand?: string;
    technologies?: string; // Comma-separated
    ratings?: string; // Comma-separated
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular';
    search?: string;
}

/**
 * Paginated products response
 */
export interface PaginatedProducts {
    products: import('@/types/product').ProductDetail[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Filter options for collection pages
 */
export interface FilterOptions {
    categories: FilterOption[];
    technologies: FilterOption[];
    ratings: RatingOption[];
    priceRange: {
        min: number;
        max: number;
    };
    context?: {
        level: number;
        parent: string | null;
    };
}

export interface FilterOption {
    id: string;
    label: string;
    count: number;
}

export interface RatingOption {
    value: string;
    count: number;
}
