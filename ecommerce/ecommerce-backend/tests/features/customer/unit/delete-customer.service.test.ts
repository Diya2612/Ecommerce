/**
 * Delete Customer Service Unit Tests
 */

jest.mock('@/features/user/services/user.service', () => ({
  userService: {
    softDeleteUser: jest.fn(),
  },
}));

jest.mock('@/database', () => ({
  db: {
    transaction: jest.fn(),
    query: {
      users: { findFirst: jest.fn() },
    },
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
  auditService: { log: jest.fn() },
}));

jest.mock('@/features/tags/services/tag-sync.service', () => ({
  updateTagUsage: jest.fn(),
}));

import { CustomerService } from '@/features/customer/services/customer.service';
import { db } from '@/database';
import { userService } from '@/features/user/services/user.service';

const mockCustomerProfile = {
  id: 'customer-uuid-1',
  user_id: 'user-123',
  customer_type: 'individual',
  is_active: true,
  tags: ['vip'],
};

const mockTx = {
  query: {
    users: { findFirst: jest.fn() },
  },
};

describe('CustomerService - Delete Customer', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    jest.clearAllMocks();
    customerService = new CustomerService();

    // Setup transaction mock
    (db.transaction as jest.Mock).mockImplementation(async (cb) => {
      return cb(mockTx);
    });
  });

  it('should soft-delete a customer', async () => {
    (userService.softDeleteUser as jest.Mock).mockResolvedValue(undefined);
    (mockTx.query.users.findFirst as jest.Mock).mockResolvedValue(mockCustomerProfile);

    await expect(
      customerService.deleteCustomer('customer-uuid-1', 'admin-uuid-1'),
    ).resolves.not.toThrow();

    expect(userService.softDeleteUser).toHaveBeenCalledWith(
      'customer-uuid-1',
      'admin-uuid-1',
      mockTx,
    );
  });

  it('should propagate error when userService throws (e.g. 404)', async () => {
    const error404 = { status: 404, message: 'User not found' };
    (userService.softDeleteUser as jest.Mock).mockRejectedValue(error404);

    await expect(
      customerService.deleteCustomer('non-existent-id', 'admin-uuid-1'),
    ).rejects.toMatchObject({ status: 404 });
  });
});
