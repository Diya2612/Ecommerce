/**
 * Cancel stale pending orders cron job.
 * Orders that remain in 'pending' status for more than the configured timeout
 * are automatically cancelled and their inventory reservations released.
 */

import cron from 'node-cron';
import { eq, and, lt } from 'drizzle-orm';
import { db } from '../../../database';
import { orders } from '../shared/orders.schema';
import { releaseReservation } from '../../inventory/services';
import { logger } from '../../../utils';

/** How long (in hours) a pending order can remain before auto-cancellation. */
const STALE_ORDER_TIMEOUT_HOURS = parseInt(process.env.STALE_ORDER_TIMEOUT_HOURS || '24', 10);

/** How often (in minutes) the cleanup runs. */
const STALE_ORDER_CHECK_INTERVAL = parseInt(process.env.STALE_ORDER_CHECK_INTERVAL || '30', 10);

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

/** Start the stale pending order cancellation cron job. */
export function startStalePendingOrderCleanup() {
  const schedulePattern = `*/${STALE_ORDER_CHECK_INTERVAL} * * * *`;

  cron.schedule(schedulePattern, async () => {
    try {
      const cutoff = new Date(Date.now() - STALE_ORDER_TIMEOUT_HOURS * 60 * 60 * 1000);

      const staleOrders = await db
        .select({ id: orders.id, order_number: orders.order_number, user_id: orders.user_id })
        .from(orders)
        .where(
          and(
            eq(orders.order_status, 'pending'),
            eq(orders.is_deleted, false),
            lt(orders.created_at, cutoff),
          ),
        );

      if (staleOrders.length === 0) return;

      logger.info(`Found ${staleOrders.length} stale pending orders to cancel`);

      let cancelledCount = 0;
      for (const order of staleOrders) {
        try {
          await db
            .update(orders)
            .set({
              order_status: 'cancelled',
              admin_comment: `Auto-cancelled: pending for more than ${STALE_ORDER_TIMEOUT_HOURS} hours`,
              updated_at: new Date(),
            })
            .where(eq(orders.id, order.id));

          // Release committed inventory
          try {
            await releaseReservation(order.id, order.user_id || SYSTEM_USER_ID);
          } catch (invErr) {
            logger.error(
              `Failed to release inventory for stale order ${order.order_number}:`,
              invErr,
            );
          }

          cancelledCount++;
        } catch (err) {
          logger.error(`Failed to cancel stale order ${order.order_number}:`, err);
        }
      }

      if (cancelledCount > 0) {
        logger.info(`Stale order cleanup: cancelled ${cancelledCount} pending orders`);
      }
    } catch (error) {
      logger.error('Stale pending order cleanup failed:', error);
    }
  });

  logger.info(
    `Stale pending order cleanup cron started (every ${STALE_ORDER_CHECK_INTERVAL} min, timeout ${STALE_ORDER_TIMEOUT_HOURS}h)`,
  );
}
