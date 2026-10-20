import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter, HttpException, omitFields } from '../../../utils';
import { createProductSchema } from '../shared/validation';
import { createProduct } from '../services/product.service';

/** POST /api/products - Create a new product (Admin). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const data = req.body;
  const product = await createProduct(data, userId);
  const sanitized = omitFields(product, [
    'is_deleted',
    'deleted_at',
    'deleted_by',
    'created_by',
    'updated_by',
  ]);

  ResponseFormatter.success(
    res,
    {
      ...sanitized,
      base_inventory: data.inventory_quantity || 0,
      total_stock: data.inventory_quantity || 0,
      variants:
        product.has_variants && data.variants
          ? data.variants.map((v: any) => ({ ...v }))
          : undefined,
    },
    'Product created successfully',
    201,
  );
};

const router = Router();
router.post(
  '/',
  requireAuth,
  requirePermission('products:create'),
  validationMiddleware(createProductSchema),
  handler,
);

export default router;
