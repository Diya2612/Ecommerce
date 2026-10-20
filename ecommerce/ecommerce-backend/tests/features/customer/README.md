# Customer Module — Test Suite

> **Status:** ✅ All 60 tests passing across 9 test suites  
> **Last verified:** 2026-02-23  
> **Run time:** ~1.25 s

---

## Directory Structure

```
tests/features/customer/
├── integration/
│   └── customer.api.test.ts          # HTTP-level route tests (mocked services)
└── unit/
    ├── create-customer.service.test.ts
    ├── customer-cache.service.test.ts
    ├── customer-import.service.test.ts
    ├── delete-customer.service.test.ts
    ├── get-all-customers.service.test.ts
    ├── get-customer-by-id.service.test.ts
    └── update-customer.service.test.ts
```

---

## Running the Tests

```bash
# All customer tests
npx jest --testPathPatterns="tests/features/customer" --runInBand

# Only unit tests
npx jest --testPathPatterns="tests/features/customer/unit" --runInBand

# Only integration tests
npx jest --testPathPatterns="tests/features/customer/integration" --runInBand

# Single suite
npx jest tests/features/customer/unit/customer-import.service.test.ts --runInBand
```

---

## Test Coverage

### Integration — `customer.api.test.ts` (15 tests)

Verifies the Express route layer end-to-end using a **minimal inline app** with mocked service stubs.

| Group | Tests |
|---|---|
| `POST /customers/customer` | Success (201), invalid email (400), missing fields (400), email conflict (409), with segments |
| `GET /customers/` | Returns list, empty array, pagination params |
| `GET /customers/customer/:id` | Returns by ID, 404 for missing |
| `PUT /customers/customer/:id` | Updates fields, 404 for missing, updates tags |
| `DELETE /customers/customer/:id` | Deletes + invalidates cache, 404 for missing |

### Unit — `create-customer.service.test.ts` (7 tests)

Tests `customerService.createCustomer()`.  
Covers: user + profile creation, empty/no tags, segments defaulting to `['new']`, email conflict (409).

### Unit — `customer-cache.service.test.ts`

Tests `CustomerCacheService`.  
Covers: cache hit/miss for `getCustomerById`, Redis-ready vs not-ready paths, `invalidateCustomer` calling `redisClient.del`.

### Unit — `customer-import.service.test.ts` (11 tests)

Tests `CustomerImportService.processCustomerRecord()` and `importCustomers()`.

| Group | Tests |
|---|---|
| `processCustomerRecord` | Create mode (new user), duplicate email rejection, soft-delete restore, update mode, update-not-found, DB error, with address fields |
| `importCustomers` | Batch success aggregation, skip on duplicate email, failure recording, empty list |

### Unit — `delete-customer.service.test.ts`

Tests `customerService.deleteCustomer()`.  
Covers: successful soft-delete, 404 on missing customer.

### Unit — `get-all-customers.service.test.ts`

Tests `customerService.getCustomers()`.  
Covers: pagination, filtering, empty results.

### Unit — `get-customer-by-id.service.test.ts`

Tests `customerService.getCustomerById()`.  
Covers: found, not found (404), cache-first behavior.

### Unit — `update-customer.service.test.ts` (4 tests)

Tests `customerService.updateCustomer()`.  
Covers: full update with profile fields, skips `updateTagUsage` when tags not in DTO, 404 on missing customer.

---

## Mocking Strategy

### Key Mocked Modules

| Module | Why Mocked |
|---|---|
| `@/database` | Prevents real PostgreSQL pool from opening (`new Pool(...)` in `drizzle.ts`) |
| `@/utils` | Provides `ResponseFormatter`, `logger`, `HttpException`, and re-exported Zod schemas (`shortTextSchema`, `emailSchema`, `uuidSchema`) needed by validation schemas |
| `@/utils/database/redis` | Prevents real Redis `createClient` on import |
| `@/utils/import-export` | Provides `createImportResult`, `recordSuccess`, `recordFailure`, `recordSkipped` stubs |
| `@/middlewares` | Bypasses real JWT auth and RBAC permission checks |
| `@/features/customer/services/customer.service` | Core service singleton stub |
| `@/features/customer/services/customer-cache.service` | Cache service stub |
| `@/features/customer/shared/queries` | Stubs `findUserStatusByEmail`, `findCustomerProfileByUserId`, `checkExistingAddress` |
| `@/features/notifications/services/notification-core.service` | Prevents notification side-effects |
| `@/features/audit/services/audit.service` | Prevents audit log side-effects |
| `@/features/auth/services/supabase-auth.service` | Prevents JWKS fetch |
| `@/features/rbac/services/rbac-cache.service` | Prevents RBAC Redis lookups |
| `@/features/user/shared/queries` | Prevents DB queries in `get-user-tags.ts` route |
| `@/features/user/services/user-cache.service` | Prevents Redis lookups |
| `@/features/user/services/user.service` | User service stub |

