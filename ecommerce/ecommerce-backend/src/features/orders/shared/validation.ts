/**
 * Orders Validation Schemas
 *
 * Shared Zod schemas for order validation across multiple endpoints
 */

import { z } from 'zod';

/**
 * Schema for order item (used in create and update operations)
 */
export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1),
  cost_price: z.union([z.string(), z.number()]),
  line_total: z.union([z.string(), z.number()]),
  product_name: z.string().optional(),
  sku: z.string().optional(),
  product_image: z.string().optional(),
  variant_id: z.string().uuid().optional().nullable(),
});

/**
 * Schema for creating a new order
 * Supports both cart-based orders (user checkout) and direct orders (admin)
 */
export const createOrderSchema = z.object({
  // Common fields
  shipping_address_id: z.string().optional().or(z.literal('')), // Admin sends empty string if not selected
  billing_address_id: z.string().optional().or(z.literal('')),
  payment_method: z.string().max(60).default('cod'),
  customer_note: z.string().max(500).optional(),

  // Admin / Direct Order fields
  items: z.array(orderItemSchema).optional(),
  user_id: z.string().optional().or(z.literal('')), // Target customer ID
  // channel removed
  is_draft: z.boolean().optional(),
  currency: z.string().optional(),

  // Pricing (Admin provided)
  subtotal: z.string().optional(),
  discount_total: z.string().optional(),
  tax_type: z.enum(['cgst_sgst', 'igst', 'none']).optional(),
  cgst_amount: z.string().optional(),
  sgst_amount: z.string().optional(),
  igst_amount: z.string().optional(),
  shipping_total: z.string().optional(),
  cod_charges: z.string().optional(),
  // giftcard_total removed
  total_amount: z.string().optional(),
  advance_paid_amount: z.string().optional(), // For partial payment

  // Metadata
  admin_comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // amz_order_id removed
});

/**
 * Type inference for create order data
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Type inference for order item data
 */
export type OrderItemValidationInput = z.infer<typeof orderItemSchema>;
/**
 * Schema for direct order creation (admin only)
 * Does NOT include pricing fields - pricing is calculated server-side
 */
export const directOrderItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(), // Optional for custom items
  is_custom: z.boolean().optional(), // Flag for custom/ad-hoc items
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
  cost_price: z.number().min(0).optional(),
  product_name: z.string().min(1),
  sku: z.string().optional(), // Optional for custom items
  product_image: z.string().optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  discount_reason: z.string().max(255).optional(), // Reason for applying discount
  tax_percentage: z.number().min(0).max(100).optional(),
  variant_id: z.string().uuid().optional().nullable(),
});

export const directOrderSchema = z.object({
  // Required fields
  items: z.array(directOrderItemSchema).min(1),
  shipping_state: z.string().length(2), // 2-letter state code (e.g., 'MH', 'DL')
  billing_state: z.string().length(2),

  // Optional fields
  user_id: z.string().uuid().optional(),
  shipping_address_id: z.string().uuid().optional(),
  billing_address_id: z.string().uuid().optional(),
  payment_method: z.string().max(60).default('cod'),
  // channel removed
  is_draft: z.boolean().default(false),
  currency: z.string().length(3).default('INR'),
  customer_note: z.string().max(500).optional(),
  admin_comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // amz_order_id removed

  // Discount codes (optional)
  discount_code: z.string().optional(),
  discount_type: z.enum(['percent', 'amount', 'none']).optional(), // Order-level discount type
  discount_value: z.number().min(0).optional(), // Order-level discount value
  discount_reason: z.string().max(255).optional(), // Order-level discount reason
  // giftcard_code removed

  // Shipping
  shipping_amount: z.number().min(0).optional(),
  delivery_price: z.number().min(0).optional(),
  // is_international removed

  // Partial payment
  advance_paid_amount: z.number().min(0).optional(),
});

export type DirectOrderInput = z.infer<typeof directOrderSchema>;

/**
 * Schema for GET /orders query parameters
 */
export const getOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;

