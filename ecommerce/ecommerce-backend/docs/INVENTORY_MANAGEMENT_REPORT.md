# Comprehensive Inventory & Cart Quantity Management Report

## Executive Summary

Full-stack analysis of the SportzSaga inventory management system spanning the **backend** (Node.js/Drizzle/PostgreSQL) and **frontend** (Next.js/React Query). The backend inventory system is architecturally solid with proper transactional locking and stock reservations. The primary gaps were on the **frontend** — missing error handling, no visual feedback during mutations, fake loading states, no pre-checkout validation, and a quantity fallback bug. All identified issues have been resolved.

---

## 1. Backend Inventory Architecture

### 1.1 Database Schema (`inventory.schema.ts`)

| Column | Purpose |
|---|---|
| `available_quantity` | Physical stock on hand |
| `committed_quantity` | Stock reserved (carts/pending orders) |
| `total_sold` | Cumulative units sold |
| `total_fulfilled` | Cumulative units shipped |
| **Available-to-sell** | `available_quantity - committed_quantity` |

**Constraints:**
- CHECK: `available_quantity >= 0`, `committed_quantity >= 0`
- UNIQUE: `(product_id, variant_id)` — ensures one inventory record per product or per variant
- Supports both product-level and variant-level inventory (mutually exclusive via DB check)

### 1.2 Service Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    INVENTORY SERVICES                         │
├───────────────────────┬───────────────────────────────────────┤
│ inventory-core        │ CRUD operations, create inventory     │
│ inventory-stock       │ getAvailableStock, backfill           │
│ inventory-adjustment  │ Manual adjustments + audit trail      │
│ cart-reservation      │ Cart stock reservations (timed)       │
│ order-reservation     │ Order-level stock lifecycle           │
└───────────────────────┴───────────────────────────────────────┘
```

### 1.3 Stock Reservation Flow

```
User adds to cart
  → SELECT FOR UPDATE on inventory row (transaction lock)
  → Validate: available_quantity - committed_quantity >= requested_qty
  → INCREMENT committed_quantity by requested_qty
  → Store reservation_id + expires_at on cart_item
  → Cart item saved with reserved stock

User updates quantity (e.g. 2 → 5)
  → SELECT FOR UPDATE on inventory row
  → Release old reservation (DECREMENT committed_quantity by 2)
  → Validate: available - committed >= 5 (new total)
  → Reserve new quantity (INCREMENT committed_quantity by 5)
  → Update cart item

User removes from cart
  → Release reservation (DECREMENT committed_quantity)
  → Soft-delete cart item

Reservation expires (background cleanup)
  → Find expired cart_items where reservation_expires_at < NOW
  → Release committed_quantity for each
  → Clear reservation fields on cart_items
```

### 1.4 Order Lifecycle

```
Checkout (reserveStockForOrder)
  → Transfer from cart reservation to order reservation
  → committed_quantity stays allocated
  
Fulfillment (fulfillOrderInventory)
  → DECREMENT available_quantity (stock leaves warehouse)
  → DECREMENT committed_quantity (reservation consumed)
  → INCREMENT total_sold, total_fulfilled

Cancellation (releaseReservation)
  → DECREMENT committed_quantity (free the reserved stock)

Return (processOrderReturn)
  → INCREMENT available_quantity (stock returns to shelf)
