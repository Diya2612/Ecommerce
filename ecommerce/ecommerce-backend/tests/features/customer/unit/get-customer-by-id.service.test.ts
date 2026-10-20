/**
 * Get Customer By ID Service Unit Tests
 */

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    leftJoin: jest.fn(),
    where: jest.fn(),
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
  sanitizeUser: jest.fn((u) => u),
}));

// Dependencies
jest.mock('@/features/user/services/user.service', () => ({ userService: {} }));
jest.mock('@/features/audit/services/audit.service', () => ({ auditService: {} }));
jest.mock('@/features/tags/services/tag-sync.service', () => ({}));

import { CustomerService } from '@/features/customer/services/customer.service';
import { db } from '@/database';

const mockCustomer = {
  user: {
    id: 'user-uuid-1',
    first_name: 'John',
    email: 'test@example.com',
  },
  customerProfile: {
    id: 'customer-uuid-1',
    user_id: 'user-uuid-1',
    customer_type: 'individual',
  },
};

describe('CustomerService - Get Customer By ID', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    jest.clearAllMocks();
    customerService = new CustomerService();

    // Setup chainable mock for db.select

    // Create chain mock factory
    const createChain = (result: any) => ({
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue(result),
    });

    // Default mock behavior for successful user fetch
    (db.select as jest.Mock).mockReturnValue(createChain([mockCustomer]));
  });

  it('should return customer with user data', async () => {
    const chainForUser = {
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([mockCustomer]),
    };

    const chainForAddresses = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]),
    };

    (db.select as jest.Mock)
      .mockReturnValueOnce(chainForUser)
      .mockReturnValueOnce(chainForAddresses);

    const result = await customerService.getCustomerById('user-uuid-1');

    expect(result).toHaveProperty('id', 'user-uuid-1');
    expect(result).toHaveProperty('details');
  });

  it('should throw 404 when customer not found', async () => {
    const chainForUser = {
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]), // Empty result
    };

    (db.select as jest.Mock).mockReturnValue(chainForUser);

    await expect(customerService.getCustomerById('non-existent-id')).rejects.toMatchObject({
      status: 404,
    });
  });
});