/**
 * Schema for GET /orders/:id path parameters
 */
export const getOrderByIdParamsSchema = z.object({
  // Accept either UUID or Order Number (e.g. ORD-)
  id: z.string().min(1, 'Invalid order ID format'),
});

export type GetOrderByIdParams = z.infer<typeof getOrderByIdParamsSchema>;

// ============================================
// PARAMETER SCHEMAS (Reusable)
// ============================================

/**
 * Reusable UUID param schema for order ID
 * Used by multiple endpoints with /:id parameter
 */
export const orderIdParamSchema = z.object({
  // Accept either UUID or Order Number
  id: z.string().min(1, 'Invalid order ID format'),
});

/**
 * Reusable UUID param schema for user ID
 */
export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

/**
 * Reusable UUID param schema for cart ID
 */
export const cartIdParamSchema = z.object({
  cartId: z.string().uuid('Invalid cart ID format'),
});

// ============================================
// ORDER STATUS UPDATE SCHEMAS
// ============================================

/**
 * Schema for updating order status
 * Used by PUT /api/admin/orders/:id/status
 */
export const updateOrderStatusSchema = z
  .object({
    order_status: z
      .enum([
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'returned',
      ])
      .optional(),
    payment_status: z.enum(['pending', 'paid', 'partially_paid', 'refunded']).optional(),
    fulfillment_status: z
      .enum(['unfulfilled', 'partial', 'fulfilled', 'returned', 'cancelled'])
      .optional(),
    order_tracking: z.string().max(200).optional(),
    admin_comment: z.string().max(500).optional(),
  })
  .refine((data) => data.order_status || data.payment_status || data.fulfillment_status, {
    message: 'At least one status field must be provided',
  });

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

/**
 * Schema for updating payment status
 * Used by PUT /api/admin/orders/:id/payment
 */
