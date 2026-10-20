/**
 * Orders Interfaces
 *
 * Canonical TypeScript interfaces for order-related data (database entities).
 * For API response shapes, see responses.ts
 */

import { Order } from './orders.schema';
import { OrderItem } from './order-items.schema';
import { omitFields } from '../../../utils';
import { GSTCalculation } from '../../../utils/helpers/tax-calculator';

// ============================================
// ORDER (Database Entity)
// ============================================

/**
 * Order entity type (inferred from Drizzle schema)
 */
export type IOrder = Order;

/**
 * Sanitized order type without internal/audit fields
 * Omits sensitive data that should never be exposed in API responses
 */
export type SanitizedOrder = Omit<
  IOrder,
  'is_deleted' | 'deleted_at' | 'deleted_by' | 'created_by' | 'updated_by'
>;

// ============================================
// ORDER ITEM (Database Entity)
// ============================================

/**
 * Order Item entity type (inferred from Drizzle schema)
 */
export type IOrderItem = OrderItem;

/**
 * Sanitized order item type without internal/audit fields
 */
export type SanitizedOrderItem = IOrderItem;

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Remove internal/audit fields from a single order object
 * Ensures sensitive audit data never leaks in API responses
 */
export const sanitizeOrder = (order: IOrder): SanitizedOrder =>
  omitFields(order, ['is_deleted', 'deleted_at', 'deleted_by', 'created_by', 'updated_by']);

/**
 * Remove internal/audit fields from an array of order objects
 */
export const sanitizeOrders = (orders: IOrder[]): SanitizedOrder[] => {
  return orders.map(sanitizeOrder);
};

/**
 * Sanitize order item (currently no-op but kept for consistency)
 */
export const sanitizeOrderItem = (item: IOrderItem): SanitizedOrderItem => {
  return item;
};

/**
 * Sanitize order items array
 */
export const sanitizeOrderItems = (items: IOrderItem[]): SanitizedOrderItem[] => {
  return items.map(sanitizeOrderItem);
};

// ============================================
// ORDER CALCULATION (from order-calculation.service.ts)
// ============================================

// GSTCalculation is imported from the global tax utility
export type { GSTCalculation };

/**
 * A single item input for order pricing calculation
 */
export interface OrderItemInput {
  product_id: string | null; // Nullable for custom/ad-hoc items
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount_percentage?: number;
  discount_amount?: number;
  tax_percentage?: number;
  weight?: number;
}

/**
 * Input shape expected by calculateOrderPricing()
 */
export interface OrderPricingInput {
  items: OrderItemInput[];
  discount_code?: string;
  shipping_amount?: number;
  delivery_price?: number;
  shipping_state: string;
  billing_state: string;
}

/**
 * Full pricing breakdown returned by calculateOrderPricing()
 */
export interface OrderPricing {
  subtotal: number;
  discount_total: number;
  shipping_amount: number;
  delivery_price: number;
  tax_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_amount: number;
  total_quantity: number;
  items: Array<{
    quantity: number;
    unit_price: number;
    cost_price: number;
    discount_amount: number;
    discount_percentage: number;
    tax_amount: number;
    tax_percentage: number;
    line_subtotal: number;
    line_total: number;
  }>;
}

// ============================================
// ORDER CONVERSION (from order-conversion.service.ts)
// ============================================

/**
 * Input data required to convert a cart into an order
 */
export interface CartToOrderData {
  cartId: string;
  userId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Normalised cart data ready for order creation
 */
export interface ConvertedCartData {
  items: Array<{
    product_id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    cost_price: number;
  }>;
  subtotal: number;
  discount_code?: string;
}

// ============================================
// ORDER NOTIFICATION (from order-notification.service.ts)
// ============================================

/**
 * Payload for triggering a generic order notification
 */
export interface OrderNotificationData {
  orderId: string;
  orderNumber: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount: string;
  currency?: string;
}

/**
 * Payload for triggering an order status-change notification
 */
export interface StatusChangeNotificationData {
  orderId: string;
  orderNumber: string;
  userId: string;
  oldStatus: string;
  newStatus: string;
}

// ============================================
// ORDER VALIDATION (from order-validation.service.ts)
// ============================================

/**
 * Standard result returned by all validation methods
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Minimal item shape required for stock validation
 */
export interface OrderItemForValidation {
  product_id: string;
  quantity: number;
  unit_price?: number;
}

/**
 * Order data shape accepted by validateOrder()
 */
export interface OrderDataForValidation {
  items?: Array<{ quantity: number; unit_price: number }>;
  user_id?: string;
  billing_email?: string;
  shipping_address_line1?: string;
  billing_address_line1?: string;
  total_amount?: number;
}

/**
 * Order item shape accepted by mapOrderItems()
 */
export interface OrderItemForMapping {
  product_id: string;
  sku?: string;
  product_name?: string;
  product_image?: string;
  cost_price: string | number;
  quantity: number;
  line_total: string | number;
}
/**
 * Order Response DTOs
 *
 * TypeScript interfaces for API response shapes.
 * These represent transformed data sent to clients, separate from database entities.
 *
 * Pattern based on product/shared/responses.ts
 */

// ============================================
// ADDRESS RESPONSE
// ============================================

/**
 * Address details included in order responses
 */
export interface IAddressResponse {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

// ============================================
// ORDER ITEM RESPONSES
// ============================================

/**
 * Detailed order item for single order view
 */
export interface IOrderItemResponse {
  id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string;
  product_image_url: string | null;
  product_slug: string | null;

