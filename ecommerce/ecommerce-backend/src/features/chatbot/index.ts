/**
 * Chatbot Feature
 * Entry point for chatbot routes and shared exports.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { logger } from '../../utils';
import { isDevelopment } from '../../utils/config/validate-env';

class ChatbotRoute implements Route {
  public path = '/chatbot';
  public router = Router();

  public async init(): Promise<void> {
    if (isDevelopment) {
      this.initializeRoutesSync();
    } else {
      await this.initializeRoutes();
    }
  }

  /** Synchronous initialization for development/test speed. */
  private initializeRoutesSync(): void {
    try {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const uploadDocumentRouter = require('./apis/upload-document').default;
      const listDocumentsRouter = require('./apis/list-documents').default;
      const deleteDocumentRouter = require('./apis/delete-document').default;
      const sendMessageRouter = require('./apis/send-message').default;
      const listSessionsRouter = require('./apis/list-sessions').default;
      const getSessionRouter = require('./apis/get-session').default;
      const deleteSessionRouter = require('./apis/delete-session').default;

      this.router.use(this.path, uploadDocumentRouter);
      this.router.use(this.path, listDocumentsRouter);
      this.router.use(this.path, deleteDocumentRouter);
      this.router.use(this.path, sendMessageRouter);
      this.router.use(this.path, listSessionsRouter);
      this.router.use(this.path, getSessionRouter);
      this.router.use(this.path, deleteSessionRouter);
    } catch (error) {
      logger.warn('Chatbot routes initialization failed', { error });
    }
  }

  /** Dynamic imports in production to minimize initial load time and circular dependencies. */
  private async initializeRoutes(): Promise<void> {
    const { default: uploadDocumentRouter } = await import('./apis/upload-document');
    const { default: listDocumentsRouter } = await import('./apis/list-documents');
    const { default: deleteDocumentRouter } = await import('./apis/delete-document');
    const { default: sendMessageRouter } = await import('./apis/send-message');
    const { default: listSessionsRouter } = await import('./apis/list-sessions');
    const { default: getSessionRouter } = await import('./apis/get-session');
    const { default: deleteSessionRouter } = await import('./apis/delete-session');

    this.router.use(this.path, uploadDocumentRouter);
    this.router.use(this.path, listDocumentsRouter);
    this.router.use(this.path, deleteDocumentRouter);
    this.router.use(this.path, sendMessageRouter);
    this.router.use(this.path, listSessionsRouter);
    this.router.use(this.path, getSessionRouter);
    this.router.use(this.path, deleteSessionRouter);
  }
}

export default ChatbotRoute;

export {
  chatbotDocuments,
  chatbotSessions,
  chatbotMessages,
  type ChatbotDocument,
  type ChatbotSession,
  type ChatbotMessage,
} from './shared/chatbot.schema';

export { chatbotCacheService } from './services/chatbot-cache.service';
export { pineconeIndex } from './services/pinecone.service';
