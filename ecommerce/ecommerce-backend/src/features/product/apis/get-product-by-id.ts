import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { optionalAuth } from '../../../middlewares/auth.middleware';
import { getProductDetail } from '../services/product-detail.service';
import { getProductByIdParamsSchema } from '../shared/validation';

/** GET /api/products/:id - Get product detail (Public/Admin). */
const handler = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params as { id: string };
  const detail = await getProductDetail({ id, userId: req.userId });
  return ResponseFormatter.success(res, detail, 'Product retrieved successfully');
};

const router = Router();
router.get(
  '/:id',
  optionalAuth,
  validationMiddleware(getProductByIdParamsSchema, 'params'),
  handler,
);

export default router;
