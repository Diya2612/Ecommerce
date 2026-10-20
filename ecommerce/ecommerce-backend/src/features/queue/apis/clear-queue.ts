/**
 * DELETE /api/admin/queue/queues/:name
 * Clear all jobs from a queue
 * Admin-only access - DANGEROUS OPERATION
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission, validationMiddleware } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { queueService } from '../services/queue.service';

// Validation schema
const paramsSchema = z.object({
  name: z.string().min(1),
});

const handler = async (req: RequestWithUser, res: Response) => {
  const { name } = req.params as { name: string };

  // Clear the queue
  await queueService.clearQueue(name);

  ResponseFormatter.success(res, { queue: name }, `Queue ${name} has been cleared successfully`);
};

const router = Router();
router.delete(
  '/:name',
  requireAuth,
  requirePermission('queue:delete'),
  validationMiddleware(paramsSchema, 'params'),
  handler,
);

export default router;
