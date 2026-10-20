/**
 * GET /api/admin/orders/metrics
 * Get order statistics and metrics for admin dashboard
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import { getAdminOrderMetrics } from '../shared/queries';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';

const handler = async (req: RequestWithUser, res: Response) => {
  // Calculate metrics using centralized query
  const metrics = await getAdminOrderMetrics();

  // TODO: Add caching layer (Redis) for better performance
  // Cache these metrics for 5-10 minutes since they don't change frequently

  return ResponseFormatter.success(res, metrics, 'Order metrics retrieved successfully');
};

const router = Router();
router.get('/admin/orders/metrics', requireAuth, requirePermission('orders:read'), handler);

export default router;
