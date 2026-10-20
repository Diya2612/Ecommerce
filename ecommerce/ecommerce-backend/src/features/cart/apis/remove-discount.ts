/**
 * DELETE /api/cart/discount
 * Remove applied discount code from the cart.
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
import { removeDiscountSchema } from '../shared/validation';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;

  const { code } = removeDiscountSchema.parse(req.body);
  const cart = await cartCoreService.getOrCreateCart(userId, sessionId);
  await cartCalculationService.removeDiscountCode(cart.id, code);
  cartAnalyticsService.track('coupon_removed', cart.id, { code }, userId, sessionId);
  const cartResponse = await cartOrchestratorService.getCartWithDetails(userId, sessionId);

  return ResponseFormatter.success(res, cartResponse, 'Discount code removed successfully');
};

const router = Router();
router.delete('/discount', optionalAuth, handler);

export default router;
