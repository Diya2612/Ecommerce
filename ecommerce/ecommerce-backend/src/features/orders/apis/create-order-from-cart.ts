/**
 * POST /api/orders
 * Create a new order from the user's cart
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { createOrderSchema, orderService } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const orderData = req.body;
  const sessionId = (req.headers['x-session-id'] as string) || null;

  // Delegate all logic to service
  const order = await orderService.createOrderFromCart(orderData, userId, sessionId);

  return ResponseFormatter.success(
    res,
    {
      order_id: order.id,
      order_number: order.order_number,
      order_status: order.order_status,
      payment_status: order.payment_status,
      total_amount: order.total_amount,
      discount_amount: order.discount_amount,
      total_quantity: order.total_quantity,
      created_at: order.created_at,
    },
    'Order created successfully',
    201,
  );
};

const router = Router();
router.post('/', requireAuth, validationMiddleware(createOrderSchema, 'body'), handler);

export default router;
