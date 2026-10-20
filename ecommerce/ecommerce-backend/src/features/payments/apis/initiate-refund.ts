import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import { initiateRefundSchema } from '../shared/validation';
import { PaymentService } from '../services/payment.service';

/** Initiates a full or partial refund for a paid order (Admin only). */
const handler = async (req: RequestWithUser, res: Response) => {
  const adminId = req.userId;
  if (!adminId) throw new HttpException(401, 'Authentication required');

  const body = initiateRefundSchema.parse(req.body);
  const result = await PaymentService.initiateRefund(adminId, body);

  return ResponseFormatter.success(
    res,
    result,
    `Refund of ₹${result.amount.toFixed(2)} initiated successfully`,
  );
};

const router = Router();
router.post('/refund', requireAuth, requirePermission('orders.refund'), handler);
export default router;