```

### 1.5 Backend Assessment

| Aspect | Status | Notes |
|---|---|---|
| Transactional locking | ✅ Solid | `SELECT FOR UPDATE` prevents race conditions |
| Reservation system | ✅ Complete | Timed reservations with configurable timeout |
| Order lifecycle | ✅ Complete | Reserve → Fulfill → Return all handled |
| Audit trail | ✅ Present | `inventory-adjustment.service.ts` logs changes |
| Stock validation | ✅ Correct | `available_quantity - committed_quantity` used consistently |
| Cleanup mechanism | ✅ Present | `cleanupExpiredCartReservations` service exists |
| Cart validation API | ✅ Complete | `POST /cart/validate` with auto-repair option |

**No backend code changes were needed** — the backend inventory system is well-implemented.

---

## 2. Frontend Gaps Identified & Fixed

### 2.1 Bug: Quantity Fallback Allowed Exceeding Stock

**File:** `CartPage.tsx`  
**Before:** `Math.min(item.availableStock || 99, ...)` — if `availableStock` was falsy (0), fell back to 99, allowing users to request more than available.  
**After:** `const maxQty = item.availableStock > 0 ? item.availableStock : 1` — explicit zero check.

### 2.2 Missing: Error Handling on Cart Mutations

**Files:** `CartPage.tsx`, `ProductInfo.tsx`, `CollectionGrid.tsx`  
**Before:** No error feedback when `updateCartItem`, `removeCartItem`, or `addToCart` failed.  
**After:** All mutations now show `toast.error()` with the backend error message, including:
- Stock insufficient errors ("Only X units available")
- Product unavailable errors
- Generic fallback messages

### 2.3 Missing: Success Toast Notifications

**Files:** `CartPage.tsx`, `ProductInfo.tsx`  
**Before:** No user feedback on successful cart operations.  
**After:** Toast notifications for: item removed, coupon applied/removed, offer applied, cart cleared, add-to-cart success.

### 2.4 Missing: Loading States During Mutations

**Files:** `CartPage.tsx`, `CartItemRow.tsx`  
**Before:** No visual indication when quantity is updating or item is being removed.  
**After:**
- `pendingItemId` tracked in CartPage and passed to each CartItemRow
- CartItemRow dims opacity to 0.6 during pending
- Quantity display replaced with spinner during update
- +/- buttons and Remove button disabled during pending

### 2.5 Bug: Fake Loading State in ProductCard

**File:** `ProductCard.tsx`  
**Before:** `setTimeout(() => setIsLoading(false), 1000)` — artificial 1-second timer instead of actual mutation state.  
**After:** `await onAddToCart?.(...)` wrapped in try/finally — loading reflects actual operation duration.

### 2.6 Missing: Optimistic Updates for Cart Operations

**File:** `use-cart.ts`  
**Before:** `useUpdateCartItemMutation` and `useRemoveCartItemMutation` only updated cache after server response.  
**After:**
- `onMutate`: Instantly updates local cache (quantity change reflected immediately)
- `onError`: Rolls back to previous cache state
- `onSuccess`: Replaces with authoritative server data
- Result: Cart UI feels instant while maintaining correctness on failure

### 2.7 Missing: Pre-Checkout Cart Validation

**Files:** `CartOrderSummaryPanel.tsx`, `MobileCheckoutBar.tsx`, `cart.api.ts`, `use-cart.ts`, `constants.ts`  
**Before:** "Place Order" / "Checkout" buttons navigated directly to `/checkout` without stock/price validation.  
**After:**
- New `validateCart()` API function calling `POST /cart/validate?auto_repair=true`
- New `useValidateCartMutation()` hook
- Checkout buttons now:
  1. Show "Validating..." with spinner
  2. Call backend validation (auto-repairs stale prices)
  3. On valid → proceed to checkout
  4. On stock issues → show toast with specific error
  5. On price changes → show "Prices were updated" info toast

### 2.8 Missing: Quantity Reset After Add-to-Cart

**File:** `ProductInfo.tsx`  
**Before:** After adding 5 units to cart, the quantity selector stayed at 5.  
**After:** `setQuantity(1)` called in `onSuccess` callback.

### 2.9 Improvement: Low Stock Warning Accuracy

**File:** `CartItemRow.tsx`  
**Before:** `item.availableStock <= 5` always shown (even when 0 = out of stock case).  
**After:** Low stock warning only shows when `item.inStock && availableStock <= 5 && availableStock > 0`. Added separate warning for `quantity > availableStock` case. Added price-changed indicator banner.

---

## 3. Files Modified

### Frontend (9 files)

| File | Changes |
|---|---|
| `src/hooks/use-cart.ts` | Optimistic updates for update/remove; new `useValidateCartMutation` |
| `src/lib/api/cart.api.ts` | New `validateCart()` function + `CartValidationResult` type |
| `src/utils/constants.ts` | Added `CART_VALIDATE` endpoint |
| `src/components/features/cart/CartPage.tsx` | Toast notifications, error handling, pending tracking, quantity fix |
| `src/components/features/cart/components/CartItemRow.tsx` | `isPending` prop, loading spinner, disabled states, price-changed banner |
| `src/components/features/cart/components/CartOrderSummaryPanel.tsx` | Pre-checkout validation with loading state |
| `src/components/features/cart/components/MobileCheckoutBar.tsx` | Pre-checkout validation with loading state |
| `src/components/features/product/ProductInfo.tsx` | Success/error toast, quantity reset |
| `src/components/shared/ProductCard.tsx` | Real loading state instead of fake setTimeout |
| `src/components/features/collection/CollectionGrid.tsx` | Promise-based add-to-cart, proper error handling |

### Backend (0 files)

No changes needed — the backend inventory system is complete and well-implemented.

---

## 4. Complete Quantity Flow Summary

### Add to Cart (Product Detail Page)
```
User selects variant → sets quantity → clicks "Add to Cart"
  → Frontend: validates variant selected + not out of stock + quantity ≤ available
  → POST /cart/items { product_id, variant_id, quantity }
  → Backend: SELECT FOR UPDATE → validate stock → reserve → save item
  → Response: full cart with enriched items (stock status, price)
  → Frontend: cache updated → toast "Added to cart" → quantity resets to 1
  → On error: toast with backend message (e.g. "Insufficient stock")
