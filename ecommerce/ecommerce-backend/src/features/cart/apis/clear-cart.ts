/**
 * DELETE /api/cart
 * Clear all items from the cart.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { cartCoreService, cartItemService } from '../services';
import { optionalAuth } from '../../../middlewares';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;

  if (!userId && !sessionId) {
    throw new HttpException(401, 'Authentication or session ID required');
  }

  const cart = await cartCoreService.getActiveCart(userId, sessionId);
  if (!cart) {
    return ResponseFormatter.success(res, null, 'Cart is already empty');
  }

  await cartCoreService.verifyCartOwnership(cart, userId, sessionId);
  await cartItemService.clearAllItems(cart.id);

  return ResponseFormatter.success(res, null, 'Cart cleared successfully');
};

const router = Router();
router.delete('/', optionalAuth, handler);

export default router;
