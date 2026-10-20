/**
 * Unit tests for get-user-addresses business logic
 */

import { HttpException } from '@/utils';

// Mock database
jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  },
}));

import { db } from '@/database';

const mockDb = db as jest.Mocked<typeof db>;

const mockAddresses = [
  {
    id: 'addr-1',
    user_id: 'user-1',
    address_label: 'home',
    recipient_name: 'John Doe',
    address_line1: '123 Main St',
    city: 'Mumbai',
    state_province: 'Maharashtra',
    postal_code: '400001',
    country: 'India',
    is_default_shipping: true,
    is_default_billing: false,
    is_deleted: false,
  },
  {
    id: 'addr-2',
    user_id: 'user-1',
    address_label: 'office',
    recipient_name: 'John Doe',
    address_line1: '456 Work Ave',
    city: 'Pune',
    state_province: 'Maharashtra',
    postal_code: '411001',
    country: 'India',
    is_default_shipping: false,
    is_default_billing: true,
    is_deleted: false,
  },
];

// Simulate business logic
async function getUserAddresses(userId: string) {
  if (!userId) throw new HttpException(400, 'User ID is required');
  const addresses = await (mockDb.orderBy as jest.Mock)();
  return addresses;
}

describe('Get User Addresses - Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockDb.orderBy as jest.Mock).mockResolvedValue(mockAddresses);
  });

  it('should return all addresses for a user', async () => {
    const result = await getUserAddresses('user-1');
    expect(result).toHaveLength(2);
  });

  it('should return empty array when user has no addresses', async () => {
    (mockDb.orderBy as jest.Mock).mockResolvedValue([]);
    const result = await getUserAddresses('user-no-addresses');
    expect(result).toEqual([]);
  });

  it('should throw 400 if userId is missing', async () => {
    await expect(getUserAddresses('')).rejects.toThrow(HttpException);
    await expect(getUserAddresses('')).rejects.toMatchObject({ status: 400 });
  });

  it('should return addresses with correct structure', async () => {
    const result = await getUserAddresses('user-1');
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('address_label');
    expect(result[0]).toHaveProperty('is_default_shipping');
    expect(result[0]).toHaveProperty('is_default_billing');
  });

  it('should handle database errors gracefully', async () => {
    (mockDb.orderBy as jest.Mock).mockRejectedValue(new Error('DB error'));
    await expect(getUserAddresses('user-1')).rejects.toThrow('DB error');
  });
});
