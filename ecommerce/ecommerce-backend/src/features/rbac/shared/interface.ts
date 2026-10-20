import { Role } from './roles.schema';
import { Permission } from './permissions.schema';
import { UserRole } from './user-roles.schema';
import { RolePermission } from './role-permissions.schema';

export type IRole = Role;

export interface ICreateRole {
  name: string;
  description?: string;
  is_system_role?: boolean;
}

export interface IUpdateRole {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface IRoleWithPermissions extends IRole {
  permissions: IPermission[];
}

export type IPermission = Permission;

export interface ICreatePermission {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export type IUserRole = UserRole;

export interface IAssignRoleToUser {
  user_id: string;
  role_id: string;
  expires_at?: Date;
}

export interface IUserWithRoles {
  id: string;
  name: string;
  email: string;
  roles: IRole[];
  permissions: string[];
}

export interface ICachedPermissions {
  permissions: string[];
  roleIds: string[];
  expiresAt: number;
}

export interface IPermissionCheck {
  resource: string;
  action: string;
}

export interface IRoleResponse {
  id: string;
  name: string;
  description?: string | null;
  is_system_role: boolean;
  is_active: boolean;
  permissions_count?: number;
  users_count?: number;
  created_at: Date;
}

export interface IPermissionResponse {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
}

export interface IUserPermissionsResponse {
  user_id: string;
  roles: string[];
  permissions: string[];
  has_wildcard: boolean;
}

export type { Role, Permission, UserRole, RolePermission };