```

### Add to Cart (Collection Grid / Product Card)
```
User clicks "Add to Cart" on card
  → Frontend: loading state on button → POST with quantity=1
  → Backend: same flow as above
  → Success: toast "Added to cart" → button loading clears
  → Error: toast error message → button loading clears
```

### Update Quantity (Cart Page)
```
User clicks +/- on cart item
  → Frontend: optimistic update (instant visual change)
  → PUT /cart/items/:id { quantity: newQty }
  → Backend: SELECT FOR UPDATE → differential stock check → re-reserve
  → Success: cache replaced with server data
  → Error: cache rolled back to previous → toast error
  → UI: item row dims during mutation, spinner replaces quantity
```

### Remove from Cart
```
User clicks "Remove"
  → Frontend: optimistic removal (item vanishes immediately)
  → DELETE /cart/items/:id
  → Backend: release stock reservation → soft-delete
  → Success: toast "Product Name removed" → cache confirmed
  → Error: item reappears (cache rollback) → toast error
```

### Pre-Checkout Validation
```
User clicks "Place Order" / "Checkout"
  → Frontend: button shows "Validating..." with spinner
  → POST /cart/validate?auto_repair=true
  → Backend: check every item for stock + price + product availability
  → If auto_repair: stale prices updated automatically
  → Valid: redirect to /checkout
  → Stock issues: toast error with specific message
  → Price changes only: toast "Prices were updated. Please review."
```

---

## 5. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│                                                                  │
│  ProductInfo ──┐                                                 │
│  ProductCard ──┤── useAddToCartMutation ─── POST /cart/items     │
│  CollGrid   ──┘                                                  │
│                                                                  │
│  CartPage ────── useUpdateCartItemMutation ─ PUT /cart/items/:id │
│       │                (optimistic update)                        │
│       │──────── useRemoveCartItemMutation ── DELETE /cart/items/:id│
│       │                (optimistic remove)                        │
│       │──────── useClearCartMutation ─────── DELETE /cart          │
│                                                                  │
│  OrderSummary ── useValidateCartMutation ── POST /cart/validate  │
│  MobileBar ───┘                                                  │
│                                                                  │
│  CartContext ─── useCartQuery ─────────────── GET /cart           │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                          BACKEND                                 │
│                                                                  │
│  cart-orchestrator ──── cart-item.service ──── inventory rows     │
│       │                    │                    (SELECT FOR UPDATE)│
│       │                    │                                      │
│       │                cart-reservation.service                   │
│       │                    │                                      │
│       │              ┌─────┴──────┐                              │
│       │              │ committed  │                              │
│       │              │ quantity   │                              │
│       │              └─────┬──────┘                              │
│       │                    │                                      │
│  cart-validation ──── stock check (avail - committed)            │
│  cart-calculation ─── totals recalculation                       │
│                                                                  │
│  order-reservation ── reserve → fulfill → return                 │
│  inventory-adjustment ── manual +audit                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Key Design Decisions

1. **Available-to-sell = `available_quantity - committed_quantity`** — used consistently everywhere. Never exposes raw `available_quantity` to purchase decisions.

2. **`SELECT FOR UPDATE`** on inventory row during cart operations — prevents concurrent users from over-committing stock.

3. **Optimistic UI updates** — cart mutations show instant feedback while server processes. On failure, UI rolls back seamlessly.

4. **Pre-checkout validation** — catches stale data before payment flow. Auto-repairs price changes; blocks on stock issues.

5. **Backend sends `availableStock` per cart item** — includes user's own reserved quantity back (so user can see "available for me" count, not just global net stock).

6. **Timed reservations** — stock is reserved for a configurable duration. Expired reservations are cleaned up automatically, releasing `committed_quantity` back to the pool.
