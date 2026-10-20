import { eq, and, or, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../database';
import { buildSearchConditions } from '../../../utils';
import { products } from '../shared/products.schema';
import { productVariants } from '../shared/product-variants.schema';
import { reviews } from '../../reviews/shared/reviews.schema';
import { tiers } from '../../tiers/shared/tiers.schema';
import { IProductListItem, ProductListParams, ProductListResponse } from '../shared/interface';
import {
  buildAverageRating,
  buildReviewCount,
  buildInventoryQuantityWithVariants,
  buildAvailableStockWithVariants,
  buildCategoryFilter,
  buildTechnologyFilter,
} from '../shared/queries';

const STOCK_THRESHOLDS = { LOW_STOCK: 5, OUT_OF_STOCK: 0 } as const;
const PRICE_DEFAULTS = { MIN: 0, MAX: 999999999 } as const;

/** Fetches paginated products with advanced multi-field filtering. */
export const getAllProducts = async (
  params: ProductListParams,
  isAdmin = false,
): Promise<ProductListResponse> => {
  const conditions: any[] = [eq(products.is_deleted, false)];
  if (isAdmin) {
    if (params.status) {
      const s = Array.isArray(params.status) ? params.status : [params.status];
      if (s.length) conditions.push(or(...s.map((st) => eq(products.status, st as any))));
    }
    if (params.category_tier_1) {
      const c = Array.isArray(params.category_tier_1)
        ? params.category_tier_1
        : [params.category_tier_1];
      if (c.length) conditions.push(or(...c.map((ct) => eq(products.category_tier_1, ct))));
    }
  } else conditions.push(eq(products.status, 'active'));

  if (params.search?.trim()) {
    const fuzzy = buildSearchConditions(params.search, {
      fuzzyColumns: [products.product_title],
      exactColumns: [products.sku, products.barcode],
      threshold: 0.1,
    });
    const pattern = `%${params.search.trim()}%`;
    conditions.push(
      or(
        fuzzy,
        sql`${products.tags}::text ILIKE ${pattern}`,
        sql`${products.search_vector} @@ plainto_tsquery('english', ${params.search.trim()})`,
      ),
    );
  }

  if (params.categories) {
    const filter = buildCategoryFilter(params.categories.split(',').map((c) => c.trim()));
    if (filter) conditions.push(filter);
  }
  if (params.technologies) {
    const filter = buildTechnologyFilter(params.technologies.split(',').map((t) => t.trim()));
    if (filter) conditions.push(filter);
  }

  conditions.push(gte(products.selling_price, (params.minPrice ?? PRICE_DEFAULTS.MIN).toString()));
  conditions.push(lte(products.selling_price, (params.maxPrice ?? PRICE_DEFAULTS.MAX).toString()));

  if (params.quickFilter) {
    const qfs = Array.isArray(params.quickFilter) ? params.quickFilter : [params.quickFilter];
    if (qfs.includes('recently-updated'))
      conditions.push(sql`${products.updated_at} >= NOW() - INTERVAL '7 days'`);
    if (qfs.includes('featured')) conditions.push(eq(products.featured, true));
  }

  if (params.startDate) {
    conditions.push(gte(products.created_at, new Date(params.startDate)));
  }
  if (params.endDate) {
    conditions.push(lte(products.created_at, new Date(params.endDate)));
  }

  const results = await db
    .select({
      id: products.id,
      product_title: products.product_title,
      selling_price: products.selling_price,
      cost_price: products.cost_price,
      compare_at_price: products.compare_at_price,
      primary_image_url: products.primary_image_url,
      category_name: sql<string>`(
        SELECT name FROM ${tiers}
        WHERE id = COALESCE(${products.category_tier_3}, ${products.category_tier_2}, ${products.category_tier_1})
        LIMIT 1
      )`,
      tags: products.tags,
      created_at: products.created_at,
      updated_at: products.updated_at,
      status: products.status,
      featured: products.featured,
      sku: products.sku,
      barcode: products.barcode,
      hsn_code: products.hsn_code,
      weight: products.weight,
      length: products.length,
      breadth: products.breadth,
      height: products.height,
      slug: products.slug,
      description: products.short_description,
      category_tier_1: products.category_tier_1,
      category_tier_2: products.category_tier_2,
      category_tier_3: products.category_tier_3,
      category_tier_4: products.category_tier_4,
      inventory_quantity: buildAvailableStockWithVariants().mapWith(Number),
      rating: buildAverageRating(),
      review_count: buildReviewCount(),
      total_stock: buildInventoryQuantityWithVariants().mapWith(Number),
      variants: sql<any[]>`(
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', ${productVariants.id},
              'option_name', ${productVariants.option_name},
              'option_value', ${productVariants.option_value},
              'image_url', ${productVariants.image_url}
            )
          ),
          '[]'::jsonb
        )
        FROM ${productVariants}
        WHERE ${productVariants.product_id} = ${products.id}
        AND ${productVariants.is_deleted} = false
      )`,
    })
    .from(products)
    .leftJoin(
      reviews,
      and(
        eq(reviews.product_id, products.id),
        eq(reviews.status, 'approved'),
        eq(reviews.is_deleted, false),
      ),
    )
    .where(and(...conditions))
    .groupBy(products.id);

  let filtered = results;
  if (params.ratings) {
    const minRating = Math.min(...params.ratings.split(',').map((r) => parseFloat(r.trim())));
    filtered = results.filter((p) => Number(p.rating || 0) >= minRating);
  }
  if (params.stockStatus) {
    const ss = Array.isArray(params.stockStatus) ? params.stockStatus : [params.stockStatus];
    filtered = filtered.filter((p) => {
      const q = Number(p.inventory_quantity || 0);
      return ss.some((s) =>
        s === 'in_stock'
          ? q > 0
          : s === 'out_of_stock'
            ? q === 0
            : s === 'low_stock'
              ? q > 0 && q <= STOCK_THRESHOLDS.LOW_STOCK
              : true,
      );
    });
  }

  const sortBy = params.sortBy || 'created_at';
  const mult = params.sortOrder === 'asc' ? 1 : -1;
  filtered.sort((a: any, b: any) => {
    if (['selling_price', 'cost_price', 'compare_at_price'].includes(sortBy))
      return (Number(a[sortBy] || 0) - Number(b[sortBy] || 0)) * mult;
    if (['inventory_quantity', 'total_stock', 'rating'].includes(sortBy))
      return (Number(a[sortBy] || 0) - Number(b[sortBy] || 0)) * mult;
    if (['created_at', 'updated_at'].includes(sortBy))
      return (new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()) * mult;
    const vA = String(a[sortBy] || '').toLowerCase();
    const vB = String(b[sortBy] || '').toLowerCase();
    return vA < vB ? -1 * mult : vA > vB ? 1 * mult : 0;
  });

  const page = params.page || 1,
    limit = params.limit || 20,
    offset = (page - 1) * limit;
  return {
    products: filtered.slice(offset, offset + limit),
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
    currentPage: page,
  };
};

export const formatAdminProducts = (ps: any[]) =>
  ps.map((p) => ({ ...p, inventory_quantity: p.inventory_quantity.toString() }));

export const formatStorefrontProducts = (ps: any[]): IProductListItem[] =>
  ps.map((p) => {
    const created = new Date(p.created_at),
      thirty = new Date();
    thirty.setDate(thirty.getDate() - 30);
    const tags = (p.tags as string[]) || [];
    return {
      id: p.id,
      slug: p.slug,
      name: p.product_title,
      tags,
      rating: Number(p.rating) || 0,
      reviews: Number(p.review_count) || 0,
      price: Number(p.selling_price),
      originalPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
      image: p.primary_image_url,
      isNew: created > thirty,
      category: p.category_name || '',
      technologies: tags.map((t) => t.toLowerCase()),
      description: p.description,
      inStock: Number(p.inventory_quantity) > 0,
      total_stock: Number(p.inventory_quantity),
      variants: p.variants || [],
    };
  });

/** Fetches featured products for homepage/highlights. */
export const getFeaturedProducts = async (): Promise<IProductListItem[]> => {
  const ps = await db
    .select({
      id: products.id,
      product_title: products.product_title,
      selling_price: products.selling_price,
      compare_at_price: products.compare_at_price,
      primary_image_url: products.primary_image_url,
      category_name: sql<string>`(
        SELECT name FROM ${tiers}
        WHERE id = COALESCE(${products.category_tier_3}, ${products.category_tier_2}, ${products.category_tier_1})
        LIMIT 1
      )`,
      tags: products.tags,
      created_at: products.created_at,
      updated_at: products.updated_at,
      status: products.status,
      featured: products.featured,
      sku: products.sku,
      slug: products.slug,
      short_description: products.short_description,
      category_tier_1: products.category_tier_1,
      category_tier_2: products.category_tier_2,
      category_tier_3: products.category_tier_3,
      category_tier_4: products.category_tier_4,
    })
    .from(products)
    .where(
      and(
        eq(products.featured, true),
        eq(products.status, 'active'),
        eq(products.is_deleted, false),
      ),
    )
    .orderBy(sql`${products.created_at} DESC`);

  if (!ps.length) return [];
  const ids = ps.map((p) => p.id);
  const { getProductsRatingStats, getProductsInventoryStats } = await import('../shared/queries');
  const [rms, ims] = await Promise.all([
    getProductsRatingStats(ids),
    getProductsInventoryStats(ids),
  ]);

  return ps.map((p) => {
    const created = new Date(p.created_at),
      thirty = new Date();
    thirty.setDate(thirty.getDate() - 30);
    const rs = rms.get(p.id),
      is = ims.get(p.id),
      qty = Number(is?.available_quantity || 0),
      tags = (p.tags as string[]) || [];
    return {
      id: p.id,
      slug: p.slug,
      name: p.product_title,
      tags,
      rating: Number(rs?.avg_rating || 0),
      reviews: Number(rs?.review_count || 0),
      price: Number(p.selling_price),
      originalPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
      image: p.primary_image_url,
      isNew: created > thirty,
      category: p.category_name || '',
      technologies: tags.map((t) => t.toLowerCase()),
      description: p.short_description,
      inStock: qty > 0,
      total_stock: qty,
    };
  });
};
