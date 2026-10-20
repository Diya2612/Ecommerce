/**
 * Product Constants
 * Centralized constants for product management
 */

// Export all constants
export * from './filters';
export * from './statuses';
export * from './sorts';

/**
 * Product Field Limits
 */
/**
 * Product Field Limits
 */
export const PRODUCT_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
  SKU_MAX_LENGTH: 100,
  BARCODE_MAX_LENGTH: 50,
  HSN_MAX_LENGTH: 20,
  MAX_IMAGES: 10,
  MAX_ADDITIONAL_IMAGES: 5,
  MAX_FILE_SIZE_MB: 10,
  MIN_IMAGE_DIMENSION: 200,
  MAX_IMAGE_DIMENSION: 2000,
  MAX_VARIANTS: 50,
  MAX_FAQS: 20,
  MAX_TAGS: 10,
  VARIANTS_PER_PAGE: 5,
} as const;

/**
 * Product Validation Rules
 */
export const PRODUCT_VALIDATION = {
  SKU_PATTERN: /^[A-Z0-9-]+$/,
  PRICE_DECIMAL_PLACES: 2,
  MAX_SAFE_VALUE: 1000000000, // 1 Billion
} as const;

export const CURRENCY_SYMBOL = '₹';

// Common Variant Attributes
export const COMMON_VARIANT_ATTRIBUTES = [
  { label: 'Color', value: 'Color' },
  { label: 'Size', value: 'Size' },
] as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  IMAGE_NOT_SQUARE: (width: number, height: number) =>
    `Image must be square (1:1 ratio). Current: ${width}x${height}`,
  IMAGE_TOO_SMALL: (width: number, height: number) =>
    `Image too small. Minimum size is ${PRODUCT_LIMITS.MIN_IMAGE_DIMENSION}x${PRODUCT_LIMITS.MIN_IMAGE_DIMENSION}px. Current: ${width}x${height}`,
  IMAGE_TOO_LARGE: (width: number, height: number) =>
    `Image too large. Maximum size is ${PRODUCT_LIMITS.MAX_IMAGE_DIMENSION}x${PRODUCT_LIMITS.MAX_IMAGE_DIMENSION}px. Current: ${width}x${height}`,
  IMAGE_LOAD_FAILED: 'Failed to load image for validation',
  FILE_TOO_LARGE: (sizeMb: number) => `File must be under ${sizeMb}MB`,
  INVALID_IMAGE: 'Please select a valid image file',
  MAX_IMAGES_REACHED: (max: number) => `Maximum ${max} additional images allowed`,
  PRICE_COMPARISON_ERROR: 'Compare at price must be greater than or equal to selling price',
} as const;

/**
 * Product Table Column Keys
 * Used for column visibility toggling
 */
export const PRODUCT_COLUMN_KEYS = {
  IMAGE: 'primary_image_url',
  TITLE: 'product_title',
  SKU: 'sku',
  SELLING_PRICE: 'selling_price',
  COST_PRICE: 'cost_price',
  COMPARE_PRICE: 'compare_at_price',
  STOCK: 'total_stock',
  STATUS: 'status',
  FEATURED: 'featured',
  BARCODE: 'barcode',
  HSN: 'hsn_code',
  CATEGORY: 'category_tier_1',
  WEIGHT: 'weight',
  TAGS: 'tags',
  CREATED: 'created_at',
  UPDATED: 'updated_at',
} as const;

/**
 * Non-sortable columns
 * Columns that should not have sort functionality
 */
export const NON_SORTABLE_COLUMNS = [
  PRODUCT_COLUMN_KEYS.BARCODE,
  PRODUCT_COLUMN_KEYS.HSN,
  PRODUCT_COLUMN_KEYS.IMAGE,
  PRODUCT_COLUMN_KEYS.WEIGHT,
  PRODUCT_COLUMN_KEYS.TAGS,
] as const;
