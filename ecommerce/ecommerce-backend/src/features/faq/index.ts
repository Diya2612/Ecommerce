/**
 * FAQ Feature Entry Point
 * Orchestrates general and categorized frequently asked questions.
 */

import { Router } from 'express';
import getFaqsRoute from './apis/get-faqs';
import getFaqByIdRoute from './apis/get-faq-by-id';
import createFaqRoute from './apis/create-faq';
import updateFaqRoute from './apis/update-faq';
import deleteFaqRoute from './apis/delete-faq';

class FaqRoute {
  public path = '/faqs';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  /** Registers FAQ endpoints. */
  private initializeRoutes() {
    this.router.use(this.path, getFaqsRoute);
    this.router.use(this.path, getFaqByIdRoute);
    this.router.use(this.path, createFaqRoute);
    this.router.use(this.path, updateFaqRoute);
    this.router.use(this.path, deleteFaqRoute);
  }
}

export default FaqRoute;

export * from './shared';
