import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import {
  getPriceRange,
  getTechnologiesAggregation,
  getRatingCounts,
  getFilterCategories,
  getTierByCode,
} from '../services/product-filters.service';

/** GET /api/products/filters - Get filter options for search. */
const handler = async (req: Request, res: Response) => {
  try {
    const code = req.query.categories as string;
    let tid = null,
      lvl = 0;

    if (code) {
      const tier = await getTierByCode(code);
      if (tier) {
        tid = tier.id;
        lvl = tier.level;
      }
    }

    const [cats, techs, rats, price] = await Promise.all([
      getFilterCategories(tid, lvl),
      getTechnologiesAggregation(),
      getRatingCounts(),
      getPriceRange(),
    ]);

    return ResponseFormatter.success(
      res,
      {
        categories: cats.categories,
        technologies: techs,
        ratings: rats,
        priceRange: price,
        context: { level: cats.context.level, parent: code || null },
      },
      'Filter options retrieved successfully',
    );
  } catch (e: any) {
    return ResponseFormatter.error(res, 'FILTER_ERROR', e.message || 'Error', 500);
  }
};

const router = Router();
router.get('/filters', handler);

export default router;
