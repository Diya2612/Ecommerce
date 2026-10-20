/**
 * POST /api/orders/:id/cancel
 * Cancel an order (user can only cancel pending/confirmed orders)
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException, logger } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { releaseReservation } from '../../inventory/services';
import {
  findOrderById,
  orderStatusService,
  cancelOrderSchema,
  orderIdParamSchema,
} from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  const orderId = req.params.id as string;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const { reason } = req.body;

  // Get order using queries
  const order = await findOrderById(orderId);
  if (!order) {
    throw new HttpException(404, 'Order not found');
  }

  // Verify ownership
  if (order.user_id !== userId) {
    throw new HttpException(403, 'Not authorized to cancel this order');
  }

  // Check if order can be cancelled using status service
  const canCancel = await orderStatusService.canBeCancelled(orderId);
  if (!canCancel) {
    throw new HttpException(
      400,
      `Cannot cancel order in "${order.order_status}" status. Only pending or confirmed orders can be cancelled.`,
    );
  }

  // Cancel order using status service
  await orderStatusService.markAsCancelled(
    orderId,
    reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer',
    userId,
  );

  // Release inventory reservation if order not yet shipped
  if (order.order_status !== 'shipped' && order.order_status !== 'delivered') {
    try {
      await releaseReservation(String(orderId), String(userId));
      logger.info(`Inventory reservation released for order ${order.order_number}`);
    } catch (error: any) {
      logger.error('Failed to release inventory reservation:', error);
      // Continue with cancellation even if inventory release fails
    }
  } else {
    logger.info(
      `Order ${order.order_number} already shipped - inventory not released (requires return flow)`,
    );
  }

  return ResponseFormatter.success(
    res,
    {
      order_id: orderId,
      order_number: order.order_number,
      new_status: 'cancelled',
    },
    'Order cancelled successfully',
  );
};

const router = Router();
router.post(
  '/:id/cancel',
  requireAuth,
  validationMiddleware(orderIdParamSchema, 'params'),
  validationMiddleware(cancelOrderSchema, 'body'),
  handler,
);

export default router;
