import { eq, sql } from 'drizzle-orm';
import { db } from '../../../../database';
import { inventory } from '../inventory.schema';
import { orderItems } from '../../../orders/shared/order-items.schema';
import { buildInventoryFilter } from './inventory';

export async function getOrderItemsByOrderId(orderId: string, transaction: any = db) {
  return transaction
    .select({
      product_id: orderItems.product_id,
      variant_id: orderItems.variant_id,
      quantity: orderItems.quantity,
      product_name: orderItems.product_name,
    })
    .from(orderItems)
    .where(eq(orderItems.order_id, orderId));
}

export async function updateInventoryForFulfillment(
  productId: string,
  variantId: string | null | undefined,
  quantity: number,
  userId: string | null,
  _allowNegative: boolean = false,
  transaction: any = db,
) {
  const [updated] = await transaction
    .update(inventory)
    .set({
      total_fulfilled: sql`${inventory.total_fulfilled} + ${quantity}`,
      last_stock_movement_at: new Date(),
      updated_at: new Date(),
      ...(userId ? { updated_by: userId } : {}),
    })
    .where(buildInventoryFilter(productId, variantId))
    .returning();
  return updated;
}

export async function updateInventoryForSale(
  productId: string,
  variantId: string | null | undefined,
  quantity: number,
  userId: string | null,
  transaction: any = db,
) {
  const [updated] = await transaction
    .update(inventory)
    .set({
      available_quantity: sql`GREATEST(0, ${inventory.available_quantity} - ${quantity})`,
      committed_quantity: sql`GREATEST(0, ${inventory.committed_quantity} - ${quantity})`,
      total_sold: sql`${inventory.total_sold} + ${quantity}`,
      last_sale_at: new Date(),
      last_stock_movement_at: new Date(),
      updated_at: new Date(),
      ...(userId ? { updated_by: userId } : {}),
    })
    .where(buildInventoryFilter(productId, variantId))
    .returning();
  return updated;
}

export async function updateInventoryForReturn(
  productId: string,
  variantId: string | null | undefined,
  quantity: number,
  userId: string | null,
  transaction: any = db,
) {
  const [updated] = await transaction
    .update(inventory)
    .set({
      available_quantity: sql`${inventory.available_quantity} + ${quantity}`,
      updated_at: new Date(),
      ...(userId ? { updated_by: userId } : {}),
    })
    .where(buildInventoryFilter(productId, variantId))
    .returning();
  return updated;
}
