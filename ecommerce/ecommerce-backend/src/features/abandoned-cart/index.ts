import { Router } from 'express';
import Route from '../../interfaces/route.interface';

/**
 * Abandoned Cart Feature Index
 */
class AbandonedCartRoute implements Route {
  public path = '';
  public router = Router();

  public async init() {
    const { default: getAbandonedCartsRouter } = await import('./apis/get-abandoned-carts');
    const { default: getAbandonedCartMetricsRouter } =
      await import('./apis/get-abandoned-cart-metrics');
    const { default: getAbandonedCartDetailsRouter } =
      await import('./apis/get-abandoned-cart-details');
    const { default: sendAbandonedCartEmailsRouter } =
      await import('./apis/send-abandoned-cart-emails');
    const { default: getEmailTemplatesRouter } = await import('./apis/get-email-templates');

    // Mount routes (the nested controllers already define their full path e.g. /admin/abandoned-carts, so use empty path here)
    this.router.use(this.path, getAbandonedCartMetricsRouter);
    this.router.use(this.path, getEmailTemplatesRouter);
    this.router.use(this.path, sendAbandonedCartEmailsRouter);
    this.router.use(this.path, getAbandonedCartDetailsRouter);
    this.router.use(this.path, getAbandonedCartsRouter);
  }
}

export default AbandonedCartRoute;
