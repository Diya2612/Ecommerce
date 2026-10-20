import { CustomerService } from '@/features/customer/services/customer.service';
import { db } from '@/database';
import { users } from '@/features/user/shared/user.schema';

// Mock dependencies
jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    leftJoin: jest.fn(),
    where: jest.fn(),
    innerJoin: jest.fn(),
    groupBy: jest.fn(),
    having: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
    orderBy: jest.fn(),
    $count: jest.fn(),
  },
}));

jest.mock('@/features/user/services/user.service');

describe('CustomerService - Get All Customers', () => {
  let customerService: CustomerService;

  // Define mock data matching Drizzle query result structure
  const mockCustomer = {
    user: {
      id: 'user-uuid-1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      phone_number: '1234567890',
      profile_picture_url: 'http://example.com/pic.jpg',
      is_active: true,
      is_verified: true,
      role: 'customer',
      created_at: new Date(),
      updated_at: new Date(),
      date_of_birth: '1990-01-01',
      gender: 'male',
      tags: ['vip'],
    },
    customerProfile: {
      id: 'profile-uuid-1',
      user_id: 'user-uuid-1',
      total_orders: 10,
      total_spent: 1000,
      wallet_balance: 50,
      loyalty_points: 100,
      segment: 'premium',
      notes: 'Good customer',
      last_order_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
    totalOrders: 10,
    city: 'New York',
    activeOrders: 2,
  };

  const createMockBuilder = (result: any[] = []) => {
    const builder: any = {
      then: (resolve: any) => resolve(result),
      as: jest
        .fn()
        .mockImplementation(() => ({ userId: 'userId', totalOrders: 'totalOrders', city: 'city' })),
    };

    const chainMethods = [
      'from',
      'innerJoin',
      'leftJoin',
      'where',
      'groupBy',
      'having',
      'limit',
      'offset',
      'orderBy',
      'select',
    ];

    chainMethods.forEach((method) => {
      builder[method] = jest.fn().mockReturnValue(builder);
    });

    return builder;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    customerService = new CustomerService();
  });

  it('should return list of customers with user data', async () => {
    const adminQuery = createMockBuilder();
    const totalQuery = createMockBuilder([{ total: 1 }]);
    const metricsQuery = createMockBuilder(); // for orderCountSq and citySq
    const mainQuery = createMockBuilder([mockCustomer]);
    const addressesQuery = createMockBuilder([]);
    const orderCountsQuery = createMockBuilder([]);

    (db.select as jest.Mock)
      .mockReturnValueOnce(adminQuery) // 1. adminUserIdsSubquery
      .mockReturnValueOnce(totalQuery) // 2. total query
      .mockReturnValueOnce(metricsQuery) // 3. orderCountSq
      .mockReturnValueOnce(metricsQuery) // 4. citySq
      .mockReturnValueOnce(mainQuery) // 5. main query execution
      .mockReturnValueOnce(addressesQuery) // 6. addressesMap query
      .mockReturnValueOnce(orderCountsQuery); // 7. orderCountsMap query

    const result = await customerService.getCustomers(1, 20, {});

    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('total', 1);
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('limit', 20);
    expect(result.users).toHaveLength(1);
    expect(result.users[0]).toHaveProperty('id', 'user-uuid-1');
  });

  it('should return empty array when no customers exist', async () => {
    const adminQuery = createMockBuilder();
    const totalQuery = createMockBuilder([{ total: 0 }]);
    const metricsQuery = createMockBuilder();
    const mainQuery = createMockBuilder([]); // Empty result

    (db.select as jest.Mock)
      .mockReturnValueOnce(adminQuery)
      .mockReturnValueOnce(totalQuery)
      .mockReturnValueOnce(metricsQuery)
      .mockReturnValueOnce(metricsQuery)
      .mockReturnValueOnce(mainQuery);
    // explicit mockReturnValues beyond what is called are fine (jest ignores extra),
    // but if getCustomers stops early, we just need enough mocks.
    // Since mainQuery returns [], logic for addresses/orderCounts won't run.

    const result = await customerService.getCustomers(1, 20, {});

    expect(result.users).toEqual([]);
    expect(result.total).toBe(0);
  });
});
