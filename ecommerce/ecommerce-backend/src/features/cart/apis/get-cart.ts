/**
 * GET /api/cart
 * Get current user's cart including product details and stock status.
 */

import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { optionalAuth } from '../../../middlewares';
import { cartOrchestratorService } from '../services';

const handler = async (req: Request, res: Response) => {
  const userReq = req as RequestWithUser;
  const userId = userReq.userId || undefined;
  const sessionId = (req.headers['x-session-id'] as string) || undefined;

  const cartResponse = await cartOrchestratorService.getCartWithDetails(userId, sessionId);

  return ResponseFormatter.success(res, cartResponse, 'Cart retrieved successfully');
};

const router = Router();
router.get('/', optionalAuth, handler);

export default router;
