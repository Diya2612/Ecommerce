/**
 * PUT /api/cart/items/:id/variant
 * Atomically switch a cart item to a different variant.
 */

import { Router, Response, Request } from 'express';
import { z } from 'zod';
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

const switchVariantSchema = z.object({
  new_variant_id: z.string().uuid('Invalid variant ID'),
});

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;
  const { id: itemId } = req.params as { id: string };

  const { new_variant_id } = switchVariantSchema.parse(req.body);

  const item = await findCartItemById(itemId);
  if (!item) return ResponseFormatter.error(res, 'NOT_FOUND', 'Cart item not found', 404);

  const cart = await cartCoreService.getCart(item.cart_id);
  if (!cart) return ResponseFormatter.error(res, 'NOT_FOUND', 'Cart not found', 404);

  await cartCoreService.verifyCartOwnership(cart, userId, sessionId);
  await cartItemService.switchVariant(itemId, new_variant_id);
  cartAnalyticsService.track(
    'cart_variant_switched',
    cart.id,
    {
      item_id: itemId,
      new_variant_id,
    },
    userId,
    sessionId,
  );
  await cartCalculationService.recalculateCartTotals(cart.id);

  const cartResponse = await cartOrchestratorService.getCartWithDetails(userId, sessionId);
  return ResponseFormatter.success(res, cartResponse, 'Variant switched successfully');
};

const router = Router();
router.put('/items/:id/variant', optionalAuth, handler);

export default router;
