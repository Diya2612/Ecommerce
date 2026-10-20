import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter, HttpException } from '../../../utils';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { productCacheService } from '../services/product-cache.service';
import { deleteProduct } from '../services/product.service';
import { deleteProductParamsSchema } from '../shared/validation';

/** DELETE /api/products/:id - Soft delete product (Admin). */
const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = deleteProductParamsSchema.parse(req.params);
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const { sku, slug } = await deleteProduct(id, userId);
  await productCacheService.invalidateProduct(id, sku, slug);

  ResponseFormatter.success(res, null, 'Product deleted successfully');
};

const router = Router();
router.delete(
  '/:id',
  requireAuth,
  requirePermission('products:delete'),
  validationMiddleware(deleteProductParamsSchema, 'params'),
  handler,
);

export default router;
