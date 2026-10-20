import { eq, and, or, sql, ne, count, avg, inArray } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { products, type Product } from './products.schema';
import { productVariants, type ProductVariant } from './product-variants.schema';
import { productFaqs } from './product-faqs.schema';
import { inventory } from '../../inventory/shared/inventory.schema';
import { inventoryAdjustments } from '../../inventory/shared/inventory-adjustments.schema';
import { reviews } from '../../reviews/shared/reviews.schema';
import { tiers } from '../../tiers/shared/tiers.schema';
import { buildSearchConditions } from '../../../utils/database/search-utils';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

const SEARCH_CONFIG = { SIMILARITY_THRESHOLD: 0.15 } as const;

/** Find product by ID (excluding soft-deleted). */
export const findProductById = async (
  id: string,
  tx: Database = db,
): Promise<Product | undefined> => {
  const [product] = await tx
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.is_deleted, false)))
    .limit(1);
  return product;
};

/** Find product by SKU (excluding soft-deleted). */
export const findProductBySku = async (
  sku: string,
  tx: Database = db,
): Promise<Product | undefined> => {
  const [product] = await tx
    .select()
    .from(products)
    .where(and(eq(products.sku, sku), eq(products.is_deleted, false)))
    .limit(1);
  return product;
};

/** Find product by slug (excluding soft-deleted). */
export const findProductBySlug = async (
  slug: string,
  tx: Database = db,
): Promise<Product | undefined> => {
  const [product] = await tx
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.is_deleted, false)))
    .limit(1);
  return product;
};

/** Checks if SKU is already used by any product or variant. */
export const isSkuTaken = async (
  sku: string,
  excludeProductId?: string,
  tx: Database = db,
): Promise<boolean> => {
  const productConditions = [eq(products.sku, sku), eq(products.is_deleted, false)];
  if (excludeProductId) productConditions.push(ne(products.id, excludeProductId));
  const [exists] = await tx
    .select({ id: products.id })
    .from(products)
    .where(and(...productConditions))
    .limit(1);
  if (exists) return true;

  const variantConditions = [eq(productVariants.sku, sku), eq(productVariants.is_deleted, false)];
  if (excludeProductId) variantConditions.push(ne(productVariants.product_id, excludeProductId));
  const [variantExists] = await tx
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(and(...variantConditions))
    .limit(1);
  return !!variantExists;
};

/** Marks product as deleted. */
export const softDeleteProduct = async (
  id: string,
  deletedBy: string,
  tx: Database = db,
): Promise<Product | undefined> => {
  const [deleted] = await tx
    .update(products)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: deletedBy,
      updated_at: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  return deleted;
};

/** Get all variants for a product. */
export const findVariantsByProductId = async (
  productId: string,
  tx: Database = db,
): Promise<ProductVariant[]> => {
  return tx
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.product_id, productId), eq(productVariants.is_deleted, false)));
};

/** Get FAQs for a product. */
export const getProductFaqs = async (productId: string, tx: Database = db) => {
  return tx
    .select({ id: productFaqs.id, question: productFaqs.question, answer: productFaqs.answer })
    .from(productFaqs)
    .where(eq(productFaqs.product_id, productId));
};

/** Get aggregated rating stats for products. */
export const getProductsRatingStats = async (
  productIds: string[],
  tx: Database = db,
): Promise<Map<string, { avg_rating: number; review_count: number }>> => {
  if (productIds.length === 0) return new Map();
  const stats = await tx
    .select({
      product_id: reviews.product_id,
      avg_rating: avg(reviews.rating),
      review_count: count(reviews.id),
    })
    .from(reviews)
    .where(
      and(
        inArray(reviews.product_id, productIds),
        eq(reviews.status, 'approved'),
        eq(reviews.is_deleted, false),
      ),
    )
    .groupBy(reviews.product_id);
  return new Map(
    stats.map((s) => [
      s.product_id,
      { avg_rating: Number(s.avg_rating) || 0, review_count: Number(s.review_count) || 0 },
    ]),
  );
};

