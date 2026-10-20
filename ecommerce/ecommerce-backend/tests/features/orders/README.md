# Orders Feature — Test Suite

Comprehensive unit and integration tests for the **Orders** feature of Anant Enterprises backend.

---

## Overview

| Type        | Files | Tests | Status |
|-------------|-------|-------|--------|
| Unit        | 6     | 79    | ✅ All passing |
| Integration | 2     | 35    | ✅ All passing |
| **Total**   | **8** | **114** | **✅ 114 / 114** |

---

## Folder Structure

```
tests/features/orders/
├── README.md                            ← this file
├── unit/
│   ├── order-creation.service.test.ts   # 7 tests  — generateOrderNumber, createOrderFromCart
│   ├── order-validation.service.test.ts # 20 tests — validateOrder, validateAndWarnStock, mapOrderItems
│   ├── order-calculation.service.test.ts# 8 tests  — calculateOrderPricing, calculateGST
│   ├── order-status.service.test.ts     # 27 tests — transitions, updateStatus, cancel, refund
│   ├── order-management.service.test.ts # 10 tests — confirmDraft, duplicate, delete
│   └── order-update.service.test.ts     # 10 tests — updateFullOrder, updateTracking, updateFulfillment
└── integration/
    ├── orders.api.test.ts               # 33 tests — full HTTP round-trip for all 18 endpoints
    └── order-edge.test.ts               # 2 tests  — edge cases (negative qty, empty cart)
```

---

## Running the Tests

### All Orders Tests
```bash
npx jest tests/features/orders --no-coverage
```

### Unit Tests Only
```bash
npx jest tests/features/orders/unit --no-coverage
```

### Integration Tests Only
```bash
npx jest tests/features/orders/integration --no-coverage
```

### Single Service File
```bash
npx jest tests/features/orders/unit/order-creation.service.test.ts --no-coverage
```

### With Coverage
```bash
npx jest tests/features/orders --coverage
```

---

## Unit Tests — What's Covered

### `order-creation.service.test.ts` (7 tests)
Tests `OrderCreationService`:
- **`generateOrderNumber`** — format (`ORD-YY-NNNNNN`), zero-padding, sequential increment
- **`createOrderFromCart`** — no active cart (400), empty cart (400), missing addresses (400), successful creation

### `order-validation.service.test.ts` (20 tests)
Tests `OrderValidationService`:
- **`validateOrder`** — validates items, quantities, prices, user/email, shipping address, billing address, total amount; accumulates multiple errors
- **`validateAndWarnStock`** — empty items pass, all stock available, insufficient stock throws 400, oversell-allowed warns only
- **`validateItemQuantities`** — positive integers pass, zero fails, non-integer fails
- **`mapOrderItems`** — maps items to DB format with correct defaults

### `order-calculation.service.test.ts` (8 tests)
Tests `OrderCalculationService`:
- **`calculateOrderPricing`** — no discount, percentage discount, fixed discount, multiple items qty sum, shipping amount, default 18% GST, empty items
- **`calculateGST`** — delegates to `calculateGST` helper, returns `{ cgst, sgst, igst, taxAmount }` for intra-state

### `order-status.service.test.ts` (27 tests)
Tests `OrderStatusService`:
- **`getValidTransitions`** — all 6 statuses mapped correctly; terminal statuses return empty
- **`isValidTransition`** — valid/invalid transitions; no transitions out of cancelled
- **`updateOrderStatus`** — order not found, invalid transition, successful transition
- **`canBeCancelled`** — order not found, shipped/delivered → false; pending/confirmed → true
- **`canBeRefunded`** — order not found, delivered+paid → true, pending → false
- **`markAsCancelled`**, **`updatePaymentStatus`**, **`updateFulfillmentStatus`** — db.update called correctly

### `order-management.service.test.ts` (10 tests)
Tests `OrderManagementService`:
- **`confirmDraftOrder`** — not found (404), not draft (400), no items (400), success
- **`duplicateOrder`** — source not found (404), successful duplication
- **`deleteOrders`** — not found (404), paid order (400), delivered order (400), soft-delete success

