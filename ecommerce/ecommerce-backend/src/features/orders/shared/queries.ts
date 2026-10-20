/**
 * Orders Queries - Core CRUD Operations Only
 *
 * Contains only reusable database queries for basic order operations.
 * Complex queries and cross-domain logic have been moved to their respective services.
 */

import { eq, and, desc, asc, inArray, count, sum } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { orders, type Order } from './orders.schema';
import { orderItems, type OrderItem } from './order-items.schema';
import { products } from '../../product/shared/products.schema';
import { productVariants } from '../../product/shared/product-variants.schema';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

// =====================================================
// CORE ORDER CRUD - Reusable basic operations only
// =====================================================

export const findOrderById = async (
  identifier: string,
  includeDeleted = false,
  tx: Database = db,
): Promise<Order | undefined> => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  const conditions = isUuid ? [eq(orders.id, identifier)] : [eq(orders.order_number, identifier)];

  if (!includeDeleted) conditions.push(eq(orders.is_deleted, false));
  const [order] = await tx
    .select()
    .from(orders)
    .where(and(...conditions))
    .limit(1);
  return order;
};

export const findOrderByNumber = async (
  orderNumber: string,
  includeDeleted = false,
  tx: Database = db,
): Promise<Order | undefined> => {
  const conditions = [eq(orders.order_number, orderNumber)];
  if (!includeDeleted) conditions.push(eq(orders.is_deleted, false));
  const [order] = await tx
    .select()
    .from(orders)
    .where(and(...conditions))
    .limit(1);
  return order;
};

export const findOrdersByUserId = async (
  userId: string,
  options: {
    page?: number;
    limit?: number;
    includeDrafts?: boolean;
    includeDeleted?: boolean;
  } = {},
  tx: Database = db,
): Promise<Order[]> => {
  const { page = 1, limit = 20, includeDrafts = false, includeDeleted = false } = options;
  const offset = (page - 1) * limit;
  const conditions = [eq(orders.user_id, userId)];
  if (!includeDrafts) conditions.push(eq(orders.is_draft, false));
  if (!includeDeleted) conditions.push(eq(orders.is_deleted, false));
  return tx
    .select()
    .from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.created_at))
    .limit(limit)
    .offset(offset);
};

export const findOrderByCartId = async (
  cartId: string,
  tx: Database = db,
): Promise<Order | undefined> => {
  const [order] = await tx
    .select()
    .from(orders)
    .where(and(eq(orders.cart_id, cartId), eq(orders.is_deleted, false)))
    .limit(1);
  return order;
};

export const countOrdersByUserId = async (
  userId: string,
  includeDrafts = false,
  tx: Database = db,
): Promise<number> => {
  const conditions = [eq(orders.user_id, userId), eq(orders.is_deleted, false)];
  if (!includeDrafts) conditions.push(eq(orders.is_draft, false));
  const [result] = await tx
    .select({ count: count() })
    .from(orders)
    .where(and(...conditions));
  return result?.count || 0;
};

export const createOrder = async (
  data: typeof orders.$inferInsert,
  tx: Database = db,
): Promise<Order> => {
  const [order] = await tx.insert(orders).values(data).returning();
  if (!order) throw new Error('Failed to create order');
  return order;
};

