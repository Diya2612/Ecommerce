/**
 * Cart Entity & Response Interfaces
 */

import { Cart } from './carts.schema';
import { CartItem } from './cart-items.schema';
import { omitFields } from '../../../utils';

export type ICart = Cart;

/** Sanitized cart without internal/audit fields. */
export type SanitizedCart = Omit<
  ICart,
  'is_deleted' | 'deleted_at' | 'deleted_by' | 'created_by' | 'updated_by'
>;

export type ICartItem = CartItem;

/** Sanitized cart item without internal fields. */
export type SanitizedCartItem = Omit<ICartItem, 'is_deleted' | 'deleted_at'>;

/** Sanitize cart object. */
export const sanitizeCart = (cart: ICart): SanitizedCart =>
  omitFields(cart, ['is_deleted', 'deleted_at', 'deleted_by', 'created_by', 'updated_by']);

/** Sanitize multiple carts. */
export const sanitizeCarts = (carts: ICart[]): SanitizedCart[] => carts.map(sanitizeCart);

/** Sanitize cart item. */
export const sanitizeCartItem = (item: ICartItem): SanitizedCartItem =>
  omitFields(item, ['is_deleted', 'deleted_at']);

/** Sanitize multiple cart items. */
export const sanitizeCartItems = (items: ICartItem[]): SanitizedCartItem[] =>
  items.map(sanitizeCartItem);

export type { Cart, CartItem };

/** Cart item with product details and stock status. */
export interface ICartItemResponse {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  cost_price: string;
  final_price: string;
  discount_amount: string;
  line_subtotal: string;
  line_total: string;
  product_name: string | null;
  product_image_url: string | null;
  product_sku: string | null;
  inStock: boolean;
  availableStock: number;
  maxOrderQuantity: number;
  lowStock: boolean;
  stockMessage: string | null;
  priceChanged: boolean;
  currentPrice: string | null;
  priceAtAdd: string | null;
  priceChangeAmount: string | null;
  saved_for_later: boolean;
  created_at: Date;
  updated_at: Date;
}

/** Applied discount metadata. */
export interface IAppliedDiscountResponse {
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  title: string;
  value: string | null;
  savings: string;
}

/** Info about a discount that was auto-removed during recalculation. */
export interface IRemovedDiscountInfo {
  code: string;
  reason: string;
  removed_at: string;
}

/** Full cart response. */
export interface ICartResponse {
  id: string | null;
  currency: string;
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  tax_total: string;
  grand_total: string;
  applied_discount_codes: string[];
  applied_giftcard_codes: string[];
  applied_discounts: IAppliedDiscountResponse[];
  items: ICartItemResponse[];
  itemCount: number;
  totalQuantity: number;
  hasStockIssues: boolean;
  hasPriceChanges: boolean;
  hasLowStockWarnings: boolean;
  removedDiscounts: IRemovedDiscountInfo[];
  savedForLaterItems: ICartItemResponse[];
  savedForLaterCount: number;
  hasUnmergedGuestCart: boolean;
  last_activity_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

/** Simplified cart summary. */
export interface ICartSummaryResponse {
  itemCount: number;
  totalQuantity: number;
  grand_total: string;
  currency: string;
}

export interface IAddToCartResponse {
  success: boolean;
  cart: ICartResponse | null;
  items: ICartItemResponse[];
  itemCount: number;
  message: string;
}

export interface IUpdateCartItemResponse {
  success: boolean;
  cart: ICartResponse | null;
  updatedItem: ICartItemResponse | null;
  message: string;
}

export interface IRemoveCartItemResponse {
  success: boolean;
  cart: ICartResponse | null;
  message: string;
}

export interface IClearCartResponse {
  success: boolean;
  message: string;
}

export interface ICartMergeResponse {
  merged: boolean;
  cart_id: string | null;
  itemCount: number;
  itemsMerged: number;
  totalItems?: number;
  message: string;
}

export interface IValidationIssue {
  itemId: string;
  productId: string | null;
  productName: string | null;
  type: 'out_of_stock' | 'insufficient_stock' | 'price_changed' | 'product_unavailable';
  message: string;
  details: {
    requestedQuantity?: number;
    availableQuantity?: number;
    oldPrice?: string;
    newPrice?: string;
  };
}

export interface ICartValidationResponse {
  valid: boolean;
  cartId: string;
  issues: IValidationIssue[];
  updatedTotals: {
    subtotal: string;
    discount_total: string;
    grand_total: string;
  } | null;
}

export interface IApplyDiscountResponse {
  success: boolean;
  code: string;
  discount: IAppliedDiscountResponse | null;
  cart: ICartResponse | null;
  message: string;
}

export interface IRemoveDiscountResponse {
  success: boolean;
  code: string;
  cart: ICartResponse | null;
  message: string;
}
