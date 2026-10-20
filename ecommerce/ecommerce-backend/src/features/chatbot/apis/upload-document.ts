/**
 * Upload Document API
 * POST /api/chatbot/documents
 */

import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { requireAuth, requirePermission, uploadSingleFileMiddleware } from '../../../middlewares';
import {
  ResponseFormatter,
  shortTextSchema,
  mediumTextSchema,
  HttpException,
  logger,
} from '../../../utils';
import { uploadToStorage } from '../../../utils/supabase/storage';
import {
  createDocument,
  updateDocumentStatus,
  updateDocumentProcessingResult,
} from '../shared/queries';
import {
  extractTextFromBuffer,
  isValidFileType,
  isValidFileSize,
} from '../services/document-processor.service';
import { chunkText } from '../services/chunker.service';
import { upsertDocumentVectors } from '../services/vector.service';
import { chatbotCacheService } from '../services/chatbot-cache.service';

const uploadMetadataSchema = z.object({
  name: shortTextSchema.optional(),
  description: mediumTextSchema.optional(),
});

/** Background task: Extracts text, chunks it, and updates the vector record. */
async function processDocument(
  documentId: number,
  buffer: Buffer,
  mimeType: string,
  documentName: string,
  userId: string,
): Promise<{ chunkCount: number }> {
  try {
    await updateDocumentStatus(documentId, 'processing', userId);
    const text = await extractTextFromBuffer(buffer, mimeType);

    if (!text?.trim()) throw new Error('No text content extracted');

    const { chunks } = chunkText(text);
    if (!chunks.length) throw new Error('No chunks created');

    await upsertDocumentVectors(chunks, documentId, documentName, mimeType);
    await updateDocumentProcessingResult(documentId, chunks.length, userId);
    await updateDocumentStatus(documentId, 'completed', userId);

    return { chunkCount: chunks.length };
  } catch (error) {
    logger.error(`❌ Document ${documentId} failed:`, error);
    await updateDocumentStatus(
      documentId,
      'failed',
      userId,
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

/** Admin-only: Uploads a document to storage and triggers background vectorization. */
const handler = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Unauthorized');

  const file = req.file;
  if (!file) throw new HttpException(400, 'No file uploaded');

  if (!isValidFileType(file.mimetype)) {
    throw new HttpException(400, `Invalid type: ${file.mimetype}`);
  }

  if (!isValidFileSize(file.size)) {
    throw new HttpException(400, 'File too large');
  }

  const metadata = uploadMetadataSchema.parse(req.body);
  const documentName = metadata.name || file.originalname;

  logger.info(`📤 Uploading: ${documentName}`);
  const uploadResult = await uploadToStorage(file.buffer, file.originalname, file.mimetype, userId);

  const document = await createDocument({
    name: documentName,
    description: metadata.description || null,
    file_url: uploadResult.url,
    file_path: uploadResult.key,
    file_size: file.size,
    mime_type: file.mimetype,
    status: 'pending',
    created_by: userId,
    updated_by: userId,
  });

  await chatbotCacheService.invalidateDocuments();

  // Background processing
  processDocument(document.id, file.buffer, file.mimetype, documentName, userId)
    .then(async () => {
      await chatbotCacheService.invalidateDocuments();
    })
    .catch(async () => {
      await chatbotCacheService.invalidateDocuments();
    });

  ResponseFormatter.created(
    res,
    {
      id: document.id,
      name: document.name,
      description: document.description,
      fileSize: document.file_size,
      mimeType: document.mime_type,
      status: document.status,
      createdAt: document.created_at,
    },
    'Document uploaded. Background training started.',
  );
};

const router = Router();
router.post(
  '/documents',
  requireAuth,
  requirePermission('chatbot:documents'),
  uploadSingleFileMiddleware,
  handler,
);

export default router;
