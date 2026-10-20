import { eq, and, desc, sql, inArray, ne } from 'drizzle-orm';
import { db } from '../../../database';
import { logger } from '../../../utils';
import { orders } from '../../orders/shared/orders.schema';
import { users } from '../../user/shared/user.schema';
import { carts } from '../../cart/shared/carts.schema';
import { cartItems } from '../../cart/shared/cart-items.schema';
import { paymentTransactions } from './payment-transactions.schema';
import { paymentWebhookLogs } from './webhook-logs.schema';
import { IRazorpayWebhookEvent } from './interface';

/**
 * Returns an order by its ID and User ID. Ensures order is not deleted.
 */
export async function getOrderByIdAndUser(orderId: string, userId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.user_id, userId), eq(orders.is_deleted, false)))
    .limit(1);
  return order;
}

/**
 * Returns an order by its ID regardless of user ID.
 */
export async function getOrderById(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return order;
}

/**
 * Returns an order by its Razorpay Order ID.
 */
export async function getOrderByRazorpayOrderId(razorpayOrderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.razorpay_order_id, razorpayOrderId))
    .limit(1);
  return order;
}

/**
 * Finds a specific user's contact information.
 */
export async function getUserContactInfo(userId: string) {
  const [user] = await db
    .select({ name: users.first_name, email: users.email, phone: users.phone_number })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user;
}

/**
 * Inserts a new payment transaction.
 */
export async function createPaymentTransaction(data: {
  order_id: string;
  razorpay_order_id: string;
  amount: string;
  currency: string;
  status:
    | 'initiated'
    | 'authorized'
    | 'captured'
    | 'failed'
    | 'refund_initiated'
    | 'refunded'
    | 'partially_refunded';
  idempotency_key: string;
}) {
  await db.insert(paymentTransactions).values(data);
}

/**
 * Finds a payment transaction by its order ID and status.
 */
export async function getTransactionByOrderIdAndStatus(orderId: string, status: string) {
  return await db.query.paymentTransactions.findFirst({
    where: and(
      eq(paymentTransactions.order_id, orderId),
      eq(paymentTransactions.status, status as any),
    ),
  });
}

/**
 * Finds all transactions for a given order ID.
 */
export async function getTransactionsByOrderId(orderId: string) {
  return await db
    .select({
      id: paymentTransactions.id,
      razorpay_payment_id: paymentTransactions.razorpay_payment_id,
      amount: paymentTransactions.amount,
      status: paymentTransactions.status,
      payment_method: paymentTransactions.payment_method,
      error_code: paymentTransactions.error_code,
      error_description: paymentTransactions.error_description,
      created_at: paymentTransactions.created_at,
    })
    .from(paymentTransactions)
    .where(eq(paymentTransactions.order_id, orderId))
    .orderBy(desc(paymentTransactions.created_at));
}

/**
 * Finds a payment transaction by Razorpay Order ID.
 */
export async function getTransactionByRazorpayOrderId(razorpayOrderId: string) {
  return await db.query.paymentTransactions.findFirst({
    where: eq(paymentTransactions.razorpay_order_id, razorpayOrderId),
  });
}

/**
 * Finds a payment transaction by Razorpay Payment ID.
 */
export async function getTransactionByRazorpayPaymentId(razorpayPaymentId: string) {
  return await db.query.paymentTransactions.findFirst({
    where: eq(paymentTransactions.razorpay_payment_id, razorpayPaymentId),
  });
}

/**
 * Finds a payment transaction by Razorpay Order ID (using select for consistency with other methods if needed)
 */
export async function getTransactionForWebhookByRazorpayOrderId(razorpayOrderId: string) {
  const [transaction] = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.razorpay_order_id, razorpayOrderId))
    .limit(1);
  return transaction;
}

/**
 * Calculates current grand total of an active cart.
 */
export async function calculateActiveCartTotal(cartId: string) {
  const [currentCart] = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);

  if (!currentCart || currentCart.cart_status !== 'active') return null;

  const currentCartItems = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.is_deleted, false)));

  const total = Math.max(
    currentCartItems.reduce((sum, item) => sum + Number(item.final_price) * item.quantity, 0) -
      (Number(currentCart.discount_total) || 0),
    0,
  );
  return total;
}

/**
 * Gets payment history for a user, with pagination and optional status filter.
 */
