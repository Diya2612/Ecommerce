import type { Product } from './home';

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper from backend
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    meta: {
        timestamp: string;
    };
    data: T;
}

/**
 * Products API data structure (unwrapped from ApiResponse)
 */
export interface ProductsApiData {
    products: CollectionProduct[];
    total: number;
    totalPages: number;
    currentPage: number;
}

/**
 * Backend single product API response data
 */
export interface BackendProductData {
    id: string;
    slug: string;
    product_title: string;
    secondary_title: string | null;
    short_description: string | null;
    full_description: string | null;
    status: string;
    cost_price: string;
    selling_price: string;
    compare_at_price: string | null;
    discount: number | null;
    sku: string | null;
    barcode: string | null;
    inStock: boolean;
    total_stock: number;
    primary_image_url: string;
    additional_images: string[];
    images: string[];
    category_tier_1: string | null;
    category_tier_2: string | null;
    category_tier_3: string | null;
    rating: number;
    review_count: number;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Collection Product Types
// ============================================================================

/**
 * Extended product for collection with category and technology info
 * Inherits from Product which already supports UUID strings and nullable prices
 */
export interface CollectionProduct extends Product {
    id: string | number;          // Enforce both types for clarity
    slug?: string;                 // Product slug for detail page links
    originalPrice?: number | null; // Allow both undefined and null
    category: string;
    technologies: string[];
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter state - synced with URL search params
 */
export interface CollectionFilters {
    categories: string[];
    technologies: string[];
    ratings: string[];
    priceRange: [number, number];
    sort: 'newest' | 'price-asc' | 'price-desc' | 'rating';
    search?: string;
    page: number;
    limit: number;
}

/**
 * Available filter options from backend
 */
export interface FilterOptions {
    categories: { id: string; label: string; count: number }[];
    technologies: { id: string; label: string; count: number }[];
    ratings: { value: string; count: number }[];
    priceRange: { min: number; max: number };
    context?: {
        level: number;
        parent: string | null;
    };
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated collection response
 */
export interface CollectionResponse {
    products: CollectionProduct[];
    total: number;
    totalPages: number;
    currentPage: number;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface FiltersClientProps {
    options: FilterOptions;
    currentFilters: CollectionFilters;
}

export interface ProductGridSectionProps {
    filters: CollectionFilters;
    products: CollectionProduct[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export interface PaginationClientProps {
    currentPage: number;
    totalPages: number;
}

export interface SortSelectClientProps {
    currentSort: string;
}
