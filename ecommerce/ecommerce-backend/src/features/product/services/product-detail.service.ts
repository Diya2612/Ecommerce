import { eq, and, inArray, isNull } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { HttpException } from '../../../utils/helpers/httpException';
import { rbacCacheService } from '../../rbac/services/rbac-cache.service';
import { IProductResponse, GetProductDetailOptions } from '../shared/interface';
import { getProductFaqs, findVariantsByProductId, getProductsRatingStats } from '../shared/queries';
import { products } from '../shared/products.schema';
import { inventory } from '../../inventory/shared/inventory.schema';
import type { ProductVariant } from '../shared/product-variants.schema';
import type { ProductFaq } from '../shared/product-faqs.schema';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

/** Get product detail with stats by ID or slug. */
const getProductDetailQuery = async (
  options: { id?: string; slug?: string },
  tx: Database = db,
) => {
  const { id, slug } = options;
  if ((!id && !slug) || (id && slug)) throw new Error('Provide either id or slug');

  const [productData] = await tx
    .select({
      id: products.id,
      slug: products.slug,
      product_title: products.product_title,
      secondary_title: products.secondary_title,
      short_description: products.short_description,
      full_description: products.full_description,
      admin_comment: products.admin_comment,
      status: products.status,
      featured: products.featured,
      cost_price: products.cost_price,
      selling_price: products.selling_price,
      compare_at_price: products.compare_at_price,
      sku: products.sku,
      hsn_code: products.hsn_code,
      barcode: products.barcode,
      primary_image_url: products.primary_image_url,
      additional_images: products.additional_images,
      category_tier_1: products.category_tier_1,
      category_tier_2: products.category_tier_2,
      category_tier_3: products.category_tier_3,
      category_tier_4: products.category_tier_4,
      created_at: products.created_at,
      updated_at: products.updated_at,
      weight: products.weight,
      length: products.length,
      breadth: products.breadth,
      height: products.height,
      meta_title: products.meta_title,
      meta_description: products.meta_description,
      product_url: products.product_url,
      tags: products.tags,
      has_variants: products.has_variants,
      max_order_quantity: products.max_order_quantity,
    })
    .from(products)
    .where(
      id
        ? and(eq(products.id, id), eq(products.is_deleted, false))
        : and(eq(products.slug, slug as string), eq(products.is_deleted, false)),
    )
    .limit(1);

  if (!productData) return undefined;

  const statsMap = await getProductsRatingStats([productData.id], tx);
  const stats = statsMap.get(productData.id) ?? { avg_rating: 0, review_count: 0 };

  return { ...productData, ...stats };
};

/** Explicitly fetch the base product inventory row (product_id NOT NULL, variant_id IS NULL). */
const getBaseInventory = async (productId: string, tx: Database = db) => {
  const [row] = await tx
    .select()
    .from(inventory)
    .where(and(eq(inventory.product_id, productId), isNull(inventory.variant_id)))
    .limit(1);
  return row ?? null;
};

/** Fetch inventory rows for a list of variant IDs. */
const getVariantInventory = async (variantIds: string[], tx: Database = db) => {
  if (!variantIds.length) return [];
  return tx.select().from(inventory).where(inArray(inventory.variant_id, variantIds));
};

/** Orchestrates product detail retrieval including RBAC, pricing, and stock. */
export async function getProductDetail(
  options: GetProductDetailOptions,
): Promise<IProductResponse> {
  const { id, slug, userId } = options;
  const productData = await getProductDetailQuery({ id, slug });
  if (!productData) throw new HttpException(404, 'Product not found');

  if (productData.status !== 'active') {
    if (!userId) throw new HttpException(401, 'Auth required');
    if (!(await rbacCacheService.hasPermission(userId, 'products:read'))) {
      throw new HttpException(403, 'Permission denied');
    }
  }

  const [faqsData, variantsData] = await Promise.all([
    getProductFaqs(productData.id),
    productData.has_variants ? findVariantsByProductId(productData.id) : Promise.resolve([]),
  ]);

  const variantIds = variantsData.map((v: ProductVariant) => v.id);
  const [baseInvItem, variantInventoryData] = await Promise.all([
    getBaseInventory(productData.id),
    getVariantInventory(variantIds),
  ]);

  // Combine for aggregate stock stats (base + all variants)
  const inventoryData = [...(baseInvItem ? [baseInvItem] : []), ...variantInventoryData];

  let discount: number | null = null;
  if (productData.compare_at_price && productData.selling_price) {
    const compare = Number(productData.compare_at_price);
    const sell = Number(productData.selling_price);
    if (compare > sell) discount = Math.round(((compare - sell) / compare) * 100);
  }

  const images = [
    productData.primary_image_url,
    ...((productData.additional_images as string[]) ?? []),
  ].filter(Boolean) as string[];

  const stockStats = inventoryData.reduce(
    (acc, item) => {
      const avail = Number(item.available_quantity) || 0;
      const comm = Number(item.committed_quantity) || 0;
      acc.total += avail;
      acc.available += avail;
      acc.reserved += comm;
      return acc;
    },
    { total: 0, available: 0, reserved: 0 },
  );

  const baseAvailableStock = Number(baseInvItem?.available_quantity) || 0;

  const variants = variantsData.map((v: ProductVariant) => {
    const inv = inventoryData.find((i) => i.variant_id === v.id);
    // Return available_quantity directly - frontend will subtract cart items for cart-aware display
    const inventoryQuantity = Number(inv?.available_quantity) || 0;

    return {
      ...v,
      inventory_quantity: inventoryQuantity,
      barcode: v.barcode ?? null,
      image_url: v.image_url ?? null,
      created_by: v.created_by ?? null,
      updated_by: v.updated_by ?? null,
      deleted_at: v.deleted_at ?? null,
      deleted_by: v.deleted_by ?? null,
    };
  });

  return {
    ...productData,
    admin_comment: productData.admin_comment ?? null,
    discount,
    inStock: stockStats.available > 0,
    total_stock: stockStats.total,
    available_stock: stockStats.available,
    reserved_stock: stockStats.reserved,
    base_inventory: baseAvailableStock,
    images,
    additional_images: (productData.additional_images as string[]) ?? [],
    rating: Number(productData.avg_rating) || 0,
    review_count: Number(productData.review_count) || 0,
    category_tier_1: productData.category_tier_1 ?? null,
    category_tier_2: productData.category_tier_2 ?? null,
    category_tier_3: productData.category_tier_3 ?? null,
    category_tier_4: productData.category_tier_4 ?? null,
    tags: (productData.tags as string[]) ?? [],
    faqs: faqsData.map((f: ProductFaq) => ({ id: f.id, question: f.question, answer: f.answer })),
    variants,
  };
}
