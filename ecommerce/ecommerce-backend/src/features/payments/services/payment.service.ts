/* eslint-disable @typescript-eslint/no-extraneous-class */
import { HttpException, logger } from '../../../utils';
import { RazorpayService } from './razorpay.service';
import { PaymentLockService } from './payment-lock.service';
import { paymentsQueries } from '../shared/queries';
import { eventPublisher } from '../../queue/services/event-publisher.service';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  InitiateRefundDto,
  RetryPaymentDto,
} from '../shared/validation';
import {
  IRazorpayWebhookEvent,
  IRazorpayPaymentEntity,
  IRazorpayRefundEntity,
} from '../shared/interface';

const MAX_PAYMENT_ATTEMPTS = 5;

const SUPPORTED_EVENTS = [
  'payment.authorized',
  'payment.captured',
  'payment.failed',
  'refund.processed',
  'refund.failed',
  'order.paid',
] as const;
type SupportedEvent = (typeof SUPPORTED_EVENTS)[number];

export class PaymentService {
  private constructor() {}
  /**
   * Creates a Razorpay order or handles COD
   */
  static async createPaymentOrder(userId: string, body: CreatePaymentOrderDto) {
    if (body.payment_method === 'cod') {
      return this.handleCodPayment(body.order_id, userId);
    }

    return await PaymentLockService.withLock(body.order_id, async () => {
      const order = await paymentsQueries.getOrderByIdAndUser(body.order_id, userId);
      if (!order) throw new HttpException(404, 'Order not found', 'ORDER_NOT_FOUND');
      if (order.payment_status === 'paid')
        throw new HttpException(
          400,
          `Order ${order.order_number} is already paid`,
          'ORDER_ALREADY_PAID',
        );
      if (order.order_status === 'cancelled')
        throw new HttpException(
          400,
          'Cannot process payment for cancelled order',
          'ORDER_CANCELLED',
        );

      const existingTransaction = await paymentsQueries.getTransactionByOrderIdAndStatus(
        body.order_id,
        'initiated',
      );

      if (existingTransaction) {
        const ageMinutes =
          (Date.now() - new Date(existingTransaction.created_at).getTime()) / 60000;
        const amountMatches =
          Math.abs(Number(existingTransaction.amount) - Number(order.total_amount)) < 0.01;

        if (ageMinutes < 25 && amountMatches) {
          logger.info('Reusing existing Razorpay order', { orderId: body.order_id });
          const user = await paymentsQueries.getUserContactInfo(userId);
          return this.buildPaymentResponse(order, existingTransaction.razorpay_order_id, user);
        }

        await paymentsQueries.updatePaymentTransaction(existingTransaction.id, {
          status: 'failed',
          error_description: amountMatches ? 'Payment order expired' : 'Amount changed, creating new order',
          updated_at: new Date(),
        });
      }

      const razorpayOrder = await RazorpayService.createOrder({
        amount: Math.round(Number(order.total_amount) * 100),
        currency: order.currency,
        receipt: order.id,
        notes: { order_id: order.id, order_number: order.order_number, user_id: userId },
      });

      await paymentsQueries.createPaymentTransaction({
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: String(order.total_amount),
        currency: order.currency,
        status: 'initiated',
        idempotency_key: `create_${order.id}_${Date.now()}`,
      });

      await paymentsQueries.updateOrder(order.id, {
        razorpay_order_id: razorpayOrder.id,
        payment_method: 'razorpay',
        payment_attempts: (order.payment_attempts || 0) + 1,
        updated_at: new Date(),
      });

      const user = await paymentsQueries.getUserContactInfo(userId);
      return this.buildPaymentResponse(order, razorpayOrder.id, user);
    });
  }

  private static async handleCodPayment(orderId: string, userId: string) {
    const order = await paymentsQueries.getOrderByIdAndUser(orderId, userId);
    if (!order) throw new HttpException(404, 'Order not found');
    if (order.payment_status === 'paid') throw new HttpException(400, 'Order is already paid');

    await paymentsQueries.updateOrder(orderId, {
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'confirmed',
      updated_at: new Date(),
    });

    logger.info('COD order confirmed', { orderId, orderNumber: order.order_number });

    return {
      order_id: order.id,
      order_number: order.order_number,
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'confirmed',
      total_amount: Number(order.total_amount),
    };
  }

