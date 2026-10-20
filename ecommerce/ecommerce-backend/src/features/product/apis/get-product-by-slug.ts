import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { validationMiddleware } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { optionalAuth } from '../../../middlewares/auth.middleware';
import { getProductDetail } from '../services/product-detail.service';
import { getProductBySlugParamsSchema } from '../shared/validation';

/** GET /api/products/slug/:slug - Get product detail by slug (Public/Admin). */
const handler = async (req: RequestWithUser, res: Response) => {
  const { slug } = req.params as { slug: string };
  const detail = await getProductDetail({ slug, userId: req.userId });
  return ResponseFormatter.success(res, detail, 'Product retrieved successfully');
};

const router = Router();
router.get(
  '/slug/:slug',
  optionalAuth,
  validationMiddleware(getProductBySlugParamsSchema, 'params'),
  handler,
);

export default router;
