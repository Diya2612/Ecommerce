import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../../../utils/config/validate-env';
import { logger } from '../../../utils';
import { HttpException } from '../../../utils';

interface CreateOrderOptions {
  amount: number; // In paise (₹100 = 10000)
  currency?: string;
  receipt: string; // Order ID reference
  notes?: Record<string, string>;
}

interface RazorpayOrderResponse {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

interface CreateRefundOptions {
  amount?: number; // Optional partial refund in paise
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
  receipt?: string;
}

interface RazorpayRefundResponse {
  id: string;
  entity: 'refund';
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  status: 'pending' | 'processed' | 'failed';
  speed_requested: 'normal' | 'optimum';
  speed_processed?: 'normal' | 'optimum' | 'instant';
  created_at: number;
}

/**
 * Orchestrates Razorpay operations including order creation, signature
 * verification, and refund management with timing-safe auditing.
 */
class RazorpayServiceClass {
  private razorpay: Razorpay;
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = config.RAZORPAY_KEY_ID;
    this.keySecret = config.RAZORPAY_KEY_SECRET;
    this.webhookSecret = config.RAZORPAY_WEBHOOK_SECRET;

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });

    logger.info('RazorpayService initialized', {
      keyIdPrefix: this.keyId.substring(0, 12) + '...',
      isTestMode: this.isTestMode(),
    });
  }

  getKeyId(): string {
    return this.keyId;
  }

  isTestMode(): boolean {
    return this.keyId.startsWith('rzp_test');
  }

  /** Creates a payment order on Razorpay. */
  async createOrder(options: CreateOrderOptions): Promise<RazorpayOrderResponse> {
    try {
      const order = await this.razorpay.orders.create({
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes || {},
      });

      logger.info('Razorpay order created', { orderId: order.id, receipt: order.receipt });
      return order as RazorpayOrderResponse;
    } catch (error) {
      logger.error('Failed to create Razorpay order', { error, receipt: options.receipt });
      throw new HttpException(500, 'Failed to create payment order.');
    }
  }

  /** Fetches status and details of an existing Razorpay order. */
  async getOrder(orderId: string): Promise<RazorpayOrderResponse> {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order as RazorpayOrderResponse;
    } catch (error) {
      logger.error('Failed to fetch Razorpay order', { orderId, error });
      throw new HttpException(500, 'Failed to fetch payment order.');
    }
  }

  /** Retrieves full payment details from Razorpay by identity ID. */
  async getPayment(paymentId: string): Promise<Record<string, unknown>> {
    try {
      return (await this.razorpay.payments.fetch(paymentId)) as unknown as Record<string, unknown>;
    } catch (error) {
      logger.error('Failed to fetch payment', { paymentId, error });
      throw new HttpException(500, 'Failed to fetch payment details.');
    }
  }

  /** Initiates a full or partial refund for a captured payment. */
  async createRefund(
    paymentId: string,
    options?: CreateRefundOptions,
  ): Promise<RazorpayRefundResponse> {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: options?.amount,
        speed: options?.speed || 'normal',
        notes: options?.notes || {},
        receipt: options?.receipt,
      });

      logger.info('Razorpay refund created', { refundId: refund.id, status: refund.status });
      return refund as RazorpayRefundResponse;
    } catch (error) {
      logger.error('Failed to create refund', { paymentId, error });
      throw new HttpException(500, 'Failed to process refund.');
    }
  }

  /** Retrieves refund details including processing speed and status. */
  async getRefund(paymentId: string, refundId: string): Promise<RazorpayRefundResponse> {
    try {
      return (await this.razorpay.payments.fetchRefund(
        paymentId,
        refundId,
      )) as RazorpayRefundResponse;
    } catch (error) {
      logger.error('Failed to fetch refund', { paymentId, refundId, error });
      throw new HttpException(500, 'Failed to fetch refund details.');
    }
  }

  /**
   * Validates checkout callback signature using timing-safe comparison.
   * prevents timing attacks on signature verification.
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!orderId || !paymentId || !signature) return false;

    try {
      const message = `${orderId}|${paymentId}`;
      const expected = crypto.createHmac('sha256', this.keySecret).update(message).digest('hex');

      return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
    } catch (error) {
      logger.warn('Payment signature verification error', { orderId, paymentId, error });
      return false;
    }
  }

  /** Validates refund request signature. */
  verifyRefundSignature(paymentId: string, refundId: string, signature: string): boolean {
    if (!paymentId || !refundId || !signature) return false;

    try {
      const message = `${paymentId}|${refundId}`;
      const expected = crypto.createHmac('sha256', this.keySecret).update(message).digest('hex');

      return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
      return false;
    }
  }

  /** Validates incoming webhook signature using the raw request body. */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!rawBody || !signature) return false;

    try {
      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
    } catch (error) {
      logger.warn('Webhook signature verification error', { error });
      return false;
    }
  }
}

export const RazorpayService = new RazorpayServiceClass();
export { RazorpayServiceClass };
