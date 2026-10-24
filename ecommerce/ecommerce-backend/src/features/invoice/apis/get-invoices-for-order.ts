import { Router, Response, Request, NextFunction } from 'express';
import { requireAuth, requireAnyPermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { invoiceService } from '../services/invoice.service';
import { orderInvoiceParamsSchema } from '../shared/validation';

const handler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: orderId } = req.params as { id: string };
    const invoices = await invoiceService.getInvoicesForOrder(orderId);
    ResponseFormatter.success(res, invoices, 'Invoices retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const router = Router();

/** Lists all invoices and versions for an order. */
router.get(
  '/orders/:id/invoices',
  requireAuth,
  requireAnyPermission(['admin:system', 'orders:read', 'orders:update']),
  validationMiddleware(orderInvoiceParamsSchema),
  handler,
);

export default router;
