/**
 * Order Payment Service
 * Handles payment-related operations including Razorpay integration
 */

import { db } from '../../../database';
import { logger } from '../../../utils';

class OrderPaymentService {
  /**
   * Create Razorpay payment order for an existing order
   *
   * @param orderId - Order ID to create payment for
   * @param paymentMethod - Payment method (razorpay/cod)
   * @param adminId - Admin user ID
   * @returns Razorpay order details and transaction record
   */
  async createPaymentOrder(orderId: string, paymentMethod: string, adminId: string) {
    const { findOrderById, updateOrder } = await import('../shared/queries');
    const { RazorpayService } = await import('../../payments/services/razorpay.service');
    const { PaymentLockService } = await import('../../payments/services/payment-lock.service');
    const { HttpException } = await import('../../../utils');
    const { paymentTransactions } =
      await import('../../payments/shared/payment-transactions.schema');
    // const { users } = await import('../../user/shared/user.schema');
    const { eq, and } = await import('drizzle-orm');

    // Get order
    const existingOrder = await findOrderById(orderId);
    if (!existingOrder) {
      throw new HttpException(404, 'Order not found');
    }

    if (existingOrder.payment_status === 'paid') {
      throw new HttpException(400, 'Order already paid');
    }

    // Acquire lock (30 second TTL)
    const lockAcquired = await PaymentLockService.acquireLock(orderId, 30);

    if (!lockAcquired) {
      throw new HttpException(
        409,
        'Payment order is being created by another admin. Please try again in a few seconds.',
      );
    }

    try {
      // Check for existing Razorpay order
      const existingTransaction = await db.query.paymentTransactions.findFirst({
        where: and(
          eq(paymentTransactions.order_id, orderId),
          eq(paymentTransactions.status, 'initiated'),
        ),
      });

      if (existingTransaction && existingTransaction.razorpay_order_id) {
        logger.info('[Admin Create Payment Order] Returning existing Razorpay order', {
          orderId,
          razorpayOrderId: existingTransaction.razorpay_order_id,
        });

        return {
          razorpay_order_id: existingTransaction.razorpay_order_id,
          razorpay_key_id: RazorpayService.getKeyId(),
          amount: Number(existingOrder.total_amount) * 100,
          currency: existingOrder.currency || 'INR',
          order_id: existingOrder.id,
          order_number: existingOrder.order_number,
          transaction: existingTransaction,
        };
      }

      // Create Razorpay order
      const razorpayOrder = await RazorpayService.createOrder({
        amount: Number(existingOrder.total_amount) * 100,
        currency: existingOrder.currency || 'INR',
        receipt: existingOrder.order_number,
        notes: {
          order_id: existingOrder.id,
          order_number: existingOrder.order_number,
          created_by: 'admin',
          admin_id: adminId,
        },
      });

      // Save transaction
      const transaction = await db
        .insert(paymentTransactions)
        .values({
          order_id: existingOrder.id,
          razorpay_order_id: razorpayOrder.id,
          amount: (Number(existingOrder.total_amount) * 100).toString(),
          currency: existingOrder.currency || 'INR',
          status: 'initiated',
          payment_method: paymentMethod,
        })
        .returning();

      const [transactionResult] = transaction;

      // Update order
      await updateOrder(orderId, { payment_method: paymentMethod, updated_by: adminId });

      logger.info('[Admin Create Payment Order] Created payment order', {
        orderId,
        razorpayOrderId: razorpayOrder.id,
      });

      return {
        razorpay_order_id: razorpayOrder.id,
        razorpay_key_id: RazorpayService.getKeyId(),
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: existingOrder.id,
        order_number: existingOrder.order_number,
        transaction: transactionResult,
      };
    } finally {
      await PaymentLockService.releaseLock(orderId);
    }
  }