  private static buildPaymentResponse(order: any, razorpayOrderId: string, user?: any) {
    return {
      razorpay_order_id: razorpayOrderId,
      razorpay_key_id: RazorpayService.getKeyId(),
      amount: Math.round(Number(order.total_amount) * 100),
      currency: order.currency,
      order_id: order.id,
      order_number: order.order_number,
      prefill: {
        name: user?.name || undefined,
        email: user?.email || undefined,
        contact: user?.phone || undefined,
      },
      notes: { order_id: order.id, order_number: order.order_number },
      theme: { color: '#0066FF' },
    };
  }

  /**
   * Retries a payment
   */
  static async retryPayment(userId: string, body: RetryPaymentDto) {
    return await PaymentLockService.withLock(body.order_id, async () => {
      const order = await paymentsQueries.getOrderByIdAndUser(body.order_id, userId);
      if (!order) throw new HttpException(404, 'Order not found');
      if (order.payment_status === 'paid')
        throw new HttpException(400, 'Order is already paid', { code: 'ORDER_ALREADY_PAID' });
      if (order.payment_attempts >= MAX_PAYMENT_ATTEMPTS)
        throw new HttpException(400, 'Retry limit exceeded', { code: 'MAX_RETRIES_EXCEEDED' });

      const orderAge = Date.now() - order.created_at.getTime();
      if (orderAge > 7 * 24 * 60 * 60 * 1000)
        throw new HttpException(400, 'Order expired', { code: 'ORDER_EXPIRED' });

      if (order.cart_id) {
        const currentGrandTotal = await paymentsQueries.calculateActiveCartTotal(order.cart_id);
        if (
          currentGrandTotal !== null &&
          Math.abs(currentGrandTotal - Number(order.total_amount)) > 0.01
        ) {
          throw new HttpException(400, 'Cart modified. Create new order.', 'CART_MODIFIED');
        }
      }

      const initiatedTx = await paymentsQueries.getTransactionByOrderIdAndStatus(
        body.order_id,
        'initiated',
      );
      if (initiatedTx) {
        await paymentsQueries.updatePaymentTransaction(initiatedTx.id, {
          status: 'failed',
          error_description: 'Superseded by retry',
          updated_at: new Date(),
        });
      }

      const razorpayOrder = await RazorpayService.createOrder({
        amount: Math.round(Number(order.total_amount) * 100),
        currency: order.currency,
        receipt: order.id,
        notes: {
          order_id: order.id,
          order_number: order.order_number,
          user_id: userId,
          retry: 'true',
        },
      });

      await paymentsQueries.createPaymentTransaction({
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: String(order.total_amount),
        currency: order.currency,
        status: 'initiated',
        idempotency_key: `retry_${order.id}_${Date.now()}`,
      });

      const newAttempts = (order.payment_attempts || 0) + 1;
      await paymentsQueries.updateOrder(order.id, {
        razorpay_order_id: razorpayOrder.id,
        payment_attempts: newAttempts,
        last_payment_error: null,
        updated_at: new Date(),
      });

      const user = await paymentsQueries.getUserContactInfo(userId);
      return {
        ...this.buildPaymentResponse(order, razorpayOrder.id, user),
        attempt: newAttempts,
        max_attempts: MAX_PAYMENT_ATTEMPTS,
      };
    });
  }

