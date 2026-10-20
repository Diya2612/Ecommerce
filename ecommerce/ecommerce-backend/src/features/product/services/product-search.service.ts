import { eq, and, or, desc, ilike, sql } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { products } from '../shared/products.schema';
import { tiers } from '../../tiers/shared/tiers.schema';
import { SearchProductsOptions } from '../shared/interface';
import {
  getProductsRatingStats,
  getProductsInventoryStats,
  buildProductSearchConditions,
} from '../shared/queries';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Full-text and fuzzy search across products with relevance ranking. */
export const searchProducts = async (options: SearchProductsOptions, tx: Database = db) => {
  const { searchQuery, status = 'active', page = 1, limit = 20 } = options;
  const rank = sql<number>`CASE WHEN ${products.product_title} ILIKE ${`%${searchQuery}%`} OR ${products.sku} ILIKE ${`%${searchQuery}%`} THEN 100 ELSE 50 END`;

  const results = await tx
    .select({
      id: products.id,
      slug: products.slug,
      product_title: products.product_title,
      selling_price: products.selling_price,
      compare_at_price: products.compare_at_price,
      primary_image_url: products.primary_image_url,
      category_tier_1: products.category_tier_1,
      tags: products.tags,
      rank,
      category_name: tiers.name,
    })
    .from(products)
    .leftJoin(tiers, eq(products.category_tier_1, tiers.id))
    .where(
      and(
        eq(products.is_deleted, false),
        eq(products.status, status),
        buildProductSearchConditions(searchQuery),
      ),
    )
    .orderBy(desc(rank))
    .limit(limit)
    .offset((page - 1) * limit);

  if (!results.length) return { results: [], productStats: new Map() };

  const ids = results.map((p) => p.id);
  const [rms, ims] = await Promise.all([
    getProductsRatingStats(ids, tx),
    getProductsInventoryStats(ids, tx),
  ]);

  const stats = new Map();
  results.forEach((p) => {
    const rs = rms.get(p.id) || { avg_rating: 0, review_count: 0 },
      is = ims.get(p.id) || { available_quantity: 0 };
    stats.set(p.id, {
      rating: rs.avg_rating,
      reviews: rs.review_count,
      total_stock: is.available_quantity,
    });
  });
  return { results, productStats: stats };
};

/** Returns the total count of search matches for pagination. */
export const getProductSearchCount = async (
  options: Pick<SearchProductsOptions, 'searchQuery' | 'status'>,
  tx: Database = db,
): Promise<number> => {
  const { searchQuery, status = 'active' } = options;
  const conds = or(
    sql`${products.search_vector} @@ plainto_tsquery('english', ${searchQuery})`,
    ilike(products.sku, `%${searchQuery}%`),
    sql`${products.tags}::text ILIKE ${`%${searchQuery}%`}`,
  );
  const [res] = await tx
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(products)
    .where(and(eq(products.is_deleted, false), eq(products.status, status), conds));
  return res?.count ?? 0;
};

/** Lightweight search for admin order creation flows. */
export const searchProductsForOrderCreation = async (
  search: string,
  limit = 20,
  tx: Database = db,
) => {
  const p = `%${search}%`;
  return tx
    .select({
      id: products.id,
      name: products.product_title,
      sku: products.sku,
      description: products.short_description,
      image: products.primary_image_url,
      price: products.selling_price,
      cost_price: products.cost_price,
      weight: products.weight,
      is_active: sql<boolean>`${products.status} = 'active'`,
    })
    .from(products)
    .where(
      and(
        eq(products.is_deleted, false),
        or(ilike(products.product_title, p), ilike(products.sku, p)),
      ),
    )
    .limit(limit);
};
