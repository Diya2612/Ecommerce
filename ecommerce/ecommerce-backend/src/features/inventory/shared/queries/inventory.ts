/**
 * Inventory Queries
 * Database operations for core inventory management.
 */

import { eq, and, desc, asc, sql, count, inArray, isNull, or, ne, gte, lte } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../../database';
import { inventory } from '../inventory.schema';
import { products } from '../../../product/shared/products.schema';
import { productVariants } from '../../../product/shared/product-variants.schema';
import { tiers } from '../../../tiers/shared/tiers.schema';
import { buildSearchConditions } from '../../../../utils/database/search-utils';
import type { InventoryListParams } from '../interface';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Filter helper for product/variant exclusivity. */
export const buildInventoryFilter = (productId: string, variantId?: string | null) =>
  variantId
    ? eq(inventory.variant_id, variantId)
    : and(eq(inventory.product_id, productId), isNull(inventory.variant_id));

/** Retrieves a single inventory record by ID. */
export const findInventoryById = async (id: string, tx: Database = db) => {
  const [result] = await tx.select().from(inventory).where(eq(inventory.id, id));
  return result;
};

/** Retrieves inventory by base product ID. */
export const findInventoryByProduct = async (productId: string, tx: Database = db) =>
  tx.select().from(inventory).where(eq(inventory.product_id, productId));

/** Retrieves inventory by variant ID. */
export const findInventoryByVariant = async (variantId: string, tx: Database = db) =>
  tx.select().from(inventory).where(eq(inventory.variant_id, variantId));

/** Retrieves inventory for multiple base products. */
export const findInventoryByProductIds = async (productIds: string[], tx: Database = db) => {
  if (productIds.length === 0) return [];
  return tx
    .select({
      product_id: inventory.product_id,
      variant_id: inventory.variant_id,
      available_quantity: inventory.available_quantity,
      committed_quantity: inventory.committed_quantity,
    })
    .from(inventory)
    .where(and(inArray(inventory.product_id, productIds), isNull(inventory.variant_id)));
};

/** Retrieves inventory for multiple variants. */
export const findInventoryByVariantIds = async (variantIds: string[], tx: Database = db) => {
  if (variantIds.length === 0) return [];
  return tx
    .select({
      product_id: inventory.product_id,
      variant_id: inventory.variant_id,
      available_quantity: inventory.available_quantity,
      committed_quantity: inventory.committed_quantity,
    })
    .from(inventory)
    .where(inArray(inventory.variant_id, variantIds));
};

/** Retrieves inventory by ID with product/variant metadata. */
export const findInventoryByIdWithDetails = async (id: string, tx: Database = db) => {
  const result = await tx
    .select({
      id: inventory.id,
      product_id: inventory.product_id,
      variant_id: inventory.variant_id,
      location: inventory.location,
      available_quantity: inventory.available_quantity,
      committed_quantity: inventory.committed_quantity,
      condition: inventory.condition,
      status: inventory.status,
      created_at: inventory.created_at,
      updated_at: inventory.updated_at,
      created_by: inventory.created_by,
      updated_by: inventory.updated_by,
      product_title: products.product_title,
      product_sku: products.sku,
      product_thumbnail: sql<
        string | null
      >`COALESCE(${products.primary_image_url}, ${products.thumbnail_url})`,
      variant_sku: productVariants.sku,
      variant_option_name: productVariants.option_name,
      variant_option_value: productVariants.option_value,
    })
    .from(inventory)
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .leftJoin(
      products,
      or(eq(inventory.product_id, products.id), eq(productVariants.product_id, products.id)),
    )
    .where(and(eq(inventory.id, id), ne(products.status, 'archived')));

  return result[0];
};

/** Creates a new inventory record. */
export const createInventory = async (data: any, tx: Database = db) => {
  const [result] = await tx.insert(inventory).values(data).returning();
  return result;
};

/** Updates inventory record fields. */
export const updateInventoryById = async (id: string, data: any, tx: Database = db) => {
  const [result] = await tx
    .update(inventory)
    .set({ ...data, updated_at: new Date() })
    .where(eq(inventory.id, id))
    .returning();
  return result;
};

