import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { createPaymentOrderSchema } from '../shared/validation';
import { PaymentService } from '../services/payment.service';

/**
 * Creates a Razorpay order for a pending order after validating state
 * and acquiring a distributed lock to prevent duplicate creation.
 */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Authentication required');

  const body = createPaymentOrderSchema.parse(req.body);

  const result = await PaymentService.createPaymentOrder(userId, body);

  return ResponseFormatter.success(
    res,
    result,
    body.payment_method === 'cod'
      ? 'Order confirmed for Cash on Delivery'
      : 'Payment order created successfully',
    201,
  );
};

const router = Router();
router.post('/create-order', requireAuth, handler);
export default router;
