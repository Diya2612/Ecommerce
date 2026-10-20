import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { HttpException } from '../../../utils';
import { findRoleById, findRoleByName, updateRole } from '../shared/queries';
import { rbacCacheService } from '../services/rbac-cache.service';
import { Role } from '../shared/roles.schema';
import { updateRoleSchema, UpdateRoleDto } from '../shared/validation';

async function handleUpdateRole(
  roleId: string,
  data: UpdateRoleDto,
  updatedBy: string,
): Promise<Role> {
  const existingRole = await findRoleById(roleId);
  if (!existingRole) {
    throw new HttpException(404, 'Role not found');
  }

  if (existingRole.is_system_role && data.name && data.name !== existingRole.name) {
    throw new HttpException(400, 'Cannot change the name of a system role');
  }

  if (data.name && data.name !== existingRole.name) {
    const roleWithName = await findRoleByName(data.name);
    if (roleWithName) {
      throw new HttpException(409, `Role '${data.name}' already exists`);
    }
  }

  const updatedRole = await updateRole(roleId, {
    ...data,
    updated_by: updatedBy,
  });

  await rbacCacheService.invalidateAll();

  return updatedRole;
}

const handler = async (req: RequestWithUser, res: Response) => {
  const roleId = req.params.roleId as string;
  if (!roleId) throw new HttpException(400, 'Invalid roleId parameter');

  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const updateData: UpdateRoleDto = req.body;
  const updatedRole = await handleUpdateRole(roleId, updateData, userId);
  ResponseFormatter.success(res, updatedRole, 'Role updated successfully');
};

const router = Router();
router.put(
  '/:roleId',
  requireAuth,
  requirePermission('roles:manage'),
  validationMiddleware(updateRoleSchema),
  handler,
);

export default router;
