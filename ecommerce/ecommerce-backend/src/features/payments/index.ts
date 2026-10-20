import { Router } from 'express';
import Route from '../../interfaces/route.interface';

/**
 * Payments Feature
 */
class PaymentsRoute implements Route {
  public path = '/payments';
  public webhookPath = '/webhooks';
  public router = Router();

  public async init() {
    const { default: createPaymentOrderRouter } = await import('./apis/create-payment-order');
    const { default: verifyPaymentRouter } = await import('./apis/verify-payment');
    const { default: paymentStatusRouter } = await import('./apis/payment-status');
    const { default: retryPaymentRouter } = await import('./apis/retry-payment');
    const { default: initiateRefundRouter } = await import('./apis/initiate-refund');
    const { default: paymentHistoryRouter } = await import('./apis/payment-history');
    const { default: adminPaymentHistoryRouter } = await import('./apis/get-admin-payment-history');
    const { default: paymentKeyRouter } = await import('./apis/get-payment-key');
    const { default: razorpayWebhookHandler } = await import('./apis/webhook-handler');

    // Admin payment routes
    const { default: adminCreatePaymentOrderRouter } =
      await import('./apis/admin-create-payment-order');
    const { default: adminVerifyPaymentRouter } = await import('./apis/admin-verify-payment');

    // Standard payment routes
    this.router.use(this.path, paymentKeyRouter);
    this.router.use(this.path, createPaymentOrderRouter);
    this.router.use(this.path, verifyPaymentRouter);
    this.router.use(this.path, paymentStatusRouter);
    this.router.use(this.path, retryPaymentRouter);
    this.router.use(this.path, initiateRefundRouter);
    this.router.use(this.path, paymentHistoryRouter);
    this.router.use(this.path, paymentHistoryRouter);
    this.router.use(this.path, adminPaymentHistoryRouter);

    // Mount admin payment routes (paths are /admin/orders/...)
    // Since these handles start with /admin/orders/, we might want to mount them at the root level in the App,
    // or we mount them with an empty path since the API file itself defined '/admin/orders/create-payment-order'.
    // If we use `this.path` which is `/payments`, it will become `/payments/admin/orders/...` which is wrong.
    // Let's use `''` for these specific ones.
    this.router.use('', adminCreatePaymentOrderRouter);
    this.router.use('', adminVerifyPaymentRouter);

    // External webhook routes
    // Maintain /api/webhooks/razorpay path for Razorpay dashboard configuration
    this.router.use(`${this.webhookPath}/razorpay`, razorpayWebhookHandler);
  }
}

export default PaymentsRoute;
export * from './shared';
export { RazorpayService } from './services/razorpay.service';
export { PaymentLockService } from './services/payment-lock.service';