  // Variant details
  variant_id: string | null;
  variant_name: string | null;
  variant_sku: string | null;

  // Quantities and pricing
  quantity: number;
  unit_price: string;
  cost_price: string;

  // Discounts
  discount_percentage: string | null;
  discount_amount: string;

  // Tax
  tax_percentage: string | null;
  tax_amount: string;

  // Totals
  line_subtotal: string;
  line_total: string;

  // Additional
  weight: string | null;
}

/**
 * Simplified order item for list views
 */
export interface IOrderItemSummary {
  id: string;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

// ============================================
// ORDER RESPONSE (Detail View)
// ============================================

/**
 * Detailed order response for single order views
 * Includes all order information with items, addresses, and customer details
 */
export interface IOrderResponse {
  // Core order fields
  id: string;
  order_number: string;

  // Customer info
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;

  // Status tracking
  order_status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
    | 'returned';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  payment_method: string | null;
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled' | 'returned' | 'cancelled';

  // Payment details
  payment_ref: string | null;
  transaction_id: string | null;
  paid_at: Date | null;

  // Financial breakdown
  currency: string;
  subtotal: string;
  discount_amount: string;
  shipping_amount: string;
  tax_amount: string;
  cgst: string;
  sgst: string;
  igst: string;
  total_amount: string;
  total_quantity: number;

  // Discount details
  discount_code: string | null;
  discount_type: 'percent' | 'amount' | 'none';
  discount_value: string;

  // Shipping details
  shipping_method: string | null;
  shipping_option: string | null;
  order_tracking: string | null;

  // COD details
  partial_cod_charges: string;
  advance_paid_amount: string;

  // Addresses
  shipping_address: IAddressResponse | null;
  billing_address: IAddressResponse | null;

  // Items
  items: IOrderItemResponse[];

  // Notes and tags
  customer_note: string | null;
  admin_comment: string | null;
  tags: string[];

  // Timestamps
  created_at: Date;
  updated_at: Date;
  fulfillment_date: Date | null;
  delivery_date: Date | null;
  return_date: Date | null;

  // Draft status
  is_draft: boolean;
}

// ============================================
// ORDER LIST ITEM (Collections/Lists)
// ============================================

/**
 * Simplified order response for list/collection views
 * Optimized for displaying multiple orders with essential information
 */
export interface IOrderListItem {
  id: string;
  order_number: string;

  // Status
  order_status: string;
  payment_status: string;
  payment_method: string | null;
  fulfillment_status: string;

  // Financial summary
  total_amount: string;
  total_quantity: number;
  currency: string;

  // Customer info
  customer_name: string | null;
  customer_email: string | null;

  // Timestamps
  created_at: Date;
  updated_at: Date;

  // Draft flag
  is_draft: boolean;
}

/**
 * Paginated orders list response
 */
export interface IOrdersListResponse {
  orders: IOrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// ADMIN ORDER RESPONSES
// ============================================

/**
 * Extended order response for admin views
 * Includes additional fields for internal operations
 */
export interface IAdminOrderResponse extends IOrderResponse {
  // Cart reference
  cart_id: string | null;

  // Additional IDs
  discount_id: string | null;
  discount_code_id: string | null;
  tax_rule_id: string | null;
  shipping_address_id: string | null;
  billing_address_id: string | null;

  // Cost analysis
  total_cost_price: string;
  profit_margin: string;
  profit_percentage: number;

  // Audit fields
  created_by: string | null;
  updated_by: string | null;
  deleted_at: Date | null;
  deleted_by: string | null;
  is_deleted: boolean;
}

/**
 * Admin order list item with extended fields
 */
export interface IAdminOrderListItem extends IOrderListItem {
  // Additional admin-only fields
  profit_margin: string;
  payment_ref: string | null;
  order_tracking: string | null;
}

// ============================================
// ABANDONED CART RESPONSES
// ============================================

/**
 * Abandoned cart item details
 */
export interface IAbandonedCartItem {
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  product_image_url: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

/**
 * Abandoned cart response for admin tracking
 */
export interface IAbandonedCartResponse {
  cart_id: string;

  // Customer info
  user_id: string | null;
  user_email: string | null;
  user_first_name: string | null;
  user_last_name: string | null;
  user_phone: string | null;

