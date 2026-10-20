import { Router, Response, Request, NextFunction } from 'express';
import { requireAuth, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { HttpException, logger } from '../../../utils';
import { invoiceService } from '../services/invoice.service';
import { invoiceQueries } from '../shared';
import { orderInvoiceParamsSchema } from '../shared/validation';

/** Fetches the latest invoice or triggers lazy generation for paid orders. */
const handler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: orderId } = req.params as { id: string };
    let invoiceData;

    try {
      invoiceData = await invoiceService.getLatestInvoiceForOrder(orderId);
    } catch (error) {
      if (error instanceof HttpException && error.status === 404) {
        invoiceData = null;
      } else {
        throw error;
      }
    }

    if (!invoiceData) {
      const order = await invoiceQueries.getOrderById(orderId);

      if (order?.payment_status === 'paid') {
        logger.info('Lazy triggering invoice generation for paid order', { orderId });
        invoiceData = await invoiceService.generateInvoice(orderId);
      } else {
        throw new HttpException(404, 'Invoice not found');
      }
    }

    ResponseFormatter.success(res, invoiceData, 'Invoice retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const router = Router();
router.get(
  '/orders/:id/invoices/latest',
  requireAuth,
  validationMiddleware(orderInvoiceParamsSchema),
  handler,
);

export default router;