  /**
   * Verifies a checkout payment signature
   */
  static async verifyPayment(userId: string, body: VerifyPaymentDto) {
    const transaction = await paymentsQueries.getTransactionByRazorpayOrderId(
      body.razorpay_order_id,
    );
    if (!transaction) throw new HttpException(404, 'Payment not found', 'PAYMENT_NOT_FOUND');

    const order = await paymentsQueries.getOrderByIdAndUser(transaction.order_id, userId);
    if (!order) throw new HttpException(404, 'Order not found');

    const lockKey = `payment:verify:${transaction.id}`;
    const lockAcquired = await PaymentLockService.acquireLock(lockKey);
    if (!lockAcquired) throw new HttpException(409, 'Payment verification already in progress');

    try {
      if (transaction.status === 'captured' || transaction.webhook_verified) {
        return {
          order_id: order.id,
          order_number: order.order_number,
          payment_status: order.payment_status,
          transaction_id: transaction.razorpay_payment_id,
          paid_at: transaction.verified_at?.toISOString() || order.paid_at?.toISOString() || null,
          amount_paid: Number(order.total_amount),
          confirmation_source: 'webhook',
        };
      }

      if (
        !RazorpayService.verifyPaymentSignature(
          body.razorpay_order_id,
          body.razorpay_payment_id,
          body.razorpay_signature,
        )
      ) {
        await paymentsQueries.failPaymentVerification(
          transaction.id,
          order.id,
          body.razorpay_payment_id,
        );
        throw new HttpException(400, 'Payment verification failed', 'INVALID_SIGNATURE');
      }

      try {
        const rpPayment = await RazorpayService.getPayment(body.razorpay_payment_id);
        if (Number(rpPayment.amount) !== Math.round(Number(order.total_amount) * 100)) {
          throw new HttpException(400, 'Payment amount mismatch', 'AMOUNT_MISMATCH');
        }
      } catch (error: any) {
        if (error.status === 400) throw error;
        logger.warn('Amount validation skipped due to Razorpay API error', {
          error: error.message,
        });
      }

      await paymentsQueries.capturePayment(
        transaction.id,
        order.id,
        body.razorpay_payment_id,
        body.razorpay_signature,
        null, // methodDetails
        order.cart_id,
        false, // isWebhook
      );

      if (order.discount_code && order.discount_id) {
        // Run discount recording asynchronously
        void (async () => {
          try {
            const { discountCodeService } = await import('../../discount/services');
            await discountCodeService.recordUsage({
              discount_id: order.discount_id as string,
              discount_code: order.discount_code as string,
              user_id: userId,
              order_id: order.id,
              order_number: order.order_number,
              discount_type: order.discount_type || 'unknown',
              discount_amount: Number(order.discount_amount),
              order_subtotal: Number(order.subtotal),
              order_total: Number(order.total_amount),
              items_count: order.total_quantity,
            });
          } catch (error) {
            logger.error('Discount usage recording failed', { error });
          }
        })();
      }

      return {
        order_id: order.id,
        order_number: order.order_number,
        payment_status: 'paid',
        transaction_id: body.razorpay_payment_id,
        paid_at: new Date().toISOString(),
        amount_paid: Number(order.total_amount),
        confirmation_source: 'client',
      };
    } finally {
      await PaymentLockService.releaseLock(lockKey);
    }
  }

