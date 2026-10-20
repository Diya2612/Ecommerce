/**
 * PUT /api/admin/orders/:id
 * Admin: Update full order details
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { updateOrderSchema, orderIdParamSchema } from '../shared/validation';
import { orderService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  const orderNumberOrId = req.params.id as string;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const updateData = req.body;

  // Delegate all logic to service
  const updatedOrder = await orderService.updateFullOrder(orderNumberOrId, updateData, userId);

  return ResponseFormatter.success(res, updatedOrder, 'Order updated successfully');
};

const router = Router();
router.put(
  '/admin/orders/:id',
  requireAuth,
  requirePermission('orders:update'),
  validationMiddleware(orderIdParamSchema, 'params'),
  validationMiddleware(updateOrderSchema, 'body'),
  handler,
);

export default router;
