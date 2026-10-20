/**
 * List Sessions API
 * GET /api/chatbot/sessions
 */

import { Router, Response, Request } from 'express';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { paginationSchema } from '../../../utils/validation/common-schemas';
import { chatbotCacheService } from '../services/chatbot-cache.service';

/** Retrieves a paginated list of chat sessions for the authenticated user. */
const handler = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Unauthorized');

  const { page, limit } = paginationSchema.parse(req.query);
  const { sessions, total } = await chatbotCacheService.listUserSessions(userId, page, limit);

  ResponseFormatter.paginated(
    res,
    sessions.map((session) => ({
      id: session.id,
      title: session.title || 'New Chat',
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    })),
    { page, limit, total },
    'Sessions retrieved successfully',
  );
};

const router = Router();
router.get('/sessions', requireAuth, handler);

export default router;
