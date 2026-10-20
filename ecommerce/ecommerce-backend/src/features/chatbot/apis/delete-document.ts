/**
 * Delete Document API
 * DELETE /api/chatbot/documents/:id
 */

import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../../../middlewares';
import { ResponseFormatter, HttpException, logger } from '../../../utils';
import { getDocumentById, deleteDocument } from '../shared/queries';
import { deleteDocumentVectors } from '../services/vector.service';
import { chatbotCacheService } from '../services/chatbot-cache.service';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Admin-only: Deletes a document record and its associated vector embeddings. */
const handler = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Unauthorized');

  const { id } = paramsSchema.parse(req.params);
  const document = await getDocumentById(id);
  if (!document) throw new HttpException(404, 'Document not found');

  if (document.status === 'completed' && (document.chunk_count || 0) > 0) {
    try {
      await deleteDocumentVectors(id);
    } catch (error) {
      logger.error(`⚠️ Vector deletion failed for ${id}:`, error);
    }
  }

  await deleteDocument(id, userId);
  await chatbotCacheService.invalidateDocuments();

  logger.info(`✅ Document ${id} deleted by ${userId}`);
  ResponseFormatter.noContent(res);
};

const router = Router();
router.delete('/documents/:id', requireAuth, requirePermission('chatbot:documents'), handler);

export default router;
