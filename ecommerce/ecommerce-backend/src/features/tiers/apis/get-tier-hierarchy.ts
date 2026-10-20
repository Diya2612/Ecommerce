import { Router, Response, Request } from 'express';
import { ResponseFormatter } from '../../../utils';
import { tierStructureService } from '../services/tier-structure.service';
import { mapToTierHierarchyResponse } from '../shared/interface';

/**
 * GET /api/tiers/hierarchy
 * Get full tier hierarchy.
 */
const handler = async (req: Request, res: Response) => {
  const hierarchy = await tierStructureService.getTierHierarchy();
  const sanitizedHierarchy = hierarchy.map(mapToTierHierarchyResponse);

  return ResponseFormatter.success(
    res,
    { tiers: sanitizedHierarchy },
    'Tier hierarchy retrieved successfully',
  );
};

const router = Router();
router.get('/hierarchy', handler);

export default router;
