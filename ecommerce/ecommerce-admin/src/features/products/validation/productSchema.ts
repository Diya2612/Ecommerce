import { z } from 'zod';
import { validateNumericString, type NumericOptions } from '@/utils';


/**
 * Required numeric string schema
 */
const requiredNumericSchema = (label: string, options: NumericOptions = {}) => {
  return z.string()
    .trim()
    .min(1, `${label} is required`)
    .superRefine((val, ctx) => validateNumericString(val, ctx, label, options));
};

/**
 * Optional numeric string schema
 */
const optionalNumericSchema = (label: string, options: NumericOptions = {}) => {
  return z.string()
    .trim()
    .optional()
    .or(z.literal(''))
    .superRefine((val, ctx) => {
      if (!val) return;
      validateNumericString(val, ctx, label, options);
    });
};

/**
 * Product Image Schema
 * Validates individual product images
 */
export const productImageSchema = z.object({
  id: z.string(),
  url: z.string().url('Image URL must be valid'),
  thumbnailUrl: z.string().url('Thumbnail URL must be valid').optional(),
  isPrimary: z.boolean(),
  altText: z.string().optional(),
  // For file uploads (client-side only, won't be in API response usually)
  file: z.any().optional(),
  previewUrl: z.string().optional(),
});

/**
 * Product Variant Schema
 * Validates individual product variants with comprehensive pricing and inventory rules
 */
export const productVariantSchema = z.object({
  id: z.string(),
  optionName: z.string()
    .min(1, 'Variant Name is required')
    .trim(),
  optionValue: z.string()
    .min(1, 'Variant Value is required')
    .trim(),
  sku: z.string()
    .min(1, 'Variant SKU is required')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens')
    .trim(),

  sellingPrice: requiredNumericSchema('Variant Selling Price'),
  costPrice: requiredNumericSchema('Variant Cost Price'),
  compareAtPrice: optionalNumericSchema('Compare at price'),

  inventoryQuantity: requiredNumericSchema('Inventory Quantity', {
    allowZero: true,
    maxDecimals: 0
  }),

  barcode: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  image: z.string().optional(),
  imageFile: z.any().optional(),
  previewUrl: z.string().optional(),
  enabled: z.boolean().optional(),
}).refine((variant) => {
  // Cost price should be less than or equal to selling price
  if (!variant.costPrice || !variant.sellingPrice) return true;
  const cost = parseFloat(variant.costPrice);
  const selling = parseFloat(variant.sellingPrice);
  return cost <= selling;
}, {
  message: 'Variant Selling Price must be greater than or equal to Cost Price',
  path: ['sellingPrice'],
}).refine((variant) => {
  // Compare at price should be greater than or equal to selling price
  if (!variant.compareAtPrice || variant.compareAtPrice.trim() === '') return true;
  const compareAt = parseFloat(variant.compareAtPrice);
  const selling = parseFloat(variant.sellingPrice);
  return compareAt >= selling;
}, {
  message: 'Compare at price must be greater than or equal to Selling Price',
  path: ['compareAtPrice'],
});

/**
 * FAQ Schema
 * Validates FAQ items
 */
export const faqSchema = z.object({
  id: z.string(),
  question: z.string()
    .min(1, 'FAQ question is required')
    .max(500, 'FAQ question must not exceed 500 characters'),
  answer: z.string()
    .min(1, 'FAQ answer is required')
    .max(2000, 'FAQ answer must not exceed 2000 characters'),
});

/**
 * Main Product Validation Schema
 * Comprehensive validation for product creation and updates
 */
