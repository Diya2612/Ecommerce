/**
 * GET /api/admin/orders/products/search
 * Admin: Search products for order creation
 */

import { Router, Response } from 'express';
import { ResponseFormatter } from '../../../utils';
import { db } from '../../../database';
import { products } from '../../product/shared/products.schema';
import { findInventoryByProductIds } from '../../inventory/shared/queries';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { productSearchQuerySchema, ProductSearchQuery } from '../shared/validation';
import { ilike, or } from 'drizzle-orm';

const handler = async (req: RequestWithUser, res: Response) => {
  const { search, limit } = req.query as unknown as ProductSearchQuery;

  // 1. Search products
  const productResults = await db
    .select({
      id: products.id,
      name: products.product_title,
      sku: products.sku,
      price: products.selling_price,
      image: products.primary_image_url,
    })
    .from(products)
    .where(or(ilike(products.product_title, `%${search}%`), ilike(products.sku, `%${search}%`)))
    .limit(limit);

  if (productResults.length === 0) {
    return ResponseFormatter.success(
      res,
      {
        products: [],
        total: 0,
      },
      'No products found',
    );
  }

  // 2. Bulk fetch inventory for found products
  const productIds = productResults.map((p: any) => p.id);
  const inventoryRecords = await findInventoryByProductIds(productIds);

  // Create an inventory map for O(1) lookup
  const inventoryMap = new Map();
  for (const record of inventoryRecords) {
    if (!record.product_id) continue;

    const existing = inventoryMap.get(record.product_id) || { available: 0, committed: 0 };
    inventoryMap.set(record.product_id, {
      available: existing.available + (record.available_quantity || 0),
      committed: existing.committed + (record.committed_quantity || 0),
    });
  }

  // 3. Merge data
  const enrichedProducts = productResults.map((product: any) => {
    const stock = inventoryMap.get(product.id) || { available: 0, committed: 0 };
    const specificBaseStock = Math.max(0, stock.available - stock.committed);

    return {
      ...product,
      stock_quantity: specificBaseStock,
      available_stock: stock.available,
      reserved_stock: stock.committed,
      in_stock: specificBaseStock > 0,
    };
  });

  return ResponseFormatter.success(
    res,
    {
      products: enrichedProducts,
      total: enrichedProducts.length,
    },
    'Products retrieved successfully',
  );
};

const router = Router();
router.get(
  '/admin/orders/products/search',
  requireAuth,
  requirePermission('orders:read'),
  validationMiddleware(productSearchQuerySchema, 'query'),
  handler,
);

export default router;
