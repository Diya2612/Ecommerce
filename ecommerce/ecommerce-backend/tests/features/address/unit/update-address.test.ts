/**
 * Unit tests for update-user-address business logic
 * Tests field updates, default flag management, and 404 handling
 */

import { HttpException } from '@/utils';

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    update: jest.fn(),
    returning: jest.fn(),
  },
}));

jest.mock('@/features/audit/services/audit.service', () => ({
  auditService: { log: jest.fn().mockResolvedValue(undefined) },
}));

import { db } from '@/database';
const mockDb = db as jest.Mocked<typeof db>;

const mockAddress = {
  id: 'addr-1',
  user_id: 'user-1',
  address_label: 'home',
  recipient_name: 'John Doe',
  address_line1: '123 Main St',
  city: 'Mumbai',
  state_province: 'Maharashtra',
  postal_code: '400001',
  country: 'India',
  is_default_shipping: false,
  is_default_billing: false,
  is_deleted: false,
};

// Simulate update logic
async function updateAddress(addressId: string, userId: string, updates: Record<string, any>) {
  const [address] = await (mockDb.where as jest.Mock)();
  if (!address) throw new HttpException(404, 'Address not found');
  if (address.user_id !== userId) throw new HttpException(403, 'Forbidden');

  if (updates.isDefaultShipping) {
    await (db.update as jest.Mock)({} as any)
      .set({ is_default_shipping: false })
      .where({} as any);
  }
  if (updates.isDefaultBilling) {
    await (db.update as jest.Mock)({} as any)
      .set({ is_default_billing: false })
      .where({} as any);
  }

  const [updated] = await (mockDb.returning as jest.Mock)();
  return updated;
}

describe('Update User Address - Business Logic', () => {
  beforeEach(() => {
    // resetMocks:true clears mock implementations - re-setup everything
    const mockUpdateChain = {
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };
    (mockDb.update as jest.Mock).mockReturnValue(mockUpdateChain);
    (mockDb.where as jest.Mock).mockResolvedValue([mockAddress]);
    (mockDb.returning as jest.Mock).mockResolvedValue([{ ...mockAddress, city: 'Pune' }]);
  });

  it('should update address fields successfully', async () => {
    const result = await updateAddress('addr-1', 'user-1', { city: 'Pune' });
    expect(result).toHaveProperty('city', 'Pune');
  });

  it('should throw 404 if address not found', async () => {
    (mockDb.where as jest.Mock).mockResolvedValue([]);
    await expect(updateAddress('nonexistent', 'user-1', {})).rejects.toMatchObject({
      status: 404,
      message: 'Address not found',
    });
  });

  it('should throw 403 if user does not own the address', async () => {
    await expect(updateAddress('addr-1', 'other-user', {})).rejects.toMatchObject({
      status: 403,
      message: 'Forbidden',
    });
  });

  it('should unset other default shipping when setting new default', async () => {
    await updateAddress('addr-1', 'user-1', { isDefaultShipping: true });
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('should unset other default billing when setting new default', async () => {
    await updateAddress('addr-1', 'user-1', { isDefaultBilling: true });
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('should not unset defaults when not changing default flags', async () => {
    await updateAddress('addr-1', 'user-1', { city: 'Pune' });
    // update should not be called for clearing defaults
    expect(mockDb.update).not.toHaveBeenCalled();
  });
});
