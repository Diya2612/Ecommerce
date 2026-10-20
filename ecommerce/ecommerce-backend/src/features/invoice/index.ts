import { Router } from 'express';
import Route from '../../interfaces/route.interface';

/**
 * Invoice Feature
 * Manages tax invoicing, PDF generation, and version control.
 */
class InvoiceRoute implements Route {
  public path = '/invoices';
  public router = Router();

  public async init() {
    const [
      { default: downloadInvoiceRouter },
      { default: getOrderInvoiceRouter },
      { default: getInvoicesForOrderRouter },
      { default: generateInvoiceRouter },
      { default: resendInvoiceEmailRouter },
    ] = await Promise.all([
      import('./apis/download-invoice'),
      import('./apis/get-order-invoice'),
      import('./apis/get-invoices-for-order'),
      import('./apis/generate-invoice'),
      import('./apis/resend-invoice-email'),
    ]);

    this.router.use(this.path, downloadInvoiceRouter);
    this.router.use('/', getOrderInvoiceRouter);
    this.router.use('/admin', getInvoicesForOrderRouter);
    this.router.use('/admin', generateInvoiceRouter);
    this.router.use('/admin', resendInvoiceEmailRouter);
  }
}

export default InvoiceRoute;
export { invoiceService, InvoiceService } from './services/invoice.service';
export * from './shared';
