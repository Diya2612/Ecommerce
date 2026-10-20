/**
 * GET /customer/:id/activity
 * Aggregates a comprehensive activity timeline across orders, payments, and account events.
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, logger } from '../../../utils';
import { customerIdParamsSchema, customerActivityQuerySchema } from '../shared/validation';
import { customerService } from '../services/customer.service';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const { limit, offset, category } = req.query as unknown as z.infer<
    typeof customerActivityQuerySchema
  >;

  logger.info(`GET /customer/${id}/activity request received`);

  const { activities, total } = await customerService.getCustomerActivity(
    id,
    limit,
    offset,
    category,
  );

  logger.info(`Found ${activities.length} activities for customer ${id}`);

  ResponseFormatter.success(
    res,
    {
      activities,
      pagination: { limit, offset, total, hasMore: offset + activities.length < total },
    },
    'Customer activity retrieved successfully',
  );
};

const router = Router();
router.get(
  '/customer/:id/activity',
  requireAuth,
  validationMiddleware(customerIdParamsSchema, 'params'),
  validationMiddleware(customerActivityQuerySchema, 'query'),
  requirePermission('users:read'),
  handler,
);

export default router;
