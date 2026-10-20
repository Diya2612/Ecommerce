/**
 * Seed: Inventory
 *
 * Creates inventory records for every variant of every seeded product.
 *
 * Run:
 *   NODE_ENV=development npx tsx scripts/seed/seed-inventory.ts
 *   (Windows PowerShell)
 *   $env:NODE_ENV="development"; npx tsx scripts/seed/seed-inventory.ts
 */

import { db } from '../../src/database';
import { inventory } from '../../src/features/inventory/shared/inventory.schema';
import { products } from '../../src/features/product/shared/products.schema';
import { productVariants } from '../../src/features/product/shared/product-variants.schema';
import { logger } from '../../src/utils/logging/logger';
import { eq, and, isNull } from 'drizzle-orm';

/** Maps available_quantity to the correct status enum value. */
function getStatus(qty: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (qty === 0) return 'out_of_stock';
  if (qty <= 10) return 'low_stock';
  return 'in_stock';
}

async function seedInventory() {
  logger.info('🌱 Seeding inventory for all products...');

  try {
    if (!process.env.NODE_ENV) {
      logger.warn('⚠ NODE_ENV not set. Defaulting to "development".');
      process.env.NODE_ENV = 'development';
    }

    const allProducts = await db
      .select({ id: products.id, sku: products.sku, title: products.product_title })
      .from(products);

    if (allProducts.length === 0) {
      logger.error('❌ No seeded products found. Run create-products.ts first.');
      process.exit(1);
    }

    logger.info(`Found ${allProducts.length} total products.`);

    for (const product of allProducts) {
      const variants = await db
        .select({
          id: productVariants.id,
          sku: productVariants.sku,
          option_value: productVariants.option_value,
        })
        .from(productVariants)
        .where(
          and(eq(productVariants.product_id, product.id), eq(productVariants.is_deleted, false)),
        );

      if (variants.length === 0) {
        // Product with no variants
        const [existingRow] = await db
          .select({ id: inventory.id })
          .from(inventory)
          .where(and(eq(inventory.product_id, product.id), isNull(inventory.variant_id)));

        if (existingRow) {
          logger.info(
            `↩ Inventory for product ${product.sku || product.title} already exists, skipping.`,
          );
          continue;
        }

        const qty = 50; // Default stock for standalone products
        await db.insert(inventory).values({
          product_id: product.id,
          variant_id: null,
          available_quantity: qty,
          committed_quantity: 0,
          location: 'Nashik',
          condition: 'sellable',
          status: getStatus(qty),
          total_sold: 0,
          total_fulfilled: 0,
        });

        logger.info(
          `✅ [Product: ${product.sku || product.title}] ${qty} units → ${getStatus(qty)}`,
        );
      } else {
        // Product with variants — seed both a base inventory row AND per-variant rows.
        logger.info(`Processing "${product.title}" — ${variants.length} variant(s)`);

        // 1. Base product inventory row (product_id NOT NULL, variant_id IS NULL)
        const [existingBase] = await db
          .select({ id: inventory.id, available_quantity: inventory.available_quantity })
          .from(inventory)
          .where(and(eq(inventory.product_id, product.id), isNull(inventory.variant_id)));

        if (existingBase) {
          if (Number(existingBase.available_quantity) === 0) {
            // Row exists but is at zero — restock it so the base product is purchasable.
            const qty = 50;
            await db
              .update(inventory)
              .set({ available_quantity: qty, status: getStatus(qty) })
              .where(eq(inventory.id, existingBase.id));
            logger.info(
              `↻ [Base: ${product.sku || product.title}] Restocked to ${qty} units → ${getStatus(qty)}`,
            );
          } else {
            logger.info(
              `↩ Base inventory for "${product.title}" already exists (${existingBase.available_quantity} units), skipping.`,
            );
          }
        } else {
          const baseQty = 50;
          await db.insert(inventory).values({
            product_id: product.id,
            variant_id: null,
            available_quantity: baseQty,
            committed_quantity: 0,
            location: 'Nashik',
            condition: 'sellable',
            status: getStatus(baseQty),
            total_sold: 0,
            total_fulfilled: 0,
          });
          logger.info(
            `✅ [Base: ${product.sku || product.title}] ${baseQty} units → ${getStatus(baseQty)}`,
          );
        }

        // 2. Per-variant inventory rows (product_id IS NULL, variant_id NOT NULL)
        for (const variant of variants) {
          const [existingRow] = await db
            .select({ id: inventory.id })
            .from(inventory)
            .where(and(eq(inventory.variant_id, variant.id), isNull(inventory.product_id)));

          if (existingRow) {
            logger.info(`↩ Inventory for variant ${variant.sku} already exists, skipping.`);
            continue;
          }

          const qty = 20;

          await db.insert(inventory).values({
            product_id: null, // Mutually exclusive with variant_id
            variant_id: variant.id,
            available_quantity: qty,
            committed_quantity: 0,
            location: 'Nashik',
            condition: 'sellable',
            status: getStatus(qty),
            total_sold: 0,
            total_fulfilled: 0,
          });

          logger.info(`✅ [Variant: ${variant.sku}] ${qty} units → ${getStatus(qty)}`);
        }
      }
    }

    logger.info('✨ Inventory seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    logger.error('❌ Error seeding inventory:', error);
    process.exit(1);
  }
}

seedInventory();
