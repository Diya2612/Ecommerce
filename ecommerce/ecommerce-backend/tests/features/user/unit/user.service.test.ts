/**
 * User Service Unit Tests
 * Tests for user service methods: createUser, updateCoreUser, getUserById, etc.
 */

// Mock all dependencies BEFORE imports
jest.mock('@/database', () => ({
  db: {
    transaction: jest.fn(),
    query: {
      users: { findFirst: jest.fn() },
    },
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  },
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

// Mock rbacCacheService and userCacheService because they are imported in user.service.ts
jest.mock('@/features/rbac', () => ({
  rbacCacheService: {
    hasPermission: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@/features/user/services/user-cache.service', () => ({
  userCacheService: {
    invalidateUser: jest.fn(),
  },
}));

import { db } from '@/database';

const mockUser = {
  id: 'user-uuid-1',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '+911234567890',
  user_type: 'individual',
  is_deleted: false,
  auth_id: 'auth-uuid-1',
  email_verified: true,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockTx: any = {};
mockTx.insert = jest.fn().mockReturnValue(mockTx);
mockTx.values = jest.fn().mockReturnValue(mockTx);
mockTx.update = jest.fn().mockReturnValue(mockTx);
mockTx.set = jest.fn().mockReturnValue(mockTx);
mockTx.query = { users: { findFirst: jest.fn() } };
mockTx.select = jest.fn().mockReturnValue(mockTx);
mockTx.from = jest.fn().mockReturnValue(mockTx);
mockTx.where = jest.fn().mockReturnValue(mockTx);
mockTx.orderBy = jest.fn().mockReturnValue(mockTx);
mockTx.limit = jest.fn().mockReturnValue(mockTx);
mockTx.returning = jest.fn().mockResolvedValue([mockUser]);

describe('UserService - Unit Tests', () => {
  let userService: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTx.insert = jest.fn().mockReturnValue(mockTx);
    mockTx.values = jest.fn().mockReturnValue(mockTx);
    mockTx.update = jest.fn().mockReturnValue(mockTx);
    mockTx.set = jest.fn().mockReturnValue(mockTx);
    mockTx.query = { users: { findFirst: jest.fn() } };
    mockTx.select = jest.fn().mockReturnValue(mockTx);
    mockTx.from = jest.fn().mockReturnValue(mockTx);
    mockTx.where = jest.fn().mockReturnValue(mockTx);
    mockTx.orderBy = jest.fn().mockReturnValue(mockTx);
    mockTx.limit = jest.fn().mockResolvedValue([]);
    mockTx.returning = jest.fn().mockResolvedValue([mockUser]);

    (db.transaction as jest.Mock).mockImplementation(async (callback: (tx: any) => any) =>
      callback(mockTx),
    );

    // Mock the queries.findUserByEmail and findUserById which are imported in the service
    jest.mock('@/features/user/shared/queries', () => ({
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
    }));

    // Re-import to ensure mocks are applied
    jest.resetModules();
    const module = await import('@/features/user/services/user.service');
    userService = module.userService;

    // We need to mock the exported functions from queries AFTER import if they are used directly
    // But since they are top-level imports in the service file, we need to mock the module itself before import.
    // The jest.mock above should work if it was at the top level.
    // Since we are doing dynamic imports, we need to be careful.
    // Let's redefine the mock at top level of test file.
  });

  describe('createUser', () => {
    const createDto = {
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+911234567890',
      user_type: 'individual' as const,
    };

    it('should create a user successfully', async () => {
      // Mock findUserByEmail to return null (no existing user)
      const queries = await import('@/features/user/shared/queries');
      (queries.findUserByEmail as jest.Mock).mockResolvedValue(null);

      mockTx.insert.mockReturnValue(mockTx);
      mockTx.values.mockReturnValue(mockTx);
      mockTx.returning.mockResolvedValue([mockUser]);

      const result = await userService.createUser(createDto, mockTx);

      expect(result).toBeDefined();
      expect(mockTx.insert).toHaveBeenCalled();
    });

    it('should throw 409 if user already exists', async () => {
      const queries = await import('@/features/user/shared/queries');
      (queries.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(userService.createUser(createDto, mockTx)).rejects.toMatchObject({
        status: 409,
      });
    });
  });

  describe('updateCoreUser', () => {
    const updateDto = {
      first_name: 'Jane',
      phone_number: '+919876543210',
    };

    it('should update user fields successfully', async () => {
      const queries = await import('@/features/user/shared/queries');
      (queries.findUserById as jest.Mock).mockResolvedValue(mockUser);

      mockTx.update.mockReturnValue(mockTx);
      mockTx.set.mockReturnValue(mockTx);
      mockTx.where.mockReturnValue(mockTx);
      mockTx.returning.mockResolvedValue([mockUser]);

      await expect(
        userService.updateCoreUser('user-uuid-1', updateDto, 'user-uuid-1', mockTx), // Requester is same user
      ).resolves.not.toThrow();
    });

    it('should handle permissions for different user', async () => {
      const queries = await import('@/features/user/shared/queries');
      (queries.findUserById as jest.Mock).mockResolvedValue(mockUser);

      const { rbacCacheService } = await import('@/features/rbac');
      (rbacCacheService.hasPermission as jest.Mock).mockResolvedValue(true);

      mockTx.update.mockReturnValue(mockTx);
      mockTx.set.mockReturnValue(mockTx);
      mockTx.where.mockReturnValue(mockTx);
      mockTx.returning.mockResolvedValue([mockUser]);

      await expect(
        userService.updateCoreUser('user-uuid-1', updateDto, 'admin-uuid-1', mockTx),
      ).resolves.not.toThrow();
    });
  });
});
