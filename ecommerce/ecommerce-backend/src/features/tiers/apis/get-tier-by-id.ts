import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { ResponseFormatter, HttpException } from '../../../utils';
import { tiersService } from '../services/tiers.service';
import { mapToTierResponse, mapToTierHierarchyResponse } from '../shared/interface';

const paramsSchema = z.object({ id: z.string().uuid() });
const querySchema = z.object({
  includeChildren: z.enum(['true', 'false']).optional().default('false'),
});

/**
 * GET /api/tiers/:id
 * Get tier details.
 */
const handler = async (req: Request, res: Response) => {
  const paramsValidation = paramsSchema.safeParse(req.params);
  if (!paramsValidation.success) throw new HttpException(400, 'Invalid tier ID');

  const queryValidation = querySchema.safeParse(req.query);
  if (!queryValidation.success) throw new HttpException(400, 'Invalid query parameters');

  const { id } = paramsValidation.data;
  const { includeChildren } = queryValidation.data;

  const response = await tiersService.getTierById(id, includeChildren === 'true');

  let result;
  if (Array.isArray(response)) {
    result = response.map(mapToTierResponse);
  } else {
    result =
      includeChildren === 'true'
        ? mapToTierHierarchyResponse(response)
        : mapToTierResponse(response);
  }

  return ResponseFormatter.success(res, result, 'Tier retrieved successfully');
};

const router = Router();
router.get('/:id', handler);

export default router;
