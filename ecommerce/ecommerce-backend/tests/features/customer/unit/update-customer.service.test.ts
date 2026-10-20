/**
 * Update Customer Service Unit Tests
 */

jest.mock('@/features/user/services/user.service', () => ({
  userService: {
    createUser: jest.fn(),
    updateCoreUser: jest.fn(),
  },
}));

jest.mock('@/database', () => ({
  db: {
    transaction: jest.fn(),
    query: {
      users: { findFirst: jest.fn() },
      customerProfiles: { findFirst: jest.fn() },
      customers: { findFirst: jest.fn() },
    },
    update: jest.fn(),
    insert: jest.fn(),
    returning: jest.fn(),
  },
}));

jest.mock('@/features/audit/services/audit.service', () => ({
  auditService: { log: jest.fn() },
}));

jest.mock('@/features/tags/services/tag-sync.service', () => ({
  syncTags: jest.fn(),
  updateTagUsage: jest.fn(),
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

import { CustomerService } from '@/features/customer/services/customer.service';
import { userService } from '@/features/user/services/user.service';
import { updateTagUsage } from '@/features/tags/services/tag-sync.service';
import { db } from '@/database';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
};

const mockCustomerProfile = {
  id: 'customer-uuid-1',
  user_id: 'user-123',
  customer_type: 'individual',
  tags: ['vip'],
  segments: ['premium'],
  notes: 'Test customer',
  is_active: true,
};

const mockTx = {
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([mockCustomerProfile]),
    }),
  }),
  update: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  }),
  query: {
    users: { findFirst: jest.fn() },
    customerProfiles: { findFirst: jest.fn() },
    customers: { findFirst: jest.fn() },
  },
};

describe('CustomerService - Update Customer', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.updateCoreUser as jest.Mock).mockResolvedValue(mockUser);
    (updateTagUsage as jest.Mock).mockResolvedValue(undefined);

    // Re-setup mockTx implementations due to resetMocks
    mockTx.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockCustomerProfile]),
      }),
    });
    mockTx.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    });

    // db.transaction calls the callback with mockTx
    (db.transaction as jest.Mock).mockImplementation((callback: (tx: any) => any) =>
      callback(mockTx),
    );

    // Setup for updateCustomer extended tests
    (db.query.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomerProfile);
    (db.returning as jest.Mock).mockResolvedValue([mockCustomerProfile]);

    customerService = new CustomerService();
  });

  const updateDto = {
    first_name: 'Jane',
    tags: ['new-tag'],
    notes: 'Updated notes',
  };

  it('should update user and profile successfully', async () => {
    // Mock for core update
    await customerService.updateCustomer('user-123', updateDto as any, 'admin-123');
    expect(userService.updateCoreUser).toHaveBeenCalled();
  });

  it('should not call updateTagUsage if tags are not in update dto', async () => {
    const dtoWithoutTags = { first_name: 'Jane' };
    await customerService.updateCustomer('user-123', dtoWithoutTags as any, 'admin-123');
    expect(updateTagUsage).not.toHaveBeenCalled();
  });

  it('should handle update with profile fields', async () => {
    const profileUpdate = {
      notes: 'Updated notes',
      marketing_opt_in: true,
    };
    await customerService.updateCustomer('user-123', profileUpdate as any, 'admin-123');
    expect(userService.updateCoreUser).toHaveBeenCalled();
  });

  it('should throw 404 when customer not found (user not found)', async () => {
    const error404 = { status: 404, message: 'User not found' };
    (userService.updateCoreUser as jest.Mock).mockRejectedValue(error404);

    await expect(
      customerService.updateCustomer('non-existent-id', { notes: 'Test' }, 'admin-uuid-1'),
    ).rejects.toMatchObject({ status: 404 });
  });
});
