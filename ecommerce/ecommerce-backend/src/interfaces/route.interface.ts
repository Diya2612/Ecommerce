import { Router } from 'express';

/**
 * @description Defines the architectural contract for scalable feature module registration.
 * Standardizes how controllers mount routers onto the core Express application.
 */
interface Route {
  path?: string;
  router: Router;
  /** @description Deferred lifecycle hook allowing modules to fulfill asynchronous startup prerequisites (e.g., cache priming) prior to accepting traffic. */
  init?(): Promise<void>;
}

export default Route;
