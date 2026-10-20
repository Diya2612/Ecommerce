/**
 * List Documents API
 * GET /api/chatbot/documents
 */

import { Router, Response, Request } from 'express';
import { requireAuth, requirePermission } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { paginationSchema } from '../../../utils/validation/common-schemas';
import { chatbotCacheService } from '../services/chatbot-cache.service';

/** Admin-only: Retrieves a paginated list of uploaded documentation. */
const handler = async (req: Request, res: Response) => {
  const { page, limit } = paginationSchema.parse(req.query);
  const { documents, total } = await chatbotCacheService.listDocuments(page, limit);

  ResponseFormatter.paginated(
    res,
    documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      status: doc.status,
      chunkCount: doc.chunk_count,
      errorMessage: doc.error_message,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    })),
    { page, limit, total },
    'Documents retrieved successfully',
  );
};

/** Admin-only: Returns aggregated counts and processing status metrics. */
const statsHandler = async (_req: Request, res: Response) => {
  const stats = await chatbotCacheService.getDocumentStats();
  ResponseFormatter.success(res, stats, 'Document statistics retrieved successfully');
};

const router = Router();
router.get('/documents', requireAuth, requirePermission('chatbot:documents'), handler);
router.get('/documents/stats', requireAuth, requirePermission('chatbot:documents'), statsHandler);

export default router;
