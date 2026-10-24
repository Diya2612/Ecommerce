import { Router, Response, Request, NextFunction } from 'express';
import { requireAuth, requireAnyPermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { invoiceService } from '../services/invoice.service';
import { eventPublisher } from '../../queue/services/event-publisher.service';
import { invoiceVersionParamsSchema } from '../shared/validation';

const handler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { versionId } = req.params as { versionId: string };
    const invoiceData = await invoiceService.getValidatedVersion(versionId);

    if (!invoiceData.version.pdf_url) {
      throw new HttpException(400, 'Invoice PDF not generated yet');
    }

    await eventPublisher.publishEmailNotification({
      to: invoiceData.version.customer_email,
      subject: `Invoice #${invoiceData.invoice_number} (Resent)`,
      template: 'invoice_generated',
      templateData: {
        customerName: invoiceData.version.customer_name,
        orderNumber: invoiceData.order_id,
        invoiceNumber: invoiceData.invoice_number,
        date: new Date(invoiceData.version.created_at).toLocaleDateString(),
      },
      attachments: [
        {
          filename: `${invoiceData.invoice_number}.pdf`,
          path: invoiceData.version.pdf_url,
        },
      ],
      priority: 2,
    });

    ResponseFormatter.success(res, null, 'Invoice email resent successfully');
  } catch (error) {
    next(error);
  }
};

const router = Router();

/** Manually resends invoice email with PDF attachment. */
router.post(
  '/invoices/:versionId/email',
  requireAuth,
  requireAnyPermission(['admin:system', 'orders:update', 'orders:write', 'orders:read']),
  validationMiddleware(invoiceVersionParamsSchema, 'params'),
  handler,
);

export default router;
