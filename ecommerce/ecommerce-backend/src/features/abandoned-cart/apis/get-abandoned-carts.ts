/**
 * GET /api/admin/abandoned-carts
 * Admin: Get all abandoned carts with filters
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import { getAbandonedCarts } from '../shared/queries';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { abandonedCartsQuerySchema, AbandonedCartsQuery } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const params = req.query as unknown as AbandonedCartsQuery;

  // Call centralized query
  const result = await getAbandonedCarts(params);

  // Transform response for frontend needs
  const transformedCarts = result.carts.map((cart) => {
    // Calculate relative last activity time
    const lastActivityDate = cart.last_activity_at ? new Date(cart.last_activity_at) : new Date();
    const now = new Date();
    const diffMs = now.getTime() - lastActivityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let lastActivity = '';
    if (diffDays > 0) {
      lastActivity = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      lastActivity = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      lastActivity = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }

    let recoveryStatus: 'not-contacted' | 'email-sent' | 'recovered' = 'not-contacted';
    if (cart.recovery_email_sent) {
      recoveryStatus = 'email-sent';
    }

    return {
      cart_id: cart.cart_id,
      customer_info: {
        name: cart.customer_name || 'Guest',
        email:
          cart.customer_email ||
          (cart.session_id ? `Guest (${cart.session_id.substring(0, 8)}...)` : 'Unknown'),
        phone: cart.customer_phone,
      },
      cart_value: cart.cart_value,
      // items_count removed from list view for performance, details endpoint fetches items
      abandoned_at: cart.abandoned_at,
      last_activity: lastActivity,
      last_activity_at: cart.last_activity_at,
      recovery_status: recoveryStatus,
      recovery_email_sent_at: cart.recovery_email_sent_at,
    };
  });

  return ResponseFormatter.success(
    res,
    {
      carts: transformedCarts,
      pagination: result.pagination,
    },
    'Abandoned carts retrieved successfully',
  );
};

const router = Router();
router.get(
  '/admin/abandoned-carts',
  requireAuth,
  requirePermission('orders:read'),
  validationMiddleware(abandonedCartsQuerySchema, 'query'),
  handler,
);

export default router;
