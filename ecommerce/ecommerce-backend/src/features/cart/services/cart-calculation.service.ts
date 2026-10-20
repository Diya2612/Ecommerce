/**
 * Cart Calculation Service
 * Handles cart totals and discount calculations.
 */

import { db } from '../../../database';
import { eq } from 'drizzle-orm';
import { HttpException } from '../../../utils';
import { Cart, carts } from '../shared/carts.schema';
import { CartItem } from '../shared/cart-items.schema';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../../database';
import { findCartById, getCartItems, updateCartTotals } from '../shared/queries';
import { cartAnalyticsService } from './cart-analytics.service';
import {
  discountValidationService,
  discountCalculationService,
  type ValidationContext,
} from '../../discount/services';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Add discount code to cart. */
const addDiscountCodeToCart = async (
  cartId: string,
  discountCode: string,
  tx: Database = db,
): Promise<void> => {
  const [cart] = await tx
    .select({ applied_discount_codes: carts.applied_discount_codes })
    .from(carts)
    .where(eq(carts.id, cartId))
    .limit(1);

  const currentCodes = (cart?.applied_discount_codes as string[]) || [];

  if (!currentCodes.includes(discountCode)) {
    const updatedCodes = [...currentCodes, discountCode];
    await tx
      .update(carts)
      .set({
        applied_discount_codes: updatedCodes,
        updated_at: new Date(),
      })
      .where(eq(carts.id, cartId));
  }
};

/** Remove discount code from cart. */
const removeDiscountCodeFromCart = async (
  cartId: string,
  discountCode: string,
  tx: Database = db,
): Promise<void> => {
  const [cart] = await tx
    .select({ applied_discount_codes: carts.applied_discount_codes })
    .from(carts)
    .where(eq(carts.id, cartId))
    .limit(1);

  const currentCodes = (cart?.applied_discount_codes as string[]) || [];
  const updatedCodes = currentCodes.filter((code) => code !== discountCode);

  await tx
    .update(carts)
    .set({
      applied_discount_codes: updatedCodes,
      updated_at: new Date(),
    })
    .where(eq(carts.id, cartId));
};

/** Clear all discount codes. */
const clearDiscountCodes = async (cartId: string, tx: Database = db): Promise<void> => {
  await tx
    .update(carts)
    .set({
      applied_discount_codes: [],
      discount_total: '0.00',
      updated_at: new Date(),
    })
    .where(eq(carts.id, cartId));
};

export class CartCalculationService {
  /** Recalculate cart totals, validating and applying discounts. */
  async recalculateCartTotals(cartId: string): Promise<void> {
    const cart = await findCartById(cartId);
    if (!cart) return;

    const allItems = await getCartItems(cartId);
    // Exclude saved-for-later items from totals
    const items = allItems.filter((item) => !item.saved_for_later);

    if (items.length === 0) {
      await updateCartTotals(cartId, {
        subtotal: '0.00',
        discount_total: '0.00',
        shipping_total: '0.00',
        tax_total: '0.00',
        grand_total: '0.00',
      });
      await clearDiscountCodes(cartId);
      return;
    }

    const codes = (cart.applied_discount_codes as string[]) || [];
    const validCodes: string[] = [];
    let totalDiscountAmount = 0;

    const calculationItems = items.map((item) => ({
      ...item,
      final_price: Number(item.final_price),
      line_total: Number(item.final_price) * item.quantity,
    }));

    const subtotal = calculationItems.reduce((sum, item) => sum + item.line_total, 0);

    // Apply first valid discount code (only one allowed per order)
    if (codes.length > 0) {
      const code = codes[0];
      const context: ValidationContext = {
        code,
        cart_items: calculationItems
          .filter((item) => item.product_id && item.product_name)
          .map((item) => ({
            product_id: item.product_id as string,
            variant_id: item.variant_id || undefined,
            name: item.product_name as string,
            quantity: item.quantity,
            price: Number(item.final_price),
          })),
        cart_subtotal: subtotal,
        user_id: cart.user_id || undefined,
      };

      const validation = await discountValidationService.validateDiscountCode(context);

      if (validation.valid && validation.discount) {
        validCodes.push(code);
        const calcResult = await discountCalculationService.calculateDiscount(
          validation.discount,
          {
            cart_items: context.cart_items,
            cart_subtotal: subtotal,
            shipping_amount: 0,
          },
          validation.applicable_items,
        );
        totalDiscountAmount = calcResult.discount_amount;
      }
    }

    // Track codes that were auto-removed during recalculation
    const removedCodes = codes.filter((c) => !validCodes.includes(c));
    for (const code of removedCodes) {
      cartAnalyticsService.track('coupon_auto_removed', cartId, {
        code,
        reason: 'no longer valid',
      });
    }
    const existingRemoved = (cart.removed_discount_info as any[]) || [];
    const removedDiscountInfo = [
      ...existingRemoved,
      ...removedCodes.map((code) => ({
        code,
        reason: 'Discount code is no longer valid for this cart',
        removed_at: new Date().toISOString(),
      })),
    ];

    const grandTotal = Math.max(subtotal - totalDiscountAmount, 0);

    await updateCartTotals(cartId, {
      subtotal: subtotal.toFixed(2),
      discount_total: totalDiscountAmount.toFixed(2),
      shipping_total: '0.00',
      tax_total: '0.00',
      grand_total: grandTotal.toFixed(2),
    });

    await db
      .update(carts)
      .set({
        applied_discount_codes: validCodes,
        removed_discount_info: removedDiscountInfo,
        updated_at: new Date(),
      })
      .where(eq(carts.id, cartId));
  }

