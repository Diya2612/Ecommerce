/**
 * Order Conversion Service
 * Handles cart-to-order conversion, draft order confirmation, and quote conversions
 */

import { eq, and } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { carts } from '../../cart/shared/carts.schema';
import { cartItems } from '../../cart/shared/cart-items.schema';
import { logger } from '../../../utils';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

// Interfaces live in shared/interface.ts — re-exported here for backward compatibility
export type { CartToOrderData, ConvertedCartData } from '../shared/interface';
import type { ConvertedCartData } from '../shared/interface';

class OrderConversionService {
  /**
   * Find active cart by user ID
   *
   * @param userId - User ID
   * @param tx - Optional transaction connection
   * @returns Active cart or null
   */
  async findActiveCart(userId: string, tx: Database = db) {
    const [cart] = await tx
      .select()
      .from(carts)
      .where(and(eq(carts.user_id, userId), eq(carts.cart_status, 'active')))
      .limit(1);

    return cart || null;
  }

  /**
   * Get cart items with product details
   *
   * @param cartId - Cart ID
   * @param tx - Optional transaction connection
   * @returns Array of active (non-deleted) cart items
   */
  async getCartItems(cartId: string, tx: Database = db) {
    const items = await tx
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.is_deleted, false)));

    return items;
  }

  /**
   * Extract order data from cart
   *
   * Transforms cart and cart items into format suitable for order creation.
   * Performs data mapping and calculates initial totals.
   *
   * @param cartId - Cart ID to convert
   * @param tx - Optional transaction connection
   * @returns Converted cart data ready for order creation
   * @throws Error if cart not found or has no items
   *
   * @example
   * const cartData = await orderConversionService.extractCartData('cart-123');
   * // Returns: { items: [...], subtotal: 1000, discount_code: 'SAVE10' }
   */
  async extractCartData(cartId: string, tx: Database = db): Promise<ConvertedCartData> {
    // Get cart
    const [cart] = await tx.select().from(carts).where(eq(carts.id, cartId)).limit(1);

    if (!cart) {
      throw new Error(`Cart not found: ${cartId}`);
    }

    // Get cart items
    const items = await this.getCartItems(cartId, tx);

    if (items.length === 0) {
      throw new Error(`Cart has no items: ${cartId}`);
    }

    // Transform items to order format
    const orderItems = items.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product_name || 'Unknown Product',
      product_sku: item.product_sku || 'UNKNOWN',
      quantity: item.quantity,
      unit_price: parseFloat(item.final_price || '0'),
      cost_price: parseFloat(item.cost_price || '0'),
    }));

    // Calculate subtotal
    const subtotal = orderItems.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0,
    );

    // Extract discount code from applied_discount_codes array (if any)
    const appliedCodes = Array.isArray(cart.applied_discount_codes)
      ? cart.applied_discount_codes
      : [];
    const discountCode = appliedCodes.length > 0 ? String(appliedCodes[0]) : undefined;

    return {
      items: orderItems,
      subtotal,
      discount_code: discountCode,
    };
  }

  /**
   * Mark cart as converted to order
   *
   * Updates cart status and adds reference to created order.
   *
   * @param cartId - Cart ID
   * @param orderId - Created order ID
   * @param tx - Optional transaction connection
   * @returns Updated cart
   */
  async markCartAsConverted(cartId: string, orderId: string, tx: Database = db) {
    const [updatedCart] = await tx
      .update(carts)
      .set({
        cart_status: 'converted',
        updated_at: new Date(),
      })
      .where(eq(carts.id, cartId))
      .returning();

    logger.info('Cart marked as converted', { cartId, orderId });
    return updatedCart;
  }

  /**
   * Validate cart is eligible for conversion
   *
   * Checks:
   * - Cart exists and is active
   * - Cart has items
   * - Cart belongs to specified user
   *
   * @param cartId - Cart ID
   * @param userId - User ID
   * @param tx - Optional transaction connection
   * @returns Validation result with errors
   */
  async validateCartForConversion(
    cartId: string,
    userId: string,
    tx: Database = db,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check cart exists
    const [cart] = await tx.select().from(carts).where(eq(carts.id, cartId)).limit(1);

    if (!cart) {
      errors.push('Cart not found');
      return { isValid: false, errors };
    }

    // Check cart belongs to user
    if (cart.user_id !== userId) {
      errors.push('Cart does not belong to user');
    }

    // Check cart is active
    if (cart.cart_status !== 'active') {
      errors.push(`Cart status is ${cart.cart_status}, expected active`);
    }

    // Check cart has items
    const items = await this.getCartItems(cartId, tx);
    if (items.length === 0) {
      errors.push('Cart has no items');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear cart after successful conversion
   *
   * Option 1: Soft delete (mark as converted)
   * Option 2: Hard delete cart and items
   *
   * @param cartId - Cart ID
   * @param method - 'soft' or 'hard' delete
   * @param tx - Optional transaction connection
   */
  async clearConvertedCart(
    cartId: string,
    method: 'soft' | 'hard' = 'soft',
    tx: Database = db,
  ): Promise<void> {
    if (method === 'hard') {
      // Delete cart items first (foreign key constraint)
      await tx.delete(cartItems).where(eq(cartItems.cart_id, cartId));

      // Delete cart
      await tx.delete(carts).where(eq(carts.id, cartId));

      logger.info('Cart hard deleted', { cartId });
    } else {
      // Soft delete - already handled by markCartAsConverted
      logger.info('Cart soft deleted', { cartId });
    }
  }

  /**
   * Prepare draft order for confirmation
   *
   * Validates draft order and prepares it for final confirmation.
   * Used when converting draft orders to confirmed orders.
   *
   * @param draftOrderId - Draft order ID
   * @returns Draft order data ready for confirmation
   */
  async prepareDraftOrderConfirmation(draftOrderId: string) {
    // This will be implemented in Phase 4 when we refactor the draft order APIs
    logger.info('Preparing draft order for confirmation', { draftOrderId });

    // Placeholder return structure
    return {
      orderId: draftOrderId,
      status: 'draft',
      requiresPayment: true,
    };
  }

  /**
   * Convert quote to order
   *
   * Transforms a quote/estimate into an actual order.
   * Used for B2B or custom order flows.
   *
   * @param quoteId - Quote ID
   * @returns Quote data ready for order creation
   */
  async convertQuoteToOrder(quoteId: string) {
    // This will be implemented in Phase 4 when we refactor quote APIs
    logger.info('Converting quote to order', { quoteId });

    // Placeholder return structure
    return {
      quoteId,
      items: [],
      totalAmount: 0,
    };
  }
}

export const orderConversionService = new OrderConversionService();
