import { eq, and, isNull, inArray, gt, or } from 'drizzle-orm';
import { db } from '../../../database';
import { roles } from './roles.schema';
import { permissions } from './permissions.schema';
import { rolePermissions } from './role-permissions.schema';
import { userRoles } from './user-roles.schema';

export async function findAllRoles() {
  return db
    .select()
    .from(roles)
    .where(and(eq(roles.is_deleted, false), eq(roles.is_active, true)));
}

export async function findRoleById(id: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  return role;
}

export async function findRoleByName(name: string) {
  const [role] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
  return role;
}

export async function createRole(data: {
  name: string;
  description?: string;
  is_system_role?: boolean;
  created_by?: string;
}) {
  const [role] = await db
    .insert(roles)
    .values({
      name: data.name,
      description: data.description,
      is_system_role: data.is_system_role ?? false,
      created_by: data.created_by,
    })
    .returning();
  return role;
}

export async function updateRole(
  id: string,
  data: { name?: string; description?: string; is_active?: boolean; updated_by?: string },
) {
  const [role] = await db
    .update(roles)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(roles.id, id))
    .returning();
  return role;
}

export async function deleteRole(id: string, deleted_by: string) {
  const [role] = await db
    .update(roles)
    .set({
      is_deleted: true,
      deleted_by,
      deleted_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(roles.id, id))
    .returning();
  return role;
}

export async function findAllPermissions() {
  return db.select().from(permissions);
}

export async function findPermissionById(id: string) {
  const [permission] = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
  return permission;
}

export async function findPermissionByName(name: string) {
  const [permission] = await db
    .select()
    .from(permissions)
    .where(eq(permissions.name, name))
    .limit(1);
  return permission;
}

export async function findPermissionsByResource(resource: string) {
  return db.select().from(permissions).where(eq(permissions.resource, resource));
}

export async function createPermission(data: {
  name: string;
  resource: string;
  action: string;
  description?: string;
}) {
  const [permission] = await db.insert(permissions).values(data).returning();
  return permission;
}

export async function findRolePermissions(roleId: string) {
  return db
    .select({
      permission: permissions,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permission_id, permissions.id))
    .where(eq(rolePermissions.role_id, roleId));
}

export async function assignPermissionToRole(
  roleId: string,
  permissionId: string,
  assignedBy?: string,
) {
  const [assignment] = await db
    .insert(rolePermissions)
    .values({
      role_id: roleId,
      permission_id: permissionId,
      assigned_by: assignedBy,
    })
    .onConflictDoNothing()
    .returning();
  return assignment;
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  await db
    .delete(rolePermissions)
    .where(
      and(eq(rolePermissions.role_id, roleId), eq(rolePermissions.permission_id, permissionId)),
    );
}

export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[],
  assignedBy?: string,
) {
  if (permissionIds.length === 0) return [];

  const values = permissionIds.map((permissionId) => ({
    role_id: roleId,
    permission_id: permissionId,
    assigned_by: assignedBy,
  }));

  return db.insert(rolePermissions).values(values).onConflictDoNothing().returning();
}

export async function findUserRoles(userId: string) {
  const now = new Date();
  return db
    .select({
      role: roles,
      assigned_at: userRoles.assigned_at,
      expires_at: userRoles.expires_at,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.role_id, roles.id))
    .where(
      and(
        eq(userRoles.user_id, userId),
        eq(roles.is_deleted, false),
        eq(roles.is_active, true),
        or(isNull(userRoles.expires_at), gt(userRoles.expires_at, now)),
      ),
    );
}

export async function assignRoleToUser(
  userId: string,
  roleId: string,
  assignedBy?: string,
  expiresAt?: Date,
) {
  const [assignment] = await db
    .insert(userRoles)
    .values({
      user_id: userId,
      role_id: roleId,
      assigned_by: assignedBy,
      expires_at: expiresAt,
    })
    .onConflictDoNothing()
    .returning();
  return assignment;
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  await db
    .delete(userRoles)
    .where(and(eq(userRoles.user_id, userId), eq(userRoles.role_id, roleId)));
}

export async function findUserPermissions(userId: string): Promise<string[]> {
  const now = new Date();

  const userRoleRows = await db
    .select({ role_id: userRoles.role_id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.role_id, roles.id))
    .where(
      and(
        eq(userRoles.user_id, userId),
        eq(roles.is_deleted, false),
        eq(roles.is_active, true),
        or(isNull(userRoles.expires_at), gt(userRoles.expires_at, now)),
      ),
    );

  if (userRoleRows.length === 0) {
    return [];
  }

  const roleIds = userRoleRows.map((r) => r.role_id);

  const permissionRows = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permission_id, permissions.id))
    .where(inArray(rolePermissions.role_id, roleIds));

  return [...new Set(permissionRows.map((p) => p.name))];
}

export async function userHasPermission(userId: string, permissionName: string): Promise<boolean> {
  const userPerms = await findUserPermissions(userId);

  if (userPerms.includes('*')) {
    return true;
  }

  return userPerms.includes(permissionName);
}

export async function countUsersWithRole(roleId: string): Promise<number> {
  const result = await db
    .select({ user_id: userRoles.user_id })
    .from(userRoles)
    .where(eq(userRoles.role_id, roleId));
  return result.length;
}

export async function countRolePermissions(roleId: string): Promise<number> {
  const result = await db
    .select({ permission_id: rolePermissions.permission_id })
    .from(rolePermissions)
    .where(eq(rolePermissions.role_id, roleId));
  return result.length;
}

export async function getUserIdsByRoleName(roleName: string): Promise<string[]> {
  const now = new Date();

  const role = await findRoleByName(roleName);
  if (!role) {
    return [];
  }

  const result = await db
    .select({ user_id: userRoles.user_id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.role_id, roles.id))
    .where(
      and(
        eq(userRoles.role_id, role.id),
        eq(roles.is_deleted, false),
        eq(roles.is_active, true),
        or(isNull(userRoles.expires_at), gt(userRoles.expires_at, now)),
      ),
    );

  return result.map((r) => r.user_id);
}

export async function getAllAdminUserIds(): Promise<string[]> {
  const adminIds = await getUserIdsByRoleName('admin');
  const superadminIds = await getUserIdsByRoleName('superadmin');
  const allIds = [...new Set([...adminIds, ...superadminIds])];
  return allIds;
}
