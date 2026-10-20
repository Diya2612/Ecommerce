/**
 * Admin API: Manually release stuck committed stock
 *
 * POST /api/inventory/release-stuck-stock
 *
 * This endpoint allows admins to fix committed_quantity mismatches
 * caused by failed cleanup jobs or system errors.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import { db } from '../../../database';
import { inventory } from '../shared/inventory.schema';
import { cartItems } from '../../cart/shared/cart-items.schema';
import { eq, and, or, isNull, sql } from 'drizzle-orm';
import { HttpException, logger, ResponseFormatter } from '../../../utils';

interface ReleaseStuckStockRequest {
  product_id: string;
  variant_id?: string | null;
  dry_run?: boolean;
}

const handler = async (req: RequestWithUser, res: Response) => {
  const { product_id, variant_id, dry_run = false } = req.body as ReleaseStuckStockRequest;
  const userId = req.userId;

  if (!product_id) {
    throw new HttpException(400, 'product_id is required');
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Get current inventory record
      const [inv] = await tx
        .select()
        .from(inventory)
        .where(
          and(
            eq(inventory.product_id, product_id),
            variant_id ? eq(inventory.variant_id, variant_id) : isNull(inventory.variant_id),
          ),
        );

      if (!inv) {
        throw new HttpException(404, 'Inventory record not found');
      }

      // Calculate actual reservations
      const cartReservations = await tx
        .select({
          total: sql<number>`COALESCE(SUM(${cartItems.quantity}), 0)`,
        })
        .from(cartItems)
        .where(
          and(
            eq(cartItems.product_id, product_id),
            variant_id ? eq(cartItems.variant_id, variant_id) : isNull(cartItems.variant_id),
            sql`${cartItems.reservation_id} IS NOT NULL`,
            or(
              isNull(cartItems.reservation_expires_at),
              sql`${cartItems.reservation_expires_at} > NOW()`,
            ),
          ),
        );

      const orderReservations = await tx.execute(sql`
        SELECT COALESCE(SUM(oi.quantity), 0) as total
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = ${product_id}
          ${variant_id ? sql`AND oi.variant_id = ${variant_id}` : sql`AND oi.variant_id IS NULL`}
          AND o.order_status IN ('pending', 'confirmed', 'processing')
      `);

      const actualCart = Number(cartReservations[0]?.total || 0);
      const actualOrders = Number((orderReservations.rows[0] as any)?.total || 0);
      const expectedCommitted = actualCart + actualOrders;
      const stockToRelease = inv.committed_quantity - expectedCommitted;

      const analysis = {
        product_id,
        variant_id,
        current_available: inv.available_quantity,
        current_committed: inv.committed_quantity,
        actual_cart_reservations: actualCart,
        actual_order_reservations: actualOrders,
        expected_committed: expectedCommitted,
        stock_to_release: stockToRelease,
        will_fix: stockToRelease > 0 && !dry_run,
      };

      if (stockToRelease > 0 && !dry_run) {
        await tx
          .update(inventory)
          .set({
            committed_quantity: expectedCommitted,
            updated_at: new Date(),
          })
          .where(eq(inventory.id, inv.id));

        logger.info('Admin released stuck stock', {
          userId,
          product_id,
          variant_id,
          released: stockToRelease,
          previous_committed: inv.committed_quantity,
          new_committed: expectedCommitted,
        });
      }

      return analysis;
    });

    const message = dry_run
      ? 'Dry run complete - no changes made'
      : result.stock_to_release > 0
        ? `Released ${result.stock_to_release} stuck units`
        : 'No stuck stock found';

    ResponseFormatter.success(res, result, message);
  } catch (error) {
    logger.error('Error releasing stuck stock', { error, userId, product_id, variant_id });
    throw error;
  }
};

const router = Router();
router.post('/release-stuck-stock', requireAuth, requirePermission('inventory:update'), handler);

export default router;