  /** Apply discount code to cart after validation. */
  async applyDiscountCode(cartId: string, code: string, userId?: string): Promise<Cart> {
    const cart = await findCartById(cartId);
    if (!cart) throw new HttpException(404, 'Cart not found');

    const normalizedCode = code.toUpperCase().trim();

    const appliedCodes = (cart.applied_discount_codes as string[]) || [];
    if (appliedCodes.includes(normalizedCode))
      throw new HttpException(400, 'Discount code already applied');

    const items = await getCartItems(cartId);
    if (items.length === 0) throw new HttpException(400, 'Cannot apply discount to empty cart');

    const cartSubtotal = items.reduce((sum, item) => sum + Number(item.line_subtotal), 0);

    const context: ValidationContext = {
      code: normalizedCode,
      cart_items: items
        .filter((item) => item.product_id && item.product_name)
        .map((item) => ({
          product_id: item.product_id as string,
          variant_id: item.variant_id || undefined,
          name: item.product_name as string,
          quantity: item.quantity,
          price: Number(item.final_price),
        })),
      cart_subtotal: cartSubtotal,
      user_id: userId || cart.user_id || undefined,
    };

    const result = await discountValidationService.validateDiscountCode(context);
    if (!result.valid) throw new HttpException(400, result.message || 'Invalid discount code');

    await addDiscountCodeToCart(cartId, normalizedCode);
    await this.recalculateCartTotals(cartId);

    const updatedCart = await findCartById(cartId);
    if (!updatedCart) throw new HttpException(404, 'Cart not found after update');
    return updatedCart;
  }

  /** Remove specific or all discount codes. */
  async removeDiscountCode(cartId: string, code?: string): Promise<Cart> {
    if (code) {
      await removeDiscountCodeFromCart(cartId, code.toUpperCase().trim());
    } else {
      await clearDiscountCodes(cartId);
    }

    await this.recalculateCartTotals(cartId);

    const updatedCart = await findCartById(cartId);
    if (!updatedCart) throw new HttpException(404, 'Cart not found after update');
    return updatedCart;
  }

  /** Preview totals for a set of items without saving. */
  async calculateTotalsPreview(items: CartItem[]): Promise<{
    subtotal: number;
    discount_total: number;
    grand_total: number;
  }> {
    const subtotal = items.reduce((sum, item) => sum + Number(item.line_subtotal), 0);
    const discountTotal = items.reduce((sum, item) => sum + Number(item.discount_amount), 0);
    const grandTotal = items.reduce((sum, item) => sum + Number(item.line_total), 0);

    return { subtotal, discount_total: discountTotal, grand_total: grandTotal };
  }
}

export const cartCalculationService = new CartCalculationService();
