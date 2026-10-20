import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { PaymentService } from '../services/payment.service';

/** Retrieves current payment status and full transaction history for an order. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Authentication required');

  const { orderId } = req.params as { orderId: string };
  if (!orderId) throw new HttpException(400, 'Order ID is required');

  const result = await PaymentService.getPaymentStatus(userId, orderId);

  return ResponseFormatter.success(res, result, 'Payment status retrieved');
};

const router = Router();
router.get('/:orderId/status', requireAuth, handler);
export default router;
