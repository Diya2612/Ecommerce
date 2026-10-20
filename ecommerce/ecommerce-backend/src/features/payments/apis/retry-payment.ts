import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { retryPaymentSchema } from '../shared/validation';
import { PaymentService } from '../services/payment.service';

/** Creates a fresh Razorpay order for a previously failed payment attempt after validating anti-abuse limits. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Authentication required');

  const body = retryPaymentSchema.parse(req.body);
  const result = await PaymentService.retryPayment(userId, body);

  return ResponseFormatter.success(res, result, 'Payment retry initiated', 201);
};

const router = Router();
router.post('/retry', requireAuth, handler);
export default router;
