/**
 * GET /metrics
 * Aggregates high-level metrics (Total, Active, Inactive) excluding administrators.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { customerService } from '../services/customer.service';

const handler = async (req: RequestWithUser, res: Response) => {
  const { total, active, inactive } = await customerService.getCustomerMetrics();

  ResponseFormatter.success(
    res,
    { total, active, inactive },
    'Customer metrics retrieved successfully',
  );
};

const router = Router();
router.get('/metrics', requireAuth, requirePermission('users:read'), handler);

export default router;
