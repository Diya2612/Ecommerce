/**
 * Customer Feature
 * Central entry point for customer-related routes and shared resources.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class CustomerRoute implements Route {
  public path = '/customers';
  public router = Router();

  /** Standardizes all customer-related API routes. */
  public async init() {
    const { default: getAllCustomersRouter } = await import('./apis/get-all-customers');
    const { default: getCustomerByIdRouter } = await import('./apis/get-customer-by-id');
    const { default: createCustomerRouter } = await import('./apis/create-customer');
    const { default: updateCustomerRouter } = await import('./apis/update-customer');
    const { default: deleteCustomerRouter } = await import('./apis/delete-customer');
    const { default: bulkDeleteCustomersRouter } = await import('./apis/bulk-delete-customers');
    const { default: getCustomerActivityRouter } = await import('./apis/get-customer-activity');
    const { default: getCustomerMetricsRouter } = await import('./apis/get-customer-metrics');
    const { default: checkEmailRouter } = await import('./apis/check-email');

    // Static endpoints
    this.router.use(this.path, checkEmailRouter);
    this.router.use(this.path, getAllCustomersRouter);
    this.router.use(this.path, createCustomerRouter);
    this.router.use(this.path, bulkDeleteCustomersRouter);
    this.router.use(this.path, getCustomerMetricsRouter);

    // Parametric endpoints
    this.router.use(this.path, getCustomerByIdRouter);
    this.router.use(this.path, getCustomerActivityRouter);
    this.router.use(this.path, updateCustomerRouter);
    this.router.use(this.path, deleteCustomerRouter);
  }
}

export default CustomerRoute;

// Shared resource exports
export * from './shared/customer-profiles.schema';
