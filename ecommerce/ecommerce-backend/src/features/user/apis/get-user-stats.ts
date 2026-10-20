/**
 * GET /api/users/me/stats
 * Retrieve aggregated stats for the current user's profile overview.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { db } from '../../../database';
import { sql } from 'drizzle-orm';

const handler = async (req: RequestWithUser, res: Response) => {
  if (!req.userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const userId = req.userId;

  // Run all count queries in parallel for performance
  const [orderStats, addressCount, wishlistCount] = await Promise.all([
    // Order stats: total orders + total spent
    db.execute(sql`
      SELECT
        COALESCE(COUNT(*), 0)::int AS total_orders,
        COALESCE(SUM(total_amount::numeric), 0)::numeric AS total_spent
      FROM orders
      WHERE user_id = ${userId}
        AND is_deleted = false
        AND is_draft = false
    `),
    // Address count
    db.execute(sql`
      SELECT COALESCE(COUNT(*), 0)::int AS count
      FROM user_addresses
      WHERE user_id = ${userId}
        AND is_deleted = false
    `),
    // Wishlist item count
    db.execute(sql`
      SELECT COALESCE(COUNT(*), 0)::int AS count
      FROM wishlist_items wi
      INNER JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE w.user_id = ${userId}
    `),
  ]);

  const stats = {
    totalOrders: Number(orderStats.rows[0]?.total_orders ?? 0),
    totalSpent: Number(orderStats.rows[0]?.total_spent ?? 0),
    wishlistCount: Number(wishlistCount.rows[0]?.count ?? 0),
    savedAddressCount: Number(addressCount.rows[0]?.count ?? 0),
    rewardPoints: 0, // Placeholder until rewards system is connected
    memberTier: 'Bronze', // Placeholder until loyalty system is connected
  };

  ResponseFormatter.success(res, stats, 'User stats retrieved successfully');
};

const router = Router();
router.get('/me/stats', requireAuth, handler);

export default router;
