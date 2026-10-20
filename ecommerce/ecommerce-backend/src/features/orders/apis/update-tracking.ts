/**
 * PUT /api/admin/orders/:id/tracking
 * Add or update tracking information for an order
 */

import { Router, Response } from 'express';
import { HttpException, ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { orderIdParamSchema, updateTrackingSchema, orderService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.userId;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const trackingData = req.body;

  // Delegate all logic to service
  const updatedOrder = await orderService.updateTracking(id, trackingData, userId);

  return ResponseFormatter.success(
    res,
    {
      id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      tracking_number: updatedOrder.order_tracking,
      shipping_method: updatedOrder.shipping_method,
      shipping_option: updatedOrder.shipping_option,
      updated_at: updatedOrder.updated_at,
    },
    'Tracking information updated successfully',
  );
};

const router = Router();
router.put(
  '/admin/orders/:id/tracking',
  requireAuth,
  requirePermission('orders:update'),
  validationMiddleware(orderIdParamSchema, 'params'),
  validationMiddleware(updateTrackingSchema, 'body'),
  handler,
);

export default router;
