/**
 * POST /api/cart/validate
 * Validate cart integrity, stock, and prices before checkout.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { optionalAuth } from '../../../middlewares';
import { cartCoreService, cartValidationService } from '../services';
import { validateCartQuerySchema } from '../shared/validation';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;

  const cart = await cartCoreService.getActiveCart(userId, sessionId);
  if (!cart) throw new HttpException(404, 'Cart not found');

  const { auto_repair: autoRepair } = validateCartQuerySchema.parse(req.query);
  const validationResult = await cartValidationService.validateCart(cart.id, autoRepair);

  return ResponseFormatter.success(
    res,
    validationResult,
    validationResult.valid ? 'Cart is valid' : 'Cart has validation issues',
  );
};

const router = Router();
router.post('/validate', optionalAuth, handler);

export default router;
