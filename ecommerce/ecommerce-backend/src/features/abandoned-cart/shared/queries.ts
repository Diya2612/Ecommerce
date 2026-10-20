import { eq, and, desc, asc, ilike, or, gte, lte, count, inArray, isNotNull } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { db, schema } from '../../../database';
import { carts } from '../../cart/shared/carts.schema';
import { cartItems } from '../../cart/shared/cart-items.schema';
import { users } from '../../user/shared/user.schema';
import { notificationTemplates } from '../../notifications/shared/notification-templates.schema';
import { userAddresses } from '../../address/shared/addresses.schema';

type Database = NodePgDatabase<typeof schema> | PgTransaction<any, typeof schema, any>;

export interface AbandonedCartParams {
  page?: number;
  limit?: number;
  days_ago?: number;
  search?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: 'abandoned_at' | 'grand_total' | 'last_activity_at';
  sort_order?: 'asc' | 'desc';
}

export const getAbandonedCarts = async (params: AbandonedCartParams = {}, tx: Database = db) => {
  const {
    page = 1,
    limit = 20,
    search,
    from_date,
    to_date,
    sort_by = 'abandoned_at',
    sort_order = 'desc',
    days_ago,
  } = params;
  const offset = (page - 1) * limit;
  const conditions: any[] = [eq(carts.cart_status, 'abandoned'), eq(carts.is_deleted, false)];
  if (from_date) conditions.push(gte(carts.abandoned_at, new Date(from_date)));
  if (to_date) conditions.push(lte(carts.abandoned_at, new Date(to_date)));
  if (!from_date && !to_date && days_ago) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days_ago);
    conditions.push(lte(carts.updated_at, cutoffDate));
  }
  if (search) {
    const searchPattern = `%${search}%`;
    const searchCondition = or(
      ilike(carts.session_id, searchPattern),
      ilike(users.email, searchPattern),
      ilike(users.first_name, searchPattern),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  let orderByColumn;
  switch (sort_by) {
    case 'grand_total':
      orderByColumn = carts.grand_total;
      break;
    case 'last_activity_at':
      orderByColumn = carts.last_activity_at;
      break;
    case 'abandoned_at':
    default:
      orderByColumn = carts.abandoned_at;
      break;
  }
  const sortFn = sort_order === 'asc' ? asc : desc;
  const abandonedCarts = await tx
    .select({
      cart_id: carts.id,
      user_id: carts.user_id,
      session_id: carts.session_id,
      subtotal: carts.subtotal,
      cart_value: carts.grand_total,
      grand_total: carts.grand_total,
      created_at: carts.created_at,
      updated_at: carts.updated_at,
      abandoned_at: carts.abandoned_at,
      last_activity_at: carts.last_activity_at,
      recovery_email_sent: carts.recovery_email_sent,
      recovery_email_sent_at: carts.recovery_email_sent_at,
      user_email: users.email,
      customer_email: users.email,
      user_first_name: users.first_name,
      customer_name: users.first_name,
      user_last_name: users.last_name,
      customer_phone: users.phone_number,
    })
    .from(carts)
    .leftJoin(users, eq(carts.user_id, users.id))
    .where(and(...conditions))
    .orderBy(sortFn(orderByColumn))
    .limit(limit)
    .offset(offset);
  const [countResult] = await tx
    .select({ total: count() })
    .from(carts)
    .leftJoin(users, eq(carts.user_id, users.id))
    .where(and(...conditions));
  return {
    carts: abandonedCarts,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit),
    },
  };
};

export const getAbandonedCartDetails = async (cartId: string, tx: Database = db) => {
  const [cart] = await tx
    .select({
      id: carts.id,
      user_id: carts.user_id,
      session_id: carts.session_id,
      subtotal: carts.subtotal,
      currency: carts.currency,
      discount_total: carts.discount_total,
      shipping_total: carts.shipping_total,
      tax_total: carts.tax_total,
      applied_discount_codes: carts.applied_discount_codes,
      applied_giftcard_codes: carts.applied_giftcard_codes,
      grand_total: carts.grand_total,
      created_at: carts.created_at,
      updated_at: carts.updated_at,
      abandoned_at: carts.abandoned_at,
      last_activity_at: carts.last_activity_at,
      recovery_email_sent: carts.recovery_email_sent,
      recovery_email_sent_at: carts.recovery_email_sent_at,
      cart_status: carts.cart_status,
      customer_name: users.first_name,
      customer_email: users.email,
      customer_phone: users.phone_number,
    })
    .from(carts)
    .leftJoin(users, eq(carts.user_id, users.id))
    .where(and(eq(carts.id, cartId), eq(carts.is_deleted, false)))
    .limit(1);
  if (!cart) return null;
  const items = await tx
    .select({
      id: cartItems.id,
      product_id: cartItems.product_id,
      product_name: cartItems.product_name,
      product_sku: cartItems.product_sku,
      product_image_url: cartItems.product_image_url,
      quantity: cartItems.quantity,
      cost_price: cartItems.cost_price,
      final_price: cartItems.final_price,
      discount_amount: cartItems.discount_amount,
      line_subtotal: cartItems.line_subtotal,
      line_total: cartItems.line_total,
    })
    .from(cartItems)
    .where(and(eq(cartItems.cart_id, cart.id), eq(cartItems.is_deleted, false)));
  let addresses: any[] = [];
  if (cart.user_id)
    addresses = await tx
      .select()
      .from(userAddresses)
      .where(and(eq(userAddresses.user_id, cart.user_id), eq(userAddresses.is_deleted, false)));
  return { cart, items, addresses };
};

