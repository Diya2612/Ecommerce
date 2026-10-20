/**
 * PUT /api/admin/orders/:id/status
 * Admin: Update order status
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { updateOrderStatusSchema, orderIdParamSchema } from '../shared/validation';
import { orderStatusService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  const { id: orderId } = req.params as { id: string };

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const statusUpdate = req.body;

  // Delegate all logic to service
  const updatedOrder = await orderStatusService.updateOrderStatusWithSideEffects(
    orderId,
    statusUpdate,
    userId,
    {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    },
  );

  return ResponseFormatter.success(
    res,
    {
      order_id: orderId,
      order_number: updatedOrder?.order_number,
      order_status: updatedOrder?.order_status,
      payment_status: updatedOrder?.payment_status,
      fulfillment_status: updatedOrder?.fulfillment_status,
    },
    'Order status updated successfully',
  );
};

const router = Router();
router.put(
  '/admin/orders/:id/status',
  requireAuth,
  requirePermission('orders:update'),
  validationMiddleware(orderIdParamSchema, 'params'),
  validationMiddleware(updateOrderStatusSchema, 'body'),
  handler,
);

export default router;
