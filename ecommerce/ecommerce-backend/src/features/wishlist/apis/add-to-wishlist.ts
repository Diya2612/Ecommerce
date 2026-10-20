/**
 * POST /api/wishlist/:userId/wishlist/:productId
 * Add a product to the wishlist.
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import * as wishlistService from '../services/wishlist.service';
import { addToWishlistSchema, wishlistParamSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const targetUserId = (req.params.userId || req.userId) as string;
  if (!targetUserId) throw new HttpException(401, 'Authentication required');

  const body = addToWishlistSchema.parse(req.body);
  const productId = (req.params.productId || body.product_id) as string;

  const result = await wishlistService.addToWishlist(targetUserId, {
    product_id: productId,
    notes: body.notes,
  });

  if (result.already_exists) {
    return ResponseFormatter.success(
      res,
      result,
      `${result.product_name} is already in your wishlist`,
    );
  }

  return ResponseFormatter.success(res, result, `${result.product_name} added to wishlist`, 201);
};

const router = Router();
router.post(
  '/:userId/wishlist/:productId',
  requireAuth,
  validationMiddleware(wishlistParamSchema, 'params'),
  requireOwnerOrPermission('userId', 'users:write'),
  handler,
);

export default router;
