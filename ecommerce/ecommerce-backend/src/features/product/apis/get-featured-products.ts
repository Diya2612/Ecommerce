import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { getFeaturedProducts } from '../services/product-list.service';

/** GET /api/products/featured - Get featured products (Public). */
const handler = async (req: Request, res: Response) => {
  const ps = await getFeaturedProducts();
  return ResponseFormatter.success(res, ps, 'Featured products retrieved successfully');
};

const router = Router();
router.get('/featured', handler);

export default router;
