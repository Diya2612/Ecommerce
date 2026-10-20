/**
 * DELETE /api/wishlist/:userId/wishlist/:productId
 * Remove a product from the wishlist.
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import * as wishlistService from '../services/wishlist.service';
import { wishlistParamSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = (req.params.userId || req.userId) as string;
  const productId = req.params.productId as string;

  if (!userId) throw new HttpException(401, 'Authentication required');
  if (!productId) throw new HttpException(400, 'Product ID is required');

  await wishlistService.removeFromWishlist(userId, productId);
  return ResponseFormatter.success(res, null, 'Product removed from wishlist');
};

const router = Router();
router.delete(
  '/:userId/wishlist/:productId',
  requireAuth,
  validationMiddleware(wishlistParamSchema, 'params'),
  requireOwnerOrPermission('userId', 'users:delete'),
  handler,
);

export default router;
