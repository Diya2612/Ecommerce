/**
 * POST /api/cart/items
 * Add a product to the cart with stock reservation.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { optionalAuth, cartMutationRateLimit } from '../../../middlewares';
import { addToCartSchema } from '../shared/validation';
import {
  cartCoreService,
  cartItemService,
  cartCalculationService,
  cartOrchestratorService,
  cartAnalyticsService,
} from '../services';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;

  const data = addToCartSchema.parse(req.body);
  const cart = await cartCoreService.getOrCreateCart(userId, sessionId);

  await cartItemService.addItem(cart.id, {
    product_id: data.product_id,
    variant_id: data.variant_id,
    quantity: data.quantity,
  });

  await cartCalculationService.recalculateCartTotals(cart.id);
  cartAnalyticsService.track(
    'cart_item_added',
    cart.id,
    {
      product_id: data.product_id,
      variant_id: data.variant_id,
      quantity: data.quantity,
    },
    userId,
    sessionId,
  );
  const cartResponse = await cartOrchestratorService.getCartWithDetails(userId, sessionId);

  return ResponseFormatter.success(res, cartResponse, 'Item added to cart successfully', 201);
};

const router = Router();
router.post('/items', cartMutationRateLimit, optionalAuth, handler);

export default router;
