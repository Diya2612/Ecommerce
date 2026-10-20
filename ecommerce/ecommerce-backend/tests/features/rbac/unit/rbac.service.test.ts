/**
 * RBAC Permission Service Unit Tests
 * Tests for permission checking, role assignment, and access control logic
 */

jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    transaction: jest.fn(),
    query: {
      roles: { findFirst: jest.fn(), findMany: jest.fn() },
      permissions: { findFirst: jest.fn(), findMany: jest.fn() },
      userRoles: { findFirst: jest.fn(), findMany: jest.fn() },
    },
  },
}));

// Mock the shared queries module so the service layer is tested in isolation
jest.mock('@/features/rbac/shared/queries', () => ({
  findAllRoles: jest.fn(),
  findRoleById: jest.fn(),
  findRoleByName: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  findAllPermissions: jest.fn(),
  assignPermissionsToRole: jest.fn(),
  assignRoleToUser: jest.fn(),
  removeRoleFromUser: jest.fn(),
  userHasPermission: jest.fn(),
}));

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

jest.mock('@/features/audit/services/audit.service', () => ({
  auditService: { log: jest.fn().mockResolvedValue(undefined) },
}));

import * as queries from '@/features/rbac/shared/queries';
import { db } from '@/database';

// Typed references
const mockFindAllRoles = queries.findAllRoles as jest.Mock;
const mockFindRoleById = queries.findRoleById as jest.Mock;
const mockFindRoleByName = queries.findRoleByName as jest.Mock;
const mockCreateRole = queries.createRole as jest.Mock;
const mockUpdateRole = queries.updateRole as jest.Mock;
const mockDeleteRole = queries.deleteRole as jest.Mock;
const mockFindAllPermissions = queries.findAllPermissions as jest.Mock;
const mockAssignPermissionsToRole = queries.assignPermissionsToRole as jest.Mock;
const mockAssignRoleToUser = queries.assignRoleToUser as jest.Mock;
const mockRemoveRoleFromUser = queries.removeRoleFromUser as jest.Mock;
const mockUserHasPermission = queries.userHasPermission as jest.Mock;