  /**
   * Verify Razorpay payment and update order
   *
   * @param paymentData - Razorpay payment verification data
   * @param adminId - Admin user ID
   * @returns Verified order details
   */
  async verifyPayment(
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    adminId: string,
  ) {
    const {
      findOrderById,
      updatePaymentDetails,
      updateOrderStatus,
      updateOrder,
      markCartAsConverted,
    } = await import('../shared/queries');
    const { RazorpayService } = await import('../../payments/services/razorpay.service');
    const { HttpException } = await import('../../../utils');
    const { paymentTransactions } =
      await import('../../payments/shared/payment-transactions.schema');
    const { eq } = await import('drizzle-orm');

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    // Find transaction
    const transaction = await db.query.paymentTransactions.findFirst({
      where: eq(paymentTransactions.razorpay_order_id, razorpay_order_id),
    });

    if (!transaction) {
      throw new HttpException(404, 'Payment transaction not found');
    }

    const orderId = transaction.order_id;
    const order = await findOrderById(orderId);

    if (!order) {
      throw new HttpException(404, 'Order not found');
    }

    if (order.payment_status === 'paid') {
      return { order, message: 'Payment already verified' };
    }

    // Verify signature
    const isValid = RazorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      // Update transaction as failed
      await db
        .update(paymentTransactions)
        .set({
          status: 'failed',
          updated_at: new Date(),
        })
        .where(eq(paymentTransactions.id, transaction.id));

      throw new HttpException(400, 'Payment verification failed: Invalid signature');
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await RazorpayService.getPayment(razorpay_payment_id);

    // Update transaction
    const paymentMethod = (paymentDetails as any).method as string | null;
    await db
      .update(paymentTransactions)
      .set({
        razorpay_payment_id,
        razorpay_signature,
        status: 'captured',
        payment_method: paymentMethod || transaction.payment_method,
        updated_at: new Date(),
      })
      .where(eq(paymentTransactions.id, transaction.id));

    // Update order
    await updatePaymentDetails(orderId, {
      payment_status: 'paid',
      payment_ref: razorpay_payment_id,
      transaction_id: razorpay_payment_id,
      paid_at: new Date(),
    });

    // Update payment method separately
    await updateOrder(orderId, {
      payment_method: paymentMethod || transaction.payment_method,
      updated_by: adminId,
    });

    // Confirm order if pending
    if (order.order_status === 'pending') {
      await updateOrderStatus(orderId, 'confirmed', adminId);
    }

    // Mark cart as converted if not already
    if (order.cart_id && !order.is_draft) {
      await markCartAsConverted(order.cart_id, orderId);
    }

    // Record sale (move from committed to sold) - payment confirmed
    try {
      const { recordSaleForOrder } = await import('../../inventory/services');
      await recordSaleForOrder(orderId, adminId);
      logger.info(
        `[Admin Verify Payment] Sale recorded for order ${order.order_number} - moved from committed to sold`,
      );
    } catch (error: any) {
      logger.error('[Admin Verify Payment] Failed to record sale:', error);
    }

    logger.info('[Admin Verify Payment] Payment verified successfully', {
      orderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return { order: await findOrderById(orderId), message: 'Payment verified successfully' };
  }

  /**
   * Update order payment status
   *
   * @param orderId - Order ID
   * @param paymentData - Payment status data
   * @param userId - User ID performing the update
   * @returns Updated order
   */
  async updatePaymentStatus(
    orderId: string,
    paymentData: {
      payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded';
      paid_at?: string;
      transaction_id?: string;
      payment_ref?: string;
      notes?: string;
    },
    userId: string,
  ) {
    // Update order payment status
    const { findOrderById, updateOrder } = await import('../shared/queries');
    const { HttpException } = await import('../../../utils');
    const { eventPublisher } = await import('../../queue/services/event-publisher.service');
    const { TEMPLATE_CODES } = await import('../../notifications/shared/constants');
    const { recordSaleForOrder } = await import('../../inventory/services');

    // Check if order exists
    const existingOrder = await findOrderById(orderId);
    if (!existingOrder) {
      throw new HttpException(404, 'Order not found');
    }

    // Prepare update data
    const updateData: any = {
      payment_status: paymentData.payment_status,
      updated_at: new Date(),
      updated_by: userId,
    };

    // Set paid_at timestamp if status is paid and not already set
    if (paymentData.payment_status === 'paid' && !existingOrder.paid_at) {
      updateData.paid_at = paymentData.paid_at ? new Date(paymentData.paid_at) : new Date();
    }

    // Update transaction details if provided
    if (paymentData.transaction_id) {
      updateData.transaction_id = paymentData.transaction_id;
    }

    if (paymentData.payment_ref) {
      updateData.payment_ref = paymentData.payment_ref;
    }

    // Update payment note and admin comment
    if (paymentData.notes) {
      updateData.payment_note = paymentData.notes;

      // Append to admin comment for audit trail
      const existingComment = existingOrder.admin_comment || '';
      const timestamp = new Date().toISOString();
      updateData.admin_comment =
        `${existingComment}\n[${timestamp}] Payment update: ${paymentData.notes}`.trim();
    }

    // Update the order
    const updatedOrder = await updateOrder(orderId, updateData);
    if (!updatedOrder) {
      throw new HttpException(500, 'Failed to update order');
    }

    logger.info(`Payment status updated for order ${orderId}`, {
      old_status: existingOrder.payment_status,
      new_status: updatedOrder.payment_status,
      payment_note: paymentData.notes,
    });

    // Record sale when payment is confirmed (moves from committed to sold)
    if (paymentData.payment_status === 'paid' && existingOrder.payment_status !== 'paid') {
      setImmediate(async () => {
        try {
          await recordSaleForOrder(orderId, userId);
          logger.info(
            `[UpdatePayment] Sale recorded for order ${updatedOrder.order_number} - moved from committed to sold`,
          );
        } catch (error: any) {
          logger.error(`[UpdatePayment] Failed to record sale:`, error);
        }
      });
    }

    // Send payment confirmation notification if status is 'paid' (non-blocking)
    const userIdToNotify = updatedOrder.user_id;
    if (paymentData.payment_status === 'paid' && userIdToNotify) {
      setImmediate(async () => {
        try {
          await eventPublisher.publishNotification({
            userId: userIdToNotify,
            templateCode: TEMPLATE_CODES.ORDER_PAYMENT_CONFIRMED,
            variables: {
              orderNumber: updatedOrder.order_number,
              totalAmount: updatedOrder.total_amount,
              currency: updatedOrder.currency || 'INR',
              paymentMethod: updatedOrder.payment_method || 'Not specified',
              transactionId: paymentData.transaction_id || 'N/A',
            },
            options: {
              priority: 'high',
              actionUrl: `/profile/orders/${updatedOrder.id}`,
              actionText: 'View Order',
            },
          });
          logger.info(
            `[UpdatePayment] Payment confirmation notification queued for order ${updatedOrder.order_number}`,
          );
        } catch (error) {
          logger.error(`[UpdatePayment] Failed to queue payment notification:`, error);
        }
      });
    }

    return updatedOrder;
  }
}

export const orderPaymentService = new OrderPaymentService();