export async function getPaymentTransactionsHistory(
  userId: string,
  page: number,
  limit: number,
  status?: string,
) {
  const offset = (page - 1) * limit;

  const userOrdersSubquery = db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.user_id, userId));

  let whereClause = sql`${paymentTransactions.order_id} IN (${userOrdersSubquery})`;

  if (status) {
    const validStatuses = [
      'initiated',
      'authorized',
      'captured',
      'failed',
      'refund_initiated',
      'refunded',
      'partially_refunded',
    ];
    if (validStatuses.includes(status)) {
      whereClause = sql`${whereClause} AND ${paymentTransactions.status} = ${status}`;
    }
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(paymentTransactions)
    .where(whereClause);

  const total = countResult?.count || 0;

  const transactions = await db
    .select({
      id: paymentTransactions.id,
      order_id: paymentTransactions.order_id,
      order_number: orders.order_number,
      razorpay_order_id: paymentTransactions.razorpay_order_id,
      razorpay_payment_id: paymentTransactions.razorpay_payment_id,
      amount: paymentTransactions.amount,
      currency: paymentTransactions.currency,
      status: paymentTransactions.status,
      payment_method: paymentTransactions.payment_method,
      error_code: paymentTransactions.error_code,
      error_description: paymentTransactions.error_description,
      refund_id: paymentTransactions.refund_id,
      refund_amount: paymentTransactions.refund_amount,
      created_at: paymentTransactions.created_at,
      verified_at: paymentTransactions.verified_at,
    })
    .from(paymentTransactions)
    .innerJoin(orders, eq(paymentTransactions.order_id, orders.id))
    .where(whereClause)
    .orderBy(desc(paymentTransactions.created_at))
    .limit(limit)
    .offset(offset);

  return { transactions, total };
}

/**
 * Logs a webhook event, handling uniqueness.
 */
export async function logWebhookEvent(data: {
  event_id: string;
  event_type: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  raw_payload: IRazorpayWebhookEvent;
  signature_verified: boolean;
}) {
  const [inserted] = await db
    .insert(paymentWebhookLogs)
    .values(data)
    .onConflictDoUpdate({ target: paymentWebhookLogs.event_id, set: { received_at: new Date() } })
    .returning({ id: paymentWebhookLogs.id, processed: paymentWebhookLogs.processed });

  return inserted;
}

/**
 * Marks a webhook log as successfully processed.
 */
export async function markWebhookProcessed(logId: string) {
  await db
    .update(paymentWebhookLogs)
    .set({ processed: true, processed_at: new Date() })
    .where(eq(paymentWebhookLogs.id, logId));
}

/**
 * Marks a webhook log as failed in processing.
 */
export async function markWebhookProcessingError(logId: string, errorMsg: string) {
  await db
    .update(paymentWebhookLogs)
    .set({ processing_error: errorMsg, retry_count: 1 })
    .where(eq(paymentWebhookLogs.id, logId));
}

/**
 * Updates a transaction and order status to failed.
 */
export async function markPaymentFailed(
  transactionId: string,
  orderId: string,
  paymentId: string | null,
  errorReason: string,
) {
  await db.transaction(async (tx) => {
    await tx
      .update(paymentTransactions)
      .set({
        status: 'failed',
        razorpay_payment_id: paymentId,
        error_description: errorReason,
        updated_at: new Date(),
      })
      .where(eq(paymentTransactions.id, transactionId));
    await tx
      .update(orders)
      .set({
        last_payment_error: errorReason || 'Payment failed',
        updated_at: new Date(),
      })
      .where(and(eq(orders.id, orderId), eq(orders.payment_status, 'pending')));
  });
}

/**
 * Captures a payment, updating both transaction and order inside a DB transaction.
 * Also handles cart conversion if verifying from checkout.
 */
