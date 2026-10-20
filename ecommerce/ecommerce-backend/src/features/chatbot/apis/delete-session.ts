/**
 * Delete Session API
 * DELETE /api/chatbot/sessions/:id
 */

import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException, logger } from '../../../utils';
import { getSessionByIdForUser, deleteSession } from '../shared/queries';
import { chatbotCacheService } from '../services/chatbot-cache.service';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Deletes a chat session and its message history (verifies ownership). */
const handler = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Unauthorized');

  const { id } = paramsSchema.parse(req.params);
  const session = await getSessionByIdForUser(id, userId);
  if (!session) throw new HttpException(404, 'Session not found');

  await deleteSession(id, userId);
  await chatbotCacheService.invalidateUserSessions(userId);

  logger.info(`✅ Session ${id} deleted by ${userId}`);
  ResponseFormatter.noContent(res);
};

const router = Router();
router.delete('/sessions/:id', requireAuth, handler);

export default router;
