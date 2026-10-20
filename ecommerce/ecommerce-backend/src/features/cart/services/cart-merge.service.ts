/**
 * Cart Merge Service
 * Handles merging items from guest carts into user accounts.
 */

import { redisClient, isRedisReady } from '../../../utils';
import { CartItem } from '../shared/cart-items.schema';
import { ICartMergeResponse } from '../shared/interface';
import {
  findCartBySessionId,
  findActiveCartByUserId,
  createCart,
  getCartItems,
  markCartAsConverted,
  getAvailableStock,
} from '../shared/queries';
import { cartItemService } from './cart-item.service';
import { cartCalculationService } from './cart-calculation.service';
import { releaseCartStock } from '../../inventory/services';
import { CART_RESERVATION_CONFIG } from '../config/cart-reservation.config';

const MERGE_LOCK_PREFIX = 'cart:merge:lock:';
const MERGE_LOCK_TTL = 30;

export class CartMergeService {
  /** Merge guest cart into user cart using session tracking. */
  async mergeGuestCartIntoUserCart(userId: string, sessionId: string): Promise<ICartMergeResponse> {
    const lockAcquired = await this.acquireMergeLock(userId, sessionId);
    if (!lockAcquired) {
      return {
        merged: false,
        cart_id: null,
        itemCount: 0,
        itemsMerged: 0,
        message: 'Merge already in progress',
      };
    }

    try {
      const guestCart = await findCartBySessionId(sessionId);

      if (guestCart && guestCart.cart_status === 'converted') {
        const userCart = await findActiveCartByUserId(userId);
        const userCartItems = userCart ? await getCartItems(userCart.id) : [];

        return {
          merged: false,
          cart_id: userCart?.id || null,
          itemCount: userCartItems.length,
          itemsMerged: 0,
          message: 'Guest cart already merged',
        };
      }

      if (!guestCart || guestCart.cart_status !== 'active') {
        const userCart = await findActiveCartByUserId(userId);
        const userCartItems = userCart ? await getCartItems(userCart.id) : [];

        return {
          merged: false,
          cart_id: userCart?.id || null,
          itemCount: userCartItems.length,
          itemsMerged: 0,
          message: guestCart ? 'No active guest cart found' : 'No guest cart found',
        };
      }

      const guestItems = await getCartItems(guestCart.id);

      if (guestItems.length === 0) {
        await markCartAsConverted(guestCart.id);
        return {
          merged: true,
          cart_id: null,
          itemCount: 0,
          itemsMerged: 0,
          message: 'Guest cart was empty',
        };
      }

      let userCart = await findActiveCartByUserId(userId);

      if (!userCart) {
        userCart = await createCart({
          user_id: userId,
          session_id: null,
          cart_status: 'active',
          created_by: userId,
        });
      }

      const userItems = await getCartItems(userCart.id);
      let itemsMerged = 0;

      // P1-6: Release all guest cart reservations BEFORE merging to prevent
      // double-committed stock (addItem/updateItemQuantity will create new reservations)
      if (CART_RESERVATION_CONFIG.ENABLED) {
        for (const guestItem of guestItems) {
          try {
            await releaseCartStock(guestItem.id);
          } catch {
            // Continue even if release fails for one item
          }
        }
      }

      for (const guestItem of guestItems) {
        if (!guestItem.product_id) continue;
        const merged = await this.mergeItem(userCart.id, guestItem, userItems);
        if (merged) itemsMerged++;
      }

      await cartCalculationService.recalculateCartTotals(userCart.id);
      await markCartAsConverted(guestCart.id);

      const finalItems = await getCartItems(userCart.id);

      return {
        merged: true,
        cart_id: userCart.id,
        itemCount: finalItems.length,
        itemsMerged,
        totalItems: finalItems.length,
        message: `Successfully merged ${itemsMerged} items from guest cart`,
      };
    } finally {
      await this.releaseMergeLock(userId, sessionId);
    }
  }

  /** Merge a single item, combining quantities for duplicates. */
  private async mergeItem(
    userCartId: string,
    guestItem: CartItem,
    userItems: CartItem[],
  ): Promise<boolean> {
    if (!guestItem.product_id) return false;

    const existingUserItem = userItems.find(
      (ui) => ui.product_id === guestItem.product_id && ui.variant_id === guestItem.variant_id,
    );

    if (existingUserItem) {
      const newQuantity = existingUserItem.quantity + guestItem.quantity;
      const availableStock = await getAvailableStock(
        guestItem.product_id,
        guestItem.variant_id || null,
      );
      const finalQuantity = Math.min(newQuantity, availableStock);

      if (finalQuantity > 0) {
        await cartItemService.updateItemQuantity(existingUserItem.id, finalQuantity);
        return true;
      }
    } else {
      await cartItemService.addItem(userCartId, {
        product_id: guestItem.product_id,
        variant_id: guestItem.variant_id || undefined,
        quantity: guestItem.quantity,
      });
      return true;
    }

    return false;
  }

  /** Acquire Redis lock to prevent race conditions during merge. */
  private async acquireMergeLock(userId: string, sessionId: string): Promise<boolean> {
    if (!isRedisReady()) return true;

    const lockKey = `${MERGE_LOCK_PREFIX}${userId}:${sessionId}`;
    try {
      const result = await redisClient.set(lockKey, Date.now().toString(), {
        NX: true,
        EX: MERGE_LOCK_TTL,
      });
      return result === 'OK';
    } catch {
      return true;
    }
  }

  /** Release Redis merge lock. */
  private async releaseMergeLock(userId: string, sessionId: string): Promise<void> {
    if (!isRedisReady()) return;

    const lockKey = `${MERGE_LOCK_PREFIX}${userId}:${sessionId}`;
    try {
      await redisClient.del(lockKey);
    } catch {
      // Silently continue - lock will expire
    }
  }
}

export const cartMergeService = new CartMergeService();
