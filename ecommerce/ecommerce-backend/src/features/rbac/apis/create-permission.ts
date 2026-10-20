import { Router, Response, NextFunction } from 'express';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { ResponseFormatter } from '../../../utils';
import { HttpException } from '../../../utils';
import { createPermission, findPermissionByName } from '../shared/queries';
import { Permission } from '../shared/permissions.schema';
import { createPermissionSchema, CreatePermissionDto } from '../shared/validation';

async function handleCreatePermission(data: CreatePermissionDto): Promise<Permission> {
  const existingPermission = await findPermissionByName(data.name);
  if (existingPermission) {
    throw new HttpException(409, `Permission '${data.name}' already exists`);
  }

  const expectedName = `${data.resource}:${data.action}`;
  if (data.name !== expectedName) {
    throw new HttpException(
      400,
      `Permission name must match resource:action format. Expected: ${expectedName}`,
    );
  }

  const newPermission = await createPermission({
    name: data.name,
    resource: data.resource,
    action: data.action,
    description: data.description,
  });

  return newPermission;
}

const handler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const permissionData: CreatePermissionDto = req.body;
    const newPermission = await handleCreatePermission(permissionData);
    ResponseFormatter.created(res, newPermission, 'Permission created successfully');
  } catch (error) {
    next(error);
  }
};

const router = Router();
router.post(
  '/',
  requireAuth,
  requirePermission('permissions:assign'),
  validationMiddleware(createPermissionSchema),
  handler,
);

export default router;