/** Get aggregated inventory stats for products. */
export const getProductsInventoryStats = async (
  productIds: string[],
  tx: Database = db,
): Promise<Map<string, { available_quantity: number; total_stock: number }>> => {
  if (productIds.length === 0) return new Map();
  const effectiveProductId = sql<string>`COALESCE(${inventory.product_id}, ${productVariants.product_id})`;
  const stats = await tx
    .select({
      product_id: effectiveProductId,
      available_quantity: sql<number>`COALESCE(SUM(${inventory.available_quantity}), 0)`,
      total_stock: sql<number>`COALESCE(SUM(${inventory.available_quantity} + ${inventory.committed_quantity}), 0)`,
    })
    .from(inventory)
    .leftJoin(
      productVariants,
      and(eq(inventory.variant_id, productVariants.id), eq(productVariants.is_deleted, false)),
    )
    .where(inArray(effectiveProductId, productIds))
    .groupBy(effectiveProductId);
  return new Map(
    stats
      .filter((s) => s.product_id !== null)
      .map((s) => [
        s.product_id as string,
        {
          available_quantity: Number(s.available_quantity) || 0,
          total_stock: Number(s.total_stock) || 0,
        },
      ]),
  );
};

/** Build hierarchical category filter. */
export const buildCategoryFilter = (categoryList: string[]) => {
  if (categoryList.length === 0) return undefined;
  return sql`EXISTS (
    WITH RECURSIVE tier_tree AS (
      SELECT id FROM ${tiers} WHERE LOWER(code) IN (${sql.join(
        categoryList.map((c) => c.toLowerCase()),
        sql`, `,
      )})
      UNION ALL
      SELECT t.id FROM ${tiers} t INNER JOIN tier_tree tt ON t.parent_id = tt.id
    )
    SELECT 1 FROM tier_tree WHERE tier_tree.id = ${products.category_tier_1} OR tier_tree.id = ${products.category_tier_2} OR tier_tree.id = ${products.category_tier_3} OR tier_tree.id = ${products.category_tier_4}
  )`;
};