export const updatePaymentStatusSchema = z.object({
  payment_status: z.enum(['pending', 'paid', 'partially_paid', 'refunded']),
  paid_at: z.string().optional(), // ISO date string
  transaction_id: z.string().optional(),
  payment_ref: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;

/**
 * Schema for updating fulfillment status
 * Used by PUT /api/admin/orders/:id/fulfillment
 */
export const updateFulfillmentStatusSchema = z.object({
  fulfillment_status: z.enum(['unfulfilled', 'fulfilled', 'returned', 'cancelled']),
  fulfillment_date: z.string().optional(), // ISO date string
  delivery_date: z.string().optional(),
  tracking_number: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateFulfillmentStatusInput = z.infer<typeof updateFulfillmentStatusSchema>;

/**
 * Schema for updating tracking information
 * Used by PUT /api/admin/orders/:id/tracking
 */
export const updateTrackingSchema = z.object({
  tracking_number: z.string().min(1, 'Tracking number is required'),
  shipping_method: z.string().optional(),
  shipping_option: z.string().optional(),
  carrier: z.string().optional(), // e.g., 'BlueDart', 'Delhivery'
  notes: z.string().optional(),
});

export type UpdateTrackingInput = z.infer<typeof updateTrackingSchema>;

// ============================================
// ORDER UPDATE SCHEMAS
// ============================================

/**
 * Schema for order item in update operations
 * Used by PUT /api/admin/orders/:id
 */
export const updateOrderItemSchema = z.object({
  // Relaxed product validation (allow empty string for custom items)
  product_id: z.string().optional().or(z.literal('')),
  variant_id: z.string().optional().or(z.literal('')).nullable(),
  quantity: z.number().min(1),
  cost_price: z.union([z.string(), z.number()]),
  line_total: z.union([z.string(), z.number()]),
  product_name: z.string().optional(),
  sku: z.string().optional(),
  product_image: z.string().optional(),
  discount_percentage: z.number().optional(),
  discount_amount: z.number().optional(),
  discount_reason: z.string().max(255).optional(),
});

/**
 * Schema for full order update
 * Used by PUT /api/admin/orders/:id
 */
export const updateOrderSchema = z.object({
  // Editable fields
  shipping_address_id: z.string().optional().or(z.literal('')),
  billing_address_id: z.string().optional().or(z.literal('')),
  payment_method: z.string().optional(),
  customer_note: z.string().optional(),
  admin_comment: z.string().optional(),

  // Statuses
  order_status: z.string().optional(),
  payment_status: z.string().optional(),
  fulfillment_status: z.string().optional(),

  // Items (Full replacement)
  items: z.array(updateOrderItemSchema).optional(),

  // Pricing (Admin override)
  subtotal: z.union([z.string(), z.number()]).optional(),
  discount_total: z.union([z.string(), z.number()]).optional(),
  tax_amount: z.union([z.string(), z.number()]).optional(),
  shipping_total: z.union([z.string(), z.number()]).optional(),
  total_amount: z.union([z.string(), z.number()]).optional(),

  // Order-level discounts
  discount_type: z.enum(['percent', 'amount', 'none']).optional(),
  discount_value: z.number().min(0).optional(),
  discount_reason: z.string().max(255).optional(),

  // Tax components
  tax_type: z.string().optional(),
  cgst_amount: z.union([z.string(), z.number()]).optional(),
  sgst_amount: z.union([z.string(), z.number()]).optional(),
  igst_amount: z.union([z.string(), z.number()]).optional(),
  cod_charges: z.union([z.string(), z.number()]).optional(),
  advance_paid_amount: z.union([z.string(), z.number()]).optional(),

  // Metadata
  user_id: z.string().optional().or(z.literal('')),
  is_draft: z.boolean().optional(),
  currency: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;

// ============================================
// ORDER ACTIONS SCHEMAS
// ============================================

/**
 * Schema for cancelling an order
 * Used by POST /api/orders/:id/cancel
 */
export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

/**
 * Schema for confirming draft order
 * Used by POST /api/admin/orders/drafts/:id/confirm
 */
export const confirmDraftOrderSchema = z.object({
  send_confirmation_email: z.boolean().default(true),
  notes: z.string().optional(),
});

export type ConfirmDraftOrderInput = z.infer<typeof confirmDraftOrderSchema>;

/**
 * Schema for deleting orders (bulk)
 * Used by POST /api/admin/orders/delete
 */
export const deleteOrdersBodySchema = z.object({
  order_ids: z.array(z.string().uuid()).min(1, 'At least one order ID is required'),
});

export type DeleteOrdersInput = z.infer<typeof deleteOrdersBodySchema>;

// ============================================
// QUERY SCHEMAS
// ============================================

/**
 * Schema for admin orders list query
 * Used by GET /api/admin/orders
 */
export const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .optional(),
  payment_status: z.string().optional(),
  fulfillment_status: z.string().optional(),
  amount_ranges: z.string().optional(),
  item_ranges: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  user_id: z.string().optional(),
});

export type AdminOrdersQuery = z.infer<typeof adminOrdersQuerySchema>;

/**
 * Schema for draft orders query
 * Used by GET /api/admin/orders/drafts
 */
export const draftOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  sort_by: z
    .enum([
      'id',
      'order_number',
      'order_status',
      'payment_status',
      'total_amount',
      'total_quantity',
      'channel',
      'created_at',
      'updated_at',
      'delivery_price',
      'return_amount',
      'discount_amount',
      'customer_name',
      'customer_email',
    ])
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type DraftOrdersQuery = z.infer<typeof draftOrdersQuerySchema>;

/**
 * Schema for product search in order creation
 * Used by GET /api/admin/orders/products/search
 */
export const productSearchQuerySchema = z.object({
  search: z.string().min(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type ProductSearchQuery = z.infer<typeof productSearchQuerySchema>;

/**
 * Schema for batch stock checking
 * Used by GET /api/admin/orders/stock/batch
 */
export const stockBatchQuerySchema = z.object({
  product_ids: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').filter(Boolean) : [])),
  variant_ids: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').filter(Boolean) : [])),
});

export type StockBatchQuery = z.infer<typeof stockBatchQuerySchema>;
