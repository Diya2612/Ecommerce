/**
 * POST /admin/orders/verify-payment
 *
 * Admin endpoint to verify payment signature after Razorpay checkout.
 * Unlike the user endpoint, this doesn't validate user ownership.
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { verifyPaymentSchema } from '../shared/validation';
import { orderPaymentService } from '../../orders/services/order-payment.service';

const handler = async (req: RequestWithUser, res: Response) => {
  const adminId = req.userId;
  if (!adminId) {
    throw new HttpException(401, 'Authentication required');
  }

  const paymentData = req.body;

  // Delegate to service
  const result = await orderPaymentService.verifyPayment(paymentData, adminId);

  return ResponseFormatter.success(
    res,
    {
      order_id: result.order?.id,
      order_number: result.order?.order_number,
      payment_status: result.order?.payment_status,
      order_status: result.order?.order_status,
    },
    result.message,
  );
};

const router = Router();
router.post(
  '/admin/orders/verify-payment',
  requireAuth,
  requirePermission('orders:update'),
  validationMiddleware(verifyPaymentSchema, 'body'),
  handler,
);

export default router;
