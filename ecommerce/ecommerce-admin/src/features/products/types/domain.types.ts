export interface ProductImage {
    id: string;
    url: string;
    isPrimary: boolean;
    file?: File; // Optional if needed for upload logic
    name?: string;
    size?: number;
    uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
    /** Blob URL for instant preview (local file, not yet uploaded) */
    previewUrl?: string;
    /** Upload progress percentage (0-100) */
    uploadProgress?: number;
    /** Error message if upload failed */
    errorMessage?: string;
    /** Thumbnail URL (compressed, for faster grid loading) */
    thumbnailUrl?: string;
}

import type { PendingFile } from '@/types/media';

export interface PendingImage extends PendingFile {
    /** Is this the primary/cover image? */
    isPrimary: boolean;
    /** The thumbnail URL after successful upload */
    uploadedThumbnailUrl?: string;
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export interface VariantOption {
    id: string;
    name: string;
    values: string[];
}

export interface ProductVariant {
    id: string;
    // Dimensions
    optionName?: string; // Single dimension support
    optionValue?: string; // Single dimension support
    combination?: { [key: string]: string }; // Multi-dimension support

    image?: string;
    imageFile?: File; // For deferred upload
    previewUrl?: string; // For deferred upload preview
    sku: string;
    barcode?: string;

    // Pricing
    costPrice?: string;
    sellingPrice: string;
    compareAtPrice?: string;
    price?: string; // Alternative pricing field for variants

    // Inventory
    inventoryQuantity: string;

    enabled?: boolean;
}

export interface Product {
    id: string;
    slug?: string;
    product_title: string;
    selling_price: string;
    cost_price?: string;
    compare_at_price?: string | null;
    primary_image_url?: string | null;
    sku?: string;
    barcode?: string;
    hsn_code?: string;
    weight?: string | null;
    length?: string | null;
    breadth?: string | null;
    height?: string | null;
    // Phase 2A: inventory_quantity removed - products use inventory table
    status: 'draft' | 'active' | 'archived';
    featured?: boolean;
    category_tier_1?: string;
    category_tier_2?: string;
    tags?: string[] | null;
    total_stock?: number;
    rating?: number;
    review_count?: number;
    created_at: string;
    updated_at?: string;
}
