
import type { Product } from './domain.types';
import type { ApiResponse, PaginationParams } from '@/types/api';

// API Query Params
export interface ProductsQueryParams extends PaginationParams {
    search?: string;
    status?: string | string[];
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock' | ('in_stock' | 'out_of_stock' | 'low_stock')[];
    category_tier_1?: string | string[];
    quickFilter?: string | string[];
    startDate?: string;
    endDate?: string;
}

// Backend Response Type for Product Details
export interface BackendProductDetail {
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
    sku: string;
    inStock: boolean;
    total_stock: number;
    base_inventory: number;
    primary_image_url: string | null;
    thumbnail_url?: string | null;
    additional_images: string[];
    additional_thumbnails?: string[];
    images: string[];
    category_tier_1: string | null;
    category_tier_2: string | null;
    category_tier_3: string | null;
    category_tier_4: string | null;
    rating: number;
    review_count: number;
    created_at: string;
    updated_at: string;
    weight: string | null;
    length: string | null;
    breadth: string | null;
    height: string | null;
    meta_title: string | null;
    meta_description: string | null;
    admin_comment: string | null;
    product_url: string | null;
    hsn_code: string | null;
    barcode: string | null;
    tags: string[] | null;
    featured: boolean;
    faqs?: Array<{ id: string; question: string; answer: string }>;

    // Variants support
    has_variants: boolean;
    variants: Array<{
        id: string;
        product_id: string;
        option_name: string;
        option_value: string;
        sku: string;
        barcode?: string | null;
        cost_price: string;
        selling_price: string;
        compare_at_price?: string | null;
        inventory_quantity?: number;
        image_url?: string | null;
        thumbnail_url?: string | null;
        is_default: boolean;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    }>;
}

export interface ProductsApiResponse extends ApiResponse<{
    products: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
}> { }

export interface ProductStats {
    total: number;
    active: number;
    featured: number;
    out_of_stock: number;
    low_stock: number;
}

// ==================== Inventory History Types ====================

export interface InventoryHistoryItem {
    id: string;
    adjustment_type: 'increase' | 'decrease' | 'correction' | 'write-off';
    quantity_change: number;
    reason: string;
    reference_number: string | null;
    quantity_before: number;
    quantity_after: number;
    adjusted_by: string;
    adjusted_at: string;
    notes: string | null;
    adjusted_by_name: string | null;
    target_name?: string;
    variant_sku?: string | null;
}

// Backend response structure from ResponseFormatter.paginated
export interface InventoryHistoryResponse {
    success: boolean;
    data: InventoryHistoryItem[];
    message: string;
    meta: {
        timestamp: string;
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    };
}

export interface InventoryHistoryParams {
    page?: number;
    limit?: number;
}

// ==================== Service Payload Types ====================

export interface BackendVariant {
    id?: string;
    product_id?: string;
    option_name: string;
    option_value: string;
    sku: string;
    barcode: string | null;
    cost_price: string;
    selling_price: string;
    compare_at_price: string | null;
    inventory_quantity: number;
    image_url: string | null;
    thumbnail_url: string | null;
    is_active?: boolean;
}

export interface CreateProductPayload {
    slug: string;
    product_title: string;
    secondary_title?: string;
    short_description?: string;
    full_description?: string;
    admin_comment?: string;
    status: string;
    featured: boolean;
    cost_price: string;
    selling_price: string;
    compare_at_price: string | null;
    sku: string;
    hsn_code?: string;
    barcode?: string;
    weight?: string;
    length?: string;
    breadth?: string;
    height?: string;
    category_tier_1?: string;
    category_tier_2?: string;
    category_tier_3?: string;
    category_tier_4?: string;
    primary_image_url?: string;
    thumbnail_url?: string;
    additional_images: string[];
    additional_thumbnails: string[];
    meta_title?: string;
    meta_description?: string;
    product_url?: string;
    tags: string[];
    faqs: Array<{ question: string; answer: string }>;
    inventory_quantity: number;
    has_variants: boolean;
    variants: BackendVariant[];
}


export interface UpdateProductPayload extends Omit<Partial<CreateProductPayload>,
    'category_tier_1' | 'category_tier_2' | 'category_tier_3' | 'category_tier_4' |
    'primary_image_url' | 'thumbnail_url' | 'compare_at_price' |
    'weight' | 'length' | 'breadth' | 'height' | 'barcode' | 'hsn_code' | 'hsn_code'
> {
    category_tier_1?: string | null;
    category_tier_2?: string | null;
    category_tier_3?: string | null;
    category_tier_4?: string | null;
    primary_image_url?: string | null;
    thumbnail_url?: string | null;
    compare_at_price?: string | null;
    weight?: string | null;
    length?: string | null;
    breadth?: string | null;
    height?: string | null;
    barcode?: string | null;
    hsn_code?: string | null;
    variant_metadata?: any; // For flexible updates
}

// ==================== Structured Error Types ====================

/**
 * Base error interface for product mutations
 */
export interface ProductMutationError {
    type: 'validation' | 'network' | 'server' | 'conflict' | 'not_found' | 'unknown';
    message: string;
    statusCode?: number;
    field?: string; // For validation errors
    details?: Record<string, any>;
}

/**
 * Validation error for form field errors
 */
export interface ValidationError extends ProductMutationError {
    type: 'validation';
    field: string;
    statusCode: 400;
}

/**
 * Network error for connection issues
 */
export interface NetworkError extends ProductMutationError {
    type: 'network';
    message: string;
}

/**
 * Server error for 500+ responses
 */
export interface ServerError extends ProductMutationError {
    type: 'server';
    statusCode: number;
}

/**
 * Conflict error for duplicate SKU, slug, etc.
 */
export interface ConflictError extends ProductMutationError {
    type: 'conflict';
    statusCode: 409;
    field?: string;
}

/**
 * Not found error for non-existent resources
 */
export interface NotFoundError extends ProductMutationError {
    type: 'not_found';
    statusCode: 404;
}

/**
 * Type guard to check if error is a ProductMutationError
 */
export function isProductMutationError(error: any): error is ProductMutationError {
    return error && typeof error === 'object' && 'type' in error && 'message' in error;
}

/**
 * Parse unknown error into structured ProductMutationError
 */
export function parseProductError(error: any): ProductMutationError {
    // Already structured
    if (isProductMutationError(error)) {
        return error;
    }

    // API error response with status code
    if (error?.response?.status) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message || 'An error occurred';
        const details = error.response.data?.details;

        if (status === 400 && details?.field) {
            return {
                type: 'validation',
                message,
                statusCode: 400,
                field: details.field,
                details
            };
        }

        if (status === 404) {
            return {
                type: 'not_found',
                message,
                statusCode: 404
            };
        }

        if (status === 409) {
            return {
                type: 'conflict',
                message,
                statusCode: 409,
                field: details?.field
            };
        }

        if (status >= 500) {
            return {
                type: 'server',
                message,
                statusCode: status
            };
        }
    }

    // Network error
    if (error?.name === 'NetworkError' || error?.message?.includes('network') || !navigator.onLine) {
        return {
            type: 'network',
            message: 'Network connection failed. Please check your internet connection.'
        };
    }

    // Unknown error
    return {
        type: 'unknown',
        message: error?.message || 'An unexpected error occurred'
    };
}
