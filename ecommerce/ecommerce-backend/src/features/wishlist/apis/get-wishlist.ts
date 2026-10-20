/**
 * GET /api/wishlist/:userId/wishlist
 * Get user's wishlist.
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import * as wishlistService from '../services/wishlist.service';
import { wishlistParamSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const targetUserId = (req.params.userId || req.userId) as string;
  if (!targetUserId) throw new HttpException(401, 'Authentication required');

  const wishlist = await wishlistService.getWishlist(targetUserId);
  return ResponseFormatter.success(res, wishlist, 'Wishlist retrieved successfully');
};

const router = Router();
router.get(
  '/:userId/wishlist',
  requireAuth,
  validationMiddleware(wishlistParamSchema.pick({ userId: true }), 'params'),
  requireOwnerOrPermission('userId', 'users:read'),
  handler,
);

export default router;
