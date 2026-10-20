import { Router, Response, Request } from 'express';
import { ResponseFormatter, HttpException } from '../../../utils';
import { getTiersQuerySchema } from '../shared/validation';
import { mapToTierResponse } from '../shared/interface';
import { tiersService } from '../services/tiers.service';

/**
 * GET /api/tiers
 * List tiers.
 */
const handler = async (req: Request, res: Response) => {
  const validation = getTiersQuerySchema.safeParse(req.query);
  if (!validation.success) {
    throw new HttpException(400, 'Invalid query parameters', { details: validation.error.issues });
  }

  const tiers = await tiersService.getAllTiers(validation.data);
  const sanitizedTiers = tiers.map(mapToTierResponse);

  return ResponseFormatter.success(res, sanitizedTiers, 'Tiers retrieved successfully');
};

const router = Router();
router.get('/', handler);

export default router;
