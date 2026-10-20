# Inventory Feature — Test Suite Documentation

> **Reviewer:** Developer Review Guide  
> **Date:** 2026-02-25  
> **Status:** ✅ All tests passing (124/124)

---

## Table of Contents

1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Test Files Summary](#test-files-summary)
4. [Integration Tests](#integration-tests)
5. [Unit Tests](#unit-tests)
6. [Running the Tests](#running-the-tests)
7. [Test Design Principles](#test-design-principles)
8. [API Coverage Matrix](#api-coverage-matrix)
9. [Known Considerations](#known-considerations)

---

## Overview

This document describes the test suite created for the **Inventory** feature of the Anant Enterprises backend API.

| Category         | Files | Tests | Status |
|------------------|-------|-------|--------|
| Integration      | 1     | 49    | ✅ Pass |
| Unit (Core)      | 1     | 23    | ✅ Pass |
| Unit (Adjustment)| 1     | 19    | ✅ Pass |
| Unit (Stock)     | 1     | 12    | ✅ Pass |
| Unit (Helpers)   | 1     | 21    | ✅ Pass |
| **Total**        | **5** | **124**| ✅ All Pass |

---

## Folder Structure

```
tests/features/inventory/
├── integration/
│   └── inventory.api.test.ts       # HTTP-level API tests (mocked services)
└── unit/
    ├── inventory-core.service.test.ts       # getInventoryList, getInventoryById, updateInventory, createInventoryForProduct, requireInventoryExists
    ├── inventory-adjustment.service.test.ts # adjustInventory, getInventoryHistory, getInventoryHistoryByProductId
    ├── inventory-stock.service.test.ts      # getAvailableStock, backfillInventoryForProducts
    └── inventory-helpers.service.test.ts   # isValidUUID, getStatusFromQuantity, resolveValidUserId
```

---

## Test Files Summary

### Integration Test — `inventory.api.test.ts`

**Strategy:** An inline Express application mirrors all inventory routes. Services are replaced with `jest.fn()` stubs. No database, Redis, or network calls are made.

**What is verified:**
- Correct HTTP status codes for success and error paths
- Service methods called with expected arguments and payloads
- Validation rejects malformed/invalid inputs (400)
- Error propagation from service layer → HTTP response
- Pagination and query parameter forwarding
- UUID format validation in route parameters

---

### Unit Test — `inventory-core.service.test.ts`

**Source:** `src/features/inventory/services/inventory-core.service.ts`

**What is verified:**
- `getInventoryList` correctly passes params to DB queries and returns paginated structure
- `getInventoryById` assembles the correct `product_name` for both base products and variants
- `updateInventory` resolves valid user ID and passes correct payload to DB
- `requireInventoryExists` throws a 404 `HttpException` when inventory is missing
- `createInventoryForProduct` handles duplicate prevention, variant vs. base product creation, custom location, and skips adjustment creation when user is invalid

---

### Unit Test — `inventory-adjustment.service.test.ts`

**Source:** `src/features/inventory/services/inventory-adjustment.service.ts`

**What is verified:**
- `adjustInventory` creates the correct `adjustment_type` (increase/decrease) based on sign of `quantity_change`
- Negative stock is blocked by default (allowNegative=false)
- Negative stock is allowed when allowNegative=true is passed
- `quantity_before` and `quantity_after` are correctly recorded in the audit record
- Optional fields `reference_number` and `notes` are persisted
- Throws `Invalid user for audit logging` when userId fails resolution
- Throws `Inventory record not found` when inventory is missing inside transaction
- Throws `Failed to update inventory` when `adjustQuantitiesWithStatus` returns null
- `getInventoryHistory` forwards the limit parameter and returns results in correct shape
- `getInventoryHistoryByProductId` paginates correctly and computes `totalPages`

---

### Unit Test — `inventory-stock.service.test.ts`

**Source:** `src/features/inventory/services/inventory-stock.service.ts`

**What is verified:**
- `getAvailableStock` returns stock data from the query when found
- `getAvailableStock` returns a zero-stock fallback object (inStock: false) when no record exists
- `backfillInventoryForProducts` inserts inventory records with correct defaults (Nashik, out_of_stock, 0 qty)
- Dry run mode (`dryRun: true`) does NOT call `bulkCreateInventory`
- When all products already have inventory, no records are created and the message reflects that
- `bulkCreateInventory` is called only once per backfill run
- Product details (`id`, `name`, `sku`) are correctly mapped in the result

---

### Unit Test — `inventory-helpers.service.test.ts`

**Source:** `src/features/inventory/services/inventory-helpers.service.ts`

**What is verified:**
- `isValidUUID` correctly validates v1, v4 UUIDs and rejects nulls, empty strings, wrong-length strings, and malformed formats
- `getStatusFromQuantity` maps: 0 → `out_of_stock`, 1–10 → `low_stock`, 11+ → `in_stock`
- `resolveValidUserId` returns the UUID as-is when valid
- `resolveValidUserId` falls back to the first admin user from DB when the provided ID is invalid
- `resolveValidUserId` returns `null` silently when DB returns null and no cache exists
- `resolveValidUserId` returns `null` silently when DB throws (fail-safe behavior)
- The module-level `cachedSystemUserId` singleton is handled via `jest.isolateModules` to avoid test pollution

---

## Running the Tests

### Run all inventory tests

```bash
npx jest tests/features/inventory --no-coverage
```

### Run with coverage

```bash
npx jest tests/features/inventory --coverage
```

### Run a single test file

```bash
# Integration
npx jest tests/features/inventory/integration/inventory.api.test.ts --no-coverage

# Unit — Core
npx jest tests/features/inventory/unit/inventory-core.service.test.ts --no-coverage

# Unit — Adjustment
npx jest tests/features/inventory/unit/inventory-adjustment.service.test.ts --no-coverage

# Unit — Stock
npx jest tests/features/inventory/unit/inventory-stock.service.test.ts --no-coverage

# Unit — Helpers
npx jest tests/features/inventory/unit/inventory-helpers.service.test.ts --no-coverage
```

### Run with verbose output

```bash
npx jest tests/features/inventory --no-coverage --verbose
```

---

## Test Design Principles

### Mocking Strategy

All tests use **jest module mocking** to isolate the unit under test:

- **Database layer** (`@/database`) — mocked with `jest.fn()` stubs; `db.transaction` is mocked to execute the callback immediately
- **Query functions** (`@/features/inventory/shared/queries`) — each query function is individually mocked
- **Dependency services** (helpers, audit, etc.) — mocked at the module level before imports

No real database connections, Redis, or Supabase calls are made.

### Integration Test App Structure

The integration test builds a minimal Express application inline:
1. Routes replicate the same validation logic as the real handlers (UUID regex, required fields, valid enum values)
2. Service calls are replaced with `jest.fn()` stubs from `inventoryServiceStub`
3. A middleware injects `req.userId = ADMIN_USER_ID` to simulate an authenticated user
4. A global error handler converts thrown errors to JSON responses

### UUID Fixtures

All test UUID constants use RFC-4122 compliant v4 UUIDs to pass the strict UUID validation regex used in route handlers:

```
ADMIN_USER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890'
INVENTORY_ID  = 'b2c3d4e5-f6a7-4901-bcde-f12345678901'
PRODUCT_ID    = 'c3d4e5f6-a7b8-4012-abcd-123456789012'
```

---

## API Coverage Matrix

| Endpoint | Method | Test File | Tests |
|---|---|---|---|
| `/inventory` | GET | integration | 8 |
| `/inventory/:id` | GET | integration | 4 |
| `/inventory/:id` | PUT | integration | 8 |
| `/inventory/:id/adjust` | POST | integration | 11 |
| `/inventory/:id/history` | GET | integration | 5 |
| `/inventory/products/:productId/history` | GET | integration | 4 |
| `/inventory/product/:productId/available` | GET | integration | 4 |
| `/inventory/backfill` | POST | integration | 6 |
| `getInventoryList` | service | unit/core | 6 |
| `getInventoryById` | service | unit/core | 4 |
| `updateInventory` | service | unit/core | 4 |
| `requireInventoryExists` | service | unit/core | 3 |
| `createInventoryForProduct` | service | unit/core | 6 |
| `adjustInventory` | service | unit/adjustment | 10 |
| `getInventoryHistory` | service | unit/adjustment | 4 |
| `getInventoryHistoryByProductId` | service | unit/adjustment | 5 |
| `getAvailableStock` | service | unit/stock | 5 |
| `backfillInventoryForProducts` | service | unit/stock | 7 |
| `isValidUUID` | helper | unit/helpers | 9 |
| `getStatusFromQuantity` | helper | unit/helpers | 6 |
| `resolveValidUserId` | helper | unit/helpers | 6 |

---

## Known Considerations

### 1. TypeScript Design-Time Errors

The test files show TypeScript IDE errors for `jest`, `describe`, `it`, `expect` etc. This is **expected and intentional** — the same pattern exists in all other test files in this project (e.g., `product.service.test.ts`, `audit.service.test.ts`).

**Reason:** The `tsconfig.json` excludes `tests/**/*` from TypeScript compilation. The tests are transpiled at runtime by `@swc/jest` which does **not** type-check — it only transpiles. The tests execute correctly.

**Fix (optional):** Add `"types": ["jest"]` to a `tsconfig.test.json` that includes the tests folder.

### 2. Module-Level Cache in `resolveValidUserId`

The `inventory-helpers.service.ts` uses a module-level variable `cachedSystemUserId` as a performance optimization to avoid repeated DB queries. This creates test isolation challenges.

**Solution used:** `jest.isolateModules()` is used for tests that need a fresh module state (null fallback and DB error tests). Other tests use `mockResolvedValueOnce` to avoid permanently overwriting mock implementations.

### 3. UUID Regex Validation

The integration test app uses the strict UUID regex:
```
/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
```

This validates RFC-4122 UUIDs only. Ensure any new test fixtures use compliant UUIDs (version digit must be `1`–`5`, variant nibble must be `8`, `9`, `a`, or `b`).

### 4. No Real Database Tests

These tests do not cover the actual SQL queries in `shared/queries/`. To test query correctness, integration tests against a real test database (using the patterns in `jest.integration.config.js`) would be needed.

---

*Generated as part of the Avhad Enterprises inventory feature test suite — February 2026.*
