/**
 * Inventory Stock Queries
 * Specialized operations for stock level tracking and bulk management.
 */

import { eq, and, sql, sum } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../../database';
import { inventory } from '../inventory.schema';
import { products } from '../../../product/shared/products.schema';
import { productVariants } from '../../../product/shared/product-variants.schema';
import { buildInventoryFilter } from './inventory';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Retrieves stock levels for a specific product/variant. */
export const getInventoryStockLevel = async (
  productId: string,
  variantId?: string | null,
  tx: Database = db,
) => {
  const [stock] = await tx
    .select({
      id: inventory.id,
      available_quantity: inventory.available_quantity,
      committed_quantity: inventory.committed_quantity,
      product_title: products.product_title,
      variant_option: productVariants.option_value,
    })
    .from(inventory)
    .leftJoin(products, eq(inventory.product_id, products.id))
    .leftJoin(productVariants, eq(inventory.variant_id, productVariants.id))
    .where(buildInventoryFilter(productId, variantId));

  return stock;
};

/** Atomically increments committed stock quantity. */
export const incrementCommittedQuantity = async (id: string, amount: number, tx: Database = db) => {
  const [result] = await tx
    .update(inventory)
    .set({
      committed_quantity: sql`${inventory.committed_quantity} + ${amount}`,
      last_stock_movement_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(inventory.id, id))
    .returning();
  return result;
};

/** Atomically decrements committed stock quantity. */
export const decrementCommittedQuantity = async (id: string, amount: number, tx: Database = db) => {
  const [result] = await tx
    .update(inventory)
    .set({
      committed_quantity: sql`GREATEST(0, ${inventory.committed_quantity} - ${amount})`,
      last_stock_movement_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(inventory.id, id))
    .returning();
  return result;
};

/** Aggregates available stock for a product across all locations. */
export const getAvailableStockByProduct = async (productId: string, tx: Database = db) => {
  const [stockData] = await tx
    .select({
      productId: inventory.product_id,
      availableStock: sum(inventory.available_quantity),
      committedStock: sum(inventory.committed_quantity),
      totalStock: sql<number>`SUM(${inventory.available_quantity} + ${inventory.committed_quantity})`,
    })
    .from(inventory)
    .where(eq(inventory.product_id, productId))
    .groupBy(inventory.product_id);

  if (!stockData) return null;

  const available = Number(stockData.availableStock) || 0;
  return {
    productId: stockData.productId,
    availableStock: available,
    committedStock: Number(stockData.committedStock) || 0,
    totalStock: Number(stockData.totalStock) || 0,
    inStock: available > 0,
  };
};

/** Identifies products missing inventory records. */
export const findProductsWithoutInventory = async (tx: Database = db) =>
  tx
    .select({
      id: products.id,
      product_title: products.product_title,
      sku: products.sku,
    })
    .from(products)
    .where(
      and(
        sql`${products.id} NOT IN (SELECT product_id FROM ${inventory} WHERE product_id IS NOT NULL)`,
        sql`${products.status} != 'archived'`,
      ),
    );

/** Performs bulk creation of inventory records. */
export const bulkCreateInventory = async (records: any[], tx: Database = db) =>
  tx.insert(inventory).values(records).returning();
