/**
 * POST /api/cart/discount
 * Apply a discount code to the cart.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import {
  cartCoreService,
  cartCalculationService,
  cartOrchestratorService,
  cartAnalyticsService,
} from '../services';
import { optionalAuth } from '../../../middlewares';
import { applyDiscountSchema } from '../shared/validation';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;

  const { code } = applyDiscountSchema.parse(req.body);
  const cart = await cartCoreService.getOrCreateCart(userId, sessionId);
  await cartCalculationService.applyDiscountCode(cart.id, code, userId);
  cartAnalyticsService.track('coupon_applied', cart.id, { code }, userId, sessionId);
  const cartResponse = await cartOrchestratorService.getCartWithDetails(userId, sessionId);

  return ResponseFormatter.success(res, cartResponse, 'Discount code applied successfully');
};

const router = Router();
router.post('/discount', optionalAuth, handler);

export default router;