export async function capturePayment(
  transactionId: string,
  orderId: string,
  paymentId: string,
  signature: string | null,
  methodDetails: any,
  cartId: string | null,
  isWebhook: boolean,
) {
  const now = new Date();
  await db.transaction(async (tx) => {
    const txUpdateClause: any = {
      status: 'captured',
      razorpay_payment_id: paymentId,
      updated_at: now,
    };
    if (signature) txUpdateClause.razorpay_signature = signature;
    if (isWebhook) {
      txUpdateClause.webhook_verified = true;
      txUpdateClause.payment_method_details = methodDetails;
      txUpdateClause.verified_at = now;
      if (methodDetails?.method) txUpdateClause.payment_method = methodDetails.method;
    } else {
      txUpdateClause.verified_at = now;
    }

    await tx
      .update(paymentTransactions)
      .set(txUpdateClause)
      .where(
        isWebhook
          ? eq(paymentTransactions.id, transactionId)
          : and(
              eq(paymentTransactions.id, transactionId),
              inArray(paymentTransactions.status, ['initiated', 'failed']),
            ),
      );

    // Get order before updating to check previous payment status
    const [orderBefore] = await tx
      .select({ payment_status: orders.payment_status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    await tx
      .update(orders)
      .set({
        payment_status: 'paid',
        order_status: 'confirmed',
        transaction_id: paymentId,
        paid_at: now,
        last_payment_error: null,
        updated_at: now,
      })
      .where(
        isWebhook
          ? and(eq(orders.id, orderId), ne(orders.payment_status, 'refunded'))
          : and(eq(orders.id, orderId), inArray(orders.payment_status, ['pending', 'failed'])),
      );

    if (!isWebhook && cartId) {
      await tx
        .update(carts)
        .set({ cart_status: 'converted', updated_at: now })
        .where(eq(carts.id, cartId));
    }

    // Record sale (decrease available & committed, increase total_sold) when payment is confirmed
    if (orderBefore && orderBefore.payment_status !== 'paid') {
      try {
        const { recordSaleForOrder } = await import('../../inventory/services');
        await recordSaleForOrder(orderId, null, tx);
        logger.info(`Sale recorded for order ${orderId} after payment capture`);
      } catch (error: any) {
        logger.error(`Failed to record sale for order ${orderId}:`, error);
        // Throw error to rollback the entire transaction
        throw error;
      }
    }
  });
}

/**
 * Marks refund processed on a transaction and its order.
 */
export async function processRefundTransaction(
  transactionId: string,
  orderId: string,
  refundId: string,
  totalRefunded: number,
  isFullRefund: boolean,
  reason: string | null = null,
  adminId?: string,
) {
  const now = new Date();
  await db.transaction(async (tx) => {
    const txUpdate: any = {
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      refund_id: refundId,
      refund_amount: totalRefunded.toFixed(2),
      refunded_at: now,
      updated_at: now,
    };
    if (reason) txUpdate.refund_reason = reason;

    await tx
      .update(paymentTransactions)
      .set(txUpdate)
      .where(eq(paymentTransactions.id, transactionId));

    const orderUpdate: any = {
      payment_status: isFullRefund ? 'refunded' : 'paid',
      updated_at: now,
    };
    if (isFullRefund) orderUpdate.order_status = 'refunded';
    if (adminId) orderUpdate.updated_by = adminId;

    await tx.update(orders).set(orderUpdate).where(eq(orders.id, orderId));
  });
}

/**
 * Handle fail verification
 */
export async function failPaymentVerification(
  transactionId: string,
  orderId: string,
  paymentId: string,
) {
  await db.transaction(async (tx) => {
    await tx
      .update(paymentTransactions)
      .set({
        status: 'failed',
        error_code: 'INVALID_SIGNATURE',
        razorpay_payment_id: paymentId,
        updated_at: new Date(),
      })
      .where(eq(paymentTransactions.id, transactionId));
    await tx
      .update(orders)
      .set({ last_payment_error: 'Signature verification failed', updated_at: new Date() })
      .where(eq(orders.id, orderId));
  });
}

/**
 * Handle fail payment refund webhook
 */
export async function processFailedRefund(transactionId: string) {
  await db
    .update(paymentTransactions)
    .set({ error_description: 'Refund failed', updated_at: new Date() })
    .where(eq(paymentTransactions.id, transactionId));
}

/**
 * Generic update of payment transactions
 */
export async function updatePaymentTransaction(id: string, updates: any) {
  await db.update(paymentTransactions).set(updates).where(eq(paymentTransactions.id, id));
}

/**
 * Generic update of order
 */
export async function updateOrder(id: string, updates: any) {
  await db.update(orders).set(updates).where(eq(orders.id, id));
}

export const paymentsQueries = {
  getOrderByIdAndUser,
  getOrderById,
  getOrderByRazorpayOrderId,
  getUserContactInfo,
  createPaymentTransaction,
  getTransactionByOrderIdAndStatus,
  getTransactionsByOrderId,
  getTransactionByRazorpayOrderId,
  getTransactionByRazorpayPaymentId,
  getTransactionForWebhookByRazorpayOrderId,
  calculateActiveCartTotal,
  getPaymentTransactionsHistory,
  logWebhookEvent,
  markWebhookProcessed,
  markWebhookProcessingError,
  markPaymentFailed,
  capturePayment,
  processRefundTransaction,
  failPaymentVerification,
  processFailedRefund,
  updatePaymentTransaction,
  updateOrder,
};
