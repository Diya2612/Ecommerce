/**
 * CustomerExportService Unit Tests
 *
 * Key insight: jest.mock() factories are hoisted, so NO outer-scope variables
 * may be referenced inside them. We define the mock select fn INSIDE the factory
 * and expose it via the db import itself.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/database', () => ({
  db: { select: jest.fn() },
}));

jest.mock('@/utils', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  HttpException: class HttpException extends Error {
    constructor(
      public status: number,
      message: string,
      public code?: string,
    ) {
      super(message);
      this.name = 'HttpException';
    }
  },
}));

jest.mock('@/utils/import-export', () => ({
  generateCSV: jest.fn().mockReturnValue('col1,col2\nval1,val2'),
  generateExcelBuffer: jest.fn().mockResolvedValue(Buffer.from('xlsx-mock')),
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(() => ({ type: 'eq' })),
  and: jest.fn((...a: any[]) => ({ type: 'and', a })),
  between: jest.fn(() => ({ type: 'between' })),
  inArray: jest.fn(() => ({ type: 'inArray' })),
  notInArray: jest.fn(() => ({ type: 'notInArray' })),
  or: jest.fn((...a: any[]) => ({ type: 'or', a })),
  ilike: jest.fn(() => ({ type: 'ilike' })),
}));

jest.mock('@/features/user/shared/user.schema', () => ({
  users: {
    id: 'id',
    email: 'email',
    is_deleted: 'is_deleted',
    gender: 'gender',
    tags: 'tags',
    created_at: 'created_at',
    updated_at: 'updated_at',
  },
}));
jest.mock('@/features/customer/shared/customer-profiles.schema', () => ({
  customerProfiles: { account_status: 'account_status', user_id: 'user_id' },
}));
jest.mock('@/features/address/shared/addresses.schema', () => ({
  userAddresses: { user_id: 'user_id', is_default_shipping: 'is_default_shipping' },
}));
jest.mock('@/features/rbac/shared/user-roles.schema', () => ({
  userRoles: { user_id: 'user_id', role_id: 'role_id' },
}));
jest.mock('@/features/rbac/shared/roles.schema', () => ({
  roles: { id: 'id', name: 'name' },
}));
jest.mock('@/features/customer/shared/validation', () => ({
  customerExportSchema: {},
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { CustomerExportService } from '@/features/customer/services/customer-export.service';
import { db } from '@/database';
import { generateCSV, generateExcelBuffer } from '@/utils/import-export';

// Type alias for convenience
const dbSelect = db.select as jest.Mock;

// ── Test Data ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'user-1',
  display_id: 'CUST-000001',
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice@example.com',
  display_name: 'Alice Smith',
  phone_number: '9876543210',
  secondary_email: null,
  secondary_phone_number: null,
  date_of_birth: null,
  gender: 'female',
  tags: ['vip'],
  email_verified: true,
  phone_verified: false,
  secondary_email_verified: false,
  profile_image_url: null,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-06-01'),
};

const mockProfile = {
  account_status: 'active',
  segments: ['premium'],
  notes: 'Test notes',
};

const mockAddress = {
  user_id: 'user-1',
  city: 'Mumbai',
  state_province: 'Maharashtra',
  postal_code: '400001',
  country: 'India',
};

const baseExportOptions = {
  format: 'csv' as const,
  scope: 'all' as const,
  selectedColumns: ['first_name', 'last_name', 'email'],
  filters: {},
};

// ── Chain builders ─────────────────────────────────────────────────────────────
//
// The service calls db.select() THREE times:
//   1. SYNC subquery: .select().from(userRoles).innerJoin(roles).where(...)
//      → NOT awaited, used as a subquery object arg to notInArray()
//   2. ASYNC main query: .select({user,profile}).from(users).leftJoin(...).where(...)
//      → awaited, returns [{ user, profile }]
//   3. ASYNC address query: .select().from(userAddresses).where(...)
//      → awaited, returns address rows

function makeSyncChain() {
  // .where returns a plain object (not a Promise)
  const c: any = {};
  c.from = jest.fn().mockReturnValue(c);
  c.innerJoin = jest.fn().mockReturnValue(c);
  c.where = jest.fn().mockReturnValue({ _type: 'subquery' });
  return c;
}

function makeAsyncChain(rows: any[]) {
  const c: any = {};
  c.from = jest.fn().mockReturnValue(c);
  c.leftJoin = jest.fn().mockReturnValue(c);
  c.where = jest.fn().mockResolvedValue(rows);
  return c;
}

function setupDbMocks(mainRows: any[], addressRows: any[] = []) {
  dbSelect
    .mockReturnValueOnce(makeSyncChain()) // call 1: admin subquery
    .mockReturnValueOnce(makeAsyncChain(mainRows)) // call 2: main user query
    .mockReturnValueOnce(makeAsyncChain(addressRows)); // call 3: address query
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CustomerExportService - exportCustomers', () => {
  let service: CustomerExportService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CustomerExportService();
    (generateCSV as jest.Mock).mockReturnValue(
      'first_name,last_name,email\nAlice,Smith,alice@example.com',
    );
    (generateExcelBuffer as jest.Mock).mockResolvedValue(Buffer.from('xlsx-mock'));
  });

  it('should export customers as CSV', async () => {
    setupDbMocks([{ user: mockUser, profile: mockProfile }], [mockAddress]);

    const result = await service.exportCustomers(baseExportOptions as any);

    expect(result.contentType).toBe('text/csv');
    expect(result.filename).toMatch(/customers-export-.+\.csv/);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(generateCSV).toHaveBeenCalled();
  });

  it('should export customers as XLSX', async () => {
    setupDbMocks([{ user: mockUser, profile: mockProfile }]);

    const result = await service.exportCustomers({ ...baseExportOptions, format: 'xlsx' } as any);

    expect(result.contentType).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(result.filename).toMatch(/\.xlsx$/);
    expect(generateExcelBuffer).toHaveBeenCalled();
  });

  it('should throw 400 when no columns are selected', async () => {
    setupDbMocks([{ user: mockUser, profile: mockProfile }]);

    await expect(
      service.exportCustomers({ ...baseExportOptions, selectedColumns: [] } as any),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('should throw 400 on unsupported format', async () => {
    setupDbMocks([{ user: mockUser, profile: mockProfile }]);

    await expect(
      service.exportCustomers({ ...baseExportOptions, format: 'pdf' as any } as any),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('should only include selected columns in output', async () => {
    setupDbMocks([{ user: mockUser, profile: mockProfile }]);

    await service.exportCustomers(baseExportOptions as any);

    const [, columns] = (generateCSV as jest.Mock).mock.calls[0];
    expect(columns).toEqual(['first_name', 'last_name', 'email']);
  });

  it('should populate address city when an address exists', async () => {
    setupDbMocks([{ user: mockUser, profile: mockProfile }], [mockAddress]);

    await service.exportCustomers({
      ...baseExportOptions,
      selectedColumns: ['first_name', 'city'],
    } as any);

    const [csvData] = (generateCSV as jest.Mock).mock.calls[0];
    expect((csvData as any[])[0].city).toBe('Mumbai');
  });

  it('should handle empty result set gracefully', async () => {
    setupDbMocks([]);

    const result = await service.exportCustomers(baseExportOptions as any);

    expect(result.buffer).toBeInstanceOf(Buffer);
    const [csvData] = (generateCSV as jest.Mock).mock.calls[0];
    expect(csvData).toHaveLength(0);
  });

  it('should apply scope=selected filter', async () => {
    setupDbMocks([{ user: mockUser, profile: mockProfile }]);

    const result = await service.exportCustomers({
      ...baseExportOptions,
      scope: 'selected',
      selectedIds: ['user-1'],
    } as any);

    expect(result).toHaveProperty('buffer');
  });

  it('should format Date fields to ISO date string', async () => {
    setupDbMocks([{ user: mockUser, profile: mockProfile }]);

    await service.exportCustomers({ ...baseExportOptions, selectedColumns: ['created_at'] } as any);

    const [csvData] = (generateCSV as jest.Mock).mock.calls[0];
    expect((csvData as any[])[0].created_at).toBe('2024-01-01');
  });
});