export const updateOrder = async (
  orderId: string,
  data: Partial<typeof orders.$inferInsert>,
  tx: Database = db,
): Promise<Order | undefined> => {
  const [updatedOrder] = await tx
    .update(orders)
    .set({ ...data, updated_at: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

export const softDeleteOrder = async (
  orderId: string,
  deletedBy: string,
  tx: Database = db,
): Promise<Order | undefined> => {
  const [deletedOrder] = await tx
    .update(orders)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: deletedBy,
      updated_at: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();
  return deletedOrder;
};

export const softDeleteOrders = async (
  orderIds: string[],
  deletedBy: string,
  tx: Database = db,
): Promise<Order[]> => {
  if (orderIds.length === 0) return [];
  return tx
    .update(orders)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: deletedBy,
      updated_at: new Date(),
    })
    .where(inArray(orders.id, orderIds))
    .returning();
};

// =====================================================
// ORDER ITEMS CRUD - Basic item operations
// =====================================================

export const getOrderItems = async (orderId: string, tx: Database = db): Promise<OrderItem[]> => {
  return tx
    .select()
    .from(orderItems)
    .where(eq(orderItems.order_id, orderId))
    .orderBy(asc(orderItems.created_at));
};

export const getOrderItemsWithProducts = async (orderId: string, tx: Database = db) => {
  return tx
    .select({
      id: orderItems.id,
      order_id: orderItems.order_id,
      product_id: orderItems.product_id,
      product_name: orderItems.product_name,
      product_sku: orderItems.sku,
      variant_id: orderItems.variant_id,
      quantity: orderItems.quantity,
      cost_price: orderItems.cost_price,
      discount_type: orderItems.discount_type,
      discount_value: orderItems.discount_value,
      discount_reason: orderItems.discount_reason,
      line_total: orderItems.line_total,
      quantity_fulfilled: orderItems.quantity_fulfilled,
      quantity_cancelled: orderItems.quantity_cancelled,
      quantity_returned: orderItems.quantity_returned,
      created_at: orderItems.created_at,
      product_image_url: products.primary_image_url,
      product_slug: products.slug,
      variant_option_name: productVariants.option_name,
      variant_option_value: productVariants.option_value,
      variant_sku: productVariants.sku,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.product_id, products.id))
    .leftJoin(productVariants, eq(orderItems.variant_id, productVariants.id))
    .where(eq(orderItems.order_id, orderId))
    .orderBy(asc(orderItems.created_at));
};

export const createOrderItems = async (
  items: (typeof orderItems.$inferInsert)[],
  tx: Database = db,
): Promise<OrderItem[]> => {
  if (items.length === 0) return [];
  return tx.insert(orderItems).values(items).returning();
};

export const createOrderItem = async (
  data: typeof orderItems.$inferInsert,
  tx: Database = db,
): Promise<OrderItem> => {
  const [item] = await tx.insert(orderItems).values(data).returning();
  if (!item) throw new Error('Failed to create order item');
  return item;
};

export const updateOrderItem = async (
  itemId: string,
  data: Partial<typeof orderItems.$inferInsert>,
  tx: Database = db,
): Promise<OrderItem | undefined> => {
  const [updatedItem] = await tx
    .update(orderItems)
    .set(data)
    .where(eq(orderItems.id, itemId))
    .returning();
  return updatedItem;
};

export const deleteOrderItem = async (itemId: string, tx: Database = db): Promise<void> => {
  await tx.delete(orderItems).where(eq(orderItems.id, itemId));
};

export const calculateOrderItemsTotals = async (
  orderId: string,
  tx: Database = db,
): Promise<{ subtotal: number; totalQuantity: number }> => {
  const [result] = await tx
    .select({ subtotal: sum(orderItems.line_total), totalQuantity: sum(orderItems.quantity) })
    .from(orderItems)
    .where(eq(orderItems.order_id, orderId));
  return {
    subtotal: Number(result?.subtotal || 0),
    totalQuantity: Number(result?.totalQuantity || 0),
  };
};

// =====================================================
// ORDER STATUS UPDATES - Status management operations
// =====================================================

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  userId: string,
  tx: Database = db,
): Promise<Order | undefined> => {
  const [updatedOrder] = await tx
    .update(orders)
    .set({ order_status: status as any, updated_at: new Date(), updated_by: userId })
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: string,
  paidAt: Date | null = null,
  tx: Database = db,
): Promise<Order | undefined> => {
  const updateData: any = { payment_status: paymentStatus, updated_at: new Date() };
  if (paidAt) updateData.paid_at = paidAt;
  const [updatedOrder] = await tx
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

export const updateFulfillmentStatus = async (
  orderId: string,
  fulfillmentStatus: string,
  fulfillmentDate: Date | null = null,
  tx: Database = db,
): Promise<Order | undefined> => {
  const updateData: any = { fulfillment_status: fulfillmentStatus, updated_at: new Date() };
  if (fulfillmentDate) updateData.fulfillment_date = fulfillmentDate;
  const [updatedOrder] = await tx
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

export const updateOrderTracking = async (
  orderId: string,
  trackingNumber: string,
  tx: Database = db,
): Promise<Order | undefined> => {
  const [updatedOrder] = await tx
    .update(orders)
    .set({ order_tracking: trackingNumber, updated_at: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

export const markOrderAsCancelled = async (
  orderId: string,
  tx: Database = db,
): Promise<Order | undefined> => {
  const [updatedOrder] = await tx
    .update(orders)
    .set({ order_status: 'cancelled', fulfillment_status: 'cancelled', updated_at: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

export const markDraftOrderAsActive = async (
  orderId: string,
  tx: Database = db,
): Promise<Order | undefined> => {
  const [updatedOrder] = await tx
    .update(orders)
    .set({ is_draft: false, order_status: 'pending', updated_at: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

export const updatePaymentDetails = async (
  orderId: string,
  data: {
    payment_ref?: string;
    transaction_id?: string;
    payment_status?: 'pending' | 'paid' | 'partially_paid' | 'refunded';
    paid_at?: Date;
  },
  tx: Database = db,
): Promise<Order | undefined> => {
  const updateData: any = { updated_at: new Date() };
  if (data.payment_ref !== undefined) updateData.payment_ref = data.payment_ref;
  if (data.transaction_id !== undefined) updateData.transaction_id = data.transaction_id;
  if (data.payment_status !== undefined) updateData.payment_status = data.payment_status;
  if (data.paid_at !== undefined) updateData.paid_at = data.paid_at;
  const [updatedOrder] = await tx
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, orderId))
    .returning();
  return updatedOrder;
};

// =====================================================
// TEMPORARILY KEPT FOR API COMPATIBILITY
// TODO: Move these to their respective service layers
// =====================================================

import { or, gte, lte, ilike, sql } from 'drizzle-orm';
import { users } from '../../user/shared/user.schema';
import { userAddresses } from '../../address/shared/addresses.schema';
import { carts } from '../../cart/shared/carts.schema';
import { cartItems } from '../../cart/shared/cart-items.schema';
import { discountCodes } from '../../discount/shared/discount-codes.schema';
import { wishlists } from '../../wishlist/shared/wishlist.schema';
import { wishlistItems } from '../../wishlist/shared/wishlist-items.schema';

export interface OrderSearchParams {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  amount_ranges?: string;
  item_ranges?: string;
  user_id?: string;
  is_draft?: boolean;
}

// [TODO: Move to order-management.service.ts] Complex search query with joins
export const searchOrders = async (params: OrderSearchParams, tx: Database = db) => {
  const {
    page = 1,
    limit = 20,
    status,
    payment_status,
    fulfillment_status,
    from_date,
    to_date,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    amount_ranges,
    item_ranges,
    user_id,
    is_draft = false,
  } = params;
  const offset = (page - 1) * limit;
  const conditions: any[] = [eq(orders.is_deleted, false), eq(orders.is_draft, is_draft)];
  if (user_id) conditions.push(eq(orders.user_id, user_id));
  if (status) conditions.push(eq(orders.order_status, status as any));
  if (payment_status) {
    const statuses = payment_status.split(',').filter(Boolean);
    if (statuses.length > 0) conditions.push(inArray(orders.payment_status, statuses as any));
  }
  if (fulfillment_status) {
    const statuses = fulfillment_status.split(',').filter(Boolean);
    if (statuses.length > 0) conditions.push(inArray(orders.fulfillment_status, statuses as any));
  }
  if (from_date) conditions.push(gte(orders.created_at, new Date(from_date)));
  if (to_date) conditions.push(lte(orders.created_at, new Date(to_date)));
  if (amount_ranges) {
    const ranges = amount_ranges.split(',').filter(Boolean);
    const rangeConditions = ranges
      .map((range) => {
        if (range === '0-1000')
          return and(gte(orders.total_amount, '0'), lte(orders.total_amount, '1000'));
        if (range === '1000-5000')
          return and(gte(orders.total_amount, '1000'), lte(orders.total_amount, '5000'));
        if (range === '5000-10000')
          return and(gte(orders.total_amount, '5000'), lte(orders.total_amount, '10000'));
        if (range === 'Over-10000') return gte(orders.total_amount, '10000');
        return null;
      })
      .filter(Boolean);
    if (rangeConditions.length > 0) {
      const orCondition = or(...(rangeConditions as any));
      if (orCondition) conditions.push(orCondition);
    }
  }
  if (item_ranges) {
    const ranges = item_ranges.split(',').filter(Boolean);
    const rangeConditions = ranges
      .map((range) => {
        if (range === '1-2')
          return and(gte(orders.total_quantity, 1), lte(orders.total_quantity, 2));
        if (range === '3-5')
          return and(gte(orders.total_quantity, 3), lte(orders.total_quantity, 5));
        if (range === '6-10')
          return and(gte(orders.total_quantity, 6), lte(orders.total_quantity, 10));
        if (range === 'Over-10') return gte(orders.total_quantity, 10);
        return null;
      })
      .filter(Boolean);
    if (rangeConditions.length > 0) {
      const orCondition = or(...(rangeConditions as any));
      if (orCondition) conditions.push(orCondition);
    }
  }
  if (search) {
    const searchPattern = `%${search}%`;
    const searchCondition = or(
      ilike(orders.order_number, searchPattern),
      ilike(users.email, searchPattern),
      ilike(users.first_name, searchPattern),
      ilike(users.last_name, searchPattern),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const getSortColumn = (field: string) => {
    switch (field) {
      case 'order_number':
        return orders.order_number;
      case 'order_status':
        return orders.order_status;
      case 'payment_status':
        return orders.payment_status;
      case 'total_amount':
        return orders.total_amount;
      case 'customer_name':
        return users.first_name;
      case 'created_at':
      default:
        return orders.created_at;
    }
  };
  const sortColumn = getSortColumn(sort_by);
  const sortFn = sort_order === 'asc' ? asc : desc;
  const ordersList = await tx
    .select({
      id: orders.id,
      order_number: orders.order_number,
      order_status: orders.order_status,
      payment_status: orders.payment_status,
      payment_method: orders.payment_method,
      fulfillment_status: orders.fulfillment_status,
      total_amount: orders.total_amount,
      total_quantity: orders.total_quantity,
      currency: orders.currency,
      created_at: orders.created_at,
      updated_at: orders.updated_at,
      is_draft: orders.is_draft,
      user_id: users.id,
      customer_email: users.email,
      customer_first_name: users.first_name,
      customer_last_name: users.last_name,
    })
    .from(orders)
    .leftJoin(users, eq(orders.user_id, users.id))
    .where(and(...conditions))
    .orderBy(sortFn(sortColumn))
    .limit(limit)
    .offset(offset);
  const [countResult] = await tx
    .select({ total: count() })
    .from(orders)
    .leftJoin(users, eq(orders.user_id, users.id))
    .where(and(...conditions));
  return {
    orders: ordersList,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit),
    },
  };
};

// [TODO: Move to order-management.service.ts] Alias wrappers
export const getAdminOrders = async (params: OrderSearchParams, tx: Database = db) =>
  searchOrders({ ...params, is_draft: false }, tx);
export const getUserOrders = async (
  userId: string,
  params: { page?: number; limit?: number } = {},
  tx: Database = db,
) => searchOrders({ ...params, user_id: userId, is_draft: false }, tx);
export const getDraftOrders = async (params: OrderSearchParams = {}, tx: Database = db) =>
  searchOrders({ ...params, is_draft: true }, tx);

// [TODO: Move to get-order-metrics.ts API] Metrics queries
export const getAdminOrderMetrics = async (tx: Database = db) => {
  const [
    totalOrdersResult,
    activeOrdersResult,
    fulfilledOrdersResult,
    cancelledOrdersResult,
    totalRevenueResult,
    pendingRevenueResult,
    paidRevenueResult,
  ] = await Promise.all([
    tx
      .select({ count: count() })
      .from(orders)
      .where(and(eq(orders.is_draft, false), eq(orders.is_deleted, false))),
    tx
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.is_draft, false),
          eq(orders.is_deleted, false),
          or(
            eq(orders.fulfillment_status, 'unfulfilled'),
            eq(orders.fulfillment_status, 'partial'),
          ),
        ),
      ),
    tx
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.is_draft, false),
          eq(orders.is_deleted, false),
          eq(orders.fulfillment_status, 'fulfilled'),
        ),
      ),
    tx
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.is_draft, false),
          eq(orders.is_deleted, false),
          or(eq(orders.order_status, 'cancelled'), eq(orders.fulfillment_status, 'cancelled')),
        ),
      ),
    tx
      .select({ total: sql<string>`COALESCE(SUM(CAST(${orders.total_amount} AS DECIMAL)), 0)` })
      .from(orders)
      .where(
        and(
          eq(orders.is_draft, false),
          eq(orders.is_deleted, false),
          eq(orders.payment_status, 'paid'),
        ),
      ),
    tx
      .select({ total: sql<string>`COALESCE(SUM(CAST(${orders.total_amount} AS DECIMAL)), 0)` })
      .from(orders)
      .where(
        and(
          eq(orders.is_draft, false),
          eq(orders.is_deleted, false),
          eq(orders.payment_status, 'pending'),
        ),
      ),
    tx
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.is_draft, false),
          eq(orders.is_deleted, false),
          eq(orders.payment_status, 'paid'),
        ),
      ),
  ]);
  const totalOrders = totalOrdersResult[0]?.count || 0;
  const paidOrdersCount = paidRevenueResult[0]?.count || 0;
  const totalRevenue = parseFloat(totalRevenueResult[0]?.total || '0');
  const avgOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;
  return {
    total_orders: totalOrders,
    active_orders: activeOrdersResult[0]?.count || 0,
    fulfilled_orders: fulfilledOrdersResult[0]?.count || 0,
    cancelled_orders: cancelledOrdersResult[0]?.count || 0,
    total_revenue: totalRevenueResult[0]?.total || '0.00',
    pending_revenue: pendingRevenueResult[0]?.total || '0.00',
    paid_revenue: totalRevenueResult[0]?.total || '0.00',
    avg_order_value: avgOrderValue.toFixed(2),
    fulfillment_rate:
      totalOrders > 0
        ? (((fulfilledOrdersResult[0]?.count || 0) / totalOrders) * 100).toFixed(2)
        : '0.00',
  };
};

