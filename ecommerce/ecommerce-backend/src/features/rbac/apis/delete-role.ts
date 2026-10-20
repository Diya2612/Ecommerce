import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requirePermission } from '../../../middlewares';
import { ResponseFormatter } from '../../../utils';
import { HttpException } from '../../../utils';
import { findRoleById, deleteRole, countUsersWithRole } from '../shared/queries';
import { rbacCacheService } from '../services/rbac-cache.service';

async function handleDeleteRole(roleId: string, deletedBy: string): Promise<void> {
  const existingRole = await findRoleById(roleId);
  if (!existingRole) {
    throw new HttpException(404, 'Role not found');
  }

  if (existingRole.is_system_role) {
    throw new HttpException(400, 'Cannot delete system roles');
  }

  const usersWithRole = await countUsersWithRole(roleId);
  if (usersWithRole > 0) {
    throw new HttpException(
      400,
      `Cannot delete role: ${usersWithRole} user(s) are currently assigned to this role`,
    );
  }

  await deleteRole(roleId, deletedBy);
  await rbacCacheService.invalidateAll();
}

const handler = async (req: RequestWithUser, res: Response) => {
  const roleId = req.params.roleId as string;
  if (!roleId) throw new HttpException(400, 'Invalid roleId parameter');

  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  await handleDeleteRole(roleId, userId);
  ResponseFormatter.success(res, null, 'Role deleted successfully');
};

const router = Router();
router.delete('/:roleId', requireAuth, requirePermission('roles:manage'), handler);

export default router;
