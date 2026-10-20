/**
 * GET /api/users
 * Retrieve all users with pagination (Admin only).
 */

import { Router, Response } from 'express';
import { eq, count, desc } from 'drizzle-orm';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requirePermission } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { sanitizeUsers } from '../shared/interface';
import { db } from '../../../database';
import { users } from '../shared/user.schema';
import { IUser } from '../shared/interface';
import { paginationSchema } from '../shared/validation';

interface PaginatedUsers {
  users: IUser[];
  total: number;
  page: number;
  limit: number;
}

async function getAllUsers(page: number, limit: number): Promise<PaginatedUsers> {
  const offset = (page - 1) * limit;

  const [countResult] = await db
    .select({ total: count() })
    .from(users)
    .where(eq(users.is_deleted, false));

  const total = countResult?.total ?? 0;

  const allUsers = await db
    .select()
    .from(users)
    .where(eq(users.is_deleted, false))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(users.created_at));

  return {
    users: allUsers as IUser[],
    total,
    page,
    limit,
  };
}

const handler = async (req: RequestWithUser, res: Response) => {
  const { page, limit } = paginationSchema.parse(req.query);

  const result = await getAllUsers(page, limit);
  const sanitizedUsers = sanitizeUsers(result.users);

  ResponseFormatter.paginated(
    res,
    sanitizedUsers,
    { page: result.page, limit: result.limit, total: result.total },
    'Users retrieved successfully',
  );
};

const router = Router();
router.get('/', requireAuth, requirePermission('users:read'), handler);

export default router;
