/**
 * GET /
 * Fetches a paginated, filtered list of FAQs. Publicly accessible (active only).
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter } from '../../../utils';
import { faqFiltersSchema, FaqFiltersDto } from '../shared/validation';
import { getFaqs } from '../services/faq.service';
import { optionalAuth, validationMiddleware, userHasPermission } from '../../../middlewares';

const handler = async (req: RequestWithUser, res: Response) => {
  const filters: FaqFiltersDto = req.query as any;
  const isAdmin = await userHasPermission(req, 'faqs:update');

  const { faqs: data, total } = await getFaqs(filters, { isAdmin });

  ResponseFormatter.success(
    res,
    {
      faqs: data,
      pagination: { total, page: filters.page || 1, limit: filters.limit || 10 },
    },
    'FAQs retrieved successfully',
  );
};

const router = Router();
router.get('/', optionalAuth, validationMiddleware(faqFiltersSchema, 'query'), handler);

export default router;
