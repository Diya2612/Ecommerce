/**
 * POST /api/cart/merge
 * Merge guest cart into user cart during login.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { mergeCartSchema } from '../shared/validation';
import { cartMergeService } from '../services';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId;

  if (!userId) {
    throw new HttpException(401, 'Authentication required to merge carts');
  }

  const { session_id: sessionId } = mergeCartSchema.parse(req.body);
  const result = await cartMergeService.mergeGuestCartIntoUserCart(userId, sessionId);
  const message = result.merged ? 'Cart merged successfully' : result.message;

  return ResponseFormatter.success(res, result, message);
};

const router = Router();
router.post('/merge', requireAuth, handler);

export default router;
