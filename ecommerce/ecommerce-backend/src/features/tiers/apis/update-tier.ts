import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { requireAuth, requirePermission } from '../../../middlewares';
import { RequestWithUser } from '../../../interfaces';
import { updateTierSchema, tierIdParamSchema } from '../shared/validation';
import { mapToTierResponse } from '../shared/interface';
import { tiersService } from '../services/tiers.service';

/**
 * PUT /api/tiers/:id
 * Update a tier.
 */
const handler = async (req: RequestWithUser, res: Response) => {
  const paramsValidation = tierIdParamSchema.safeParse(req.params);
  if (!paramsValidation.success) {
    throw new HttpException(400, 'Invalid tier ID', { details: paramsValidation.error.issues });
  }

  const bodyValidation = updateTierSchema.safeParse(req.body);
  if (!bodyValidation.success) {
    throw new HttpException(400, 'Invalid request data', { details: bodyValidation.error.issues });
  }

  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'Unauthorized');

  const updated = await tiersService.updateTierAction(
    paramsValidation.data.id,
    bodyValidation.data,
    userId,
  );
  return ResponseFormatter.success(res, mapToTierResponse(updated), 'Tier updated successfully');
};

const router = Router();
router.put('/:id', requireAuth, requirePermission('tiers:update'), handler);

export default router;
