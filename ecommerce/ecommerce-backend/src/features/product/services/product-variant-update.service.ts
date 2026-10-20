import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../../database';
import { productVariants } from '../shared/product-variants.schema';
import { inventory } from '../../inventory/shared/inventory.schema';
import { HttpException } from '../../../utils';
import { updateProductSchema } from '../shared/validation';
import { findVariantsByProductId, isSkuTaken } from '../shared/queries';
import { createInventoryForProduct } from '../../inventory/services';

type UpdateProductData = z.infer<typeof updateProductSchema>;
type VariantInput = NonNullable<UpdateProductData['variants']>[number];

/** Synchronizes product variants and their inventory during updates. */
export async function updateProductVariants({
  productId,
  hasVariants,
  variants,
  updatedBy,
}: {
  productId: string;
  hasVariants?: boolean;
  variants?: VariantInput[];
  updatedBy: string;
}): Promise<void> {
  if (hasVariants === undefined && variants === undefined) return;
  const existing = await findVariantsByProductId(productId);

  if (variants?.length) {
    for (const v of variants) {
      if (await isSkuTaken(v.sku, productId)) {
        if (!existing.some((e) => e.sku === v.sku && (e.id === v.id || !v.id)))
          throw new HttpException(409, `SKU '${v.sku}' in use`);
      }
      const match = v.id
        ? existing.find((e) => e.id === v.id)
        : existing.find((e) => e.sku === v.sku);
      if (match) {
        await db
          .update(productVariants)
          .set({
            ...v,
            id: undefined,
            is_active: v.is_active ?? true,
            updated_at: new Date(),
            updated_by: updatedBy,
          })
          .where(eq(productVariants.id, match.id));
        if (v.inventory_quantity !== undefined) {
          const [inv] = await db
            .select()
            .from(inventory)
            .where(eq(inventory.variant_id, match.id))
            .limit(1);
          if (inv)
            await db
              .update(inventory)
              .set({ available_quantity: v.inventory_quantity, updated_at: new Date() })
              .where(eq(inventory.id, inv.id));
          else
            await createInventoryForProduct(
              productId,
              v.inventory_quantity,
              updatedBy,
              undefined,
              match.id,
            );
        }
      } else {
        const [vn] = await db
          .insert(productVariants)
          .values({
            ...v,
            product_id: productId,
            is_active: v.is_active ?? true,
            is_default: false,
            created_by: updatedBy,
            updated_by: updatedBy,
          })
          .returning();
        await createInventoryForProduct(
          productId,
          v.inventory_quantity || 0,
          updatedBy,
          undefined,
          vn.id,
        );
      }
    }
    const upIds = new Set(variants.map((v) => v.id).filter(Boolean));
    const upSkus = new Set(variants.map((v) => v.sku));
    const toDel = existing.filter((e) => !upIds.has(e.id) && !upSkus.has(e.sku));
    for (const d of toDel)
      await db
        .update(productVariants)
        .set({ is_deleted: true, deleted_at: new Date(), deleted_by: updatedBy })
        .where(eq(productVariants.id, d.id));
  } else if (hasVariants === false && existing.length) {
    for (const e of existing)
      await db
        .update(productVariants)
        .set({ is_deleted: true, deleted_at: new Date(), deleted_by: updatedBy })
        .where(eq(productVariants.id, e.id));
  }
}
