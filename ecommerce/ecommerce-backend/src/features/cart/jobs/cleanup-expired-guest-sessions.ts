/**
 * Cleanup expired guest cart sessions cron job.
 * Soft-deletes guest carts whose session_expires_at has passed,
 * releasing any held reservations.
 */

import cron from 'node-cron';
import { db } from '../../../database';
import { and, eq, isNull, lte, isNotNull } from 'drizzle-orm';
import { carts } from '../shared/carts.schema';
import { cartItems } from '../shared/cart-items.schema';
import { releaseCartStock } from '../../inventory/services';
import { logger } from '../../../utils';

/** Clean up expired guest carts. Returns count of deleted carts. */
async function cleanupExpiredGuestSessions(): Promise<number> {
  const now = new Date();

  // Find active guest carts with expired sessions
  const expiredCarts = await db
    .select({ id: carts.id })
    .from(carts)
    .where(
      and(
        isNull(carts.user_id),
        eq(carts.cart_status, 'active'),
        eq(carts.is_deleted, false),
        isNotNull(carts.session_expires_at),
        lte(carts.session_expires_at, now),
      ),
    );

  for (const cart of expiredCarts) {
    try {
      // Release all reservations for this cart's items
      const items = await db
        .select({ id: cartItems.id })
        .from(cartItems)
        .where(and(eq(cartItems.cart_id, cart.id), eq(cartItems.is_deleted, false)));

      for (const item of items) {
        await releaseCartStock(item.id);
      }

      // Soft-delete the cart
      await db
        .update(carts)
        .set({ is_deleted: true, deleted_at: now, updated_at: now })
        .where(eq(carts.id, cart.id));
    } catch (error) {
      logger.error(`Failed to clean up expired guest cart ${cart.id}:`, error);
    }
  }

  return expiredCarts.length;
}

/** Start the expired guest session cleanup cron job (runs daily at 4 AM). */
export function startGuestSessionCleanup() {
  cron.schedule('0 4 * * *', async () => {
    try {
      const count = await cleanupExpiredGuestSessions();
      if (count > 0) {
        logger.info(`Guest session cleanup: deleted ${count} expired guest carts`);
      }
    } catch (error) {
      logger.error('Guest session cleanup failed:', error);
    }
  });

  logger.info('Guest session cleanup cron job started (daily at 4:00 AM)');
}
