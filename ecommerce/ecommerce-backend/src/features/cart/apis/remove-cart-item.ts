/**
 * DELETE /api/cart/items/:id
 * Remove a specific item from the cart.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { optionalAuth, cartMutationRateLimit } from '../../../middlewares';
import { cartOrchestratorService, cartAnalyticsService } from '../services';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;
  const { id: itemId } = req.params as { id: string };

  await cartOrchestratorService.removeItemWithValidation(itemId, userId, sessionId);
  cartAnalyticsService.track('cart_item_removed', '', { item_id: itemId }, userId, sessionId);

  const cartResponse = await cartOrchestratorService.getCartWithDetails(userId, sessionId);

  return ResponseFormatter.success(res, cartResponse, 'Item removed from cart successfully');
};

const router = Router();
router.delete('/items/:id', cartMutationRateLimit, optionalAuth, handler);

export default router;
