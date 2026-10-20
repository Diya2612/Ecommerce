/**
 * Unit tests for sync-user business logic
 */

// Mock Supabase client BEFORE imports
jest.mock('@/utils/supabase/client', () => ({
  supabaseAnon: {
    auth: {
      refreshSession: jest.fn(),
    },
  },
}));

// Mock supabase-auth.service BEFORE imports
jest.mock('@/features/auth/services/supabase-auth.service', () => ({
  verifySupabaseToken: jest.fn(),
  requestPasswordReset: jest.fn(),
  updatePassword: jest.fn(),
  getUserByAuthId: jest.fn(),
  loginWithSupabase: jest.fn(),
}));

// Mock shared queries to avoid full DB chain
jest.mock('@/features/auth/shared/queries', () => ({
  getUserByAuthIdQuery: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUserEmailVerification: jest.fn(),
  linkUserToAuth: jest.fn(),
  insertNewUser: jest.fn(),
  insertCustomerProfile: jest.fn(),
}));

// Mock logger
jest.mock('@/utils/logging/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { syncUser } from '@/features/auth/services/auth.service';
import * as supabaseAuthService from '@/features/auth/services/supabase-auth.service';
import * as queries from '@/features/auth/shared/queries';

const mockVerifySupabaseToken = supabaseAuthService.verifySupabaseToken as jest.MockedFunction<
  typeof supabaseAuthService.verifySupabaseToken
>;
const mockGetUserByAuthIdQuery = queries.getUserByAuthIdQuery as jest.MockedFunction<
  typeof queries.getUserByAuthIdQuery
>;
const mockGetUserByEmail = queries.getUserByEmail as jest.MockedFunction<
  typeof queries.getUserByEmail
>;
const mockInsertNewUser = queries.insertNewUser as jest.MockedFunction<
  typeof queries.insertNewUser
>;
const mockInsertCustomerProfile = queries.insertCustomerProfile as jest.MockedFunction<
  typeof queries.insertCustomerProfile
>;
const mockUpdateUserEmailVerification = queries.updateUserEmailVerification as jest.MockedFunction<
  typeof queries.updateUserEmailVerification
>;
const mockLinkUserToAuth = queries.linkUserToAuth as jest.MockedFunction<
  typeof queries.linkUserToAuth
>;

describe('Sync User Business Logic', () => {
  const mockAuthPayload = {
    sub: 'supabase-auth-id-123',
    email: 'test@example.com',
    email_confirmed_at: '2024-01-01T00:00:00.000Z',
    user_metadata: { name: 'Test User' },
    phone: null,
    aud: 'authenticated',
    exp: Date.now() / 1000 + 3600,
  };

  const mockExistingUser = {
    id: 'user-uuid-123',
    auth_id: 'supabase-auth-id-123',
    first_name: 'Test',
    middle_name: null,
    last_name: 'User',
    email: 'test@example.com',
    phone_number: '1234567890',
    email_verified: true,
    email_verified_at: new Date('2024-01-01'),
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncUser', () => {
    it('should throw 401 if token is invalid', async () => {
      mockVerifySupabaseToken.mockResolvedValue(null);

      await expect(syncUser('invalid-token', {})).rejects.toMatchObject({
        status: 401,
        message: 'Invalid or expired token',
      });
    });

    it('should return existing user without syncing if already present', async () => {
      mockVerifySupabaseToken.mockResolvedValue(mockAuthPayload as any);
      mockGetUserByAuthIdQuery.mockResolvedValue(mockExistingUser as any);

      const result = await syncUser('valid-token', {});

      expect(result).toEqual({
        id: mockExistingUser.id,
        synced: false,
        message: 'User already exists',
      });
      expect(mockInsertNewUser).not.toHaveBeenCalled();
    });

    it('should update email verification if status changed', async () => {
      const userWithUnverifiedEmail = { ...mockExistingUser, email_verified: false };
      mockVerifySupabaseToken.mockResolvedValue(mockAuthPayload as any);
      mockGetUserByAuthIdQuery.mockResolvedValue(userWithUnverifiedEmail as any);
      mockUpdateUserEmailVerification.mockResolvedValue(undefined);

      await syncUser('valid-token', {});

      expect(mockUpdateUserEmailVerification).toHaveBeenCalledWith(
        userWithUnverifiedEmail.id,
        true, // emailVerified from token
        expect.any(Date),
      );
    });

    it('should link existing user by email if auth_id not found but email exists', async () => {
      mockVerifySupabaseToken.mockResolvedValue(mockAuthPayload as any);
      // First lookup by auth_id returns null
      mockGetUserByAuthIdQuery.mockResolvedValue(null);
      // Email lookup returns user
      mockGetUserByEmail.mockResolvedValue(mockExistingUser as any);
      mockLinkUserToAuth.mockResolvedValue(undefined);

      const result = await syncUser('valid-token', {});

      expect(mockLinkUserToAuth).toHaveBeenCalledWith(
        mockExistingUser.id,
        mockAuthPayload.sub,
        true,
        expect.any(Date),
      );
      expect(result).toEqual({
        id: mockExistingUser.id,
        synced: true,
        message: 'Linked existing user',
      });
    });

    it('should create a new user and customer profile when no existing user found', async () => {
      const newUser = { id: 'new-user-uuid', ...mockExistingUser };
      mockVerifySupabaseToken.mockResolvedValue(mockAuthPayload as any);
      mockGetUserByAuthIdQuery.mockResolvedValue(null);
      mockGetUserByEmail.mockResolvedValue(null);
      mockInsertNewUser.mockResolvedValue(newUser as any);
      mockInsertCustomerProfile.mockResolvedValue(undefined);

      const result = await syncUser('valid-token', { first_name: 'Alice', last_name: 'Smith' });

      expect(mockInsertNewUser).toHaveBeenCalledWith(
        expect.objectContaining({
          auth_id: mockAuthPayload.sub,
          email: mockAuthPayload.email,
          first_name: 'Alice',
          last_name: 'Smith',
        }),
      );
      expect(mockInsertCustomerProfile).toHaveBeenCalledWith({
        user_id: newUser.id,
        account_status: 'active',
      });
      expect(result).toEqual({
        isNew: true,
        id: newUser.id,
        synced: true,
        message: 'New user created',
      });
    });

    it('should extract name from token metadata if not provided in body', async () => {
      const newUser = { id: 'new-user-uuid', ...mockExistingUser };
      const payloadWithMeta = {
        ...mockAuthPayload,
        user_metadata: { name: 'John Doe' },
      };
      mockVerifySupabaseToken.mockResolvedValue(payloadWithMeta as any);
      mockGetUserByAuthIdQuery.mockResolvedValue(null);
      mockGetUserByEmail.mockResolvedValue(null);
      mockInsertNewUser.mockResolvedValue(newUser as any);
      mockInsertCustomerProfile.mockResolvedValue(undefined);

      await syncUser('valid-token', {});

      expect(mockInsertNewUser).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
        }),
      );
    });

    it('should fall back to email prefix for name when no name metadata exists', async () => {
      const newUser = { id: 'new-user-uuid', ...mockExistingUser };
      const payloadNoMeta = {
        ...mockAuthPayload,
        email: 'johndoe@example.com',
        user_metadata: {},
      };
      mockVerifySupabaseToken.mockResolvedValue(payloadNoMeta as any);
      mockGetUserByAuthIdQuery.mockResolvedValue(null);
      mockGetUserByEmail.mockResolvedValue(null);
      mockInsertNewUser.mockResolvedValue(newUser as any);
      mockInsertCustomerProfile.mockResolvedValue(undefined);

      await syncUser('valid-token', {});

      expect(mockInsertNewUser).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'johndoe',
          last_name: '',
        }),
      );
    });
  });
});
