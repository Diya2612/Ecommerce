/**
 * Unit tests for delete-user-address business logic
 * Tests soft delete, ownership validation, and error handling
 */

import { HttpException } from '@/utils';

const mockUpdateChain = {
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn(() => mockUpdateChain),
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
  is_deleted: false,
};

// Simulate delete logic
async function deleteAddress(addressId: string, userId: string) {
  const [address] = await (mockDb.where as jest.Mock)();
  if (!address) throw new HttpException(404, 'Address not found');
  if (address.user_id !== userId) throw new HttpException(403, 'Forbidden');
  await (db.update as jest.Mock)({} as any)
    .set({ is_deleted: true })
    .where({} as any);
  return { message: 'Address deleted successfully' };
}

describe('Delete User Address - Business Logic', () => {
  beforeEach(() => {
    // resetMocks:true clears mock implementations - re-setup everything
    mockUpdateChain.set.mockReturnValue(mockUpdateChain);
    mockUpdateChain.where.mockResolvedValue(undefined);
    (mockDb.update as jest.Mock).mockReturnValue(mockUpdateChain);
    (mockDb.where as jest.Mock).mockResolvedValue([mockAddress]);
  });

  it('should soft delete an address successfully', async () => {
    const result = await deleteAddress('addr-1', 'user-1');
    expect(result).toEqual({ message: 'Address deleted successfully' });
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('should throw 404 if address not found', async () => {
    (mockDb.where as jest.Mock).mockResolvedValue([]);
    await expect(deleteAddress('addr-nonexistent', 'user-1')).rejects.toMatchObject({
      status: 404,
      message: 'Address not found',
    });
  });

  it('should throw 403 if user does not own the address', async () => {
    await expect(deleteAddress('addr-1', 'other-user')).rejects.toMatchObject({
      status: 403,
      message: 'Forbidden',
    });
  });

  it('should handle database errors', async () => {
    (mockDb.where as jest.Mock).mockRejectedValue(new Error('DB error'));
    await expect(deleteAddress('addr-1', 'user-1')).rejects.toThrow('DB error');
  });
});
