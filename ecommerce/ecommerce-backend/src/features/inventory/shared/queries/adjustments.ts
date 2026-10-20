/**
 * Inventory Adjustment Queries
 * Database operations for auditing and retrieving stock movement history.
 */

import { eq, desc, sql, or, count, inArray } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../../database';
import { users } from '../../../user/shared/user.schema';
import { inventory } from '../inventory.schema';
import { inventoryAdjustments } from '../inventory-adjustments.schema';
import { products } from '../../../product/shared/products.schema';
import { productVariants } from '../../../product/shared/product-variants.schema';
import type { InventoryHistoryItem } from '../interface';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Retrieves adjustment history for a specific inventory record. */
export const findAdjustmentHistory = async (
  inventoryId: string,
  limit: number = 50,
  tx: Database = db,
) =>
  tx
    .select()
    .from(inventoryAdjustments)
    .where(eq(inventoryAdjustments.inventory_id, inventoryId))
    .orderBy(desc(inventoryAdjustments.adjusted_at))
    .limit(limit);

/** Retrieves unified adjustment history for a product and its variants. */
export const findAdjustmentHistoryByProduct = async (
  productId: string,
  page: number = 1,
  limit: number = 50,
  tx: Database = db,
) => {
  const offset = (page - 1) * limit;

  const variantIds = await tx
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.product_id, productId));

  const variantIdList = variantIds.map((v: any) => v.id);
  const inventoryConditions =
    variantIdList.length > 0
      ? or(eq(inventory.product_id, productId), inArray(inventory.variant_id, variantIdList))
      : eq(inventory.product_id, productId);

  const results = await tx
    .select({
      id: inventoryAdjustments.id,
      inventory_id: inventoryAdjustments.inventory_id,
      adjustment_type: inventoryAdjustments.adjustment_type,
      quantity_change: inventoryAdjustments.quantity_change,
      quantity_before: inventoryAdjustments.quantity_before,
      quantity_after: inventoryAdjustments.quantity_after,
      reason: inventoryAdjustments.reason,
      reference_number: inventoryAdjustments.reference_number,
      notes: inventoryAdjustments.notes,
      adjusted_by: inventoryAdjustments.adjusted_by,
      adjusted_at: inventoryAdjustments.adjusted_at,
      target_name: sql<string>`CASE WHEN ${inventory.variant_id} IS NOT NULL THEN ${productVariants.option_value} ELSE 'Base Product' END`,
      variant_sku: sql<
        string | null
      >`CASE WHEN ${inventory.variant_id} IS NOT NULL THEN ${productVariants.sku} ELSE ${products.sku} END`,
      adjusted_by_name: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
    })
    .from(inventoryAdjustments)
    .innerJoin(inventory, eq(inventoryAdjustments.inventory_id, inventory.id))
    .leftJoin(products, eq(inventory.product_id, products.id))
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .leftJoin(users, eq(inventoryAdjustments.adjusted_by, users.id))
    .where(inventoryConditions)
    .orderBy(desc(inventoryAdjustments.adjusted_at))
    .limit(limit)
    .offset(offset);

  return results as InventoryHistoryItem[];
};

/** Counts adjustments for a product including all variants. */
export const countAdjustmentsByProduct = async (productId: string, tx: Database = db) => {
  const variantIds = await tx
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.product_id, productId));

  const variantIdList = variantIds.map((v: any) => v.id);
  const inventoryConditions =
    variantIdList.length > 0
      ? or(eq(inventory.product_id, productId), inArray(inventory.variant_id, variantIdList))
      : eq(inventory.product_id, productId);

  const [result]: any = await tx
    .select({ count: count() })
    .from(inventoryAdjustments)
    .innerJoin(inventory, eq(inventoryAdjustments.inventory_id, inventory.id))
    .where(inventoryConditions);

  return result?.count || 0;
};

/** Creates a stock adjustment record. */
export const createAdjustment = async (data: any, tx: Database = db) => {
  const [result] = await tx.insert(inventoryAdjustments).values(data).returning();
  return result;
};
