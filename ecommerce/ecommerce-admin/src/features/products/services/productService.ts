import {
  makeGetRequestWithParams,
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
  httpClient
} from "@/lib/api";
import { API_ROUTES } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';
import type {
  ProductsApiResponse,
  ProductsQueryParams,
  ProductFormData,
  BackendProductDetail,
  ProductStats,
  InventoryHistoryItem,
  InventoryHistoryResponse,
  ProductImage,
  ProductVariant,
  CreateProductPayload,
  UpdateProductPayload,
  BackendVariant
} from "../types";
import { generateSlug } from '@/utils';

/**
 * Transformation utilities for converting between frontend and backend formats
 */
const transformHelpers = {
  /** Convert empty strings to undefined */
  toOptionalString: (value: string | null | undefined): string | undefined =>
    value && value.trim() ? value.trim() : undefined,

  /** Convert numeric strings to decimal or undefined (for create operations) */
  toOptionalDecimal: (value: string | null | undefined): string | undefined => {
    if (!value || value.trim() === '' || value === '0') return undefined;
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 ? num.toFixed(2) : undefined;
  },

  /** Convert numeric strings to decimal or null (for update operations) */
  toNullableDecimal: (value: string | null | undefined): string | null => {
    if (!value || value.trim() === '' || value === '0') return null;
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 ? num.toFixed(2) : null;
  },

  /** Map frontend status values to backend-supported values */
  mapStatus: (frontendStatus: string): string => {
    const statusMap: Record<string, string> = {
      'draft': 'draft',
      'active': 'active',
      'archived': 'archived',
      'schedule': 'draft',
    };
    return statusMap[frontendStatus] || 'draft';
  }
} as const;

/**
 * Image transformation utilities
 */
const imageTransformers = {
  /** Extract the primary image from an array */
  extractPrimary: (images: ProductImage[]) =>
    images.find(img => img.isPrimary) || images[0] || null,

  /** Build complete image payload for create operations */
  buildPayload: (images: ProductImage[]) => {
    const primary = imageTransformers.extractPrimary(images);
    const primaryUrl = primary?.url;
    const additional = images.filter(img => img.url !== primaryUrl && img.url?.trim());

    return {
      primary_image_url: primaryUrl || undefined,
      thumbnail_url: primary?.thumbnailUrl || undefined,
      additional_images: additional.map(img => img.url).filter(Boolean),
      additional_thumbnails: additional.map(img => img.thumbnailUrl || '').filter(Boolean),
    };
  },

  /** Build image payload for update operations (returns null instead of undefined) */
  buildUpdatePayload: (images: ProductImage[]) => {
    const primary = imageTransformers.extractPrimary(images);
    const primaryUrl = primary?.url;
    const additional = images.filter(img => img.url !== primaryUrl && img.url?.trim());

    return {
      primary_image_url: primaryUrl || null,
      thumbnail_url: primary?.thumbnailUrl || null,
      additional_images: additional.map(img => img.url).filter(Boolean),
      additional_thumbnails: additional.map(img => img.thumbnailUrl || '').filter(Boolean),
    };
  }
} as const;

/**
 * Variant transformation utilities
 */

/**
 * Mappers for Backend -> Frontend
 */
const backendMappers = {
  images: (data: BackendProductDetail): ProductImage[] => {
    const images: ProductImage[] = [];
    if (data.primary_image_url) {
      images.push({
        id: 'primary',
        url: data.primary_image_url,
        isPrimary: true,
        uploadStatus: 'success',
        thumbnailUrl: data.thumbnail_url || undefined,
      });
    }
    if (data.additional_images && Array.isArray(data.additional_images)) {
      const addThumbnails = Array.isArray(data.additional_thumbnails) ? data.additional_thumbnails : [];
      data.additional_images.forEach((url: string, index: number) => {
        images.push({
          id: `additional-${index}`,
          url: url,
          isPrimary: false,
          uploadStatus: 'success',
          thumbnailUrl: addThumbnails[index] || undefined,
        });
      });
    }
    return images;
  },

  variants: (variants: BackendProductDetail['variants']): ProductVariant[] => {
    return (variants || []).map(v => ({
      id: v.id,
      optionName: v.option_name,
      optionValue: v.option_value,
      sku: v.sku,
      barcode: v.barcode || '',
      costPrice: v.cost_price,
      sellingPrice: v.selling_price,
      compareAtPrice: v.compare_at_price || '',
      inventoryQuantity: String(v.inventory_quantity || 0),
      image: v.image_url || '',
      enabled: v.is_active,
    }));
  },

  faqs: (faqs: BackendProductDetail['faqs']) => {
    return (faqs || []).map((faq: any, index: number) => ({
      id: faq.id || `faq-${index}`,
      question: faq.question || '',
      answer: faq.answer || '',
    }));
  }
};

