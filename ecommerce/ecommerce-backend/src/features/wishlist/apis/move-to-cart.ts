/**
 * POST /api/wishlist/:userId/wishlist/:productId/move-to-cart
 * Move a wishlist item to the cart.
 */

import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requireOwnerOrPermission, validationMiddleware } from '../../../middlewares';
import * as wishlistService from '../services/wishlist.service';
import { moveToCartSchema, wishlistParamSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = (req.params.userId || req.userId) as string;
  const productId = req.params.productId as string;

  if (!userId) throw new HttpException(401, 'Authentication required');
  if (!productId) throw new HttpException(400, 'Product ID is required');

  const body = moveToCartSchema.parse(req.body || {});
  const result = await wishlistService.moveToCart(userId, productId, body);

  return ResponseFormatter.success(res, result, `${result.product_name} moved to cart`);
};

const router = Router();
router.post(
  '/:userId/wishlist/:productId/move-to-cart',
  requireAuth,
  validationMiddleware(wishlistParamSchema, 'params'),
  requireOwnerOrPermission('userId', 'users:write'),
  handler,
);

export default router;
