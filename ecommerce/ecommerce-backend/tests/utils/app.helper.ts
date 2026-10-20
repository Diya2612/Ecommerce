import { Application } from 'express';
import App from '../../src/app';
import UserRoute from '../../src/features/user';
import AuthRoute from '../../src/features/auth';
import UploadRoute from '../../src/features/upload';
import AdminInviteRoute from '../../src/features/admin-invite';
import ChatbotRoute from '../../src/features/chatbot';
import RBACRoute from '../../src/features/rbac';

/**
 * Get Express app instance for testing.
 * The app is built asynchronously (to register dynamic-import routes like RBAC).
 * Tests should call `await getTestApp()` in their `beforeAll`.
 */
let appInstance: Application | null = null;

export async function getTestApp(): Promise<Application> {
  if (appInstance) return appInstance;

  const appObj = new App([
    new AuthRoute(),
    new UserRoute(),
    new UploadRoute(),
    new AdminInviteRoute(),
    new ChatbotRoute(),
    new RBACRoute(),
  ]);

  // Must await so dynamically-imported route handlers (RBAC, etc.) are registered
  await appObj.initializeAsyncRoutes();
  appInstance = appObj.getServer();
  return appInstance;
}

// Alias for backward compat
export { getTestApp as createTestApp };

// Synchronous default export (pre-built app). For compatibility with tests
// that do `import app from '@tests/utils'` and use it in a beforeAll with
// getTestApp(). Tests using the default export directly should be updated to use getTestApp().
export default appInstance as unknown as Application;
