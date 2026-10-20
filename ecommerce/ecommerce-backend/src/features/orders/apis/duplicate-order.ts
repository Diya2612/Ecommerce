/**
 * POST /api/admin/orders/:orderId/duplicate
 * Admin: Duplicate an existing order
 */

import { Router, Response } from 'express';
import { HttpException, ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { orderIdParamSchema, orderService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const { orderId } = req.params as { orderId: string };
  const userId = req.userId;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  // Delegate all logic to service
  const duplicatedOrder = await orderService.duplicateOrder(orderId, userId);

  return ResponseFormatter.success(
    res,
    {
      order: duplicatedOrder,
    },
    'Order duplicated successfully',
  );
};

const router = Router();
router.post(
  '/admin/orders/:orderId/duplicate',
  requireAuth,
  requirePermission('orders:write'),
  validationMiddleware(orderIdParamSchema, 'params'),
  handler,
);

export default router;