  // Cart details
  subtotal: string;
  discount_total: string;
  total_items: number;

  // Status
  cart_status: string;
  abandoned_cart_email_sent: boolean;

  // Timestamps
  created_at: Date;
  updated_at: Date;
  days_abandoned: number;

  // Items
  items: IAbandonedCartItem[];

  // Recovery potential
  recovery_value: string;
}

/**
 * Abandoned cart list item for collections
 */
export interface IAbandonedCartListItem {
  cart_id: string;
  user_email: string | null;
  customer_name: string | null;
  subtotal: string;
  total_items: number;
  created_at: Date;
  updated_at: Date;
  days_abandoned: number;
  email_sent: boolean;
}

/**
 * Paginated abandoned carts response
 */
export interface IAbandonedCartsListResponse {
  carts: IAbandonedCartListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Abandoned cart metrics/statistics
 */
export interface IAbandonedCartMetricsResponse {
  total_abandoned: number;
  potential_revenue: number;
  emails_sent: number;
  recovered_count: number;
  recovery_rate: number;

  // Time-based breakdown
  last_7_days: number;
  last_30_days: number;

  // Average values
  average_cart_value: number;
  average_items_per_cart: number;
}

// ============================================
// ORDER METRICS/ANALYTICS RESPONSES
// ============================================

/**
 * Order metrics for user dashboard
 */
export interface IOrderMetricsResponse {
  total_orders: number;
  total_spent: number;
  average_order_value: number;

  // Status breakdown
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
}

/**
 * Admin order statistics/metrics
 */
export interface IAdminOrderMetricsResponse {
  // Overall stats
  total_orders: number;
  total_revenue: number;
  average_order_value: number;

  // Status breakdown
  orders_by_status: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    returned: number;
  };

  // Payment breakdown
  orders_by_payment_status: {
    pending: number;
    paid: number;
    partially_paid: number;
    refunded: number;
  };

  // Fulfillment breakdown
  orders_by_fulfillment_status: {
    unfulfilled: number;
    partial: number;
    fulfilled: number;
    returned: number;
    cancelled: number;
  };

  // Financial metrics
  total_profit: number;
  average_profit_margin: number;

  // Time-based metrics
  orders_today: number;
  orders_this_week: number;
  orders_this_month: number;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
}

/**
 * Revenue metrics response
 */
export interface IRevenueMetricsResponse {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;

  // Period comparison
  period_start: Date;
  period_end: Date;
  previous_period_revenue: number;
  revenue_growth_percentage: number;
}

// ============================================
// DRAFT ORDER RESPONSES
// ============================================

/**
 * Draft order response (quotes/proforma)
 */
export interface IDraftOrderResponse extends IOrderResponse {
  // Additional draft-specific fields
  expires_at: Date | null;
  quote_valid_until: Date | null;
}

/**
 * Draft order list item
 */
export interface IDraftOrderListItem extends IOrderListItem {
  expires_at: Date | null;
}

// ============================================
// ORDER TAG RESPONSES
// ============================================

/**
 * Order tag response
 */
export interface IOrderTagResponse {
  name: string;
  color: string | null;
  order_count: number;
}

// ============================================
// ORDER SEARCH/FILTER RESPONSES
// ============================================

/**
 * Order search result
 */
export interface IOrderSearchResult {
  orders: IOrderListItem[];
  filters: {
    statuses: string[];
    payment_statuses: string[];
    fulfillment_statuses: string[];
    date_ranges: {
      min_date: Date;
      max_date: Date;
    };
    amount_ranges: {
      min_amount: number;
      max_amount: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Pagination metadata (generic)
 */
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Standard API response wrapper
 */
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: Date;
}

/**
 * Error response
 */
export interface IErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: Date;
}

// ============================================
// ADDITIONAL RESPONSE TYPES
// ============================================

/**
 * Order summary for user order list views
 * Similar to IOrderListItem but with items included
 */
export interface IOrderSummary {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_amount: string;
  total_quantity: number;
  items_count: number;
  created_at: Date;
  items: IOrderItemSummary[];
}

/**
 * Simple order item response for mobile/simplified views
 */
export interface ISimpleOrderItemResponse {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

/**
 * Simple order response for mobile/simplified views
 */
export interface ISimpleOrderResponse {
  id: string;
  date: string;
  status: string;
  total: number;
  deliveryDate?: string;
  trackingNumber?: string;
  items: ISimpleOrderItemResponse[];
}

/**
 * Stock batch result for inventory checking
 * Used by batch stock availability endpoints
 */
export interface IStockBatchResult {
  product_id: string;
  variant_id?: string | null;
  available_quantity: number;
  committed_quantity: number;
  effective_stock: number; // available - committed
}

/**
 * Stock batch response
 */
export interface IStockBatchResponse {
  stock: IStockBatchResult[];
}