// [TODO: Move to order-conversion.service.ts] Cart conversion helpers
export const findActiveCartByUserId = async (userId: string, tx: Database = db) => {
  const [cart] = await tx
    .select()
    .from(carts)
    .where(
      and(eq(carts.user_id, userId), eq(carts.cart_status, 'active'), eq(carts.is_deleted, false)),
    )
    .limit(1);
  return cart;
};
export const findCartBySessionId = async (sessionId: string, tx: Database = db) => {
  const [cart] = await tx
    .select()
    .from(carts)
    .where(
      and(
        eq(carts.session_id, sessionId),
        eq(carts.cart_status, 'active'),
        eq(carts.is_deleted, false),
      ),
    )
    .limit(1);
  return cart;
};
export const getCartItems = async (cartId: string, tx: Database = db) =>
  tx
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.is_deleted, false)));
export const markCartAsConverted = async (
  cartId: string,
  orderId: string,
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(carts)
    .set({ cart_status: 'converted', updated_at: new Date() })
    .where(eq(carts.id, cartId));
};
export const assignGuestCartToUser = async (
  sessionId: string,
  userId: string,
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(carts)
    .set({ user_id: userId, updated_at: new Date() })
    .where(eq(carts.session_id, sessionId));
};

// [TODO: DELETE - Import from their own features instead] Cross-domain queries
export const findAddressById = async (addressId: string, tx: Database = db) => {
  const [address] = await tx
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.id, addressId))
    .limit(1);
  return address;
};
export const getUserAddresses = async (userId: string, tx: Database = db) =>
  tx
    .select()
    .from(userAddresses)
    .where(and(eq(userAddresses.user_id, userId), eq(userAddresses.is_deleted, false)))
    .orderBy(desc(userAddresses.is_default_shipping));
