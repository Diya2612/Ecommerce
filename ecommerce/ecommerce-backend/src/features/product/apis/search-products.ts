import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { searchProductsSchema } from '../shared/validation';
import { searchProducts, getProductSearchCount } from '../services/product-search.service';

/** GET /api/products/search - Search products (Public). */
const handler = async (req: Request, res: Response) => {
  const { q, page, limit, status } = searchProductsSchema.parse(req.query);
  const query = q.trim();

  const [{ results, productStats }, total] = await Promise.all([
    searchProducts({ searchQuery: query, status, page, limit }),
    getProductSearchCount({ searchQuery: query, status }),
  ]);

  const data = results.map((p) => {
    const s = productStats.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      name: p.product_title,
      price: Number(p.selling_price),
      originalPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
      image: p.primary_image_url || '',
      rating: s?.rating ?? 0,
      reviews: s?.reviews ?? 0,
      inStock: (s?.total_stock ?? 0) > 0,
      tags: p.tags as string[],
      category: p.category_name,
    };
  });

  return ResponseFormatter.success(
    res,
    { products: data, total, totalPages: Math.ceil(total / limit), page, limit },
    'Search results retrieved successfully',
  );
};

const router = Router();
router.get('/search', handler);

export default router;
