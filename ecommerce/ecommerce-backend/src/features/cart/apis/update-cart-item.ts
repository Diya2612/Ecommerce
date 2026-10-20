/**
 * PUT /api/cart/items/:id
 * Update quantity of a specific cart item.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { optionalAuth, cartMutationRateLimit } from '../../../middlewares';
import { updateCartItemSchema } from '../shared/validation';
import { cartOrchestratorService, cartAnalyticsService } from '../services';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;
  const { id: itemId } = req.params as { id: string };

  const { quantity } = updateCartItemSchema.parse(req.body);
  await cartOrchestratorService.updateItemQuantityWithValidation(
    itemId,
    quantity,
    userId,
    sessionId,
  );
  cartAnalyticsService.track(
    'cart_item_quantity_updated',
    '',
    {
      item_id: itemId,
      new_quantity: quantity,
    },
    userId,
    sessionId,
  );

  const cartResponse = await cartOrchestratorService.getCartWithDetails(userId, sessionId);

  return ResponseFormatter.success(res, cartResponse, 'Cart item updated successfully');
};

const router = Router();
router.put('/items/:id', cartMutationRateLimit, optionalAuth, handler);

export default router;
