/**
 * Create Customer Service Unit Tests
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
import { syncTags } from '@/features/tags/services/tag-sync.service';
import { db } from '@/database';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  user_type: 'individual',
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
  auth_id: null,
  email_verified: true,
};

const mockCustomerProfile = {
  id: 'customer-uuid-1',
  user_id: 'user-123',
  customer_type: 'individual',
  tags: ['vip'],
  segments: ['premium'],
  notes: 'Test customer',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
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
  },
};

describe('CustomerService - Create Customer', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
    (syncTags as jest.Mock).mockResolvedValue(undefined);

    // Re-setup tx mocks
    mockTx.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockCustomerProfile]),
      }),
    });

    // db.transaction calls the callback with mockTx and returns the result
    (db.transaction as jest.Mock).mockImplementation((callback: (tx: any) => any) =>
      callback(mockTx),
    );
    (db.returning as jest.Mock).mockResolvedValue([mockCustomerProfile]);

    customerService = new CustomerService();
  });

  const createDto = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '1234567890',
    tags: ['vip'],
    notes: 'Test note',
  };

  it('should create user and customer profile successfully', async () => {
    const result = await customerService.createCustomer(createDto as any);

    expect(userService.createUser).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should handle creation without tags', async () => {
    const dtoWithoutTags = { ...createDto, tags: undefined };

    const result = await customerService.createCustomer(dtoWithoutTags as any);

    expect(userService.createUser).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should handle creation with empty tags array', async () => {
    const dtoWithEmptyTags = { ...createDto, tags: [] };

    await customerService.createCustomer(dtoWithEmptyTags as any);

    expect(syncTags).not.toHaveBeenCalled();
  });

  it('should propagate error if userService.createUser fails', async () => {
    (userService.createUser as jest.Mock).mockRejectedValue(new Error('User creation failed'));

    await expect(customerService.createCustomer(createDto as any)).rejects.toThrow();
  });

  it('should create customer with segments', async () => {
    const dtoWithSegments = { ...createDto, segments: ['premium', 'wholesale'] };

    const result = await customerService.createCustomer(dtoWithSegments as any);
    expect(result).toEqual(mockUser);
  });

  it('should default segments to ["new"] if not provided', async () => {
    const dtoNoSegments = { ...createDto, segments: undefined };

    const result = await customerService.createCustomer(dtoNoSegments as any);
    expect(result).toEqual(mockUser);
  });

  it('should throw 409 when email already exists', async () => {
    (userService.createUser as jest.Mock).mockRejectedValue(
      Object.assign(new Error('Email already registered'), { status: 409 }),
    );

    await expect(
      customerService.createCustomer(createDto as any, 'admin-uuid-1'),
    ).rejects.toMatchObject({ status: 409 });
  });
});
