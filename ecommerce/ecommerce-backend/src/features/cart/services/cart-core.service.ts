/**
 * Cart Core Service
 * Handles basic cart lifecycle operations and ownership verification.
 */

import { db } from '../../../database';
import { eq, inArray, sql } from 'drizzle-orm';
import { HttpException } from '../../../utils';
import { Cart, NewCart } from '../shared/carts.schema';
import { ICartResponse, IAppliedDiscountResponse } from '../shared/interface';
import {
  findActiveCartByUserId,
  findActiveCartBySessionId,
  findCartById,
  createCart,
  softDeleteCart,
  transferCartOwnership,
  hasUnmergedGuestCart,
} from '../shared/queries';

export class CartCoreService {
  /** Get cart by ID. */
  async getCart(cartId: string): Promise<Cart | undefined> {
    return findCartById(cartId);
  }

  /** Throws error if cart is missing, inactive, or deleted. */
  async ensureActiveCart(cartId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);

    if (!cart) throw new HttpException(404, 'Cart not found');
    if (cart.cart_status !== 'active')
      throw new HttpException(400, `Cart is no longer active (status: ${cart.cart_status})`);
    if (cart.is_deleted) throw new HttpException(404, 'Cart has been deleted');

    return cart;
  }

  /** Find active cart by user ID or session ID. */
  async getActiveCart(userId?: string, sessionId?: string): Promise<Cart | undefined> {
    if (!userId && !sessionId) return undefined;

    if (userId) {
      const userCart = await findActiveCartByUserId(userId);
      if (userCart) return userCart;
    }

    if (sessionId) {
      return findActiveCartBySessionId(sessionId);
    }

    return undefined;
  }

  /** Find or create a new active cart. */
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (!userId && !sessionId)
      throw new HttpException(400, 'Either user authentication or session ID is required');

    const existingCart = await this.getActiveCart(userId, sessionId);
    if (existingCart) return existingCart;

    const isGuest = !userId && !!sessionId;
    const newCartData: NewCart = {
      user_id: userId || null,
      session_id: sessionId || null,
      cart_status: 'active',
      created_by: userId || null,
      ...(isGuest && {
        session_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }),
    };

    return createCart(newCartData);
  }

  /** Check for unmerged guest carts. */
  async checkUnmergedGuestCart(sessionId?: string): Promise<boolean> {
    if (!sessionId) return false;
    return hasUnmergedGuestCart(sessionId);
  }

  /** Verify cart ownership. */
  async verifyCartOwnership(cart: Cart, userId?: string, sessionId?: string): Promise<void> {
    if (userId && cart.user_id !== userId)
      throw new HttpException(403, 'Not authorized to access this cart');
    if (!userId && sessionId && cart.session_id !== sessionId)
      throw new HttpException(403, 'Not authorized to access this cart');
    if (!userId && !sessionId)
      throw new HttpException(401, 'Authentication or session ID required');
  }

  /** Transfer ownership from guest session to user. */
  async transferOwnership(cartId: string, userId: string): Promise<void> {
    return transferCartOwnership(cartId, userId);
  }

  /** Soft delete cart. */
  async deleteCart(cartId: string, deletedBy?: string): Promise<void> {
    return softDeleteCart(cartId, deletedBy);
  }

  /** Return standard empty cart structure. */
  buildEmptyCartResponse(hasUnmergedGuestCart: boolean = false): ICartResponse {
    return {
      id: null,
      currency: 'INR',
      subtotal: '0.00',
      discount_total: '0.00',
      shipping_total: '0.00',
      tax_total: '0.00',
      grand_total: '0.00',
      applied_discount_codes: [],
      applied_giftcard_codes: [],
      applied_discounts: [],
      items: [],
      itemCount: 0,
      totalQuantity: 0,
      hasStockIssues: false,
      hasPriceChanges: false,
      hasLowStockWarnings: false,
      removedDiscounts: [],
      savedForLaterItems: [],
      savedForLaterCount: 0,
      hasUnmergedGuestCart,
    };
  }

  /** Enrich codes with discount metadata from discount service. */
  async enrichCartWithDiscountMetadata(
    appliedCodes: string[],
  ): Promise<IAppliedDiscountResponse[]> {
    if (appliedCodes.length === 0) return [];

    try {
      const { discountCodes } = await import('../../discount/shared/discount-codes.schema');
      const { discounts } = await import('../../discount/shared/discount.schema');

      const upperCaseCodes = appliedCodes.map((c) => c.toUpperCase());
      const discountInfoResults = await db
        .select({
          code: discountCodes.code,
          type: discounts.type,
          title: discounts.title,
          value: discounts.value,
        })
        .from(discountCodes)
        .innerJoin(discounts, eq(discountCodes.discount_id, discounts.id))
        .where(inArray(sql`UPPER(${discountCodes.code})`, upperCaseCodes));

      return discountInfoResults.map((d) => ({
        code: d.code,
        type: d.type as 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y',
        title: d.title,
        value: d.value,
        savings: '0.00',
      }));
    } catch {
      return [];
    }
  }
}

export const cartCoreService = new CartCoreService();
