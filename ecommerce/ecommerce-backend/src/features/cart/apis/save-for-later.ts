/**
 * PUT /api/cart/items/:id/save-for-later
 * Move a cart item to the "saved for later" list.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { optionalAuth } from '../../../middlewares';
import {
  cartCoreService,
  cartItemService,
  cartCalculationService,
  cartOrchestratorService,
  cartAnalyticsService,
} from '../services';
import { findCartItemById } from '../shared/queries';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;
  const { id: itemId } = req.params as { id: string };

  const item = await findCartItemById(itemId);
  if (!item) return ResponseFormatter.error(res, 'NOT_FOUND', 'Cart item not found', 404);

  const cart = await cartCoreService.getCart(item.cart_id);
  if (!cart) return ResponseFormatter.error(res, 'NOT_FOUND', 'Cart not found', 404);

  await cartCoreService.verifyCartOwnership(cart, userId, sessionId);
  await cartItemService.saveForLater(itemId);
  cartAnalyticsService.track(
    'cart_item_saved_for_later',
    cart.id,
    { item_id: itemId },
    userId,
    sessionId,
  );
  await cartCalculationService.recalculateCartTotals(cart.id);

  const cartResponse = await cartOrchestratorService.getCartWithDetails(userId, sessionId);
  return ResponseFormatter.success(res, cartResponse, 'Item saved for later');
};

const router = Router();
router.put('/items/:id/save-for-later', optionalAuth, handler);

export default router;
