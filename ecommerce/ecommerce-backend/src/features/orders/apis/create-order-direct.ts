/**
 * POST /api/admin/orders/direct
 * Admin: Create a direct order with custom items
 * - Allows admin to create orders manually
 * - Calculates pricing SERVER-SIDE (secure)
 * - STRICTLY blocks overselling (validates effective_stock)
 * - Reserves stock for the order
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { directOrderSchema, orderService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const orderData = req.body;

  // Delegate all logic to service
  const order = await orderService.createDirectOrder(orderData, userId);

  return ResponseFormatter.success(
    res,
    {
      order_id: order.id,
      order_number: order.order_number,
      order_status: order.order_status,
      payment_status: order.payment_status,
      total_amount: order.total_amount,
      pricing_breakdown: {
        subtotal: order.subtotal,
        discount: order.discount_amount,
        tax: order.tax_amount,
        shipping: order.shipping_amount,
        total: order.total_amount,
      },
      created_at: order.created_at,
    },
    'Order created successfully',
    201,
  );
};

const router = Router();
router.post(
  '/direct',
  requireAuth,
  requirePermission('orders:create'),
  validationMiddleware(directOrderSchema, 'body'),
  handler,
);

export default router;