export const getAbandonedCartMetrics = async (tx: Database = db) => {
  const [totalAbandonedResult, potentialRevenueResult, emailsSentResult, recoveredCountResult] =
    await Promise.all([
      tx
        .select({ count: count() })
        .from(carts)
        .where(and(eq(carts.cart_status, 'abandoned'), eq(carts.is_deleted, false))),
      tx
        .select({ total: sql<string>`COALESCE(SUM(${carts.grand_total}), 0)` })
        .from(carts)
        .where(and(eq(carts.cart_status, 'abandoned'), eq(carts.is_deleted, false))),
      tx
        .select({ count: count() })
        .from(carts)
        .where(
          and(
            eq(carts.cart_status, 'abandoned'),
            eq(carts.recovery_email_sent, true),
            eq(carts.is_deleted, false),
          ),
        ),
      tx
        .select({ count: count() })
        .from(carts)
        .where(
          and(
            eq(carts.cart_status, 'converted'),
            isNotNull(carts.abandoned_at),
            eq(carts.is_deleted, false),
          ),
        ),
    ]);
  const totalAbandoned = totalAbandonedResult[0]?.count || 0;
  const emailsSent = emailsSentResult[0]?.count || 0;
  const recoveredCount = recoveredCountResult[0]?.count || 0;
  const recoveryRate = emailsSent > 0 ? ((recoveredCount / emailsSent) * 100).toFixed(2) : '0.00';
  return {
    total_carts: totalAbandoned,
    potential_revenue: parseFloat(potentialRevenueResult[0]?.total || '0'),
    emails_sent: emailsSent,
    recovered_count: recoveredCount,
    recovery_rate: parseFloat(recoveryRate),
  };
};

export const markAbandonedCartEmailSent = async (
  cartId: string,
  tx: Database = db,
): Promise<void> => {
  await tx
    .update(carts)
    .set({ recovery_email_sent: true, recovery_email_sent_at: new Date(), updated_at: new Date() })
    .where(eq(carts.id, cartId));
};

export const markCartRecoveryEmailSent = async (cartId: string, tx: Database = db) => {
  await tx
    .update(carts)
    .set({ recovery_email_sent: true, recovery_email_sent_at: new Date(), updated_at: new Date() })
    .where(eq(carts.id, cartId));
};

export const getAbandonedCartsByIds = async (cartIds: string[], tx: Database = db) =>
  tx
    .select({
      cart_id: carts.id,
      user_id: carts.user_id,
      customer_email: users.email,
      customer_name: users.first_name,
      grand_total: carts.grand_total,
      abandoned_at: carts.abandoned_at,
    })
    .from(carts)
    .leftJoin(users, eq(carts.user_id, users.id))
    .where(
      and(
        inArray(carts.id, cartIds),
        eq(carts.cart_status, 'abandoned'),
        eq(carts.is_deleted, false),
      ),
    );

export const getActiveEmailTemplatesByCategory = async (category: string, tx: Database = db) =>
  tx
    .select({
      id: notificationTemplates.id,
      code: notificationTemplates.code,
      name: notificationTemplates.name,
      description: notificationTemplates.description,
      category: notificationTemplates.category,
      subject: notificationTemplates.subject,
      body_text: notificationTemplates.body_text,
      body_html: notificationTemplates.body_html,
      variables: notificationTemplates.variables,
      is_active: notificationTemplates.is_active,
      created_at: notificationTemplates.created_at,
      updated_at: notificationTemplates.updated_at,
    })
    .from(notificationTemplates)
    .where(
      and(eq(notificationTemplates.category, category), eq(notificationTemplates.is_active, true)),
    )
    .orderBy(notificationTemplates.name);

export const findNotificationTemplate = async (
  id?: string,
  category: string = 'abandoned-cart',
  tx: Database = db,
) => {
  const conditions = [eq(notificationTemplates.is_active, true)];
  if (id) conditions.push(eq(notificationTemplates.id, id));
  else conditions.push(eq(notificationTemplates.category, category));
  const [template] = await tx
    .select()
    .from(notificationTemplates)
    .where(and(...conditions))
    .limit(1);
  return template;
};
