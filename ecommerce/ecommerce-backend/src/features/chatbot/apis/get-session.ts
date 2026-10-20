/**
 * Get Session API
 * GET /api/chatbot/sessions/:id
 */

import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { paginationSchema } from '../../../utils/validation/common-schemas';
import { getSessionByIdForUser, getSessionMessages } from '../shared/queries';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Retrieves a specific chat session with its paginated message history. */
const handler = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Unauthorized');

  const { id } = paramsSchema.parse(req.params);
  const { page, limit } = paginationSchema.parse(req.query);

  const session = await getSessionByIdForUser(id, userId);
  if (!session) throw new HttpException(404, 'Session not found');

  const { messages, total } = await getSessionMessages(id, page, limit);

  ResponseFormatter.success(
    res,
    {
      session: {
        id: session.id,
        title: session.title || 'New Chat',
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        sources: msg.sources,
        createdAt: msg.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    'Session retrieved successfully',
  );
};

const router = Router();
router.get('/sessions/:id', requireAuth, handler);

export default router;
