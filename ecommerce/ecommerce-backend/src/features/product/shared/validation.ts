import { z } from 'zod';
import {
  decimalSchema,
  slugSchema,
  shortTextSchema,
  paginationSchema,
  uuidSchema,
} from '../../../utils';

export const createProductSchema = z
  .object({
    slug: z.string().min(1, 'Slug is required'),
    product_title: z.string().min(1, 'Product title is required'),
    secondary_title: z.string().optional(),
    short_description: z.string().optional(),
    full_description: z.string().optional(),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
    featured: z.boolean().default(false),
    cost_price: decimalSchema.default('0.00'),
    selling_price: decimalSchema,
    compare_at_price: decimalSchema.optional().nullable(),
    sku: z.string().min(1, 'SKU is required'),
    hsn_code: z.string().optional().nullable(),
    barcode: z.string().optional().nullable(),
    weight: decimalSchema.optional().nullable(),
    length: decimalSchema.optional().nullable(),
    breadth: decimalSchema.optional().nullable(),
    height: decimalSchema.optional().nullable(),
    category_tier_1: z.string().optional().nullable(),
    category_tier_2: z.string().optional().nullable(),
    category_tier_3: z.string().optional().nullable(),
    category_tier_4: z.string().optional().nullable(),
    primary_image_url: z.string().url().optional().nullable(),
    thumbnail_url: z.string().url().optional().nullable(),
    additional_images: z.array(z.string().url()).default([]),
    additional_thumbnails: z.array(z.string().url()).default([]),
    meta_title: z.string().optional().nullable(),
    meta_description: z.string().optional().nullable(),
    product_url: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    admin_comment: z.string().optional().nullable(),
    faqs: z
      .array(
        z.object({
          question: z.string().min(1, 'Question is required'),
          answer: z.string().min(1, 'Answer is required'),
        }),
      )
      .optional()
      .default([]),
    inventory_quantity: z.number().int().nonnegative().optional().default(0),
    has_variants: z.boolean().default(false),
    variants: z
      .array(
        z.object({
          option_name: z.string().default('Default'),
          option_value: z.string().default('Standard'),
          sku: z.string().min(1, 'Variant SKU is required'),
          barcode: z.string().optional().nullable(),
          cost_price: decimalSchema.default('0.00'),
          selling_price: decimalSchema,
          compare_at_price: decimalSchema.optional().nullable(),
          inventory_quantity: z.number().int().nonnegative().default(0),
          image_url: z.string().url().optional().nullable(),
        }),
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) =>
      !data.compare_at_price ||
      !data.selling_price ||
      parseFloat(data.compare_at_price) >= parseFloat(data.selling_price),
    { message: 'Compare at price must be >= selling price', path: ['compare_at_price'] },
  )
  .refine(
    (data) =>
      !data.cost_price ||
      !data.selling_price ||
      parseFloat(data.selling_price) >= parseFloat(data.cost_price),
    { message: 'Selling price must be >= cost price', path: ['selling_price'] },
  )
  .refine((data) => !data.has_variants || (data.variants && data.variants.length > 0), {
    message: 'Products with variants must have at least one variant',
    path: ['variants'],
  })
  .refine(
    (data) => {
      const skus = data.variants?.map((v) => v.sku) || [];
      return skus.length === new Set(skus).size;
    },
    { message: 'Variant SKUs must be unique', path: ['variants'] },
  )
  .refine(
    (data) =>
      data.variants?.every(
        (v) =>
          !v.compare_at_price ||
          !v.selling_price ||
          parseFloat(v.compare_at_price) >= parseFloat(v.selling_price),
      ) ?? true,
    { message: 'Variant compare at price must be >= selling price', path: ['variants'] },
  );

export const updateProductSchema = z.object({
  slug: slugSchema.optional(),
  product_title: shortTextSchema.optional(),
  secondary_title: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  full_description: z.string().optional().nullable(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  featured: z.boolean().optional(),
  cost_price: decimalSchema.optional(),
  selling_price: decimalSchema.optional(),
  compare_at_price: decimalSchema.optional().nullable(),
  sku: shortTextSchema.optional(),
  hsn_code: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  inventory_quantity: z.coerce.number().int().nonnegative().optional(),
  weight: decimalSchema.optional().nullable(),
  length: decimalSchema.optional().nullable(),
  breadth: decimalSchema.optional().nullable(),
  height: decimalSchema.optional().nullable(),
  category_tier_1: z.string().optional().nullable(),
  category_tier_2: z.string().optional().nullable(),
  category_tier_3: z.string().optional().nullable(),
  category_tier_4: z.string().optional().nullable(),
  primary_image_url: z.string().url().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable(),
  additional_images: z.array(z.string().url()).optional(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  product_url: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  admin_comment: z.string().optional().nullable(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1, 'Question is required'),
        answer: z.string().min(1, 'Answer is required'),
      }),
    )
    .optional(),
  has_variants: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        option_name: z.string().min(1, 'Variant name is required'),
        option_value: z.string().min(1, 'Variant value is required'),
        sku: z.string().min(1, 'Variant SKU is required'),
        barcode: z.string().optional().nullable(),
        cost_price: decimalSchema.default('0.00'),
        selling_price: decimalSchema,
        compare_at_price: decimalSchema.optional().nullable(),
        inventory_quantity: z.number().int().nonnegative().default(0),
        image_url: z.string().url().optional().nullable(),
        is_active: z.boolean().optional().default(true),
      }),
    )
    .optional(),
});


/** Filters and pagination for listing products. */
export const getAllProductsSchema = paginationSchema
  .extend({
    status: z.union([z.string(), z.array(z.string())]).optional(),
    category_tier_1: z.union([z.string(), z.array(z.string())]).optional(),
    categories: z.string().optional(),
    technologies: z.string().optional(),
    ratings: z.string().optional(),
    minPrice: z.preprocess((val) => (val ? Number(val) : 0), z.number().min(0)),
    maxPrice: z.preprocess((val) => (val ? Number(val) : 200000), z.number().min(0)),
    search: z.string().optional(),
    sortBy: z
      .enum([
        'created_at',
        'updated_at',
        'selling_price',
        'cost_price',
        'compare_at_price',
        'product_title',
        'category_tier_1',
        'inventory_quantity',
        'total_stock',
        'status',
        'featured',
        'sku',
        'rating',
      ])
      .default('created_at')
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    stockStatus: z.union([z.string(), z.array(z.string())]).optional(),
    quickFilter: z.union([z.string(), z.array(z.string())]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine((data) => data.limit <= 50, { message: 'Limit cannot exceed 50' });

export const searchProductsSchema = paginationSchema.extend({
  q: z.string().min(1, 'Search query is required'),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
});

export const duplicateProductSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID required'),
});

export const bulkDeleteProductsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID required'),
});

export const getProductBySlugParamsSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export const updateProductParamsSchema = z.object({
  id: uuidSchema,
});

export const deleteProductParamsSchema = z.object({
  id: uuidSchema,
});

export const getProductByIdParamsSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
});
