import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { duplicateProductSchema } from '../shared/validation';
import { duplicateProducts } from '../services/product-duplicate.service';

/** POST /api/products/duplicate - Duplicate products (Admin). */
const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const { ids } = duplicateProductSchema.parse(req.body);
  const count = await duplicateProducts(ids, userId);

  ResponseFormatter.success(res, { count }, `Successfully duplicated ${count} product(s)`, 201);
};

const router = Router();
router.post(
  '/duplicate',
  requireAuth,
  requirePermission('products:create'),
  validationMiddleware(duplicateProductSchema),
  handler,
);

export default router;
