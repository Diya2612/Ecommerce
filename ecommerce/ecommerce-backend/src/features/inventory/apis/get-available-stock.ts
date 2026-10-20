/**
 * GET /api/inventory/product/:productId/available
 * Retrieves real-time availability for a specific product.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter } from '../../../utils';
import { validationMiddleware } from '../../../middlewares';
import { productIdParamSchema } from '../shared/validation';
import { getAvailableStock } from '../services';

const handler = async (req: RequestWithUser, res: Response) => {
  const { productId } = req.params as { productId: string };
  const stockData = await getAvailableStock(productId);

  return ResponseFormatter.success(
    res,
    stockData,
    stockData.inStock ? 'Available stock retrieved successfully' : 'Product availability unknown',
  );
};

const router = Router();
router.get(
  '/product/:productId/available',
  validationMiddleware(productIdParamSchema, 'params'),
  handler,
);

export default router;
