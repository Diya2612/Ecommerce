import { eq, and, or, sql, min, max } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { products } from '../shared/products.schema';
import { reviews } from '../../reviews/shared/reviews.schema';
import { tiers } from '../../tiers/shared/tiers.schema';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;
const PRICE_DEFAULTS = { MIN: 0, MAX: 200000 } as const;

/** Aggregate price range for active products. */
export const getPriceRange = async (tx: Database = db) => {
  const [res] = await tx
    .select({ min: min(products.selling_price), max: max(products.selling_price) })
    .from(products)
    .where(and(eq(products.status, 'active'), eq(products.is_deleted, false)));
  return {
    min: Number(res?.min || PRICE_DEFAULTS.MIN),
    max: Number(res?.max || PRICE_DEFAULTS.MAX),
  };
};

/** Aggregates tags with usage counts. */
export const getTechnologiesAggregation = async (tx: Database = db) => {
  const result = await tx.execute(sql`
    SELECT LOWER(tag) as id, INITCAP(MAX(tag)) as label, COUNT(*) as count
    FROM (SELECT jsonb_array_elements_text(COALESCE(${products.tags}, '[]'::jsonb)) as tag FROM ${products} WHERE ${products.status} = 'active' AND ${products.is_deleted} = false) t
    GROUP BY LOWER(tag) ORDER BY count DESC
  `);
  return result.rows.map((r: any) => ({ id: r.id, label: r.label, count: Number(r.count) }));
};

/** Aggregates product counts by rating star thresholds. */
export const getRatingCounts = async (tx: Database = db) => {
  const res = await tx.execute(sql`
    WITH p_ratings AS (
      SELECT p.id, COALESCE(AVG(r.rating), 0) as avg FROM ${products} p
      LEFT JOIN ${reviews} r ON p.id = r.product_id AND r.status = 'approved' AND r.is_deleted = false
      WHERE p.status = 'active' AND p.is_deleted = false GROUP BY p.id
    )
    SELECT SUM(CASE WHEN avg >= 4 THEN 1 ELSE 0 END) as c4, SUM(CASE WHEN avg >= 3 THEN 1 ELSE 0 END) as c3, SUM(CASE WHEN avg >= 2 THEN 1 ELSE 0 END) as c2 FROM p_ratings
  `);
  const r = res.rows[0] as any;
  return [
    { value: '4', count: Number(r?.c4 || 0) },
    { value: '3', count: Number(r?.c3 || 0) },
    { value: '2', count: Number(r?.c2 || 0) },
  ];
};

/** Fetches category tiers with their respective product counts. */
export const getFilterCategories = async (
  parentId?: string | null,
  parentLevel?: number,
  tx: Database = db,
) => {
  const tiersList = await tx
    .select({ id: tiers.id, code: tiers.code, name: tiers.name, level: tiers.level })
    .from(tiers)
    .where(
      and(
        eq(tiers.status, 'active'),
        parentId ? eq(tiers.parent_id, parentId) : eq(tiers.level, 1),
      ),
    )
    .orderBy(tiers.priority, tiers.name);

  const categories = await Promise.all(
    tiersList.map(async (t) => {
      const [res] = await tx
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(products)
        .where(
          and(
            eq(products.status, 'active'),
            eq(products.is_deleted, false),
            or(
              eq(products.category_tier_1, t.id),
              eq(products.category_tier_2, t.id),
              eq(products.category_tier_3, t.id),
              eq(products.category_tier_4, t.id),
            ),
          ),
        );
      return { id: t.code, label: t.name, count: res?.count || 0 };
    }),
  );

  return { categories, context: { level: parentLevel ? parentLevel + 1 : 1, parent: parentId } };
};

/** Resolves a tier by its code. */
export const getTierByCode = async (code: string, tx: Database = db) => {
  const [t] = await tx
    .select({ id: tiers.id, level: tiers.level })
    .from(tiers)
    .where(and(eq(tiers.code, code), eq(tiers.status, 'active')))
    .limit(1);
  return t;
};
