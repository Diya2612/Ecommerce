import { HttpException } from '../../../utils';
import {
  findAllRoles,
  findRoleById,
  findRoleByName,
  createRole as createRoleQuery,
  updateRole as updateRoleQuery,
  deleteRole as deleteRoleQuery,
  findAllPermissions,
  assignPermissionsToRole as assignPermissionsToRoleQuery,
  assignRoleToUser as assignRoleToUserQuery,
  removeRoleFromUser as removeRoleFromUserQuery,
  userHasPermission,
} from '../shared/queries';
import { db } from '../../../database';
import { userRoles } from '../shared/user-roles.schema';
import { and, eq } from 'drizzle-orm';

export const rbacService = {
  /**
   * Get all active roles
   */
  async getRoles() {
    return findAllRoles();
  },

  /**
   * Get a single role by ID - throws 404 if not found
   */
  async getRoleById(id: string) {
    const role = await findRoleById(id);
    if (!role) throw new HttpException(404, `Role not found`);
    return role;
  },

  /**
   * Create a new role
   */
  async createRole(
    data: { name: string; display_name?: string; description?: string },
    createdBy: string,
  ) {
    const existing = await findRoleByName(data.name);
    if (existing) throw new HttpException(409, `Role '${data.name}' already exists`);

    const newRole = await createRoleQuery({
      name: data.name,
      description: data.description,
      is_system_role: false,
      created_by: createdBy,
    });
    return newRole;
  },

  /**
   * Update a role - throws 403 if it's a system role, 404 if not found
   */
  async updateRole(
    id: string,
    data: { display_name?: string; description?: string; is_active?: boolean },
    updatedBy: string,
  ) {
    const role = await findRoleById(id);
    if (!role) throw new HttpException(404, `Role not found`);
    if (role.is_system_role) throw new HttpException(403, `Cannot modify system roles`);

    const updated = await updateRoleQuery(id, { ...data, updated_by: updatedBy });
    return updated;
  },

  /**
   * Soft delete a role - throws 403 if system role, 404 if not found
   */
  async deleteRole(id: string, deletedBy: string) {
    const role = await findRoleById(id);
    if (!role) throw new HttpException(404, `Role not found`);
    if (role.is_system_role) throw new HttpException(403, `Cannot delete system roles`);

    await deleteRoleQuery(id, deletedBy);
  },

  /**
   * Get all permissions
   */
  async getPermissions() {
    return findAllPermissions();
  },

  /**
   * Assign a list of permissions to a role
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[], assignedBy: string) {
    const role = await findRoleById(roleId);
    if (!role) throw new HttpException(404, `Role not found`);

    return assignPermissionsToRoleQuery(roleId, permissionIds, assignedBy);
  },

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(userId: string, roleId: string, assignedBy: string, expiresAt?: Date) {
    const role = await findRoleById(roleId);
    if (!role) throw new HttpException(404, `Role not found`);

    // Check if already assigned
    const existing = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.user_id, userId), eq(userRoles.role_id, roleId)),
    });
    if (existing) throw new HttpException(409, `Role already assigned to user`);

    const assignment = await assignRoleToUserQuery(userId, roleId, assignedBy, expiresAt);
    return assignment;
  },

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser(userId: string, roleId: string, _removedBy: string) {
    const existing = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.user_id, userId), eq(userRoles.role_id, roleId)),
    });
    if (!existing) throw new HttpException(404, `Role not assigned to user`);

    await removeRoleFromUserQuery(userId, roleId);
  },

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    return userHasPermission(userId, permissionName);
  },
};
