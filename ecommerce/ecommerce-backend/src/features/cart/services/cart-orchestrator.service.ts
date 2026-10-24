/**
 * Cart Orchestrator Service
 * Coordinates workflows across multiple cart sub-services.
 */

import { HttpException } from '../../../utils';
import { db } from '../../../database';
import { eq } from 'drizzle-orm';
import { cartCoreService } from './cart-core.service';
import { cartItemService } from './cart-item.service';
import { cartCalculationService } from './cart-calculation.service';
import { cartValidationService } from './cart-validation.service';
import { ICartResponse } from '../shared/interface';
import { Cart } from '../shared/carts.schema';
import { CartItem } from '../shared/cart-items.schema';
import { findCartItemById } from '../shared/queries';

/** Cart is considered stale if last activity was more than this many days ago. */
const STALE_CART_THRESHOLD_DAYS = 7;

export class CartOrchestratorService {
  /** Remove item with owner validation and total recalculation. */
  async removeItemWithValidation(
    itemId: string,
    userId?: string,
    sessionId?: string,
  ): Promise<Cart | undefined> {
    const cartItem = await findCartItemById(itemId);
    if (!cartItem) throw new HttpException(404, 'Cart item not found');

    const cart = await cartCoreService.getCart(cartItem.cart_id);
    if (!cart) throw new HttpException(404, 'Cart not found');

    await cartCoreService.verifyCartOwnership(cart, userId, sessionId);
    await cartItemService.removeItem(itemId);
    await cartCalculationService.recalculateCartTotals(cart.id);

    return cartCoreService.getCart(cart.id);
  }

  /** Update quantity with owner validation and total recalculation. */
  async updateItemQuantityWithValidation(
    itemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string,
  ): Promise<CartItem> {
    const cartItem = await findCartItemById(itemId);
    if (!cartItem) throw new HttpException(404, 'Cart item not found');

    const cart = await cartCoreService.getCart(cartItem.cart_id);
    if (!cart) throw new HttpException(404, 'Cart not found');

    await cartCoreService.verifyCartOwnership(cart, userId, sessionId);
    await cartItemService.updateItemQuantity(itemId, quantity);
    await cartCalculationService.recalculateCartTotals(cart.id);

    const updatedItem = await findCartItemById(itemId);
    if (!updatedItem) throw new HttpException(404, 'Cart item not found after update');

    return updatedItem;
  }

  /** Build complete cart details response for API. */
  async getCartWithDetails(userId?: string, sessionId?: string): Promise<ICartResponse> {
    if (!userId && !sessionId) return cartCoreService.buildEmptyCartResponse(false);

    if (userId && sessionId) {
      try {
        const { cartMergeService } = await import('./cart-merge.service');
        await cartMergeService.mergeGuestCartIntoUserCart(userId, sessionId);
      } catch {
        // Safe to ignore if merge in progress or not needed
      }
    }

    const cart = await cartCoreService.getActiveCart(userId, sessionId);
    const hasUnmergedGuestCart = userId
      ? await cartCoreService.checkUnmergedGuestCart(sessionId)
      : false;

    if (!cart) return cartCoreService.buildEmptyCartResponse(hasUnmergedGuestCart);

    // P2-2: Auto-validate stale carts to repair outdated prices and flag unavailable items
    const staleCutoff = new Date(Date.now() - STALE_CART_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
    if (cart.last_activity_at && cart.last_activity_at < staleCutoff) {
      try {
        await cartValidationService.validateCart(cart.id, true);
      } catch {
        // Validation may throw if cart is empty after repairs — safe to continue
      }
    }

    const allEnrichedItems = await cartItemService.getItemsWithDetails(cart.id);
    const enrichedItems = allEnrichedItems.filter((item) => !item.saved_for_later);
    const savedForLaterItems = allEnrichedItems.filter((item) => item.saved_for_later);
    const totalQuantity = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
    const hasStockIssues = enrichedItems.some((item) => !item.inStock);
    const hasPriceChanges = enrichedItems.some((item) => item.priceChanged);
    const hasLowStockWarnings = enrichedItems.some((item) => item.lowStock);

    const appliedCodes = (cart.applied_discount_codes as string[]) || [];
    let appliedDiscounts = await cartCoreService.enrichCartWithDiscountMetadata(appliedCodes);

    appliedDiscounts = appliedDiscounts.map((d) => ({
      ...d,
      savings: cart.discount_total,
    }));

    const removedDiscounts = ((cart as any).removed_discount_info as any[]) || [];

    // Clear removed_discount_info after reading so it's only surfaced once
    if (removedDiscounts.length > 0) {
      const { carts } = await import('../shared/carts.schema');
      await db.update(carts).set({ removed_discount_info: [] }).where(eq(carts.id, cart.id));
    }

    return {
      id: cart.id,
      currency: cart.currency,
      subtotal: cart.subtotal,
      discount_total: cart.discount_total,
      shipping_total: cart.shipping_total,
      tax_total: cart.tax_total,
      grand_total: cart.grand_total,
      applied_discount_codes: appliedCodes,
      applied_giftcard_codes: (cart.applied_giftcard_codes as string[]) || [],
      applied_discounts: appliedDiscounts,
      items: enrichedItems,
      itemCount: enrichedItems.length,
      totalQuantity,
      hasStockIssues,
      hasPriceChanges,
      hasLowStockWarnings,
      removedDiscounts,
      savedForLaterItems,
      savedForLaterCount: savedForLaterItems.length,
      hasUnmergedGuestCart,
      last_activity_at: cart.last_activity_at,
      created_at: cart.created_at,
      updated_at: cart.updated_at,
    };
  }
}

export const cartOrchestratorService = new CartOrchestratorService();
