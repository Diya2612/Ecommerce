import { Router, Response, Request } from 'express';
import { ResponseFormatter, logger } from '../../../utils';
import { getAllProductsSchema } from '../shared/validation';
import {
  getAllProducts,
  formatAdminProducts,
  formatStorefrontProducts,
} from '../services/product-list.service';
import { optionalAuth, userHasPermission } from '../../../middlewares';

/** GET /api/products - Get products with pagination and filters. */
const handler = async (req: Request, res: Response) => {
  try {
    const params = getAllProductsSchema.parse(req.query);

    // Evaluate if the user is authenticated and has the admin 'products:read' permission
    const isAdmin = await userHasPermission(req, 'products:read');

    const result = await getAllProducts(params, isAdmin);

    if (isAdmin) {
      return ResponseFormatter.success(
        res,
        {
          products: formatAdminProducts(result.products),
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
        'Products retrieved successfully',
      );
    }

    return ResponseFormatter.success(
      res,
      {
        products: formatStorefrontProducts(result.products),
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      },
      'Products retrieved successfully',
    );
  } catch (e: any) {
    logger.error('Fetch failed', e);
    return ResponseFormatter.error(res, 'FETCH_ERROR', 'Failed to retrieve products', 500);
  }
};

const router = Router();
router.get('/', optionalAuth, handler);

export default router;
