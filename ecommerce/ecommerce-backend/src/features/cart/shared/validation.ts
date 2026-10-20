/**
 * Cart Validation Schemas
 * Zod schemas for cart-related API requests.
 */

import { z } from 'zod';

export const addToCartSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  variant_id: z.string().uuid('Invalid variant ID').optional(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100')
    .default(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const removeCartItemParamsSchema = z.object({
  id: z.string().uuid('Invalid item ID'),
});

export type RemoveCartItemParams = z.infer<typeof removeCartItemParamsSchema>;

export const applyDiscountSchema = z.object({
  code: z
    .string()
    .min(1, 'Discount code is required')
    .trim()
    .transform((val) => val.toUpperCase()),
});

export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;

export const removeDiscountSchema = z.object({
  code: z
    .string()
    .min(1, 'Discount code is required')
    .trim()
    .transform((val) => val.toUpperCase()),
});

export type RemoveDiscountInput = z.infer<typeof removeDiscountSchema>;

export const mergeCartSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required').max(100, 'Session ID too long'),
});

export type MergeCartInput = z.infer<typeof mergeCartSchema>;

export const getCartQuerySchema = z.object({
  include_details: z.coerce.boolean().optional().default(true),
  _rid: z.string().optional(),
});

export type GetCartQuery = z.infer<typeof getCartQuerySchema>;

export const validateCartQuerySchema = z.object({
  auto_repair: z.coerce.boolean().optional().default(false),
});

export type ValidateCartQuery = z.infer<typeof validateCartQuerySchema>;
