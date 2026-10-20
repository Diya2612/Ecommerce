/**
 * PUT /api/admin/orders/:id/payment
 * Update order payment status
 */

import { Router, Response } from 'express';
import { HttpException, ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { orderIdParamSchema, updatePaymentStatusSchema, orderService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.userId;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const paymentData = req.body;

  // Delegate all logic to service
  const updatedOrder = await orderService.updatePaymentStatus(id, paymentData, userId);

  return ResponseFormatter.success(res, updatedOrder, 'Payment status updated successfully');
};

const router = Router();
router.put(
  '/admin/orders/:id/payment',
  requireAuth,
  requirePermission('orders:update'),
  validationMiddleware(orderIdParamSchema, 'params'),
  validationMiddleware(updatePaymentStatusSchema, 'body'),
  handler,
);

export default router;
