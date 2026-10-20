import { db } from '../../../database';
import { HttpException } from '../../../utils';
import { productCacheService } from './product-cache.service';
import { incrementTierUsage } from '../../tiers/services/tier-sync.service';
import {
  findProductsByIds,
  findNextCopyNumber,
  findInventoryByProductId,
  findVariantsByProductId,
  findInventoryByVariantId,
  getProductFaqs,
  createProductRecord,
  createProductVariantRecord,
  createInventoryRecord,
  createInventoryAdjustmentRecord,
  createProductFaqsRecords,
} from '../shared/queries';

const generateUniqueSku = (orig: string) =>
  `${orig}-CPY-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
const generateUniqueSlug = (orig: string) =>
  `${orig}-copy-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

/** Clones products with variants, FAQs, and inventory status. */
export async function duplicateProducts(ids: string[], userId: string): Promise<number> {
  const originals = await findProductsByIds(ids);
  if (!originals.length) throw new HttpException(404, 'No products found');

  let successCount = 0;
  for (const orig of originals) {
    await db.transaction(async (tx: any) => {
      const stock = await findInventoryByProductId(orig.id, tx);
      const nextCopy = await findNextCopyNumber(orig.product_title, tx);

      const [copy] = await createProductRecord(
        {
          ...orig,
          id: undefined,
          slug: generateUniqueSlug(orig.slug),
          product_title: `${orig.product_title.replace(/\s*\(\s*Copy(\s+\d+)?\s*\)\s*$/i, '').trim()} (Copy ${nextCopy})`,
          sku: generateUniqueSku(orig.sku),
          product_url: orig.product_url ? `${orig.product_url}-copy` : null,
          created_by: userId,
          updated_by: userId,
          created_at: undefined,
          updated_at: undefined,
          is_deleted: false,
        } as any,
        tx,
      );

      if (orig.has_variants) {
        const variants = await findVariantsByProductId(orig.id, tx);
        for (const v of variants) {
          const [vCopy] = await createProductVariantRecord(
            {
              ...v,
              id: undefined,
              product_id: copy.id,
              sku: generateUniqueSku(v.sku),
              created_by: userId,
              updated_by: userId,
            } as any,
            tx,
          );

          const vStock = await findInventoryByVariantId(v.id, tx);
          const [vInv] = await createInventoryRecord(
            {
              variant_id: vCopy.id,
              location: 'Nashik',
              available_quantity: vStock?.available_quantity || 0,
              status: (vStock?.available_quantity || 0) > 0 ? 'in_stock' : 'out_of_stock',
              updated_by: userId,
            } as any,
            tx,
          );

          if ((vStock?.available_quantity || 0) > 0) {
            await createInventoryAdjustmentRecord(
              {
                inventory_id: vInv.id,
                adjustment_type: 'increase',
                quantity_change: vStock.available_quantity,
                reason: 'Duplication',
                quantity_before: 0,
                quantity_after: vStock.available_quantity,
                adjusted_by: userId,
              } as any,
              tx,
            );
          }
        }
      }

      const faqs = await getProductFaqs(orig.id, tx);
      if (faqs.length) {
        await createProductFaqsRecords(
          faqs.map((f) => ({ product_id: copy.id, question: f.question, answer: f.answer })) as any,
          tx,
        );
      }

      const [inv] = await createInventoryRecord(
        {
          product_id: copy.id,
          location: 'Nashik',
          available_quantity: stock?.available_quantity || 0,
          status: (stock?.available_quantity || 0) > 0 ? 'in_stock' : 'out_of_stock',
          updated_by: userId,
        } as any,
        tx,
      );

      if ((stock?.available_quantity || 0) > 0) {
        await createInventoryAdjustmentRecord(
          {
            inventory_id: inv.id,
            adjustment_type: 'increase',
            quantity_change: stock.available_quantity,
            reason: 'Duplication',
            quantity_before: 0,
            quantity_after: stock.available_quantity,
            adjusted_by: userId,
          } as any,
          tx,
        );
      }

      await incrementTierUsage([
        copy.category_tier_1,
        copy.category_tier_2,
        copy.category_tier_3,
        copy.category_tier_4,
      ]);
      await productCacheService.cacheProduct(copy);
      successCount++;
    });
  }
  return successCount;
}
