import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class RBACRoute implements Route {
  public path = '/rbac';
  public router = Router();

  public async init() {
    // Dynamic imports avoid circular dependencies with middlewares
    const { default: getRolesRouter } = await import('./apis/get-roles');
    const { default: createRoleRouter } = await import('./apis/create-role');
    const { default: updateRoleRouter } = await import('./apis/update-role');
    const { default: deleteRoleRouter } = await import('./apis/delete-role');
    const { default: rolePermissionsRouter } = await import('./apis/role-permissions');
    const { default: bulkPermissionsRouter } = await import('./apis/bulk-permissions');
    const { default: getPermissionsRouter } = await import('./apis/get-permissions');
    const { default: createPermissionRouter } = await import('./apis/create-permission');
    const { default: userRolesRouter } = await import('./apis/user-roles');

    this.router.use(`${this.path}/roles`, getRolesRouter);
    this.router.use(`${this.path}/roles`, createRoleRouter);
    this.router.use(`${this.path}/roles`, updateRoleRouter);
    this.router.use(`${this.path}/roles`, deleteRoleRouter);
    this.router.use(`${this.path}/roles`, rolePermissionsRouter);
    this.router.use(`${this.path}/roles`, bulkPermissionsRouter);

    this.router.use(`${this.path}/permissions`, getPermissionsRouter);
    this.router.use(`${this.path}/permissions`, createPermissionRouter);

    this.router.use(`${this.path}/users`, userRolesRouter);
  }
}

export default RBACRoute;

export { rbacCacheService, RBACCacheService } from './services/rbac-cache.service';

export * from './shared/roles.schema';
export * from './shared/permissions.schema';
export * from './shared/role-permissions.schema';
export * from './shared/user-roles.schema';
export * from './shared/interface';
export * from './shared/queries';