/**
 * Variant transformation utilities
 */
const variantTransformers = {
  /** Transform frontend variant to backend format */
  toBackend: (variant: ProductVariant, isUpdate = false): BackendVariant => ({
    // Include ID only for updates (and only if it's a real backend ID)
    ...(isUpdate && variant.id && !variant.id.startsWith('variant-') && { id: variant.id }),
    option_name: variant.optionName || '',
    option_value: variant.optionValue || '',
    sku: variant.sku,
    barcode: variant.barcode || null,
    cost_price: variant.costPrice || '0.00',
    selling_price: variant.sellingPrice,
    compare_at_price: variant.compareAtPrice || null,
    inventory_quantity: parseInt(variant.inventoryQuantity || '0', 10),
    image_url: variant.image || null,
    thumbnail_url: null,
    // Include is_active only for updates
    ...(isUpdate && { is_active: variant.enabled ?? true }),
  })
} as const;

export const productService = {
  getProducts: async (params: ProductsQueryParams): Promise<ProductsApiResponse['data']> => {
    logger.debug('[ProductService] Calling API with params', params);
    const response = await makeGetRequestWithParams<ProductsApiResponse>(
      API_ROUTES.PRODUCTS.BASE,
      params
    );
    // Extract the nested data object from backend response
    return response.data.data;
  },

  getProductById: async (id: string): Promise<ProductFormData> => {
    const response = await makeGetRequest<{ data: BackendProductDetail }>(
      API_ROUTES.PRODUCTS.BY_ID(id)
    );
    const data = response.data.data;

    // Map Backend Snake_Case to Frontend CamelCase
    return {
      id: data.id,
      productTitle: data.product_title,
      secondaryTitle: data.secondary_title || '',
      shortDescription: data.short_description || '',
      fullDescription: data.full_description || '',
      adminComment: data.admin_comment || '',

      costPrice: data.cost_price || '0',
      sellingPrice: data.selling_price || '0',
      compareAtPrice: data.compare_at_price || '0',

      sku: data.sku || '',
      hsnNumber: data.hsn_code || '',
      barcode: data.barcode || '',

      inventoryQuantity: String(data.base_inventory ?? data.total_stock ?? 0),
      weight: data.weight || '',
      length: data.length || '',
      breadth: data.breadth || '',
      height: data.height || '',

      tier1Category: data.category_tier_1 || '',
      tier2Category: data.category_tier_2 || '',
      tier3Category: data.category_tier_3 || '',
      tier4Category: data.category_tier_4 || '',

      productStatus: (data.status as 'draft' | 'active' | 'archived' | 'schedule') || 'draft',
      featured: data.featured || false,

      productImages: backendMappers.images(data),

      productUrl: data.product_url || '',
      metaTitle: data.meta_title || '',
      metaDescription: data.meta_description || '',

      faqs: backendMappers.faqs(data.faqs),

      tags: (data.tags as string[]) || [],

      slug: data.slug || '',

      // Variants
      productVariants: backendMappers.variants(data.variants),

      // Metadata
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: 'Admin' // Placeholder
    } as ProductFormData;
  },

  createProduct: async (data: ProductFormData) => {
    // Map Frontend CamelCase to Backend Snake_Case
    const payload: CreateProductPayload = {
      slug: data.slug || generateSlug(data.productTitle),
      product_title: data.productTitle,
      secondary_title: transformHelpers.toOptionalString(data.secondaryTitle),
      short_description: transformHelpers.toOptionalString(data.shortDescription),
      full_description: transformHelpers.toOptionalString(data.fullDescription),
      admin_comment: transformHelpers.toOptionalString(data.adminComment),


      status: transformHelpers.mapStatus(data.productStatus || 'draft'),
      featured: data.featured || false,

      cost_price: data.costPrice || '0.00',
      selling_price: data.sellingPrice,
      compare_at_price: data.compareAtPrice || null,

      sku: data.sku || '',
      hsn_code: transformHelpers.toOptionalString(data.hsnNumber),
      barcode: transformHelpers.toOptionalString(data.barcode),

      weight: transformHelpers.toOptionalString(data.weight),
      length: transformHelpers.toOptionalString(data.length),
      breadth: transformHelpers.toOptionalString(data.breadth),
      height: transformHelpers.toOptionalString(data.height),

      // Categories - Send UUIDs to backend
      category_tier_1: transformHelpers.toOptionalString(data.tier1Category),
      category_tier_2: transformHelpers.toOptionalString(data.tier2Category),
      category_tier_3: transformHelpers.toOptionalString(data.tier3Category),
      category_tier_4: transformHelpers.toOptionalString(data.tier4Category),

      // Images - use imageTransformers helper
      ...imageTransformers.buildPayload(data.productImages),

      // SEO
      meta_title: transformHelpers.toOptionalString(data.metaTitle),
      meta_description: transformHelpers.toOptionalString(data.metaDescription),
      product_url: transformHelpers.toOptionalString(data.productUrl),

      tags: data.tags || [],

      // FAQs - send array of question/answer pairs
      faqs: (data.faqs || []).map(faq => ({
        question: faq.question,
        answer: faq.answer,
      })),

      // Inventory - Restore for creation
      inventory_quantity: parseInt(data.inventoryQuantity || '0', 10),

      // Variants support
      has_variants: (data.productVariants?.length ?? 0) > 0,
      variants: (data.productVariants || []).map(v => variantTransformers.toBackend(v, false)),
    };

    logger.debug('[ProductService] Creating product with payload', payload);

    const response = await makePostRequest<{ data: any }>(
      API_ROUTES.PRODUCTS.BASE,
      payload
    );
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<ProductFormData>) => {
    // Map Frontend CamelCase to Backend Snake_Case
    const payload: UpdateProductPayload = {};

    if (data.productTitle !== undefined) payload.product_title = data.productTitle;
    if (data.secondaryTitle !== undefined) payload.secondary_title = data.secondaryTitle;
    if (data.shortDescription !== undefined) payload.short_description = data.shortDescription;
    if (data.fullDescription !== undefined) payload.full_description = data.fullDescription;
    if (data.adminComment !== undefined) payload.admin_comment = data.adminComment;


    if (data.costPrice !== undefined) payload.cost_price = data.costPrice;
    if (data.sellingPrice !== undefined) payload.selling_price = data.sellingPrice;
    if (data.compareAtPrice !== undefined) {
      // Convert "0" or empty string to null to avoid constraint violations
      const comparePrice = parseFloat(data.compareAtPrice);
      payload.compare_at_price = (!isNaN(comparePrice) && comparePrice > 0) ? data.compareAtPrice : null;
    }

    if (data.sku !== undefined) payload.sku = data.sku;
    if (data.hsnNumber !== undefined) payload.hsn_code = data.hsnNumber;
    if (data.barcode !== undefined) payload.barcode = data.barcode;

    // Inventory
    if (data.inventoryQuantity !== undefined) {
      payload.inventory_quantity = parseInt(data.inventoryQuantity || '0', 10);
    }

    // Dimensional fields - convert empty strings to null, validate decimals
    if (data.weight !== undefined) payload.weight = transformHelpers.toNullableDecimal(data.weight);
    if (data.length !== undefined) payload.length = transformHelpers.toNullableDecimal(data.length);
    if (data.breadth !== undefined) payload.breadth = transformHelpers.toNullableDecimal(data.breadth);
    if (data.height !== undefined) payload.height = transformHelpers.toNullableDecimal(data.height);

    // Categories - Convert empty strings to null (DB expects UUID or null, not empty string)
    if (data.tier1Category !== undefined) {
      payload.category_tier_1 = data.tier1Category && data.tier1Category.trim() ? data.tier1Category : null;
    }
    if (data.tier2Category !== undefined) {
      payload.category_tier_2 = data.tier2Category && data.tier2Category.trim() ? data.tier2Category : null;
    }
    if (data.tier3Category !== undefined) {
      payload.category_tier_3 = data.tier3Category && data.tier3Category.trim() ? data.tier3Category : null;
    }
    if (data.tier4Category !== undefined) {
      payload.category_tier_4 = data.tier4Category && data.tier4Category.trim() ? data.tier4Category : null;
    }

    // Slug
    if (data.slug !== undefined) payload.slug = data.slug;

    // Map frontend status to backend-supported values
    if (data.productStatus !== undefined) {
      payload.status = transformHelpers.mapStatus(data.productStatus);
    }
    if (data.featured !== undefined) payload.featured = data.featured;

    // SEO
    if (data.productUrl !== undefined) payload.product_url = data.productUrl;
    if (data.metaTitle !== undefined) payload.meta_title = data.metaTitle;
    if (data.metaDescription !== undefined) payload.meta_description = data.metaDescription;

    // Images (assuming new array replaces old one)
    if (data.productImages !== undefined) {
      const imagePayload = imageTransformers.buildUpdatePayload(data.productImages);
      // Ensure arrays are actual arrays, not stringified
      payload.primary_image_url = imagePayload.primary_image_url;
      payload.thumbnail_url = imagePayload.thumbnail_url;
      payload.additional_images = Array.isArray(imagePayload.additional_images) ? imagePayload.additional_images : [];
      payload.additional_thumbnails = Array.isArray(imagePayload.additional_thumbnails) ? imagePayload.additional_thumbnails : [];
    }

    // Tags - ensure it's an actual array, not a string
    if (data.tags !== undefined) {
      let tags = data.tags;
      // Handle if tags is a string (e.g., "[]" or "[\"tag1\",\"tag2\"]")
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch {
          tags = [];
        }
      }
      payload.tags = Array.isArray(tags) ? tags : [];
    }

    // FAQs - send array of question/answer pairs
    if (data.faqs !== undefined && data.faqs.length > 0) {
      payload.faqs = data.faqs.map(faq => ({
        question: faq.question,
        answer: faq.answer,
      }));
    }

    // Variants support - send variants to backend
    if (data.productVariants !== undefined) {
      payload.has_variants = data.productVariants.length > 0;
      payload.variants = data.productVariants.map(v => variantTransformers.toBackend(v, true));
    }

    logger.debug('[ProductService] Updating product with payload', payload);

    const response = await makePutRequest<{ data: ProductFormData }>(
      API_ROUTES.PRODUCTS.BY_ID(id),
      payload
    );
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await makeDeleteRequest<{ message: string }>(
      API_ROUTES.PRODUCTS.BY_ID(id)
    );
    return response.data;
  },

  bulkDeleteProducts: async (ids: string[]) => {
    const response = await makePostRequest<{ message: string; data: any }>(
      `${API_ROUTES.PRODUCTS.BASE}/bulk-delete`,
      { ids }
    );
    return response.data;
  },

  duplicateProducts: async (ids: string[]) => {
    const response = await makePostRequest<{ message: string; data: { count: number } }>(
      `${API_ROUTES.PRODUCTS.BASE}/duplicate`,
      { ids }
    );
    return response.data;
  },

  importProducts: async (data: any[], mode: 'create' | 'update' | 'upsert'): Promise<{
    success: number;
    failed: number;
    skipped: number;
    errors: Array<{ row: number; sku: string; error: string }>;
  }> => {
    try {
      const response = await makePostRequest<{ data: any }, { data: any[]; mode: string }>(
        `${API_ROUTES.PRODUCTS.BASE}/import`,
        { data, mode }
      );
      return response.data.data;
    } catch (error) {
      logger.error('Failed to import products', error);
      throw error;
    }
  },

  exportProducts: async (options: {
    scope: 'all' | 'selected';
    format: 'csv' | 'xlsx';
    selectedIds?: string[];
    selectedColumns: string[];
    dateRange?: { from: string; to: string };
    status?: string | string[];
    stockStatus?: string | string[];
    categoryId?: string | string[];
    search?: string;
  }): Promise<Blob> => {
    try {
      const response = await httpClient.post(
        `${API_ROUTES.PRODUCTS.BASE}/export`,
        options,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to export products', error);
      throw error;
    }
  },

  getProductStats: async (): Promise<ProductStats> => {
    const response = await makeGetRequest<{ data: ProductStats }>(
      `${API_ROUTES.PRODUCTS.BASE}/stats`
    );
    return response.data.data;
  },

  /**
   * Get inventory adjustment history for a product
   */
  getProductInventoryHistory: async (
    productId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{
    items: InventoryHistoryItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const response = await makeGetRequestWithParams<InventoryHistoryResponse>(
      API_ROUTES.INVENTORY.PRODUCT_HISTORY(productId),
      {
        page: params.page || 1,
        limit: params.limit || 20,
      }
    );

    // Access pagination from meta.pagination (not root level)
    const pagination = response.data.meta?.pagination || { page: 1, limit: 20, total: 0 };

    return {
      items: response.data.data || [],
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit) || 0,
      },
    };
  },
};
