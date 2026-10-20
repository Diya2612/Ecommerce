import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { paymentsQueries } from '../shared/queries';

/** Lists all payment transactions for the authenticated user. */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Authentication required');

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const status = req.query.status as string | undefined;

  const { transactions, total } = await paymentsQueries.getPaymentTransactionsHistory(
    userId,
    page,
    limit,
    status,
  );

  return ResponseFormatter.success(res, {
    transactions: transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      refund_amount: tx.refund_amount ? Number(tx.refund_amount) : null,
      created_at: tx.created_at.toISOString(),
      verified_at: tx.verified_at?.toISOString(),
    })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  });
};

const router = Router();
router.get('/transactions', requireAuth, handler);
export default router;
