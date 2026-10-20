/**
 * Send Message API
 * POST /api/chatbot/chat
 */

import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { requireAuth, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter, longTextSchema, HttpException } from '../../../utils';
import {
  createSession,
  getSessionByIdForUser,
  updateSessionTimestamp,
  updateSessionTitle,
  createMessage,
  getRecentMessages,
} from '../shared/queries';
import { generateChatResponse, generateSessionTitle } from '../services/chat.service';
import { chatbotCacheService } from '../services/chatbot-cache.service';

const sendMessageSchema = z.object({
  message: longTextSchema,
  sessionId: z.number().int().positive().optional(),
});

/** Processes a user message, generates an AI response, and manages session state. */
const handler = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Unauthorized');

  const { message, sessionId } = sendMessageSchema.parse(req.body);
  let session;
  let isNewSession = false;

  if (sessionId) {
    session = await getSessionByIdForUser(sessionId, userId);
    if (!session) throw new HttpException(404, 'Session not found');
  } else {
    session = await createSession({
      user_id: userId,
      title: null,
      created_by: userId,
    });
    isNewSession = true;
    await chatbotCacheService.invalidateUserSessions(userId);
  }

  const userMessage = await createMessage({
    session_id: session.id,
    role: 'user',
    content: message,
    sources: null,
    created_by: userId,
  });

  const recentMessages = await getRecentMessages(session.id, 10);
  const conversationHistory = recentMessages
    .filter((m) => m.id !== userMessage.id)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const response = await generateChatResponse(message, conversationHistory);
  const assistantMessage = await createMessage({
    session_id: session.id,
    role: 'assistant',
    content: response.message,
    sources: response.sources.length > 0 ? response.sources : null,
    created_by: userId,
  });

  await updateSessionTimestamp(session.id);

  if (isNewSession) {
    const title = await generateSessionTitle(message);
    await updateSessionTitle(session.id, title);
    session.title = title;
  }

  ResponseFormatter.success(
    res,
    {
      sessionId: session.id,
      sessionTitle: session.title,
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.created_at,
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        sources: assistantMessage.sources,
        createdAt: assistantMessage.created_at,
      },
    },
    'Message sent successfully',
  );
};

const router = Router();
router.post('/chat', requireAuth, validationMiddleware(sendMessageSchema), handler);

export default router;