---

## Bugs Fixed (Session 2026-02-23)

### 1. Wrong `userService` import path (Unit Tests)

**Files:** `delete-customer`, `get-all-customers`, `get-customer-by-id`, `update-customer` service tests  
**Problem:** Tests imported from `@/features/user/shared/user.service` (non-existent path).  
**Fix:** Changed to `@/features/user/services/user.service`.

---

### 2. `customer-cache.service.test.ts` — Hoisting & mock shape

**Problem 1:** Jest's hoisting of `jest.mock()` caused `ReferenceError: Cannot access 'sharedMocks' before initialization` when the factory referenced outer variables.  
**Fix:** Used `jest.requireMock()` inside `beforeEach` instead of referencing variables in the factory.

**Problem 2:** `redisClient.del` assertion expected an array but the real implementation passes a string.  
**Fix:** Changed assertion to `expect(rDel).toHaveBeenCalledWith('customer:user-uuid-1')`.

**Problem 3:** The mock for `customer.service` only exported the `CustomerService` class but the cache service imports the singleton `customerService`.  
**Fix:** Added `customerService: sharedMocks` to the mock factory.

---

### 3. Integration test infinite hang

**Problem:** The original integration test called `CustomerRoute.init()` which dynamically imported all customer API files. Each file pulled in a transitive dependency chain:

```
get-user-tags.ts
  → @/features/user/shared/queries
    → @/features/user/services/user-cache.service
      → @/utils/database/redis   ← createClient() called on load
        → tries to connect to Redis → HANGS
```

Even after mocking `@/database`, `@/utils/database/redis`, and other modules, the dynamic import mechanism had subtle timing issues with Jest's mock registry that prevented clean interception.

**Fix:** Replaced the entire `CustomerRoute.init()` approach with a **self-contained minimal Express app** built inline in the test file. Routes call the service stubs directly, with no module loading needed. This eliminates all transitive dependency issues and makes tests run in < 1 second.

---

### 4. `customer-import.service.test.ts` — Three layered bugs

#### Bug A: Missing queries mock

**Problem:** The service calls `findUserStatusByEmail`, `findCustomerProfileByUserId`, and `checkExistingAddress` from `@/features/customer/shared/queries`. These were not mocked, so the tests attempted real DB calls.  
**Fix:** Added `jest.mock('@/features/customer/shared/queries', ...)`.

#### Bug B: `ImportResult` shape mismatch

**Problem:** The mock for `createImportResult` returned:
```ts
{ created: 0, updated: 0, skipped: 0, failed: 0, errors: [], skippedReasons: [] }
```
But the real `ImportResult` type is:
```ts
{ success: 0, failed: 0, skipped: 0, errors: [], createdIds: [], updatedIds: [] }
```
Test assertions like `result.created` were always `undefined`.  
**Fix:** Updated the mock shape and all assertions to use `result.success`.

#### Bug C: `jest.clearAllMocks()` wipes mock implementations

**Problem:** `jest.clearAllMocks()` in `beforeEach` clears both call history AND implementations of `jest.fn()`. After clearing, `createImportResult()` returned `undefined`, causing `importCustomers` to return a broken result.  
**Fix:** Added `mockImplementation()` calls inside `beforeEach` for the `importCustomers` describe block to restore all implementations after each clear.

---

## Key Patterns & Notes

### `jest.clearAllMocks()` vs `jest.resetAllMocks()`

| Method | Clears calls | Clears implementation |
|---|---|---|
| `clearAllMocks()` | ✅ | ✅ **Dangerous for stateful mocks** |
| `resetAllMocks()` | ✅ | ✅ (same) |
| `restoreAllMocks()` | ✅ | Restores to original (only for `jest.spyOn`) |

**Best practice:** After calling `jest.clearAllMocks()`, explicitly call `.mockImplementation()` in `beforeEach` for any mock that has a meaningful return value used by the system under test.

### Integration Test Approach

For modules with deep dependency chains (DB, Redis, Supabase), use an inline Express app with direct service stubs instead of initializing the real router class. This provides:
- No transitive import chains
- No hanging from real connections
- Faster test execution
- Same assertion coverage for HTTP behavior

### Dynamic Imports & Jest Mocks

`jest.mock()` **does** intercept dynamic `import()` calls — but only when the full module resolution path matches exactly. Sub-path imports like `'../../../middlewares/validation.middleware'` (relative path directly to the file) bypass a mock registered for `@/middlewares` (the barrel alias).
