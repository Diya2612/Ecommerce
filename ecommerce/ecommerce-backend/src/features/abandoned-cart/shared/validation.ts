import { z } from 'zod';

export const cartIdParamSchema = z.object({
  cartId: z.string().uuid('Invalid cart ID format'),
});

/**
 * Schema for abandoned carts list query
 * Used by GET /api/admin/abandoned-carts
 */
export const abandonedCartsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  sort_by: z.enum(['abandoned_at', 'grand_total', 'last_activity_at']).default('abandoned_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type AbandonedCartsQuery = z.infer<typeof abandonedCartsQuerySchema>;

/**
 * Schema for sending abandoned cart emails
 * Used by POST /api/admin/abandoned-carts/send-emails
 */
export const sendAbandonedCartEmailsSchema = z.object({
  cart_ids: z.array(z.string().uuid()).optional(), // If empty, send to all eligible
  template_id: z.string().optional(), // 'template_id' is used in backend code for send-abandoned-cart-emails
  test_mode: z.boolean().default(false), // Dry run
});

export type SendAbandonedCartEmailsInput = z.infer<typeof sendAbandonedCartEmailsSchema>;
