/**
 * DELETE /api/admin/orders
 * Admin: Soft delete multiple orders
 */

import { Router, Response } from 'express';
import { HttpException, ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { deleteOrdersBodySchema, orderIdParamSchema, orderService } from '../shared';

const bulkDeleteHandler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const { order_ids } = req.body;

  // Delegate all logic to service
  const deletedOrders = await orderService.deleteOrders(order_ids, userId);

  return ResponseFormatter.success(
    res,
    {
      deleted_count: deletedOrders.length,
      order_ids: deletedOrders.map((o) => o.id),
    },
    `Successfully deleted ${deletedOrders.length} order(s)`,
  );
};

/**
 * DELETE /api/admin/orders/:orderId
 * Admin: Soft delete a single order with validation
 */
const singleDeleteHandler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  const { orderId } = req.params as { orderId: string };

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  // Delegate all logic to service (handles validations)
  const deletedOrders = await orderService.deleteOrders([orderId], userId);

  const deletedOrder = deletedOrders[0];

  return ResponseFormatter.success(
    res,
    {
      order_id: deletedOrder.id,
      order_number: deletedOrder.order_number,
    },
    'Order deleted successfully',
  );
};

const router = Router();

// Single order delete (more specific route, must come first)
router.delete(
  '/admin/orders/:orderId',
  requireAuth,
  requirePermission('orders:delete'),
  validationMiddleware(orderIdParamSchema, 'params'),
  singleDeleteHandler,
);

// Bulk orders delete
router.delete(
  '/admin/orders',
  requireAuth,
  requirePermission('orders:delete'),
  validationMiddleware(deleteOrdersBodySchema, 'body'),
  bulkDeleteHandler,
);

export default router;
