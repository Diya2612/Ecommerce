import { z } from 'zod';
import { HttpException } from '../../../utils';
import { createProductSchema, updateProductSchema } from '../shared/validation';
import {
  findProductBySlug,
  isSkuTaken,
  findProductById,
  findProductBySku,
  findInventoryByProductId,
  createProductRecord,
  createProductFaqsRecords,
  createProductVariantsRecords,
  deleteProductRecordById,
  updateInventoryRecordById,
  createInventoryRecord,
  deleteProductFaqsByProductId,
  updateProductRecordById,
  softDeleteProduct,
} from '../shared/queries';
import { IProduct } from '../shared/interface';
import { productCacheService } from './product-cache.service';
import {
  incrementTierUsage,
  decrementTierUsage,
  updateTierUsage,
} from '../../tiers/services/tier-sync.service';
import { createInventoryForProduct } from '../../inventory/services';
import { updateProductVariants } from './product-variant-update.service';

/** Validates SKU and slug uniqueness before product creation. */
async function validateProductCreation(data: z.infer<typeof createProductSchema>): Promise<void> {
  if (await isSkuTaken(data.sku)) throw new HttpException(409, 'SKU already exists');
  if (data.has_variants && data.variants) {
    for (const v of data.variants)
      if (await isSkuTaken(v.sku)) throw new HttpException(409, `Variant SKU '${v.sku}' in use`);
  }
  if (await findProductBySlug(data.slug)) throw new HttpException(409, 'Slug already exists');
}

/** Validates SKU and slug uniqueness before product update. */
async function validateProductUpdate(
  id: string,
  data: z.infer<typeof updateProductSchema>,
  current: IProduct,
): Promise<void> {
  if (data.sku && data.sku !== current.sku) {
    const p = await findProductBySku(data.sku);
    if (p && p.id !== id) throw new HttpException(409, 'SKU already exists');
  }
  if (data.slug && data.slug !== current.slug) {
    const p = await findProductBySlug(data.slug);
    if (p && p.id !== id) throw new HttpException(409, 'Slug already exists');
  }
}


/** Orchestrates new product creation including variants, FAQs, and initial inventory. */
export async function createProduct(
  data: z.infer<typeof createProductSchema>,
  userId: string,
): Promise<IProduct> {
  await validateProductCreation(data);
  const [product] = await createProductRecord({
    ...data,
    has_variants: data.has_variants || false,
    created_by: userId,
    updated_by: userId,
  });
  if (!product) throw new HttpException(500, 'Failed to create product');

  try {
    if (data.faqs?.length)
      await createProductFaqsRecords(
        data.faqs.map((f: any) => ({
          product_id: product.id,
          question: f.question,
          answer: f.answer,
        })),
      );
    if (data.has_variants && data.variants?.length) {
      const vs = data.variants.map((v: any, i: number) => ({
        ...v,
        product_id: product.id,
        is_default: i === 0,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      }));
      const ivs = await createProductVariantsRecords(vs);
      for (const v of ivs)
        await createInventoryForProduct(
          product.id,
          data.variants.find((i) => i.sku === v.sku)?.inventory_quantity || 0,
          userId,
          undefined,
          v.id,
        );
    }
    await createInventoryForProduct(product.id, data.inventory_quantity || 0, userId);
    await productCacheService.cacheProduct(product);
    await incrementTierUsage([
      data.category_tier_1 || null,
      data.category_tier_2 || null,
      data.category_tier_3 || null,
      data.category_tier_4 || null,
    ]);


    return product as IProduct;
  } catch (e) {
    await deleteProductRecordById(product.id);
    throw e;
  }
}

/** Orchestrates product updates, coordinating variants, tags, and audit logging. */
export async function updateProduct(
  id: string,
  data: z.infer<typeof updateProductSchema>,
  userId: string,
): Promise<IProduct> {
  const current = await findProductById(id);
  if (!current) throw new HttpException(404, 'Product not found');
  await validateProductUpdate(id, data, current);

  if (data.inventory_quantity !== undefined) {
    const inv = await findInventoryByProductId(id);
    if (inv)
      await updateInventoryRecordById(inv.id, {
        available_quantity: data.inventory_quantity,
        updated_at: new Date(),
      });
    else
      await createInventoryRecord({
        product_id: id,
        location: 'Nashik',
        available_quantity: data.inventory_quantity,
        committed_quantity: 0,
        status: 'in_stock',
      });
  }

  if (data.faqs !== undefined) {
    await deleteProductFaqsByProductId(id);
    if (data.faqs?.length)
      await createProductFaqsRecords(
        data.faqs.map((f: any) => ({ product_id: id, question: f.question, answer: f.answer })),
      );
  }

  await updateProductVariants({
    productId: id,
    hasVariants: data.has_variants,
    variants: data.variants,
    updatedBy: userId,
  });

  const { inventory_quantity: _q, faqs: _f, variants: _v, ...fields } = data;
  const cleaned = { ...fields };
  ['category_tier_1', 'category_tier_2', 'category_tier_3', 'category_tier_4'].forEach((k) => {
    if (cleaned[k as keyof typeof cleaned] === '') (cleaned as any)[k] = null;
  });

  const [res] = await updateProductRecordById(id, {
    ...cleaned,
    updated_by: userId,
    updated_at: new Date(),
  });
  if (!res) throw new HttpException(500, 'Update failed');

  await updateTierUsage(
    [
      current.category_tier_1,
      current.category_tier_2,
      current.category_tier_3,
      current.category_tier_4,
    ],
    [
      cleaned.category_tier_1 ?? current.category_tier_1,
      cleaned.category_tier_2 ?? current.category_tier_2,
      cleaned.category_tier_3 ?? current.category_tier_3,
      cleaned.category_tier_4 ?? current.category_tier_4,
    ],
  );


  return res as IProduct;
}

/** Soft deletes a product and decrements associated usage counts. */
export async function deleteProduct(id: string, userId: string) {
  const p = await softDeleteProduct(id, userId);
  if (!p) throw new HttpException(404, 'Product not found');

  await decrementTierUsage([
    p.category_tier_1,
    p.category_tier_2,
    p.category_tier_3,
    p.category_tier_4,
  ]);


  return { sku: p.sku, slug: p.slug };
}
