/**
 * CustomerImportService Unit Tests
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    transaction: jest.fn(),
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

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((_a: any, _b: any) => ({ type: 'eq' })),
  and: jest.fn((...args: any[]) => ({ type: 'and', args })),
}));

jest.mock('@/features/user/shared/user.schema', () => ({
  users: { id: 'id', email: 'email', is_deleted: 'is_deleted' },
}));
jest.mock('@/features/customer/shared/customer-profiles.schema', () => ({
  customerProfiles: { user_id: 'user_id' },
}));
jest.mock('@/features/address/shared/addresses.schema', () => ({
  userAddresses: { user_id: 'user_id', id: 'id' },
}));
jest.mock('@/features/customer/shared/validation', () => ({
  customerImportSchema: {},
}));

// Mock the shared queries used directly by the service
jest.mock('@/features/customer/shared/queries', () => ({
  findUserStatusByEmail: jest.fn(),
  findCustomerProfileByUserId: jest.fn(),
  checkExistingAddress: jest.fn(),
}));

jest.mock('@/utils/import-export', () => ({
  // Shape matches real ImportResult: { success, failed, skipped, errors, createdIds, updatedIds }
  createImportResult: jest.fn(() => ({
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    createdIds: [],
    updatedIds: [],
  })),
  recordSuccess: jest.fn((result, _mode, _id) => {
    result.success++;
  }),
  recordFailure: jest.fn((result, _row, _msg) => {
    result.failed++;
  }),
  recordSkipped: jest.fn((result, _row, _reason) => {
    result.skipped++;
  }),
  ImportResult: {},
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { CustomerImportService } from '@/features/customer/services/customer-import.service';
import { db } from '@/database';
import {
  createImportResult,
  recordSuccess,
  recordFailure,
  recordSkipped,
} from '@/utils/import-export';
import {
  findUserStatusByEmail,
  findCustomerProfileByUserId,
  checkExistingAddress,
} from '@/features/customer/shared/queries';

// ── Test Data ─────────────────────────────────────────────────────────────────

const validCustomer = {
  email: 'alice@example.com',
  first_name: 'Alice',
  last_name: 'Smith',
  display_name: 'Alice S.',
  phone_number: '9876543210',
  secondary_email: null,
  secondary_phone_number: null,
  date_of_birth: null,
  gender: 'female',
  tags: ['vip'],
  segments: ['premium'],
  account_status: 'active',
  notes: 'Test customer',
  address_line1: null,
  address_line2: null,
  city: null,
  state_province: null,
  postal_code: null,
  country: null,
  address_name: null,
};

// DB chain helpers
const buildSelectChain = (returnVal: any) => ({
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(returnVal),
});

const buildTx = (newUserId = 'new-user-1', hasExistingProfile = false) => ({
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ id: newUserId }]),
    }),
  }),
  update: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  }),
  select: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(hasExistingProfile ? [{ user_id: 'existing-user' }] : []),
  }),
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CustomerImportService - processCustomerRecord', () => {
  let service: CustomerImportService;
  const findUserStatusByEmailMock = findUserStatusByEmail as jest.Mock;
  const findCustomerProfileByUserIdMock = findCustomerProfileByUserId as jest.Mock;
  const checkExistingAddressMock = checkExistingAddress as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CustomerImportService();
  });

  it('should create a new customer when email does not exist (create mode)', async () => {
    const tx = buildTx('created-user-uuid');
    findUserStatusByEmailMock.mockResolvedValue(null); // no existing user
    (db.transaction as jest.Mock).mockImplementation((cb: any) => cb(tx));

    const result = await service.processCustomerRecord(validCustomer as any, 'create', 'admin-1');

    expect(result.success).toBe(true);
    expect(result.recordId).toBe('created-user-uuid');
    expect(tx.insert).toHaveBeenCalled();
  });

  it('should fail with "Email already exists" when create mode and user is not deleted', async () => {
    findUserStatusByEmailMock.mockResolvedValue({ id: 'existing-1', is_deleted: false });

    const result = await service.processCustomerRecord(validCustomer as any, 'create', 'admin-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email already exists');
  });

  it('should restore (update mode) a soft-deleted user in create mode', async () => {
    const tx = buildTx('existing-user-id');
    findUserStatusByEmailMock.mockResolvedValue({ id: 'existing-user-id', is_deleted: true });
    findCustomerProfileByUserIdMock.mockResolvedValue(null);
    checkExistingAddressMock.mockResolvedValue(null);
    (db.transaction as jest.Mock).mockImplementation((cb: any) => cb(tx));

    const result = await service.processCustomerRecord(validCustomer as any, 'create', 'admin-1');

    expect(result.success).toBe(true);
    // Should have called update (restore path)
    expect(tx.update).toHaveBeenCalled();
  });

  it('should fail with "Customer not found" in update mode when user does not exist', async () => {
    findUserStatusByEmailMock.mockResolvedValue(null);

    const result = await service.processCustomerRecord(validCustomer as any, 'update', 'admin-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Customer not found');
  });

  it('should update an existing user in update mode', async () => {
    const tx = buildTx('existing-user-id', false);
    findUserStatusByEmailMock.mockResolvedValue({ id: 'existing-user-id', is_deleted: false });
    findCustomerProfileByUserIdMock.mockResolvedValue(null);
    checkExistingAddressMock.mockResolvedValue(null);
    (db.transaction as jest.Mock).mockImplementation((cb: any) => cb(tx));

    const result = await service.processCustomerRecord(validCustomer as any, 'update', 'admin-1');

    expect(result.success).toBe(true);
    expect(tx.update).toHaveBeenCalled();
  });

  it('should return success:false if a DB error is thrown', async () => {
    findUserStatusByEmailMock.mockRejectedValue(new Error('DB connection lost'));

    const result = await service.processCustomerRecord(validCustomer as any, 'create', 'admin-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB connection lost');
  });

  it('should insert address when address fields are provided', async () => {
    const customerWithAddress = {
      ...validCustomer,
      address_line1: '123 Main St',
      city: 'Mumbai',
    };

    const tx = buildTx('user-with-address');

    (db.select as jest.Mock).mockReturnValue(buildSelectChain([]));
    (db.transaction as jest.Mock).mockImplementation((cb: any) => cb(tx));

    const result = await service.processCustomerRecord(
      customerWithAddress as any,
      'create',
      'admin-1',
    );

    expect(result.success).toBe(true);
  });
});

describe('CustomerImportService - importCustomers', () => {
  let service: CustomerImportService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore implementations cleared by clearAllMocks
    (createImportResult as jest.Mock).mockImplementation(() => ({
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      createdIds: [],
      updatedIds: [],
    }));
    (recordSuccess as jest.Mock).mockImplementation((result: any, _mode: any, _id: any) => {
      result.success++;
    });
    (recordFailure as jest.Mock).mockImplementation((result: any, _row: any, _msg: any) => {
      result.failed++;
    });
    (recordSkipped as jest.Mock).mockImplementation((result: any, _row: any, _reason: any) => {
      result.skipped++;
    });
    service = new CustomerImportService();
  });

  it('should process multiple customers and return an ImportResult', async () => {
    const customers = [validCustomer, { ...validCustomer, email: 'bob@example.com' }];

    // Spy on processCustomerRecord so we control outcomes
    jest
      .spyOn(service, 'processCustomerRecord')
      .mockResolvedValueOnce({ success: true, recordId: 'id-1' })
      .mockResolvedValueOnce({ success: true, recordId: 'id-2' });

    const result = await service.importCustomers(customers as any, 'create', 'admin-1');

    expect(service.processCustomerRecord).toHaveBeenCalledTimes(2);
    expect(recordSuccess).toHaveBeenCalledTimes(2);
    // result.failed stays 0 (the mock recordSuccess increments result.success)
    expect(result.failed).toBe(0);
    expect(result.success).toBe(2);
  });

  it('should record skipped entries when email already exists', async () => {
    jest
      .spyOn(service, 'processCustomerRecord')
      .mockResolvedValue({ success: false, error: 'Email already exists' });

    const result = await service.importCustomers([validCustomer as any], 'create', 'admin-1');

    expect(recordSkipped).toHaveBeenCalledWith(expect.any(Object), 1, 'Already exists');
  });

  it('should record failures for other errors', async () => {
    jest
      .spyOn(service, 'processCustomerRecord')
      .mockResolvedValue({ success: false, error: 'Unknown DB error' });

    await service.importCustomers([validCustomer as any], 'create', 'admin-1');

    expect(recordFailure).toHaveBeenCalledWith(expect.any(Object), 1, 'Unknown DB error');
  });

  it('should handle empty import list', async () => {
    const result = await service.importCustomers([], 'create', 'admin-1');

    expect(createImportResult).toHaveBeenCalled();
    // Real ImportResult uses `success` (not `created`) for successful count
    expect(result.success).toBe(0);
    expect(result.failed).toBe(0);
  });
});
