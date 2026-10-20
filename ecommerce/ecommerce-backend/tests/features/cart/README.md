# Cart Feature — Test Suite

Comprehensive unit and integration tests for the **Cart** feature.

---

## Overview

| File | Type | Tests | Coverage Focus |
|------|------|-------|----------------|
| `integration/cart.api.test.ts` | Integration | 30 | All 9 HTTP endpoints (routes → controllers → services) |
| `unit/cart-core.service.test.ts` | Unit | 22 | Cart lifecycle: create, retrieve, ownership, guest detection |
| `unit/cart-item.service.test.ts` | Unit | 18 | Item CRUD: add, update, remove, list, stock validation |
| `unit/cart-calculation.service.test.ts` | Unit | 13 | Totals recalculation, discount code apply/remove |
| `unit/cart-orchestrator.service.test.ts` | Unit | 13 | Cross-service orchestration: getCartWithDetails, remove/update with validation |
| `unit/cart-merge.service.test.ts` | Unit | 9 | Guest → user cart merge with conflict resolution |
| `unit/cart-validation.service.test.ts` | Unit | 10 | Stock/price/availability validation and auto-repair |
| **Total** | | **146** | |

---

## Running the Tests

```bash
# All cart tests
npx jest tests/features/cart --no-coverage

# Single file
npx jest tests/features/cart/unit/cart-core.service.test.ts --no-coverage

# With coverage
npx jest tests/features/cart --coverage
```

---

## Architecture

### Integration Test

`cart.api.test.ts` spins up an **inline Express app** with all six cart services stubbed using `jest.fn()`. It verifies:

- Correct HTTP status codes for success and error paths
- Route mounting and middleware (`optionalAuth`, `requireAuth`)
- Request body / param forwarding to service layer
- Response shape for each endpoint

Endpoints covered:

| Method | Route | Service |
|--------|-------|---------|
| `GET` | `/` | `cartOrchestratorService.getCartWithDetails` |
| `POST` | `/items` | `cartItemService.addItem` |
| `PUT` | `/items/:id` | `cartOrchestratorService.updateItemQuantityWithValidation` |
| `DELETE` | `/items/:id` | `cartOrchestratorService.removeItemWithValidation` |
| `POST` | `/discount` | `cartCalculationService.applyDiscountCode` |
| `DELETE` | `/discount` | `cartCalculationService.removeDiscountCode` |
| `DELETE` | `/` | `cartCoreService.softDeleteCart` (via controller) |
| `POST` | `/merge` | `cartMergeService.mergeGuestCartIntoUserCart` |
| `POST` | `/validate` | `cartValidationService.validateCart` |

### Unit Tests

Each unit test file mocks **all external dependencies** (database, other services, utility modules) and tests **one service class in isolation**.

Key mocking strategies:

| Situation | Strategy |
|-----------|----------|
| Drizzle ORM query functions (exported from `shared/queries.ts`) | `jest.mock('@/features/cart/shared/queries', () => ({ ... }))` |
| Inline `db` chains (private functions using `db` directly) | `jest.mock('@/database', ...)` with a chainable stub object |
| `db.transaction()` | `mockDb.transaction.mockImplementation(async (cb) => cb(mockTx))` |
| Redis (`redisClient`, `isRedisReady`) | Mocked inside `jest.mock('@/utils', ...)` |
| Discount services | `jest.mock('@/features/discount/services', ...)` |
| Inventory stock reservation | `jest.mock('@/features/inventory/services', ...)` + `CART_RESERVATION_CONFIG.ENABLED: false` |

---

## Test Data

All test UUIDs use valid RFC-4122 v4 format (version digit `4`, variant nibble `8/9/a/b`):

```
USER_ID    = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890'
CART_ID    = 'b2c3d4e5-f6a7-4901-bcde-f12345678901'
ITEM_ID    = 'c3d4e5f6-a7b8-4012-abcd-123456789012'
PRODUCT_ID = 'd4e5f6a7-b8c9-4123-abcd-234567890123'
```

