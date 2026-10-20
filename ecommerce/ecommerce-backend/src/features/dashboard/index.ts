/**
 * Dashboard Feature Entry Point
 * Orchestrates administrative reporting and statistics.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class DashboardRoute implements Route {
  public path = '/dashboard';
  public router = Router();

  /**
   * Initializes dashboard API routes using dynamic imports.
   */
  public async init() {
    const { default: getStatsRouter } = await import('./apis/get-stats');
    this.router.use(this.path, getStatsRouter);
  }
}

export default DashboardRoute;
