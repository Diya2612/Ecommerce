import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { verifyPaymentSchema } from '../shared/validation';
import { PaymentService } from '../services/payment.service';

/**
 * Verifies Razorpay signature after checkout and marks order as paid.
 * Includes redundant amount validation and idempotency protection.
 */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Authentication required');

  const body = verifyPaymentSchema.parse(req.body);
  const result = await PaymentService.verifyPayment(userId, body);

  return ResponseFormatter.success(res, result, 'Payment verified successfully', 200);
};

const router = Router();
router.post('/verify', requireAuth, handler);
export default router;
