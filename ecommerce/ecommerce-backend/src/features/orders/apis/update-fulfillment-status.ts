/**
 * PUT /api/admin/orders/:id/fulfillment
 * Update order fulfillment status
 */

import { Router, Response } from 'express';
import { HttpException, ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { orderIdParamSchema, updateFulfillmentStatusSchema, orderService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.userId;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const fulfillmentData = req.body;

  // Delegate all logic to service
  const updatedOrder = await orderService.updateFulfillmentStatus(id, fulfillmentData, userId);

  return ResponseFormatter.success(res, updatedOrder, 'Fulfillment status updated successfully');
};

const router = Router();
router.put(
  '/admin/orders/:id/fulfillment',
  requireAuth,
  requirePermission('orders:update'),
  validationMiddleware(orderIdParamSchema, 'params'),
  validationMiddleware(updateFulfillmentStatusSchema, 'body'),
  handler,
);

export default router;
