/**
 * POST /admin/orders/create-payment-order
 *
 * Admin endpoint to create a Razorpay payment order for any order.
 * Unlike the user endpoint, this doesn't validate user ownership.
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { createPaymentOrderSchema } from '../shared/validation';
import { orderPaymentService } from '../../orders/services/order-payment.service';

const handler = async (req: RequestWithUser, res: Response) => {
  const adminId = req.userId;
  if (!adminId) {
    throw new HttpException(401, 'Authentication required');
  }

  const { order_id: orderId, payment_method: paymentMethod } = req.body;

  // Delegate to service
  const result = await orderPaymentService.createPaymentOrder(orderId, paymentMethod, adminId);

  return ResponseFormatter.success(res, result, 'Payment order created successfully');
};

const router = Router();
router.post(
  '/admin/orders/create-payment-order',
  requireAuth,
  requirePermission('orders:update'),
  validationMiddleware(createPaymentOrderSchema, 'body'),
  handler,
);

export default router;
