import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { requireAuth, requirePermission } from '../../../middlewares';
import { RequestWithUser } from '../../../interfaces';
import { tierIdParamSchema } from '../shared/validation';
import { tiersService } from '../services/tiers.service';

/**
 * DELETE /api/tiers/:id
 * Delete a tier.
 */
const handler = async (req: RequestWithUser, res: Response) => {
  const validation = tierIdParamSchema.safeParse(req.params);
  if (!validation.success) {
    throw new HttpException(400, 'Invalid tier ID', { details: validation.error.issues });
  }

  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Unauthorized');

  await tiersService.deleteTierAction(validation.data.id, userId);
  return ResponseFormatter.success(res, null, 'Tier deleted successfully');
};

const router = Router();
router.delete('/:id', requireAuth, requirePermission('tiers:delete'), handler);

export default router;
