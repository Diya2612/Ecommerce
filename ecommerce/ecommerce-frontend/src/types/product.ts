/**
 * Product Page Types & Interfaces
 * Server-side migration type definitions for product detail pages
 */

// Re-export Product from home.ts for compatibility
export type { Product, ProductSpecs } from './home';

// ============================================================================
// Product Detail Extensions
// ============================================================================

export interface ProductFeature {
    icon: string;
    title: string;
    description: string;
}

export interface ProductColor {
    name: string;
    label: string;
    hex: string;
}

export interface ProductVariant {
    id: string | number;
    product_id: string | number;
    option_name: string;
    option_value: string;
    sku: string;
    barcode?: string | null;
    cost_price?: string;
    selling_price: string;
    compare_at_price?: string | null;
    image_url?: string | null;
    thumbnail_url?: string | null;
    is_default: boolean;
    is_active: boolean;
    inventory_quantity?: number;

    // Audit fields
    created_at?: string;
    updated_at?: string;
    created_by?: string | null;
    updated_by?: string | null;
    is_deleted?: boolean;
    deleted_at?: string | null;
    deleted_by?: string | null;
}

export interface ProductDetail {
    id: string | number;
    slug?: string;
    name: string;
    subtitle?: string;
    description?: string;
    tags: string[];
    rating: number;
    reviews: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    images?: string[];
    inStock: boolean;
    total_stock?: number;

    sku?: string;
    category?: string;
    categoryId?: string;
    brand?: string;
    brandId?: string;
    features?: ProductFeature[];
    colors?: ProductColor[];
    highlights?: string[];

    // Product variants
    has_variants?: boolean;
    variants?: ProductVariant[];
}

// ============================================================================
// Product Reviews
// ============================================================================

export interface ProductReview {
    id: number;
    author: string;
    avatar?: string;
    rating: number;
    date: string;
    timestamp?: string;
    verified: boolean;
    title?: string;
    content: string;
    helpful: number;
    images?: string[];
}

export interface ReviewsResponse {
    reviews: ProductReview[];
    total: number;
    averageRating: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

// ============================================================================
// Product Bundles
// ============================================================================

export interface BundleItem {
    id: string | number;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
}

export interface ProductBundle {
    id: number;
    name: string;
    items: BundleItem[];
    totalPrice: number;
    originalPrice: number;
    discount: number;
}

// ============================================================================
// Component Props
// ============================================================================

export interface ProductHeroSectionProps {
    productId: string;
}

export interface ProductHeroClientProps {
    product: ProductDetail;
    bundles: ProductBundle[];
}

export interface ReviewsSectionProps {
    productId: string;
}

export interface ReviewsClientProps {
    initialReviews: ProductReview[];
    totalReviews: number;
    productId: string;
    averageRating?: number;
}

export interface RelatedProductsSectionProps {
    productId: string;
}

export interface MoreFromBrandSectionProps {
    brandId: string;
    productId: string;
}

export interface MoreFromCategorySectionProps {
    categoryId: string;
    productId: string;
}

// ============================================================================
// Data Fetcher Response Types
// ============================================================================

export interface ProductsResponse {
    products: ProductDetail[];
    total: number;
}
