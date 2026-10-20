import { z } from 'zod';

// Discount validation schema
export const discountValidationSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must not exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Code can only contain letters, numbers, hyphens, and underscores'),

  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  type: z.enum(['percentage', 'fixed', 'buy_x_get_y', 'free_shipping']),

  value: z.string().min(1, 'Discount value is required'),

  usage_limit: z.number()
    .min(1, 'Usage limit must be at least 1')
    .max(1000000, 'Usage limit cannot exceed 1,000,000')
    .nullable()
    .optional(),

  minimum_purchase: z.number()
    .min(0, 'Minimum purchase cannot be negative')
    .nullable()
    .optional(),

  applies_to: z.enum(['all_products', 'specific_products', 'specific_collections', 'specific_customers']),

  product_ids: z.array(z.string()).optional(),
  collection_ids: z.array(z.string()).optional(),
  customer_ids: z.array(z.string()).optional(),

  starts_at: z.date(),
  ends_at: z.date().nullable().optional(),
});

// Buy X Get Y specific validation
export const buyXGetYValidationSchema = z.object({
  buy_quantity: z.number()
    .min(1, 'Buy quantity must be at least 1')
    .max(10, 'Buy quantity cannot exceed 10'),

  get_quantity: z.number()
    .min(1, 'Get quantity must be at least 1')
    .max(5, 'Get quantity cannot exceed 5'),

  max_uses_per_customer: z.number()
    .min(1, 'Max uses per customer must be at least 1')
    .nullable()
    .optional(),
});

// Free shipping validation
export const freeShippingValidationSchema = z.object({
  minimum_order_amount: z.number()
    .min(0, 'Minimum order amount cannot be negative')
    .nullable()
    .optional(),

  applicable_zones: z.array(z.string()).min(1, 'At least one shipping zone must be selected'),
});

// export type DiscountFormData = z.infer<typeof discountValidationSchema>;