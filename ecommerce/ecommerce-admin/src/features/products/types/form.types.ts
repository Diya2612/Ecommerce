import type { ProductImage, PendingImage, FAQItem, ProductVariant, VariantOption } from './domain.types';
import type { ValidationErrors, BaseFormSectionProps } from '@/types/form';

export type { ValidationErrors };

/**
 * Callbacks for expanding accordions during validation
 */
export interface ValidationCallbacks {
    setExpandedVariantId?: (id: string) => void;
    setExpandedFaqId?: (id: string) => void;
}

/**
 * Image validation options
 */
export interface ImageValidationOptions {
    pendingPrimaryImage: PendingImage | null;
    existingImages?: ProductImage[];
    isEditMode?: boolean;
}

// NOTE: This is the main ProductFormData interface used throughout the application.
// The validation schema in '../validation/productSchema.ts' exports ProductSchemaData instead
// to avoid naming conflicts. Both should eventually be unified in a future refactor.
export interface ProductFormData {
    // Basic Product Details
    productTitle: string;
    secondaryTitle?: string;
    shortDescription?: string;
    fullDescription: string;

    // Pricing
    costPrice: string;
    sellingPrice: string;
    compareAtPrice?: string;

    //Product Identification
    sku?: string;
    hsnNumber?: string;
    barcode?: string;

    // Inventory & Dimensions
    inventoryQuantity?: string;
    weight?: string;
    length?: string;
    breadth?: string;
    height?: string;

    // Categorization (4-tier hierarchy - matching schema)
    tier1Category: string;
    tier2Category?: string;
    tier3Category?: string;
    tier4Category?: string;

    // Availability & Flags
    productStatus?: 'draft' | 'active' | 'archived' | 'schedule';
    featured?: boolean;
    scheduleDate?: string;
    scheduleTime?: string;
    preorderEnabled?: boolean;
    preorderDate?: string;
    limitedEdition?: boolean;
    delistProduct?: boolean;
    delistDate?: string;
    giftWrapAvailable?: boolean;
    salesChannels?: string[];
    adminComment?: string;

    // Media
    productImages: ProductImage[];
    primaryImage?: string;
    additionalImages?: string[];

    // SEO & URL
    productUrl: string;
    metaTitle?: string;
    metaDescription?: string;

    // FAQ
    faqs?: FAQItem[];

    // Tags
    tags?: string[];
    size?: string;
    accessoriesGroup?: string;
    pickupLocation?: string;

    // Auto-generated slug
    slug?: string;

    // Variants
    productVariants?: ProductVariant[];
    variantOptions?: VariantOption[];

    // Read-only Metadata
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string; // Placeholder
}

// ==================== Component Props Interfaces ====================

export interface ImageUploaderProps {
    primaryImage: string;
    additionalImages: string[];
    onPrimaryImageChange: (url: string) => void;
    onAdditionalImagesChange: (urls: string[]) => void;
}

// ==================== Form Section Props Interfaces ====================

export type { BaseFormSectionProps };

// Form sections with standard props
export interface BasicDetailsSectionProps extends BaseFormSectionProps<ProductFormData> { }
export interface PricingSectionProps extends BaseFormSectionProps<ProductFormData> { }
export interface InventorySectionProps extends BaseFormSectionProps<ProductFormData> { }
export interface CategorizationSectionProps extends BaseFormSectionProps<ProductFormData> { }

// Form sections with additional/modified props
export interface PricingInventorySectionProps extends BaseFormSectionProps {
    productId?: string; // Only provided on Edit page
}

export interface SeoSectionProps extends BaseFormSectionProps {
    readOnlyUrl?: boolean;
}

// Specialized sections that don't fit the base pattern
export interface ProductMetricsSectionProps {
    productMetadata: {
        createdAt: string;
        createdBy?: string;
        lastModified: string;
        totalViews: number;
        totalSales: number;
    };
}

export interface IdentificationSectionProps {
    formData: ProductFormData;
    handleInputChange: (field: keyof ProductFormData, value: any) => void;
}

export interface FAQSectionProps {
    formData: ProductFormData;
    handleAddFAQ: () => void;
    handleRemoveFAQ: (id: string) => void;
    handleFAQChange: (id: string, field: 'question' | 'answer', value: string) => void;
    expandedFaqId?: string | null;
    setExpandedFaqId?: (id: string | null) => void;
}

export interface AvailabilitySectionProps extends BaseFormSectionProps { }
export interface AssociationsSectionProps extends BaseFormSectionProps { }
export interface SalesChannelsSectionProps extends BaseFormSectionProps { }
