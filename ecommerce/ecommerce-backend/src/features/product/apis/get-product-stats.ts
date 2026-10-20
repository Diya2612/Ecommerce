import { sql } from 'drizzle-orm';
import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { db } from '../../../database';
import { products } from '../shared/products.schema';
import { inventory } from '../../inventory/shared/inventory.schema';

const THRESHOLDS = { OUT: 0, LOW: 5 } as const;

/** GET /api/products/stats - Get dashboard statistics for products. */
const handler = async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      WITH inv AS (SELECT product_id, SUM(available_quantity) as qty FROM ${inventory} GROUP BY product_id)
      SELECT 
        COUNT(*) FILTER (WHERE p.is_deleted = false) as total,
        COUNT(*) FILTER (WHERE p.is_deleted = false AND p.status = 'active') as active,
        COUNT(*) FILTER (WHERE p.is_deleted = false AND p.featured = true) as featured,
        COUNT(*) FILTER (WHERE p.is_deleted = false AND COALESCE(i.qty, 0) = ${THRESHOLDS.OUT}) as out_of_stock,
        COUNT(*) FILTER (WHERE p.is_deleted = false AND COALESCE(i.qty, 0) > ${THRESHOLDS.OUT} AND COALESCE(i.qty, 0) <= ${THRESHOLDS.LOW}) as low_stock
      FROM ${products} p LEFT JOIN inv i ON p.id = i.product_id WHERE p.is_deleted = false;
    `);

    const s = (result.rows[0] as any) || {
      total: 0,
      active: 0,
      featured: 0,
      out_of_stock: 0,
      low_stock: 0,
    };
    const stats = {
      total: Number(s.total),
      active: Number(s.active),
      featured: Number(s.featured),
      out_of_stock: Number(s.out_of_stock),
      low_stock: Number(s.low_stock),
    };

    return ResponseFormatter.success(res, stats, 'Product statistics retrieved successfully');
  } catch (_e) {
    return ResponseFormatter.error(res, 'FETCH_ERROR', 'Failed to retrieve stats', 500);
  }
};

const router = Router();
router.get('/stats', handler);

export default router;
