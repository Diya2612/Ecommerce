/**
 * POST /api/auth/sync-user
 * Sync Supabase Auth user to public.users table.
 */

import { Router, Response } from 'express';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { RequestWithUser } from '../../../interfaces';
import { ResponseFormatter } from '../../../utils';
import { HttpException } from '../../../utils';
import { syncUser } from '../services/auth.service';
import { syncUserSchema } from '../shared/validation';
import { SyncUserDto } from '../shared/interface';

const handler = async (req: RequestWithUser, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpException(401, 'Authentication required');
  }

  const token = authHeader.substring(7);
  const bodyData: SyncUserDto = req.body;

  const result = await syncUser(token, bodyData);

  if (result.isNew) {
    return ResponseFormatter.created(
      res,
      { id: result.id, synced: result.synced, message: result.message },
      'User synced successfully',
    );
  }

  return ResponseFormatter.success(
    res,
    { id: result.id, synced: result.synced, message: result.message },
    'User synced successfully',
  );
};

const router = Router();
router.post('/sync-user', validationMiddleware(syncUserSchema), handler);

export default router;