/** Atomically adjusts stock quantities. */
export const adjustQuantities = async (
  id: string,
  availableDelta: number,
  committedDelta: number,
  tx: Database = db,
) => {
  const [result] = await tx
    .update(inventory)
    .set({
      available_quantity: sql`GREATEST(0, ${inventory.available_quantity} + ${availableDelta})`,
      committed_quantity: sql`GREATEST(0, ${inventory.committed_quantity} + ${committedDelta})`,
      last_stock_movement_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(inventory.id, id))
    .returning();
  return result;
};

/** Adjusts quantities and automatically syncs status. */
export const adjustQuantitiesWithStatus = async (
  id: string,
  availableDelta: number,
  committedDelta: number,
  tx: Database = db,
) => {
  const adjusted = await adjustQuantities(id, availableDelta, committedDelta, tx);
  if (!adjusted) return null;

  const newStatus =
    adjusted.available_quantity === 0
      ? 'out_of_stock'
      : adjusted.available_quantity <= 10
        ? 'low_stock'
        : 'in_stock';

  if (adjusted.status !== newStatus) {
    return updateInventoryById(id, { status: newStatus }, tx);
  }

  return adjusted;
};

/** Syncs inventory status based on available stock. */
export const updateInventoryStatus = async (id: string, tx: Database = db) => {
  const record = await findInventoryById(id, tx);
  if (!record) return null;

  const newStatus =
    record.available_quantity === 0
      ? 'out_of_stock'
      : record.available_quantity <= 10
        ? 'low_stock'
        : 'in_stock';

  return record.status !== newStatus ? updateInventoryById(id, { status: newStatus }, tx) : record;
};

/** Retrieves filtered and paginated inventory list. */
export const findInventoryList = async (params: InventoryListParams, tx: Database = db) => {
  const {
    page = 1,
    limit = 20,
    search,
    condition,
    status,
    location,
    category,
    quickFilter,
    sortBy = 'lastUpdated',
    sortOrder = 'desc',
    startDate,
    endDate,
  } = params;
  const offset = (page - 1) * limit;

  /** Maps frontend UI sort keys to the actual database column expressions. */
  const sortColumnMap: Record<string, any> = {
    productName: products.product_title,
    available: inventory.available_quantity,
    committed: inventory.committed_quantity,
    lastUpdated: inventory.updated_at,
  };
  const sortColumn = sortColumnMap[sortBy] ?? inventory.updated_at;
  const orderByClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

  const conditions: any[] = [ne(products.status, 'archived')];

  if (search) {
    conditions.push(
      buildSearchConditions(search, {
        fuzzyColumns: [products.product_title],
        exactColumns: [products.sku, productVariants.sku],
      }),
    );
  }

  if (condition) conditions.push(eq(inventory.condition, condition as any));
  if (status) conditions.push(eq(inventory.status, status as any));
  if (location) conditions.push(sql`${inventory.location} ILIKE ${'%' + location + '%'}`);
  if (category) conditions.push(eq(tiers.id, category));

  if (quickFilter === 'low-stock') {
    conditions.push(
      sql`${inventory.available_quantity} <= 10 AND ${inventory.available_quantity} > 0`,
    );
  } else if (quickFilter === 'zero-available') {
    conditions.push(eq(inventory.available_quantity, 0));
  }

  // Date range filter — applied against last updated timestamp
  if (startDate) conditions.push(gte(inventory.updated_at, new Date(startDate)));
  if (endDate) conditions.push(lte(inventory.updated_at, new Date(endDate)));

  return tx
    .select({
      id: inventory.id,
      // product_id: Return the variant_id if it exists, otherwise product_id
      product_id: sql`CASE WHEN ${inventory.variant_id} IS NOT NULL THEN ${inventory.variant_id} ELSE ${inventory.product_id} END`,
      // location_id: Use location string as location_id (schema doesn't have location_id)
      location_id: inventory.location,
      product_name: sql`CASE WHEN ${inventory.variant_id} IS NOT NULL THEN CONCAT(${products.product_title}, ' - ', ${productVariants.option_name}, ': ', ${productVariants.option_value}) ELSE ${products.product_title} END`,
      sku: sql`CASE WHEN ${inventory.variant_id} IS NOT NULL THEN ${productVariants.sku} ELSE ${products.sku} END`,
      available_quantity: inventory.available_quantity,
      // reserved_quantity: Map committed_quantity to reserved_quantity for frontend compatibility
      reserved_quantity: inventory.committed_quantity,
      // incoming fields: Not in schema, return 0/null for frontend compatibility
      incoming_quantity: sql<number>`0`,
      incoming_po_reference: sql<string | null>`NULL`,
      incoming_eta: sql<string | null>`NULL`,
      condition: inventory.condition,
      status: inventory.status,
      created_at: inventory.created_at,
      updated_at: inventory.updated_at,
      // type: Determine if Base product or Variant
      type: sql<
        'Base' | 'Variant'
      >`CASE WHEN ${inventory.variant_id} IS NOT NULL THEN 'Variant' ELSE 'Base' END`,
      // thumbnail: Get from products table (use primary_image_url or thumbnail_url)
      thumbnail: sql<
        string | null
      >`COALESCE(${products.primary_image_url}, ${products.thumbnail_url})`,
      // Additional metadata for debugging
      category_name: tiers.name,
      variant_id: inventory.variant_id,
    })
    .from(inventory)
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .leftJoin(
      products,
      or(eq(inventory.product_id, products.id), eq(productVariants.product_id, products.id)),
    )
    .leftJoin(tiers, eq(products.category_tier_1, tiers.id))
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);
};

/** Counts inventory records matching filter criteria. */
export const countInventory = async (params: InventoryListParams, tx: Database = db) => {
  const { search, condition, status, location, category, quickFilter } = params;

  const conditions: any[] = [ne(products.status, 'archived')];

  if (search) {
    conditions.push(
      buildSearchConditions(search, {
        fuzzyColumns: [products.product_title],
        exactColumns: [products.sku, productVariants.sku],
      }),
    );
  }

  if (condition) conditions.push(eq(inventory.condition, condition as any));
  if (status) conditions.push(eq(inventory.status, status as any));
  if (location) conditions.push(sql`${inventory.location} ILIKE ${'%' + location + '%'}`);
  if (category) conditions.push(eq(tiers.id, category));

  if (quickFilter === 'low-stock') {
    conditions.push(
      sql`${inventory.available_quantity} <= 10 AND ${inventory.available_quantity} > 0`,
    );
  } else if (quickFilter === 'zero-available') {
    conditions.push(eq(inventory.available_quantity, 0));
  }

  const [result]: any = await tx
    .select({ count: count() })
    .from(inventory)
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .leftJoin(
      products,
      or(eq(inventory.product_id, products.id), eq(productVariants.product_id, products.id)),
    )
    .leftJoin(tiers, eq(products.category_tier_1, tiers.id))
    .where(and(...conditions));
  return result?.count || 0;
};
