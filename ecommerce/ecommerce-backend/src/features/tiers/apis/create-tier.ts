import { Router, Response } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { requireAuth, requirePermission } from '../../../middlewares';
import { RequestWithUser } from '../../../interfaces';
import { createTierSchema } from '../shared/validation';
import { tiersService } from '../services/tiers.service';
import { mapToTierResponse } from '../shared/interface';

/**
 * POST /api/tiers
 * Create a new tier.
 */
const handler = async (req: RequestWithUser, res: Response) => {
  const validation = createTierSchema.safeParse(req.body);
  if (!validation.success) {
    throw new HttpException(400, 'Invalid request data', { details: validation.error.issues });
  }

  const newTier = await tiersService.createTierAction(validation.data, req.userId);
  return ResponseFormatter.success(
    res,
    mapToTierResponse(newTier),
    'Tier created successfully',
    201,
  );
};

const router = Router();
router.post('/', requireAuth, requirePermission('tiers:create'), handler);

export default router;