/** Build technology/tag filter. */
export const buildTechnologyFilter = (techList: string[]) => {
  if (techList.length === 0) return undefined;
  const conditions = techList.map(
    (tech) =>
      sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${products.tags}, '[]'::jsonb)) AS tag WHERE LOWER(tag) = ${tech.toLowerCase()})`,
  );
  return or(...conditions);
};

/** Build fuzzy/full-text search conditions. */
export const buildProductSearchConditions = (searchQuery: string) => {
  const fuzzy = buildSearchConditions(searchQuery, {
    fuzzyColumns: [products.product_title, products.secondary_title],
    exactColumns: [products.product_title, products.sku],
    threshold: SEARCH_CONFIG.SIMILARITY_THRESHOLD,
  });
  const tags = sql`${products.tags}::text ILIKE ${`%${searchQuery}%`}`;
  const fullText = sql`${products.search_vector} @@ plainto_tsquery('english', ${searchQuery})`;
  return or(fuzzy, tags, fullText);
};

export const buildAverageRating = () => sql<number>`COALESCE(AVG(${reviews.rating}), 0)`;
export const buildReviewCount = () => sql<number>`COALESCE(COUNT(DISTINCT ${reviews.id}), 0)`;
export const buildInventoryQuantityWithVariants = () =>
  sql<number>`(${db
    .select({
      val: sql`COALESCE(SUM(${inventory.available_quantity} + ${inventory.committed_quantity}), 0)`,
    })
    .from(inventory)
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .where(
      or(
        eq(inventory.product_id, products.id),
        and(eq(productVariants.product_id, products.id), eq(productVariants.is_deleted, false)),
      ),
    )})`;

export const buildAvailableStockWithVariants = () =>
  sql<number>`(${db
    .select({ val: sql`COALESCE(SUM(${inventory.available_quantity}), 0)` })
    .from(inventory)
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .where(
      or(
        eq(inventory.product_id, products.id),
        and(eq(productVariants.product_id, products.id), eq(productVariants.is_deleted, false)),
      ),
    )})`;

export const buildCommittedStockWithVariants = () =>
  sql<number>`(${db
    .select({ val: sql`COALESCE(SUM(${inventory.committed_quantity}), 0)` })
    .from(inventory)
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .where(
      or(
        eq(inventory.product_id, products.id),
        and(eq(productVariants.product_id, products.id), eq(productVariants.is_deleted, false)),
      ),
    )})`;

export const findProductsByIds = async (ids: string[], tx: Database = db): Promise<Product[]> => {
  if (ids.length === 0) return [];
  return tx.select().from(products).where(inArray(products.id, ids));
};

export const findInventoryByProductId = async (productId: string, tx: Database = db) => {
  const [inv] = await tx
    .select()
    .from(inventory)
    .where(eq(inventory.product_id, productId))
    .limit(1);
  return inv;
};

export const findInventoryByVariantId = async (variantId: string, tx: Database = db) => {
  const [inv] = await tx
    .select()
    .from(inventory)
    .where(eq(inventory.variant_id, variantId))
    .limit(1);
  return inv;
};

export const findTierByNameAndLevel = async (name: string, level: number, tx: Database = db) => {
  const [tier] = await tx
    .select()
    .from(tiers)
    .where(and(sql`LOWER(${tiers.name}) = ${name.trim().toLowerCase()}`, eq(tiers.level, level)))
    .limit(1);
  return tier;
};

export const findTierByName = async (name: string, tx: Database = db) => {
  const [tier] = await tx
    .select()
    .from(tiers)
    .where(sql`LOWER(${tiers.name}) = ${name.trim().toLowerCase()}`)
    .orderBy(tiers.level)
    .limit(1);
  return tier;
};

export const findNextCopyNumber = async (title: string, tx: Database = db): Promise<number> => {
  const base = title.replace(/\\s*\\(Copy(\\s+\\d+)?\\)\\s*$/i, '').trim();
  const existing = await tx
    .select({ product_title: products.product_title })
    .from(products)
    .where(
      sql`${products.is_deleted} = false AND (${products.product_title} = ${base} OR ${products.product_title} LIKE ${base + ' (Copy%'})`,
    );

  const numbers = existing
    .map((item: any) => {
      const match = item.product_title.match(/\\(Copy(?:\\s+(\\d+))?\\)\\s*$/i);
      return match ? (match[1] ? parseInt(match[1], 10) : 1) : 0;
    })
    .filter((n: number) => n > 0);

  return numbers.length ? Math.max(...numbers) + 1 : 1;
};

// --- Mutation Wrappers ---

export const createProductRecord = async (data: any, tx: Database = db) => {
  return tx.insert(products).values(data).returning();
};

export const updateProductRecordBySku = async (sku: string, data: any, tx: Database = db) => {
  return tx.update(products).set(data).where(eq(products.sku, sku)).returning();
};

export const updateProductRecordById = async (id: string, data: any, tx: Database = db) => {
  return tx.update(products).set(data).where(eq(products.id, id)).returning();
};

export const deleteProductRecordById = async (id: string, tx: Database = db) => {
  return tx.delete(products).where(eq(products.id, id));
};

export const createProductVariantsRecords = async (data: any[], tx: Database = db) => {
  return tx.insert(productVariants).values(data).returning();
};

export const createProductVariantRecord = async (data: any, tx: Database = db) => {
  return tx.insert(productVariants).values(data).returning();
};

export const createProductFaqsRecords = async (data: any[], tx: Database = db) => {
  return tx.insert(productFaqs).values(data).returning();
};

export const deleteProductFaqsByProductId = async (productId: string, tx: Database = db) => {
  return tx.delete(productFaqs).where(eq(productFaqs.product_id, productId));
};

export const createInventoryRecord = async (data: any, tx: Database = db) => {
  return tx.insert(inventory).values(data).returning();
};

export const updateInventoryRecordById = async (id: string, data: any, tx: Database = db) => {
  return tx.update(inventory).set(data).where(eq(inventory.id, id)).returning();
};

export const createInventoryAdjustmentRecord = async (data: any, tx: Database = db) => {
  return tx.insert(inventoryAdjustments).values(data).returning();
};
