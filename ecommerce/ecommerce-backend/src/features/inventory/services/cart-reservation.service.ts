/**
 * Cart Reservation Service
 * Manages temporary stock holds for active shopping carts.
 */

import { db } from '../../../database';
import { logger } from '../../../utils';
import { validateStockAvailability } from './order-reservation.service';
import {
  updateInventoryCommittedQuantity,
  updateCartItemReservation,
  getCartItemWithReservation,
  findExpiredCartReservations,
} from '../shared/queries';

/**
 * Creates a timed reservation for a cart item.
 * Atomic increment of committed quantity.
 */
export async function reserveCartStock(
  productId: string,
  quantity: number,
  cartItemId: string,
  expirationMinutes: number = 30,
  tx?: any,
  skipValidation: boolean = false,
  variantId?: string | null,
): Promise<{ reservation_id: string; expires_at: Date }> {
  const execute = async (transaction: any) => {
    if (!skipValidation) {
      const [validation] = await validateStockAvailability([
        { product_id: productId, quantity, variant_id: variantId },
      ]);
      if (!validation.available) throw new Error(validation.message || 'Insufficient stock');
    }

    // Query layer: Reserve stock (increase committed_quantity)
    await updateInventoryCommittedQuantity(productId, variantId, quantity, transaction);

    const reservation_id = crypto.randomUUID();
    const expires_at = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Query layer: Update cart item with reservation details
    await updateCartItemReservation(cartItemId, reservation_id, expires_at, transaction);

    return { reservation_id, expires_at };
  };

  return tx ? execute(tx) : db.transaction(execute);
}

/**
 * Releases stock hold for a cart item.
 * Atomic decrement of committed quantity.
 */
export async function releaseCartStock(
  cartItemId: string,
  tx?: any,
  forceRelease: boolean = false,
): Promise<void> {
  const execute = async (transaction: any) => {
    const item = await getCartItemWithReservation(cartItemId, transaction);

    if (!item?.product_id) return;
    if (!forceRelease && !item.reservation_id) return;

    // Log the release operation for debugging
    logger.info(
      `Releasing ${item.quantity} units for cart item ${cartItemId} (product: ${item.product_id}, variant: ${item.variant_id})`,
    );

    // FIX: Support variants - use variant_id if present, otherwise product_id
    await updateInventoryCommittedQuantity(
      item.product_id,
      item.variant_id,
      -item.quantity,
      transaction,
    );

    // Query layer: Clear reservation fields
    await updateCartItemReservation(cartItemId, null, null, transaction);
  };

  return tx ? execute(tx) : db.transaction(execute);
}

/**
 * Extends expiration for all reserved items in a cart.
 * P2-1: If a reservation was already expired (released by cron), re-creates
 * the reservation by re-incrementing committed_quantity inside a transaction.
 */
export async function extendCartReservation(
  cartId: string,
  additionalMinutes: number = 60,
  tx?: any,
): Promise<void> {
  const execute = async (transaction: any) => {
    const newExpiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000);

    // Fetch all active cart items to check individual reservation state
    const { cartItems: cartItemsTable } = await import('../../cart/shared/cart-items.schema');
    const { eq: eqOp, and: andOp } = await import('drizzle-orm');

    const items = await transaction
      .select({
        id: cartItemsTable.id,
        product_id: cartItemsTable.product_id,
        variant_id: cartItemsTable.variant_id,
        quantity: cartItemsTable.quantity,
        reservation_id: cartItemsTable.reservation_id,
      })
      .from(cartItemsTable)
      .where(andOp(eqOp(cartItemsTable.cart_id, cartId), eqOp(cartItemsTable.is_deleted, false)));

    for (const item of items) {
      if (!item.product_id) continue;

      if (!item.reservation_id) {
        // Reservation was cleared (expired by cron) — re-create it
        logger.info(
          `Re-creating expired reservation for cart item ${item.id} (product: ${item.product_id})`,
        );
        await updateInventoryCommittedQuantity(
          item.product_id,
          item.variant_id,
          item.quantity,
          transaction,
        );
        const reservationId = crypto.randomUUID();
        await updateCartItemReservation(item.id, reservationId, newExpiresAt, transaction);
      } else {
        // Active reservation — just extend the expiration
        await updateCartItemReservation(item.id, item.reservation_id, newExpiresAt, transaction);
      }
    }
  };

  return tx ? execute(tx) : db.transaction(execute);
}

/**
 * Background task to release expired reservations.
 * Scans for stale locks and clears them.
 */
export async function cleanupExpiredCartReservations(): Promise<number> {
  const expiredItems = await findExpiredCartReservations();

  if (expiredItems.length === 0) return 0;

  for (const item of expiredItems) {
    if (!item.product_id) continue;

    await updateInventoryCommittedQuantity(item.product_id, item.variant_id, -item.quantity);
    await updateCartItemReservation(item.id, null, null);
  }

  return expiredItems.length;
}
