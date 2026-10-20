/**
 * GET /check-email
 * Checks if an email address already exists in the system.
 */

import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { eq, and } from 'drizzle-orm';

const handler = async (req: RequestWithUser, res: Response) => {
  const { email } = req.query as { email?: string };

  if (!email || !email.includes('@')) {
    return ResponseFormatter.error(res, 'VALIDATION_ERROR', 'Valid email is required', 400);
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email.toLowerCase().trim()), eq(users.is_deleted, false)))
    .limit(1);

  return ResponseFormatter.success(res, { exists: !!existing }, 'Email check completed');
};

const router = Router();
router.get('/check-email', requireAuth, handler);

export default router;