const mockRole = {
  id: 'role-uuid-1',
  name: 'admin',
  display_name: 'Administrator',
  description: 'Full admin access',
  is_system_role: false,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockPermission = {
  id: 'perm-uuid-1',
  name: 'users:read',
  display_name: 'Read Users',
  resource: 'users',
  action: 'read',
  description: 'Can read user data',
  is_active: true,
  created_at: new Date(),
};

const mockUserRole = {
  id: 'ur-uuid-1',
  user_id: 'user-uuid-1',
  role_id: 'role-uuid-1',
  assigned_by: 'admin-uuid-1',
  created_at: new Date(),
};

describe('RBAC Service - Unit Tests', () => {
  let rbacService: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await import('@/features/rbac/services/rbac.service');
    rbacService = module.rbacService;
  });

  // ==================== Role Management ====================

  describe('getRoles', () => {
    it('should return all active roles', async () => {
      mockFindAllRoles.mockResolvedValue([mockRole]);

      const result = await rbacService.getRoles();

      expect(Array.isArray(result)).toBe(true);
      expect(mockFindAllRoles).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no roles exist', async () => {
      mockFindAllRoles.mockResolvedValue([]);

      const result = await rbacService.getRoles();

      expect(result).toEqual([]);
    });
  });

  describe('getRoleById', () => {
    it('should return role by ID', async () => {
      mockFindRoleById.mockResolvedValue(mockRole);

      const result = await rbacService.getRoleById('role-uuid-1');

      expect(result).toHaveProperty('id', 'role-uuid-1');
    });

    it('should throw 404 when role not found', async () => {
      mockFindRoleById.mockResolvedValue(null);

      await expect(rbacService.getRoleById('non-existent-id')).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      mockFindRoleByName.mockResolvedValue(null); // No duplicate
      mockCreateRole.mockResolvedValue(mockRole);

      const result = await rbacService.createRole(
        {
          name: 'admin',
          display_name: 'Administrator',
          description: 'Full admin access',
        },
        'admin-uuid-1',
      );

      expect(result).toHaveProperty('name', 'admin');
    });

    it('should throw 409 when role name already exists', async () => {
      mockFindRoleByName.mockResolvedValue(mockRole); // Duplicate found

      await expect(
        rbacService.createRole({ name: 'admin', display_name: 'Admin' }, 'admin-uuid-1'),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('updateRole', () => {
    it('should update role display name', async () => {
      mockFindRoleById.mockResolvedValue(mockRole);
      mockUpdateRole.mockResolvedValue({ ...mockRole, display_name: 'Super Admin' });

      const result = await rbacService.updateRole(
        'role-uuid-1',
        { display_name: 'Super Admin' },
        'admin-uuid-1',
      );

      expect(result).toHaveProperty('display_name', 'Super Admin');
    });

    it('should throw 404 when role not found for update', async () => {
      mockFindRoleById.mockResolvedValue(null);

      await expect(
        rbacService.updateRole('non-existent-id', { display_name: 'Test' }, 'admin-uuid-1'),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('should throw 403 when trying to update a system role', async () => {
      mockFindRoleById.mockResolvedValue({
        ...mockRole,
        is_system_role: true,
      });

      await expect(
        rbacService.updateRole('role-uuid-1', { display_name: 'Test' }, 'admin-uuid-1'),
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('deleteRole', () => {
    it('should delete a non-system role', async () => {
      mockFindRoleById.mockResolvedValue(mockRole);
      mockDeleteRole.mockResolvedValue(undefined);

      await expect(rbacService.deleteRole('role-uuid-1', 'admin-uuid-1')).resolves.not.toThrow();
    });

    it('should throw 403 when trying to delete a system role', async () => {
      mockFindRoleById.mockResolvedValue({
        ...mockRole,
        is_system_role: true,
      });

      await expect(rbacService.deleteRole('role-uuid-1', 'admin-uuid-1')).rejects.toMatchObject({
        status: 403,
      });
    });
  });

  // ==================== Permission Management ====================

  describe('getPermissions', () => {
    it('should return all permissions', async () => {
      mockFindAllPermissions.mockResolvedValue([mockPermission]);

      const result = await rbacService.getPermissions();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('assignPermissionsToRole', () => {
    it('should assign permissions to a role', async () => {
      mockFindRoleById.mockResolvedValue(mockRole);
      mockAssignPermissionsToRole.mockResolvedValue([
        { role_id: 'role-uuid-1', permission_id: 'perm-uuid-1' },
      ]);

      await expect(
        rbacService.assignPermissionsToRole('role-uuid-1', ['perm-uuid-1'], 'admin-uuid-1'),
      ).resolves.not.toThrow();
    });

    it('should throw 404 when role not found', async () => {
      mockFindRoleById.mockResolvedValue(null);

      await expect(
        rbacService.assignPermissionsToRole('non-existent-id', ['perm-uuid-1'], 'admin-uuid-1'),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  // ==================== User Role Management ====================

  describe('assignRoleToUser', () => {
    it('should assign a role to a user', async () => {
      mockFindRoleById.mockResolvedValue(mockRole);
      (db.query.userRoles.findFirst as jest.Mock).mockResolvedValue(null); // Not already assigned
      mockAssignRoleToUser.mockResolvedValue(mockUserRole);

      const result = await rbacService.assignRoleToUser(
        'user-uuid-1',
        'role-uuid-1',
        'admin-uuid-1',
      );

      expect(result).toHaveProperty('user_id', 'user-uuid-1');
    });

    it('should throw 409 when role already assigned to user', async () => {
      mockFindRoleById.mockResolvedValue(mockRole);
      (db.query.userRoles.findFirst as jest.Mock).mockResolvedValue(mockUserRole); // Already assigned

      await expect(
        rbacService.assignRoleToUser('user-uuid-1', 'role-uuid-1', 'admin-uuid-1'),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('removeRoleFromUser', () => {
    it('should remove a role from a user', async () => {
      (db.query.userRoles.findFirst as jest.Mock).mockResolvedValue(mockUserRole);
      mockRemoveRoleFromUser.mockResolvedValue(undefined);

      await expect(
        rbacService.removeRoleFromUser('user-uuid-1', 'role-uuid-1', 'admin-uuid-1'),
      ).resolves.not.toThrow();
    });

    it('should throw 404 when role not assigned to user', async () => {
      (db.query.userRoles.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        rbacService.removeRoleFromUser('user-uuid-1', 'role-uuid-1', 'admin-uuid-1'),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  // ==================== Permission Checking ====================

  describe('hasPermission', () => {
    it('should return true when user has the permission', async () => {
      mockUserHasPermission.mockResolvedValue(true);

      const result = await rbacService.hasPermission('user-uuid-1', 'users:read');

      expect(result).toBe(true);
    });

    it('should return false when user does not have the permission', async () => {
      mockUserHasPermission.mockResolvedValue(false);

      const result = await rbacService.hasPermission('user-uuid-1', 'users:delete');

      expect(result).toBe(false);
    });
  });
});
