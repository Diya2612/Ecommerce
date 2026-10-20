import { z } from 'zod';

/**
 * Input validation schemas
 */

export const addToWishlistSchema = z.object({
  product_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const moveToCartSchema = z.object({
  quantity: z.number().int().min(1).max(100).default(1),
  remove_from_wishlist: z.boolean().default(false),
});

export const wishlistParamSchema = z.object({
  userId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type MoveToCartInput = z.infer<typeof moveToCartSchema>;
export type WishlistParams = z.infer<typeof wishlistParamSchema>;