export const getDefaultAddresses = async (userId: string, tx: Database = db) => {
  const orCondition = or(
    eq(userAddresses.is_default_shipping, true),
    eq(userAddresses.is_default_billing, true),
  );
  if (!orCondition) throw new Error('Failed to create address condition');
  return tx
    .select()
    .from(userAddresses)
    .where(
      and(eq(userAddresses.user_id, userId), orCondition, eq(userAddresses.is_deleted, false)),
    );
};
export const findUserById = async (userId: string, tx: Database = db) => {
  const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
  return user;
};
export const findUserByEmail = async (email: string, tx: Database = db) => {
  const [user] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
};
export const findDiscountCodeByCode = async (code: string, tx: Database = db) => {
  const [discountCode] = await tx
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.code, code))
    .limit(1);
  return discountCode;
};
export const findWishlistByUserId = async (userId: string, tx: Database = db) => {
  const [wishlist] = await tx
    .select()
    .from(wishlists)
    .where(eq(wishlists.user_id, userId))
    .limit(1);
  return wishlist;
};
export const markWishlistItemsAsPurchased = async (
  wishlistId: string,
  productIds: string[],
  tx: Database = db,
): Promise<void> => {
  if (productIds.length === 0) return;
  await tx
    .update(wishlistItems)
    .set({ purchased_at: new Date() })
    .where(
      and(eq(wishlistItems.wishlist_id, wishlistId), inArray(wishlistItems.product_id, productIds)),
    );
};

export const addTagToOrder = async (
  orderId: string,
  tag: string,
  tx: Database = db,
): Promise<void> => {
  const order = await findOrderById(orderId, false, tx);
  if (!order) throw new Error('Order not found');
  const currentTags = (order.tags as string[]) || [];
  if (!currentTags.includes(tag)) {
    currentTags.push(tag);
    await tx
      .update(orders)
      .set({ tags: currentTags, updated_at: new Date() })
      .where(eq(orders.id, orderId));
  }
};
export const removeTagFromOrder = async (
  orderId: string,
  tag: string,
  tx: Database = db,
): Promise<void> => {
  const order = await findOrderById(orderId, false, tx);
  if (!order) throw new Error('Order not found');
  const currentTags = (order.tags as string[]) || [];
  const updatedTags = currentTags.filter((t) => t !== tag);
  await tx
    .update(orders)
    .set({ tags: updatedTags, updated_at: new Date() })
    .where(eq(orders.id, orderId));
};
