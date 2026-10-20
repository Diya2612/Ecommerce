import { Router, Response, Request, NextFunction } from 'express';
import { requireAuth, validationMiddleware } from '../../../middlewares';
import { HttpException } from '../../../utils';
import { downloadFromStorage } from '../../../utils/supabase/storage';
import { invoiceService } from '../services/invoice.service';
import { invoiceVersionParamsSchema } from '../shared/validation';

/** Streams invoice PDF from storage to the client. */
const handler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { versionId } = req.params as { versionId: string };
    const { version: invoiceVersion } = await invoiceService.getValidatedVersion(versionId);

    if (!invoiceVersion.pdf_path) {
      throw new HttpException(404, 'PDF not generated for this invoice version');
    }

    const storageResult = await downloadFromStorage(invoiceVersion.pdf_path);

    res.setHeader('Content-Type', storageResult.contentType);
    res.setHeader('Content-Length', storageResult.contentLength.toString());
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoiceVersion.invoice_number}.pdf"`,
    );

    res.send(storageResult.blob);
  } catch (error) {
    next(error);
  }
};

const router = Router();
router.get(
  '/:versionId/download',
  requireAuth,
  validationMiddleware(invoiceVersionParamsSchema),
  handler,
);

export default router;
