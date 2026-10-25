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
    const arrayBuffer = await storageResult.blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', storageResult.contentType);
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoiceVersion.invoice_number}.pdf"`,
    );

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const router = Router();
router.get(
  '/:versionId/download',
  requireAuth,
  validationMiddleware(invoiceVersionParamsSchema, 'params'),
  handler,
);

export default router;
