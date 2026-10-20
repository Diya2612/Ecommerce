import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../../database';
import { inventory } from '../inventory.schema';
import { buildInventoryFilter } from './inventory';

export async function updateInventoryCommittedQuantity(
  productId: string,
  variantId: string | null | undefined,
  quantityChange: number,
  transaction: any = db,
) {
  return transaction
    .update(inventory)
    .set({
      committed_quantity: sql`GREATEST(0, ${inventory.committed_quantity} + ${quantityChange})`,
      last_stock_movement_at: new Date(),
      updated_at: new Date(),
    })
    .where(buildInventoryFilter(productId, variantId));
}

export async function updateCartItemReservation(
  cartItemId: string,
  reservationId: string | null,
  expiresAt: Date | null,
  transaction: any = db,
) {
  const { cartItems } = await import('../../../cart/shared/cart-items.schema');
  return transaction
    .update(cartItems)
    .set({
      reservation_id: reservationId,
      reserved_at: reservationId ? new Date() : null,
      reservation_expires_at: expiresAt,
    })
    .where(eq(cartItems.id, cartItemId));
}

export async function getCartItemWithReservation(cartItemId: string, transaction: any = db) {
  const { cartItems } = await import('../../../cart/shared/cart-items.schema');
  const [item] = await transaction
    .select({
      id: cartItems.id,
      product_id: cartItems.product_id,
      variant_id: cartItems.variant_id,
      quantity: cartItems.quantity,
      reservation_id: cartItems.reservation_id,
    })
    .from(cartItems)
    .where(eq(cartItems.id, cartItemId));
  return item;
}

export async function extendCartItemReservations(
  cartId: string,
  expiresAt: Date,
  transaction: any = db,
) {
  const { cartItems } = await import('../../../cart/shared/cart-items.schema');
  return transaction
    .update(cartItems)
    .set({
      reservation_expires_at: expiresAt,
    })
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.is_deleted, false)));
}

export async function findExpiredCartReservations() {
  const { cartItems } = await import('../../../cart/shared/cart-items.schema');
  return db
    .select({
      id: cartItems.id,
      product_id: cartItems.product_id,
      variant_id: cartItems.variant_id,
      quantity: cartItems.quantity,
      reservation_id: cartItems.reservation_id,
    })
    .from(cartItems)
    .where(
      and(
        sql`${cartItems.reservation_expires_at} IS NOT NULL`,
        sql`${cartItems.reservation_expires_at} < NOW()`,
      ),
    );
}