### `order-update.service.test.ts` (10 tests)
Tests `OrderUpdateService`:
- **`updateFullOrder`** — by UUID not found (404), by order number not found (404), update by UUID, update by order number
- **`updateTracking`** — not found (404), success, null result (500)
- **`updateFulfillmentStatus`** — not found (404), success, order disappears after update (404)

---

## Integration Tests — What's Covered

### `orders.api.test.ts` (33 tests)
Full HTTP round-trip via Supertest against an Express app mounted with all order routers.

| Endpoint | Method | Tests |
|----------|--------|-------|
| `/orders` | POST | creates cart order, returns 401 unauthenticated |
| `/orders` | GET | returns user orders, 401 unauthenticated |
| `/orders/:id` | GET | returns order by ID, 404 not found, 401 unauthenticated |
| `/admin/orders` | GET | returns orders with filters, 401 unauthenticated |
| `/admin/orders/:id` | GET | returns order detail, 404 not found |
| `/admin/orders/:id` | PATCH | updates order, 404 not found |
| `/admin/orders/:id/status` | PUT | updates status |
| `/admin/orders/:id/fulfillment` | PUT | updates fulfillment status |
| `/admin/orders/:id/payment` | PUT | updates payment status |
| `/admin/orders/:id/tracking` | PUT | updates tracking info |
| `/admin/orders/:orderId/duplicate` | POST | duplicates order, 404 not found |
| `/admin/orders` | DELETE | bulk-deletes orders |
| `/admin/orders/:orderId` | DELETE | single delete, 404 not found |
| `/admin/orders/direct` | POST | creates direct order, 401 unauthenticated |

### `order-edge.test.ts` (2 tests) — pre-existing
- Rejects negative quantity
- Handles empty items payload

---

## Key Testing Patterns

### Singleton Instances
All order services export singleton instances (not classes). Tests import and use them directly:
```typescript
import { orderCreationService } from '@/features/orders/services/order-creation.service';
```

### TDZ-Safe Database Mocks
Variables referenced inside `jest.mock()` factory closures must be inline `jest.fn()` (not `const` declared above). References are obtained via `jest.requireMock()` after imports:
```typescript
jest.mock('@/database', () => ({
  db: {
    select: jest.fn(),
    transaction: jest.fn(),
    // ALL inline — no external variable references
  },
}));

function getDb() {
  return jest.requireMock('@/database').db;
}
```

### Re-asserting Mocks After `clearAllMocks()`
`jest.clearAllMocks()` in `beforeEach` clears all mock implementations. Any mock implementation needed for a specific test must be re-asserted in that test:
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // Re-assert default mock behaviour
  jest.requireMock('@/utils/helpers/tax-calculator').calculateGST
    .mockReturnValue({ cgst: 90, sgst: 90, igst: 0, taxAmount: 180 });
});
```

### Chainable DB Stub Pattern
```typescript
const mockWhere = jest.fn().mockResolvedValue([{ id: 'order-1' }]);
const mockFrom  = jest.fn().mockReturnValue({ where: mockWhere });
getDb().select.mockReturnValue({ from: mockFrom });
```

---

## Dependencies Mocked

| Module | Reason |
|--------|--------|
| `@/database` | Avoid real DB connections |
| `@/utils` | Control `HttpException`, `logger` |
| `@/features/orders/shared/queries` | Isolate query layer |
| `@/features/inventory/services` | Avoid stock system calls |
| `@/features/orders/services/order-calculation.service` | Isolate pricing logic |
| `@/features/orders/services/order-validation.service` | Isolate validation |
| `@/features/orders/services/order-conversion.service` | Isolate cart-to-order conversion |
| `@/features/orders/services/order-notification.service` | Avoid notification side-effects |
| `@/features/queue/services/event-publisher.service` | Avoid queue side-effects |
| `@/utils/helpers/tax-calculator` | Control GST calculations |
| `drizzle-orm` | Prevent SQL builder from running |
