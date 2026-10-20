import { db } from '../../../database';
import type { BackfillInventoryInput } from '../shared/validation';
import {
  getAvailableStockByProduct,
  findProductsWithoutInventory,
  bulkCreateInventory,
} from '../shared/queries';

/** Retrieves available stock levels for a specific product. */
export async function getAvailableStock(productId: string) {
  const stockData = await getAvailableStockByProduct(productId);
  return (
    stockData || {
      productId,
      totalStock: 0,
      committedStock: 0,
      availableStock: 0,
      inStock: false,
    }
  );
}

/**
 * Ensures all products have at least one inventory record.
 * @param options dryRun: simulate creation, forceRecreate: ignore existing records.
 */
export async function backfillInventoryForProducts(options: Partial<BackfillInventoryInput> = {}) {
  const { dryRun = false } = options;

  return db.transaction(async (tx) => {
    const productsWithoutInventory = await findProductsWithoutInventory(tx);

    if (productsWithoutInventory.length === 0) {
      return { created: 0, message: 'All products already have inventory records', products: [] };
    }

    const inventoryRecords = productsWithoutInventory.map((product) => ({
      product_id: product.id,
      location: 'Nashik',
      available_quantity: 0,
      committed_quantity: 0,
      condition: 'sellable' as const,
      status: 'out_of_stock' as const,
    }));

    if (!dryRun) await bulkCreateInventory(inventoryRecords, tx);

    return {
      created: dryRun ? 0 : inventoryRecords.length,
      message: dryRun
        ? `Dry run: Would create ${inventoryRecords.length} records`
        : `Created inventory for ${inventoryRecords.length} products`,
      products: productsWithoutInventory.map((p) => ({
        id: p.id,
        name: p.product_title,
        sku: p.sku,
      })),
    };
  });
}
