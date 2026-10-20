/**
 * GET /api/users/me/activity
 * Retrieve recent activity feed for the current user.
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

  // Fetch recent orders (last 10 activities)
  const recentOrders = await db.execute(sql`
    SELECT
      'order_' || order_status AS type,
      order_number,
      order_status,
      total_amount,
      created_at
    FROM orders
    WHERE user_id = ${userId}
      AND is_deleted = false
      AND is_draft = false
    ORDER BY created_at DESC
    LIMIT 10
  `);

  // Transform into activity feed
  const activity = recentOrders.rows.map((row: any) => {
    const statusMap: Record<string, { title: string; description: string }> = {
      delivered: {
        title: 'Order Delivered',
        description: `Order #${row.order_number} delivered successfully`,
      },
      shipped: {
        title: 'Order Shipped',
        description: `Order #${row.order_number} is on its way`,
      },
      confirmed: {
        title: 'Order Confirmed',
        description: `Order #${row.order_number} has been confirmed`,
      },
      processing: {
        title: 'Order Processing',
        description: `Order #${row.order_number} is being prepared`,
      },
      pending: {
        title: 'Order Placed',
        description: `Order #${row.order_number} placed for ₹${Number(row.total_amount).toLocaleString('en-IN')}`,
      },
      cancelled: {
        title: 'Order Cancelled',
        description: `Order #${row.order_number} was cancelled`,
      },
      refunded: {
        title: 'Refund Processed',
        description: `Refund for Order #${row.order_number} processed`,
      },
      returned: {
        title: 'Order Returned',
        description: `Order #${row.order_number} was returned`,
      },
    };

    const status = row.order_status as string;
    const info = statusMap[status] || {
      title: 'Order Update',
      description: `Order #${row.order_number} status: ${status}`,
    };

    return {
      type: `order_${status}`,
      title: info.title,
      description: info.description,
      timestamp: row.created_at,
    };
  });

  ResponseFormatter.success(res, activity, 'User activity retrieved successfully');
};

const router = Router();
router.get('/me/activity', requireAuth, handler);

export default router;
