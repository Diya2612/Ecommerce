import { Router, Response, Request, NextFunction } from 'express';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { invoiceService } from '../services/invoice.service';
import { generateInvoiceSchema } from '../shared/validation';

const handler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: orderId } = req.params as { id: string };
    const { force } = req.body;

    const invoice = await invoiceService.generateInvoice(orderId, {
      forceNewVersion: force === true,
    });

    ResponseFormatter.success(res, invoice, 'Invoice generated successfully');
  } catch (error) {
    next(error);
  }
};

const router = Router();

/** Triggers generation of a new invoice version. */
router.post(
  '/orders/:id/invoices',
  requireAuth,
  requirePermission('admin:system'),
  validationMiddleware(generateInvoiceSchema),
  handler,
);

export default router;
