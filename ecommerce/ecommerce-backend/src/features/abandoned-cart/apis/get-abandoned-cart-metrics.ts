/**
 * GET /api/admin/abandoned-carts/metrics
 * Admin: Get abandoned cart metrics
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import { getAbandonedCartMetrics } from '../shared/queries';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';

const handler = async (req: RequestWithUser, res: Response) => {
  // Get metrics using centralized query
  const metrics = await getAbandonedCartMetrics();

  return ResponseFormatter.success(
    res,
    {
      total_carts: metrics.total_carts,
      potential_revenue: metrics.potential_revenue,
      emails_sent: metrics.emails_sent,
      recovered_count: metrics.recovered_count,
      recovery_rate: metrics.recovery_rate,
    },
    'Abandoned cart metrics retrieved successfully',
  );
};

const router = Router();
router.get(
  '/admin/abandoned-carts/metrics',
  requireAuth,
  requirePermission('orders:read'),
  handler,
);

export default router;
