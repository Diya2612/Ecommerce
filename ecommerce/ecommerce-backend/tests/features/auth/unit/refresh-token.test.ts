/**
 * Unit tests for refresh-token business logic
 */

// Mock Supabase client BEFORE imports
jest.mock('@/utils/supabase/client', () => ({
  supabaseAnon: {
    auth: {
      refreshSession: jest.fn(),
    },
  },
}));

// Mock database
jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  },
}));

// Mock shared queries used by auth.service
jest.mock('@/features/auth/shared/queries', () => ({
  getUserByAuthIdQuery: jest.fn(),
}));

import { supabaseAnon } from '@/utils/supabase/client';
import { getUserByAuthIdQuery } from '@/features/auth/shared/queries';
import { handleRefreshToken } from '@/features/auth/services/auth.service';

const mockSupabaseAnon = supabaseAnon as jest.Mocked<typeof supabaseAnon>;
const mockRefreshSession = mockSupabaseAnon.auth.refreshSession as jest.MockedFunction<any>;
const mockGetUserByAuthIdQuery = getUserByAuthIdQuery as jest.MockedFunction<
  typeof getUserByAuthIdQuery
>;

describe('Refresh Token Business Logic', () => {
  const mockUser = {
    id: 1,
    auth_id: 'supabase-user-id-123',
    first_name: 'Test',
    middle_name: null,
    last_name: 'User',
    email: 'test@example.com',
    phone_number: '1234567890',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockSupabaseUser = {
    id: 'supabase-user-id-123',
    email: 'test@example.com',
  };

  const mockSupabaseSession = {
    access_token: 'new.access.token',
    refresh_token: 'new.refresh.token',
    expires_at: 1234567890,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleRefreshToken', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      // Mock Supabase refreshSession success
      mockRefreshSession.mockResolvedValue({
        data: {
          user: mockSupabaseUser,
          session: mockSupabaseSession,
        },
        error: null,
      });

      // Mock database query via the shared query helper
      mockGetUserByAuthIdQuery.mockResolvedValue(mockUser as any);

      const result = await handleRefreshToken('valid.refresh.token');

      expect(mockSupabaseAnon.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: 'valid.refresh.token',
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          auth_id: mockUser.auth_id,
          first_name: mockUser.first_name,
          middle_name: mockUser.middle_name,
          last_name: mockUser.last_name,
          email: mockUser.email,
          phone_number: mockUser.phone_number,
          created_at: mockUser.created_at,
          updated_at: mockUser.updated_at,
        },
        token: mockSupabaseSession.access_token,
        refreshToken: mockSupabaseSession.refresh_token,
      });
    });

    it('should throw 401 if refresh session fails', async () => {
      mockRefreshSession.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid refresh token' },
      });

      await expect(handleRefreshToken('invalid.token')).rejects.toMatchObject({
        status: 401,
        message: 'Invalid refresh token',
      });
    });

    it('should throw 500 if user sync failed', async () => {
      mockRefreshSession.mockResolvedValue({
        data: {
          user: mockSupabaseUser,
          session: mockSupabaseSession,
        },
        error: null,
      });

      // Mock database query returning null (user not found)
      mockGetUserByAuthIdQuery.mockResolvedValue(null);

      await expect(handleRefreshToken('valid.token')).rejects.toMatchObject({
        status: 500,
        message: 'User sync failed',
      });
    });

    it('should return undefined phone_number if user has no phone', async () => {
      const userWithoutPhone = { ...mockUser, phone_number: null };

      mockRefreshSession.mockResolvedValue({
        data: {
          user: mockSupabaseUser,
          session: mockSupabaseSession,
        },
        error: null,
      });

      mockGetUserByAuthIdQuery.mockResolvedValue(userWithoutPhone as any);

      const result = await handleRefreshToken('valid.token');

      expect(result.user.phone_number).toBeUndefined();
    });

    it('should handle different user roles correctly', async () => {
      // Test with admin user
      const adminUser = {
        ...mockUser,
        first_name: 'Admin',
        last_name: 'User',
      };

      mockRefreshSession.mockResolvedValue({
        data: {
          user: mockSupabaseUser,
          session: mockSupabaseSession,
        },
        error: null,
      });

      mockGetUserByAuthIdQuery.mockResolvedValue(adminUser as any);

      const result = await handleRefreshToken('admin.token');

      expect(result.user.first_name).toBe('Admin');
      expect(result.user.last_name).toBe('User');
      expect(result.token).toBe(mockSupabaseSession.access_token);
    });
  });
});
