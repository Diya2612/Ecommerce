import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, logger } from '../../../utils';
import { bulkDeleteProductsSchema } from '../shared/validation';
import { productCacheService } from '../services/product-cache.service';
import { deleteProduct } from '../services/product.service';

/** POST /api/products/bulk-delete - Bulk soft delete products (Admin). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId)
    return ResponseFormatter.error(res, 'AUTH_ERROR', 'User authentication required', 401);

  const { ids } = req.body;
  let deletedCount = 0;
  const errors: string[] = [];

  for (const id of ids) {
    try {
      const { sku, slug } = await deleteProduct(id, userId);
      deletedCount++;
      await productCacheService.invalidateProduct(id, sku, slug);
    } catch (e: any) {
      logger.error(`Delete failed (ID: ${id})`, e);
      errors.push(id);
    }
  }

  return ResponseFormatter.success(
    res,
    { deletedCount, errors },
    `Successfully deleted ${deletedCount} products`,
  );
};

const router = Router();
router.post(
  '/bulk-delete',
  requireAuth,
  requirePermission('products:delete'),
  validationMiddleware(bulkDeleteProductsSchema),
  handler,
);

export default router;
