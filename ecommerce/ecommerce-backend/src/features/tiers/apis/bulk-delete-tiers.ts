import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { requireAuth, requirePermission } from '../../../middlewares';
import { RequestWithUser } from '../../../interfaces';
import { bulkDeleteTiersSchema } from '../shared/validation';
import { tiersService } from '../services/tiers.service';

/**
 * POST /api/tiers/bulk-delete
 * Bulk delete tiers.
 */
const handler = async (req: RequestWithUser, res: Response) => {
  const validation = bulkDeleteTiersSchema.safeParse(req.body);
  if (!validation.success) {
    throw new HttpException(400, 'Invalid request data', { details: validation.error.issues });
  }

  const result = await tiersService.bulkDeleteTiersAction(validation.data.ids, req.userId);
  return ResponseFormatter.success(res, result, `${result.count} tiers deleted successfully`);
};

const router = Router();
router.post('/bulk-delete', requireAuth, requirePermission('tiers:delete'), handler);

export default router;
