/**
 * POST /api/admin/orders/drafts/:id/confirm
 * Convert a draft order to a confirmed order
 */

import { Router, Response } from 'express';
import { HttpException, ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { orderIdParamSchema, confirmDraftOrderSchema, orderService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.userId;

  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const confirmData = req.body;

  // Delegate all logic to service
  const result = await orderService.confirmDraftOrder(id, confirmData, userId);

  return ResponseFormatter.success(res, result, 'Draft order confirmed successfully', 200);
};

const router = Router();
router.post(
  '/admin/orders/drafts/:id/confirm',
  requireAuth,
  requirePermission('orders:update'),
  validationMiddleware(orderIdParamSchema, 'params'),
  validationMiddleware(confirmDraftOrderSchema, 'body'),
  handler,
);

export default router;
