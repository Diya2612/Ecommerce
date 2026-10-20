import { Router, Response } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { HttpException } from '../../../utils';
import { createRole, findRoleByName } from '../shared/queries';
import { Role } from '../shared/roles.schema';
import { createRoleSchema, CreateRoleDto } from '../shared/validation';

async function handleCreateRole(data: CreateRoleDto, createdBy: string): Promise<Role> {
  const existingRole = await findRoleByName(data.name);
  if (existingRole) {
    throw new HttpException(409, `Role '${data.name}' already exists`);
  }

  const newRole = await createRole({
    name: data.name,
    description: data.description,
    is_system_role: false,
    created_by: createdBy,
  });

  return newRole;
}

const handler = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new HttpException(401, 'User authentication required');

  const roleData: CreateRoleDto = req.body;
  const newRole = await handleCreateRole(roleData, userId);
  ResponseFormatter.created(res, newRole, 'Role created successfully');
};

const router = Router();
router.post(
  '/',
  requireAuth,
  requirePermission('roles:manage'),
  validationMiddleware(createRoleSchema),
  handler,
);

export default router;
