import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException, omitFields } from '../../../utils';
import { updateProductSchema, updateProductParamsSchema } from '../shared/validation';
import { productCacheService } from '../services/product-cache.service';
import { updateProduct } from '../services/product.service';

/** PUT /api/products/:id - Update product (Admin). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const { id } = updateProductParamsSchema.parse(req.params);
  const data = req.body;
  const product = await updateProduct(id, data, userId);

  await productCacheService.invalidateProduct(product.id, product.sku, product.slug);

  ResponseFormatter.success(
    res,
    {
      ...omitFields(product, [
        'is_deleted',
        'deleted_at',
        'deleted_by',
        'created_by',
        'updated_by',
      ]),
      base_inventory: data.inventory_quantity ?? 0,
      total_stock: data.inventory_quantity ?? 0,
    },
    'Product updated successfully',
  );
};

const router = Router();
router.put(
  '/:id',
  requireAuth,
  requirePermission('products:update'),
  validationMiddleware(updateProductSchema),
  validationMiddleware(updateProductParamsSchema, 'params'),
  handler,
);

export default router;