---

## Important Notes

### TypeScript Lint Errors (Expected)

The `tests/` folder is **excluded from `tsconfig.json`**. This means VS Code will show `Cannot find name 'jest'`, `Cannot find name 'describe'`, etc. These are **design-time only** — `@swc/jest` transpiles tests without type-checking, so all tests run correctly at runtime.

### Drizzle ORM Mock Pattern

Drizzle ORM uses a **builder/chain pattern**: `db.select().from().where().limit()`. When mocking the `@/database` module, all intermediate methods must return the stub object, and the terminal method (`.limit()`, `.where()` after update) must return a `Promise`.

For functions that use `db` chains internally (not via exported query helpers), use a thenable-aware stub:

```typescript
jest.mock('@/database', () => {
  const stub = {};
  stub.select = jest.fn().mockReturnValue(stub);
  stub.from   = jest.fn().mockReturnValue(stub);
  stub.update = jest.fn().mockReturnValue(stub);
  stub.set    = jest.fn().mockReturnValue(stub);
  // where() must both support .limit() chaining (SELECT) and
  // be awaitable directly (UPDATE chains end here)
  stub.where  = jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue([]),
    then: (resolve) => Promise.resolve(undefined).then(resolve),
    catch: (rej)     => Promise.resolve(undefined).catch(rej),
    finally: (fn)    => Promise.resolve(undefined).finally(fn),
  }));
  return { db: stub, schema: {} };
});
```

### Cart Reservation Config

By default, `CART_RESERVATION_CONFIG.ENABLED` reads from the environment variable `ENABLE_CART_RESERVATIONS`. In tests it is mocked to `false` so `reserveCartStock` / `releaseCartStock` are never called, keeping tests simple.

---

## Coverage Areas

### `CartCoreService`
- `getCart` — returns cart or undefined
- `ensureActiveCart` — throws 404 if no active cart
- `getActiveCart` — returns active cart or null
- `getOrCreateCart` — creates cart if none exists
- `checkUnmergedGuestCart` — detects unmerged guest sessions
- `verifyCartOwnership` — throws 403 if ownership mismatch
- `buildEmptyCartResponse` — builds zero-value cart response

### `CartItemService`
- `addItem` — validates product, checks stock, creates or merges item
- `getItems` — lists cart items
- `getItemsWithDetails` — enriched list with stock/price status
- `updateItemQuantity` — updates quantity with stock validation
- `removeItem` — soft-deletes item
- `clearAllItems` — soft-deletes all items in cart

### `CartCalculationService`
- `recalculateCartTotals` — sums line totals, applies valid discount codes, updates DB
- `applyDiscountCode` — validates code, adds to cart, recalculates
- `removeDiscountCode` — removes specific code or clears all, recalculates

### `CartOrchestratorService`
- `getCartWithDetails` — fetches cart + items + stock/price flags + guest-cart detection
- `removeItemWithValidation` — verifies ownership before removing
- `updateItemQuantityWithValidation` — verifies ownership before updating

### `CartMergeService`
- `mergeGuestCartIntoUserCart` — acquires Redis lock, merges items, handles conflicts
- All 9 merge scenarios: no guest cart, no items, existing items, conflicts, Redis lock failures

### `CartValidationService`
- `validateCart` — checks stock, price, product availability for all items
- `autoRepair` — updates stale prices in-place
- Multi-item mixed-issue detection

---

## Related Source Files

```
src/features/cart/
├── services/
│   ├── cart-core.service.ts
│   ├── cart-item.service.ts
│   ├── cart-calculation.service.ts
│   ├── cart-orchestrator.service.ts
│   ├── cart-merge.service.ts
│   └── cart-validation.service.ts
├── shared/
│   ├── queries.ts           # Exported Drizzle query helpers
│   ├── carts.schema.ts
│   └── cart-items.schema.ts
├── utils/
│   └── pricing.util.ts
└── config/
    └── cart-reservation.config.ts
```