  /**
   * Initiates order refund (Admin only)
   */
  static async initiateRefund(adminId: string, body: InitiateRefundDto) {
    const order = await paymentsQueries.getOrderById(body.order_id);
    if (!order) throw new HttpException(404, 'Order not found');
    if (order.payment_status !== 'paid')
      throw new HttpException(400, 'Only paid orders can be refunded', {
        code: 'REFUND_NOT_ALLOWED',
      });
    if (!order.transaction_id)
      throw new HttpException(400, 'No transaction ID found', { code: 'REFUND_NOT_ALLOWED' });

    const transaction = await paymentsQueries.getTransactionByRazorpayPaymentId(
      order.transaction_id,
    );
    if (!transaction)
      throw new HttpException(400, 'Payment transaction not found', { code: 'REFUND_NOT_ALLOWED' });

    const paidAmount = Number(order.total_amount);
    const previousRefunds = Number(transaction.refund_amount || 0);
    const refundableAmount = paidAmount - previousRefunds;
    const refundAmount = body.amount || refundableAmount;

    if (refundAmount > refundableAmount) {
      throw new HttpException(400, 'Refund amount exceeds balance', {
        code: 'REFUND_AMOUNT_EXCEEDED',
      });
    }

    const refund = await RazorpayService.createRefund(order.transaction_id, {
      amount: Math.round(refundAmount * 100),
      speed: body.refund_speed,
      notes: {
        order_id: order.id,
        order_number: order.order_number,
        reason: body.reason,
        initiated_by: adminId,
      },
    });

    const totalRefunded = previousRefunds + refundAmount;
    const isFullRefund = totalRefunded >= paidAmount;

    await paymentsQueries.processRefundTransaction(
      transaction.id,
      order.id,
      refund.id,
      totalRefunded,
      isFullRefund,
      body.reason,
      adminId,
    );

    logger.info('Refund initiated', {
      orderId: order.id,
      refundId: refund.id,
      amount: refundAmount,
    });

    return {
      refund_id: refund.id,
      payment_id: order.transaction_id,
      amount: refundAmount,
      status: refund.status,
      is_full_refund: isFullRefund,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Retrieves payment status and transactions history for an order
   */
  static async getPaymentStatus(userId: string, orderId: string) {
    const order = await paymentsQueries.getOrderByIdAndUser(orderId, userId);
    if (!order) throw new HttpException(404, 'Order not found');

    const transactions = await paymentsQueries.getTransactionsByOrderId(orderId);

    return {
      order_id: order.id,
      order_number: order.order_number,
      payment_status: order.payment_status,
      order_status: order.order_status,
      total_amount: Number(order.total_amount),
      currency: order.currency,
      payment_method: order.payment_method,
      razorpay_order_id: order.razorpay_order_id,
      payment_attempts: order.payment_attempts,
      last_payment_error: order.last_payment_error,
      paid_at: order.paid_at?.toISOString(),
      transactions: transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
        created_at: tx.created_at.toISOString(),
      })),
    };
  }

  /**
   * Processes a Razorpay webhook event asynchronously
   */
  static async processWebhook(rawBody: string, signature: string, event: IRazorpayWebhookEvent) {
    const eventType = event.event as SupportedEvent;
    const razorpayOrderId =
      event.payload?.payment?.entity?.order_id || event.payload?.order?.entity?.id;
    const razorpayPaymentId =
      event.payload?.payment?.entity?.id || event.payload?.refund?.entity?.payment_id;
    const eventIdentifier = `${razorpayPaymentId || razorpayOrderId}_${eventType}`;

    const isValid = RazorpayService.verifyWebhookSignature(rawBody, signature);

    const webhookLog = await paymentsQueries.logWebhookEvent({
      event_id: eventIdentifier,
      event_type: eventType,
      razorpay_order_id: razorpayOrderId || null,
      razorpay_payment_id: razorpayPaymentId || null,
      raw_payload: event,
      signature_verified: isValid,
    });

    if (webhookLog?.processed) return { status: 'already_processed' };
    if (!isValid) throw new Error('Invalid signature');
    if (!SUPPORTED_EVENTS.includes(eventType)) return { status: 'ignored' };

    try {
      switch (eventType) {
        case 'payment.captured':
          if (event.payload.payment) await this.handlePaymentCaptured(event.payload.payment.entity);
          break;
        case 'payment.authorized':
          if (event.payload.payment)
            await this.handlePaymentAuthorized(event.payload.payment.entity);
          break;
        case 'payment.failed':
          if (event.payload.payment) await this.handlePaymentFailed(event.payload.payment.entity);
          break;
        case 'refund.processed':
          if (event.payload.refund) await this.handleRefundProcessed(event.payload.refund.entity);
          break;
        case 'refund.failed':
          if (event.payload.refund) await this.handleRefundFailed(event.payload.refund.entity);
          break;
        case 'order.paid':
          if (event.payload.order) await this.handleOrderPaid(event.payload.order.entity as any);
          break;
      }

      if (webhookLog?.id) {
        await paymentsQueries.markWebhookProcessed(webhookLog.id);
      }
      return { status: 'success' };
    } catch (error: any) {
      if (webhookLog?.id) {
        await paymentsQueries.markWebhookProcessingError(webhookLog.id, error.message);
      }
      throw error;
    }
  }

  private static async handlePaymentCaptured(payment: IRazorpayPaymentEntity) {
    const { id: paymentId, order_id: razorpayOrderId, amount } = payment;
    const transaction =
      await paymentsQueries.getTransactionForWebhookByRazorpayOrderId(razorpayOrderId);

    if (!transaction || (transaction.status === 'captured' && transaction.webhook_verified)) return;

    if (amount !== Math.round(Number(transaction.amount) * 100)) {
      await paymentsQueries.updatePaymentTransaction(transaction.id, {
        status: 'failed',
        error_code: 'AMOUNT_MISMATCH',
        webhook_verified: true,
        updated_at: new Date(),
      });
      return;
    }

    const methodDetails = this.extractPaymentMethodDetails(payment);

    await paymentsQueries.capturePayment(
      transaction.id,
      transaction.order_id,
      paymentId,
      null, // signature unknown inside webhook payload
      methodDetails,
      null, // don't deal with carts from webhook
      true, // isWebhook
    );

    await eventPublisher.publishGenerateInvoice({
      orderId: transaction.order_id,
      reason: 'INITIAL',
      triggeredBy: 'system',
    });
  }

  private static async handlePaymentAuthorized(payment: IRazorpayPaymentEntity) {
    const { id: paymentId, order_id: razorpayOrderId } = payment;
    const transaction =
      await paymentsQueries.getTransactionForWebhookByRazorpayOrderId(razorpayOrderId);
    if (!transaction || ['captured', 'refunded'].includes(transaction.status)) return;

    await paymentsQueries.updatePaymentTransaction(transaction.id, {
      status: 'captured',
      razorpay_payment_id: paymentId,
      updated_at: new Date(),
    });

    // We update order separately here just like original code
    await paymentsQueries.updateOrder(transaction.order_id, {
      payment_status: 'paid',
      updated_at: new Date(),
    });

    // Record sale (move from committed to sold) after payment authorized
    try {
      const { recordSaleForOrder } = await import('../../inventory/services');
      await recordSaleForOrder(transaction.order_id, null);
      logger.info(`Sale recorded for order ${transaction.order_id} via payment.authorized webhook`);
    } catch (error: any) {
      logger.error(`Failed to record sale for order ${transaction.order_id}:`, error);
    }
  }

  private static async handlePaymentFailed(payment: IRazorpayPaymentEntity) {
    const { id: paymentId, order_id: razorpayOrderId, error_description, error_reason } = payment;
    const transaction =
      await paymentsQueries.getTransactionForWebhookByRazorpayOrderId(razorpayOrderId);
    if (!transaction || ['captured', 'refunded'].includes(transaction.status)) return;

    await paymentsQueries.markPaymentFailed(
      transaction.id,
      transaction.order_id,
      paymentId,
      error_description || error_reason || 'Payment failed',
    );
  }

  private static async handleRefundProcessed(refund: IRazorpayRefundEntity) {
    const { id: refundId, payment_id: paymentId, amount } = refund;
    const transaction = await paymentsQueries.getTransactionByRazorpayPaymentId(paymentId);
    if (!transaction) return;

    const totalRefunded = Number(transaction.refund_amount || 0) + amount / 100;
    const isFullRefund = totalRefunded >= Number(transaction.amount);

    await paymentsQueries.processRefundTransaction(
      transaction.id,
      transaction.order_id,
      refundId,
      totalRefunded,
      isFullRefund,
    );
  }

  private static async handleRefundFailed(refund: IRazorpayRefundEntity) {
    const transaction = await paymentsQueries.getTransactionByRazorpayPaymentId(refund.payment_id);
    if (transaction) {
      await paymentsQueries.processFailedRefund(transaction.id);
    }
  }

  private static async handleOrderPaid(order: { id: string; amount_paid: number; status: string }) {
    const dbOrder = await paymentsQueries.getOrderByRazorpayOrderId(order.id);
    if (dbOrder && dbOrder.payment_status !== 'paid' && dbOrder.payment_status !== 'refunded') {
      await paymentsQueries.updateOrder(dbOrder.id, {
        payment_status: 'paid',
        order_status: 'confirmed',
        paid_at: new Date(),
        updated_at: new Date(),
      });
      await eventPublisher.publishGenerateInvoice({
        orderId: dbOrder.id,
        reason: 'INITIAL',
        triggeredBy: 'system',
      });

      // Record sale (move from committed to sold) after order.paid webhook
      try {
        const { recordSaleForOrder } = await import('../../inventory/services');
        await recordSaleForOrder(dbOrder.id, null);
        logger.info(`Sale recorded for order ${dbOrder.id} via order.paid webhook`);
      } catch (error: any) {
        logger.error(`Failed to record sale for order ${dbOrder.id}:`, error);
      }
    }
  }

  private static extractPaymentMethodDetails(
    payment: IRazorpayPaymentEntity,
  ): Record<string, unknown> {
    const { method, card, vpa, bank, wallet } = payment;
    if (method === 'card')
      return {
        card_id: card?.id,
        network: card?.network,
        last4: card?.last4,
        issuer: card?.issuer,
        type: card?.type,
      };
    if (method === 'upi') return { vpa };
    if (method === 'netbanking') return { bank_code: bank };
    if (method === 'wallet') return { wallet };
    return { method };
  }
}