export const productValidationSchema = z.object({
  // Basic Product Details
  id: z.string().optional(),
  productTitle: z.string()
    .min(3, 'Product title must be at least 3 characters')
    .max(200, 'Product title must not exceed 200 characters')
    .trim(),

  secondaryTitle: z.string()
    .max(200, 'Secondary title must not exceed 200 characters')
    .optional(),

  shortDescription: z.string()
    .max(500, 'Short description must not exceed 500 characters')
    .optional(),

  fullDescription: z.string()
    .min(10, 'Full description must be at least 10 characters')
    .max(10000, 'Full description must not exceed 10,000 characters'),

  // Pricing
  costPrice: requiredNumericSchema('Cost price'),
  sellingPrice: requiredNumericSchema('Selling price'),
  compareAtPrice: optionalNumericSchema('Compare at price'),

  // Product Identification
  sku: z.string()
    .min(1, 'SKU is required')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),

  hsnNumber: z.string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[0-9]{6,8}$/.test(val), {
      message: 'HSN number must be 6-8 digits',
    }),

  barcode: z.string()
    .max(50, 'Barcode must not exceed 50 characters')
    .optional(),

  // Inventory & Dimensions
  inventoryQuantity: requiredNumericSchema('Inventory quantity', { allowZero: true, maxDecimals: 0 }),

  weight: optionalNumericSchema('Weight'),
  length: optionalNumericSchema('Length'),
  breadth: optionalNumericSchema('Breadth'),
  height: optionalNumericSchema('Height'),

  // Categorization (4-tier hierarchy from tiers API)
  tier1Category: z.string().min(1, 'Tier 1 category is required'),
  tier2Category: z.string().optional(),
  tier3Category: z.string().optional(),
  tier4Category: z.string().optional(),

  // Availability & Flags
  productStatus: z.enum(['draft', 'active', 'archived', 'schedule']).optional(),
  featured: z.boolean().optional(),
  delistProduct: z.boolean().optional(),
  delistDate: z.string().optional(),
  salesChannels: z.array(z.string()).min(1, 'At least one sales channel is required').optional(),

  // Scheduling & Preorder
  scheduleDate: z.string().optional(),
  scheduleTime: z.string().optional(),
  preorderEnabled: z.boolean().optional(),
  preorderDate: z.string().optional(),
  limitedEdition: z.boolean().optional(),

  // Media - Enhanced with proper validation
  productImages: z.array(productImageSchema)
    .min(1, 'At least one product image is required')
    .refine((images) => images.some(img => img.isPrimary), {
      message: 'Please select a primary image',
    }),
  primaryImage: z.string().optional(), // For backward compatibility if needed, but array should be source of truth
  additionalImages: z.array(z.string()).optional(),

  // Product Variants - Enhanced with comprehensive validation
  productVariants: z.array(productVariantSchema).optional(),
  variantOptions: z.array(z.any()).optional(), // Keep loosely typed if not strictly validating structure yet

  // SEO & URL
  productUrl: z.string()
    .regex(/^[a-z0-9-]+$/, 'Product URL must contain only lowercase letters, numbers, and hyphens')
    .min(3, 'Product URL must be at least 3 characters')
    .max(200, 'Product URL must not exceed 200 characters'),

  metaTitle: z.string()
    .max(60, 'Meta title should not exceed 60 characters for optimal SEO')
    .optional(),

  metaDescription: z.string()
    .max(160, 'Meta description should not exceed 160 characters for optimal SEO')
    .optional(),

  // Associations
  size: z.string().optional(),
  accessoriesGroup: z.string().optional(),
  pickupLocation: z.string().optional(),
  giftWrapAvailable: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  adminComment: z.string().optional(),

  // FAQ - Enhanced with schema
  faqs: z.array(faqSchema).optional(),

  // Auto-generated slug
  slug: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),

}).refine((data) => {
  // Selling price should be greater than or equal to cost price
  if (data.costPrice && data.sellingPrice) {
    return parseFloat(data.sellingPrice) >= parseFloat(data.costPrice);
  }
  return true;
}, {
  message: 'Selling price must be greater than or equal to cost price',
  path: ['sellingPrice'],
}).refine((data) => {
  // Compare at price should be greater than or equal to selling price
  if (data.compareAtPrice && data.sellingPrice) {
    return parseFloat(data.compareAtPrice) >= parseFloat(data.sellingPrice);
  }
  return true;
}, {
  message: 'Compare at price must be greater than or equal to selling price',
  path: ['compareAtPrice'],
}).refine((data) => {
  // Preorder date is required when preorder is enabled
  if (data.preorderEnabled && !data.preorderDate) {
    return false;
  }
  return true;
}, {
  message: 'Preorder date is required when preorder is enabled',
  path: ['preorderDate'],
}).refine((data) => {
  // Delist date is required when delist is enabled
  if (data.delistProduct && !data.delistDate) {
    return false;
  }
  return true;
}, {
  message: 'Delist date is required when product is marked for delisting',
  path: ['delistDate'],
}).refine((data) => {
  // If variants exist, check for duplicate SKUs
  if (data.productVariants && data.productVariants.length > 1) {
    const skus = data.productVariants.map(v => v.sku.toUpperCase());
    const uniqueSkus = new Set(skus);
    return skus.length === uniqueSkus.size;
  }
  return true;
}, {
  message: 'Variant SKUs must be unique',
  path: ['productVariants'],
});

// NOTE: ProductFormData type is defined in '../types/product.types.ts' for actual use
// This schema is used for validation only. The inferred type is kept as ProductSchemaData
// to avoid conflicts with the main ProductFormData interface.
export type ProductSchemaData = z.infer<typeof productValidationSchema>;
export type ProductImageSchemaData = z.infer<typeof productImageSchema>;
export type ProductVariantSchemaData = z.infer<typeof productVariantSchema>;
export type FAQSchemaData = z.infer<typeof faqSchema>;
