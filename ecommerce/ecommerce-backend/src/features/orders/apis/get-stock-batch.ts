/**
 * GET /api/admin/orders/stock/batch
 * Batch fetch current stock levels for multiple products and/or variants
 * Used for real-time stock validation in order forms
 *
 * Supports:
 * - product_ids: Comma-separated list of product UUIDs (queries base product inventory)
 * - variant_ids: Comma-separated list of variant UUIDs (queries variant-specific inventory)
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import {
  findInventoryByProductIds,
  findInventoryByVariantIds,
} from '../../inventory/shared/queries';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { stockBatchQuerySchema, IStockBatchResult, StockBatchQuery } from '../shared';

const handler = async (req: RequestWithUser, res: Response) => {
  const { product_ids, variant_ids } = req.query as unknown as StockBatchQuery;

  if (!product_ids || !variant_ids || (product_ids.length === 0 && variant_ids.length === 0)) {
    return ResponseFormatter.success(res, { stock: [] }, 'No products requested');
  }

  const results: IStockBatchResult[] = [];

  // 1. Fetch stock for base products (where variant_id IS NULL)
  if (product_ids && product_ids.length > 0) {
    const baseProductStock = await findInventoryByProductIds(product_ids);

    for (const row of baseProductStock) {
      if (row.product_id) {
        results.push({
          product_id: row.product_id,
          variant_id: null,
          available_quantity: row.available_quantity,
          committed_quantity: row.committed_quantity,
          effective_stock: Math.max(0, row.available_quantity - row.committed_quantity),
        });
      }
    }
  }

  // 2. Fetch stock for specific variants (where variant_id matches)
  if (variant_ids && variant_ids.length > 0) {
    const variantStock = await findInventoryByVariantIds(variant_ids);

    for (const row of variantStock) {
      if (row.variant_id) {
        results.push({
          product_id: row.product_id || '',
          variant_id: row.variant_id,
          available_quantity: row.available_quantity,
          committed_quantity: row.committed_quantity,
          effective_stock: Math.max(0, row.available_quantity - row.committed_quantity),
        });
      }
    }
  }

  return ResponseFormatter.success(res, { stock: results }, 'Stock levels retrieved');
};

const router = Router();
router.get(
  '/admin/orders/stock/batch',
  requireAuth,
  requirePermission('orders:read'),
  validationMiddleware(stockBatchQuerySchema, 'query'),
  handler,
);

export default router;
