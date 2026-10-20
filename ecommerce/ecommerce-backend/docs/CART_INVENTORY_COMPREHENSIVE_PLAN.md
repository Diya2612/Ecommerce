# Cart × Inventory — Comprehensive Scenario Plan & Defense Implementation

> **Scope**: Full user journey from product browse → add to cart → checkout → order,  
> covering every edge case, race condition, and consistency guarantee.  
> **System**: SportzSaga (Backend + Frontend)

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Database Schema Snapshot](#2-database-schema-snapshot)
3. [Stock Formula & Invariants](#3-stock-formula--invariants)
4. [Complete User Journey Scenarios](#4-complete-user-journey-scenarios)
   - A. Guest User Flow
   - B. Authenticated User Flow
   - C. Guest → Login Transition (Cart Merge)
   - D. Add to Cart
   - E. Update Quantity
   - F. Remove Item
   - G. Variant Selection
   - H. Discount / Coupon
   - I. Pre-Checkout Validation
   - J. Checkout & Payment
   - K. Post-Order Inventory
5. [Race Condition & Concurrency Scenarios](#5-race-condition--concurrency-scenarios)
6. [Edge Cases Covered in Current Codebase](#6-edge-cases-covered-in-current-codebase)
7. [GAPS — Edge Cases NOT Covered](#7-gaps--edge-cases-not-covered)
8. [Proposed New Database Fields](#8-proposed-new-database-fields)
9. [Defense Implementation Plan](#9-defense-implementation-plan)
10. [Flow Diagrams](#10-flow-diagrams)
11. [Testing Matrix](#11-testing-matrix)

---

## 1. System Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                             │
│                                                                       │
│  ProductCard ──► ProductDetailPage ──► CartPage ──► CheckoutPage      │
│       │                 │                  │              │            │
│  [Add to Cart]   [Select Variant]   [Update Qty]   [Place Order]      │
│       │                 │           [Remove Item]        │            │
│       ▼                 ▼           [Apply Coupon]       ▼            │
│  useAddToCartMutation  useCart()    useMutations    createOrder()      │
│       │                                                  │            │
│  x-session-id (guest) / Auth token (logged in)           │            │
└───────────┬──────────────────────────────────────────────┬────────────┘
            │              HTTP / REST                     │
┌───────────▼──────────────────────────────────────────────▼────────────┐
│                      BACKEND (Express + Drizzle)                      │
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │
│  │ Cart APIs   │  │ Cart Services│  │  Inventory  │  │   Orders    │  │
│  │             │  │              │  │  Services   │  │   Service   │  │
│  │ add-to-cart │  │ cart-item    │  │             │  │             │  │
│  │ update-item │  │ cart-core    │  │ cart-reserv │  │ create-from │  │
│  │ remove-item │  │ cart-calc    │  │ order-reserv│  │   -cart     │  │
│  │ clear-cart  │  │ cart-merge   │  │ stock-svc   │  │ fulfill     │  │
│  │ validate    │  │ cart-valid   │  │ cleanup-job │  │ cancel      │  │
│  │ merge       │  │ orchestrator │  │             │  │             │  │
│  └─────────────┘  └──────────────┘  └────────────┘  └─────────────┘  │
│                                                                       │
│  ┌────────────────────────── PostgreSQL ──────────────────────────┐   │
│  │ carts │ cart_items │ inventory │ inventory_adjustments │        │   │
│  │ products │ product_variants │ orders │ order_items │            │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌──── Redis ────┐                                                    │
│  │ merge locks   │                                                    │
│  └───────────────┘                                                    │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema Snapshot

### `inventory` table

| Column              | Type    | Purpose                                       |
|---------------------|---------|-----------------------------------------------|
| `product_id`        | uuid    | Link to base product (NULL if variant)         |
| `variant_id`        | uuid    | Link to variant (NULL if base product)         |
| `available_quantity` | int    | Physical stock on hand                         |
| `committed_quantity` | int    | Reserved stock (cart + order holds)            |
| `status`            | enum    | `in_stock`, `low_stock`, `out_of_stock`        |
| `total_sold`        | int    | Lifetime sell count                             |
| `total_fulfilled`   | int    | Lifetime fulfilled count                        |

**Constraint**: `product_id XOR variant_id` — exactly one must be set.

### `cart_items` table (reservation fields)

| Column                   | Type      | Purpose                           |
|--------------------------|-----------|-----------------------------------|
| `reservation_id`         | uuid      | Links to active stock hold        |
| `reserved_at`            | timestamp | When reservation was created      |
| `reservation_expires_at` | timestamp | Auto-release deadline             |

### Key Formula

```
Sellable stock = available_quantity - committed_quantity
```

- `committed_quantity` **increases** when: cart reservation created, order reservation created
- `committed_quantity` **decreases** when: cart item removed, reservation expires, order fulfilled, order cancelled

---

## 3. Stock Formula & Invariants

### Core Invariant (must ALWAYS hold)

```
available_quantity >= 0
committed_quantity >= 0
committed_quantity <= available_quantity   ← GOAL (not enforced by DB today!)
```

### Stock States

| State          | Condition                                        |
|----------------|--------------------------------------------------|
| `in_stock`     | `available_quantity - committed_quantity > low_stock_threshold` |
| `low_stock`    | `0 < (available - committed) <= low_stock_threshold` |
| `out_of_stock` | `available_quantity - committed_quantity <= 0`    |

### Who Modifies Inventory

| Actor               | Operation               | `available_qty` | `committed_qty` |
|----------------------|-------------------------|-----------------|-----------------|
| Admin (stock-in)     | Adjust inventory        | **+N**          | —               |
| Add to cart          | Reserve cart stock      | —               | **+N**          |
| Update cart qty (+)  | Release old, reserve new| —               | **±Δ** (net)    |
| Remove from cart     | Release reservation     | —               | **-N**          |
| Reservation expired  | Cleanup cron job        | —               | **-N**          |
| Order fulfilled      | Apply fulfillment       | **-N**          | **-N**          |
| Order cancelled      | Return reservation      | —               | **-N**          |
| Return processed     | Restock                 | **+N**          | —               |

---

## 4. Complete User Journey Scenarios

### A. Guest User Flow

```
Guest visits site
    ├─ No auth token, browser generates x-session-id (localStorage)
    ├─ Guest adds product → cart created with session_id, user_id=NULL
    ├─ Cart operations work identically via session_id matching
    ├─ Guest closes browser → session_id persists in localStorage
    ├─ Guest returns later → same session_id → same cart retrieved
    └─ Cart reservation may expire → cron cleanup releases stock → 
       next GET /cart shows stock issues
```

**Current Defense**: ✅ `findActiveCartBySessionId()`, `optionalAuth` middleware  
**Gap**: ⚠️ No session expiry policy — guest cart can linger indefinitely

---

### B. Authenticated User Flow

```
User logs in
    ├─ Auth token in header → userId extracted
    ├─ Cart lookup by user_id first, then session_id fallback
    ├─ All cart mutations require userId OR sessionId
    └─ Cart ownership verified on every mutation
```

**Current Defense**: ✅ `verifyCartOwnership()`, `getOrCreateCart()`

---

### C. Guest → Login Transition (Cart Merge)

```
Guest has cart (session_id="abc")
    ├─ Guest logs in → frontend calls POST /cart/merge { session_id: "abc" }
    │
    ├─ CASE 1: User has NO existing cart
    │   └─ Create new user cart → move all guest items → mark guest cart "converted"
    │
    ├─ CASE 2: User already has a cart with DIFFERENT items
    │   └─ For each guest item:
    │       ├─ No duplicate → addItem() to user cart
    │       └─ Duplicate product+variant exists → sum quantities, cap at available stock
    │
    ├─ CASE 3: User has cart with SAME items
    │   └─ Merge quantities → min(sumQty, availableStock)
    │
    ├─ CASE 4: Guest cart already "converted" (double-merge attempt)
    │   └─ Return { merged: false, message: "Guest cart already merged" }
    │
    ├─ CASE 5: No guest cart found
    │   └─ Return { merged: false, message: "No guest cart found" }
    │
    └─ CASE 6: Concurrent merge attempts
        └─ Redis lock (30s TTL) → second attempt returns "Merge already in progress"
```

**Current Defense**: ✅ Redis merge lock, quantity capping, converted status check  
**Gap**: ⚠️ Merged item reservations may create double-commit (guest reservation not released before user reservation created)

---

### D. Add to Cart — All Scenarios

```
User clicks "Add to Cart"
    │
    ├─ INPUT VALIDATION
    │   ├─ product_id: required, uuid format
    │   ├─ variant_id: optional, uuid format
    │   ├─ quantity: integer, 1-100 range
    │   └─ FAIL → 400 Zod validation error
    │
    ├─ PRODUCT CHECKS
    │   ├─ Product not found → 404
    │   ├─ Product status != "active" → 400 "not available for purchase"
    │   ├─ Product is_deleted=true → 404 (not returned by query)
    │   └─ Product archived → 400
    │
    ├─ VARIANT CHECKS (if variant_id provided)
    │   ├─ Variant not found → 404
    │   ├─ Variant.product_id != product_id → 400 "does not belong to product"
    │   ├─ Variant is_active=false → 400 "not available"
    │   ├─ Variant is_deleted=true → 404 (not returned by query)
    │   └─ ✅ Variant valid → use variant's price and SKU
    │
    ├─ INVENTORY CHECK (inside transaction with SELECT FOR UPDATE)
    │   ├─ No inventory record → 404 "inventory not found"
    │   ├─ Sellable stock (avail - committed) < requested qty → 400 "Insufficient stock"
    │   └─ ✅ Stock sufficient → proceed
    │
    ├─ DUPLICATE CHECK
    │   ├─ Same product+variant already in cart → INCREMENT quantity
    │   │   ├─ New total > available stock → 400 "Cannot add more"
    │   │   └─ ✅ Release old reservation → Create new reservation for total qty
    │   │
    │   └─ New item → CREATE cart_item record
    │       └─ ✅ Create reservation for requested qty
    │
    ├─ RESERVATION (if CART_RESERVATION_CONFIG.ENABLED)
    │   ├─ Increment committed_quantity by N
    │   ├─ Set reservation_id, reserved_at, reservation_expires_at (30 min)
    │   └─ reservation_expires_at = NOW() + 30 minutes
    │
    ├─ PRICING
    │   ├─ cost_price = compare_at_price (or selling_price if no compare)
    │   ├─ final_price = selling_price (current live price)
    │   ├─ discount_amount = (compare_at_price - selling_price) × quantity
    │   ├─ line_subtotal = selling_price × quantity
    │   └─ line_total = selling_price × quantity
    │
    └─ POST-ADD
        ├─ Recalculate cart totals (subtotal, discount, grand_total)
        ├─ Re-validate any applied discount codes
        └─ Return full cart response with enriched items
```

**Current Defense**: ✅ Transaction + SELECT FOR UPDATE, Zod validation, product/variant status checks  
**Gap**: ⚠️ No max items per cart limit, ⚠️ No max quantity per product limit configurable from admin

---

### E. Update Cart Item Quantity — All Scenarios

```
User changes quantity in cart
    │
    ├─ INPUT: { quantity: N } where 1 ≤ N ≤ 100
    │
    ├─ CART ITEM LOOKUP
    │   ├─ Item not found → 404
    │   ├─ Item has no product_id → 400
    │   └─ ✅ Item found → verify cart ownership
    │
    ├─ PRICE REFRESH (before transaction)
    │   ├─ If variant → fetch current variant price
    │   └─ If base product → fetch current product price
    │   └─ ✅ Uses LIVE price, not stale cart price
    │
    ├─ TRANSACTION (with row locks)
    │   ├─ Lock cart_item row (SELECT FOR UPDATE)
    │   ├─ Lock inventory row (SELECT FOR UPDATE)
    │   │
    │   ├─ QUANTITY INCREASE (N > current)
    │   │   ├─ additionalNeeded = N - currentQty
    │   │   ├─ sellableStock < additionalNeeded → 400 "Insufficient stock"
    │   │   └─ ✅ Proceed with update
    │   │
    │   ├─ QUANTITY DECREASE (N < current)
    │   │   └─ Always allowed (releases excess reservation)
    │   │
    │   ├─ Update cart_item quantity, pricing fields
    │   ├─ Release old reservation → Create new reservation for N units
    │   └─ Recalculate cart totals
    │
    └─ EDGE CASES
        ├─ Set qty to same value → still processes (no short-circuit)
        ├─ Product deleted between cart add and update → 400 (no product details)
        ├─ Variant deactivated between add and update → still updates 
        │   (⚠️ GAP: should check variant.is_active)
        └─ Price changed since add → uses new price ✅
```

**Current Defense**: ✅ Row-level locking, `additionalNeeded` check, live price refresh  
**Gap**: ⚠️ No variant active status re-check on update, ⚠️ No product active status re-check on update

---

### F. Remove Item — All Scenarios

```
User removes item from cart
    │
    ├─ Item not found → 404
    ├─ Cart not found → 404
    ├─ Not authorized → 403
    │
    ├─ ✅ Release stock reservation (committed_quantity -= item.quantity)
    ├─ ✅ Soft-delete cart item (is_deleted = true)
    ├─ ✅ Recalculate cart totals
    └─ Return updated cart
```

**Current Defense**: ✅ Ownership verification, reservation release, soft delete

---

### G. Variant Selection Scenarios

```
Product with variants (e.g., Size: S, M, L)
    │
    ├─ SCENARIO 1: User adds base product (no variant_id)
    │   ├─ Inventory filter: product_id=X AND variant_id IS NULL
    │   ├─ Checks base product's own inventory row
    │   └─ ✅ Works correctly if base product has separate inventory
    │
    ├─ SCENARIO 2: User adds specific variant
    │   ├─ Inventory filter: variant_id=Y
    │   ├─ Checks variant-specific inventory row
    │   └─ ✅ Independent stock per variant
    │
    ├─ SCENARIO 3: Same product, different variants in cart
    │   ├─ Two separate cart_items (product_id same, variant_id different)
    │   ├─ Each has independent inventory and reservation
    │   └─ ✅ De-duplication by product_id + variant_id pair
    │
    ├─ SCENARIO 4: User switches variant (frontend)
    │   ├─ Frontend: remove old variant item + add new variant
    │   ├─ OR: user must manually remove old, add new
    │   └─ ⚠️ GAP: No atomic "switch variant" backend API
    │
    ├─ SCENARIO 5: Variant deactivated while in cart
    │   ├─ getItemsWithDetails → checks variant_status (is_active)
    │   ├─ Shows inStock=false if variant deactivated
    │   └─ ✅ Surfaced via hasStockIssues flag in cart response
    │
    └─ SCENARIO 6: Variant deleted while in cart
        ├─ variant_id FK set to NULL on delete (onDelete: 'set null')
        ├─ Cart item becomes "orphaned" variant
        └─ ⚠️ GAP: cart_items.variant_id becomes NULL, item appears as base product
```

---

### H. Discount / Coupon Scenarios

```
User applies coupon code
    │
    ├─ SCENARIO 1: Valid coupon
    │   ├─ Normalize to UPPERCASE
    │   ├─ Validate: code exists, active, not expired, min purchase met, 
    │   │   usage limit not exceeded, applicable to cart items
    │   ├─ Add to applied_discount_codes array
    │   ├─ Recalculate grand_total = subtotal - discount
    │   └─ ✅ Only ONE discount code allowed at a time
    │
    ├─ SCENARIO 2: Already applied
    │   └─ 400 "Discount code already applied"
    │
    ├─ SCENARIO 3: Empty cart
    │   └─ 400 "Cannot apply discount to empty cart"
    │
    ├─ SCENARIO 4: Invalid/expired code
    │   └─ 400 with validation message from discount service
    │
    ├─ SCENARIO 5: Coupon valid on add, invalid on recalculate
    │   ├─ On every recalculateCartTotals(), discount is RE-VALIDATED
    │   ├─ If no longer valid → removed from applied_discount_codes
    │   └─ ✅ Self-healing: stale coupons auto-removed
    │
    ├─ SCENARIO 6: Remove coupon
    │   ├─ Remove from array → recalculate → discount_total = 0
    │   └─ ✅ Works correctly
    │
    └─ SCENARIO 7: Cart items change after coupon applied
        ├─ Remove item that met min purchase → coupon may become invalid
        ├─ recalculateCartTotals() catches this → removes coupon
        └─ ✅ Self-healing
```

**Current Defense**: ✅ Re-validation on every recalculation, single code limit  
**Gap**: ⚠️ No user notification when coupon auto-removed during item changes

---

### I. Pre-Checkout Validation — All Checks

```
POST /cart/validate (auto_repair=true/false)
    │
    ├─ For EACH cart item:
    │   │
    │   ├─ CHECK 1: Product exists
    │   │   └─ FAIL → issue: "product_unavailable"
    │   │
    │   ├─ CHECK 2: Product status = "active"
    │   │   └─ FAIL → issue: "product_unavailable"
    │   │
    │   ├─ CHECK 3: Stock availability
    │   │   ├─ totalAvailableForUser = netStock + item.quantity (own reservation)
    │   │   ├─ totalAvailable == 0 → issue: "out_of_stock"
    │   │   ├─ totalAvailable < requested → issue: "insufficient_stock"
    │   │   └─ ✅ Stock OK
    │   │
    │   └─ CHECK 4: Price consistency
    │       ├─ item.final_price != product.selling_price → issue: "price_changed"
    │       ├─ If auto_repair=true → update item to current price, recalculate
    │       └─ ✅ Price matches
    │
    ├─ RESULT
    │   ├─ valid: true if NO critical issues (out_of_stock, insufficient_stock, product_unavailable)
    │   ├─ price_changed is NOT critical (informational only)
    │   └─ issues[] array with all problems
    │
    └─ MISSING CHECKS (GAPs):
        ├─ ⚠️ Variant active status not checked
        ├─ ⚠️ Variant price changes not checked (only base product price)
        ├─ ⚠️ Max quantity per product not validated
        ├─ ⚠️ Cart staleness not checked (cart unused for weeks)
        └─ ⚠️ Discount re-validation not done in validate endpoint
```

---

### J. Checkout & Payment Flow

```
User clicks "Place Order"
    │
    ├─ STEP 1: Frontend validates cart
    │   └─ POST /cart/validate?auto_repair=false
    │       ├─ hasStockIssues → block checkout, show warnings
    │       └─ ✅ valid → proceed
    │
    ├─ STEP 2: Create order from cart
    │   ├─ POST /orders/from-cart
    │   │
    │   ├─ Find user's active cart
    │   ├─ Get cart items
    │   ├─ EXTEND cart reservations by 60 minutes (buffer for payment)
    │   │
    │   ├─ VALIDATE STOCK AGAIN (server-side)
    │   │   ├─ Pass reserved_quantity so user's own holds don't count against them
    │   │   └─ ⚠️ GAP: If reservation expired between "validate" and "create-order",
    │   │       committed_quantity was already released → stock check passes but
    │   │       no active reservation exists
    │   │
    │   ├─ Calculate pricing (subtotal, discount, tax, shipping, total)
    │   ├─ CREATE ORDER in transaction:
    │   │   ├─ Insert order record (status: pending)
    │   │   ├─ Insert order_items (copy from cart_items)
    │   │   ├─ Mark cart as "converted" (unless Razorpay — wait for payment)
    │   │   └─ ✅ Atomic
    │   │
    │   └─ Queue notifications async
    │
    ├─ STEP 3: Payment
    │   ├─ SCENARIO A: COD (Cash on Delivery)
    │   │   ├─ Order created with status "confirmed"
    │   │   ├─ Cart marked "converted" immediately
    │   │   └─ ✅ Stock remains committed until fulfillment
    │   │
    │   ├─ SCENARIO B: Razorpay (Online Payment)
    │   │   ├─ Order created with status "pending"
    │   │   ├─ Frontend opens Razorpay checkout modal
    │   │   │
    │   │   ├─ PAYMENT SUCCESS
    │   │   │   ├─ Verify payment signature server-side
    │   │   │   ├─ Update order status → "confirmed"
    │   │   │   ├─ Mark cart as "converted"
    │   │   │   └─ ✅ Stock committed now belongs to order
    │   │   │
    │   │   ├─ PAYMENT FAILED
    │   │   │   ├─ Frontend shows error overlay with retry
    │   │   │   ├─ User can retry payment → re-opens Razorpay
    │   │   │   └─ ⚠️ GAP: If user never retries, order stays "pending" forever
    │   │   │
    │   │   ├─ PAYMENT TIMEOUT (user closes modal)
    │   │   │   └─ ⚠️ GAP: Same as failed — no automatic cleanup
    │   │   │
    │   │   └─ RAZORPAY WEBHOOK (server-to-server)
    │   │       ├─ Backup verification if frontend callback fails
    │   │       └─ Updates order status asynchronously
    │   │
    │   └─ SCENARIO C: User abandons checkout
    │       ├─ Cart reservations still active (extended by 60 min)
    │       ├─ After expiry → cron job releases committed stock
    │       └─ ✅ Stock eventually freed
    │
    └─ STEP 4: Post-Order
        ├─ Cart reservation → now belongs to order (via committed_quantity)
        ├─ ⚠️ No explicit release of cart reservation + create of order reservation
        │   (relies on committed_quantity staying the same)
        └─ Order fulfillment → decreases both available_quantity and committed_quantity
```

---

### K. Order Fulfillment → Inventory Impact

```
Admin marks order "fulfilled"
    │
    ├─ For each order item:
    │   ├─ available_quantity -= item.quantity (stock left warehouse)
    │   ├─ committed_quantity -= item.quantity (reservation fulfilled)
    │   ├─ total_sold += item.quantity
    │   ├─ total_fulfilled += item.quantity
    │   └─ Create inventory_adjustment audit record
    │
    └─ ✅ available and committed both decrease → net sellable unchanged for other customers
```

---

## 5. Race Condition & Concurrency Scenarios

### RC-1: Two Users Add Last Item Simultaneously

```
Stock: available=10, committed=9 → sellable=1

User A: ADD qty=1          User B: ADD qty=1
    │                           │
    ▼                           ▼
 SELECT FOR UPDATE           (waits for lock)
 sellable=1 >= 1 ✅              │
 committed → 10                  │
 (commits TX)                    ▼
                           SELECT FOR UPDATE
                           sellable=0 < 1 ❌
                           → 400 "Insufficient stock"
```

**Defense**: ✅ `SELECT ... FOR UPDATE` row-level lock on inventory table

---

### RC-2: Same User Opens Two Tabs, Adds Same Product

```
Tab 1: ADD product X, qty=2     Tab 2: ADD product X, qty=3
    │                                │
    ▼                                ▼
 Find existing item: none        (waits if same TX timing)
 Create new item qty=2           Find existing item: qty=2 (from Tab 1)
 Reserve 2 units                 New qty = 2+3 = 5
                                 Check stock for 5 → OK
                                 Release old (2) + Reserve new (5)
```

**Defense**: ✅ `findCartItemByProduct()` deduplication within transaction

---

### RC-3: Reservation Expires During Checkout

```
Timer: reservation created at T=0, expires at T+30min
User: starts checkout at T+28min
    │
    ├─ extendCartReservation() → extends to T+88min ✅
    │   (only extends reservation_expires_at, does NOT touch committed_quantity)
    │
    └─ BUT if cron runs at T+30 and item already has expires_at < NOW():
        ├─ Cron: releases committed_quantity
        ├─ extendCartReservation: updates expires_at but committed already released
        └─ ⚠️ RACE: committed_quantity was released but cart item still has reservation_id
```

**Defense**: Partially covered (extend before order creation)  
**Gap**: ⚠️ Race between cron cleanup and extend operation — needs transaction coordination

---

### RC-4: Cart Merge During Active Cart Operations

```
User logs in → merge starts
    │
    ├─ Redis lock acquired ✅
    │
    Meanwhile: Another tab updates user cart
    ├─ Cart update succeeds (different operation, no lock needed)
    ├─ Merge adds items → quantities may conflict
    └─ ⚠️ Merge reads stale userItems before update completes
```

**Defense**: ✅ Redis lock prevents double-merge  
**Gap**: ⚠️ No lock coordination between merge and regular cart updates

---

### RC-5: Price Change During Add-to-Cart

```
Admin changes price at T=0
User clicks "Add to Cart" at T=0.5
    │
    ├─ addItem() fetches current product price
    ├─ Uses LIVE price (not stale price from ProductCard)
    └─ ✅ User gets latest price
    
BUT: Frontend showed old price → user surprised at cart price
    └─ ⚠️ UX gap (not a data consistency issue)
```

---

### RC-6: Concurrent Quantity Updates on Same Item

```
User rapidly clicks +1, +1, +1
    │
    ├─ Frontend: optimistic update (shows new qty instantly)
    ├─ Backend: each request gets row lock, processes sequentially
    ├─ Request 1: qty 1→2 ✅
    ├─ Request 2: reads qty=2, update to 3 ✅
    ├─ Request 3: reads qty=3, update to 4 ✅
    │
    └─ ⚠️ Request 2 might read qty=1 (before Request 1 commits)
        → qty 1→2 instead of 2→3 → final qty=3 instead of 4
```

**Gap**: ⚠️ Frontend debouncing recommended, backend needs absolute qty (not delta) — currently uses absolute ✅

---

## 6. Edge Cases Covered in Current Codebase

| # | Scenario | Defense |
|---|----------|---------|
| 1 | Product deleted while in cart | `getItemsWithDetails` → `inStock=false`, validation catches `product_unavailable` |
| 2 | Product archived while in cart | Status check → `product_unavailable` |
| 3 | Stock goes to zero | `available - committed = 0` → "Insufficient stock" |
| 4 | Duplicate product+variant in cart | `findCartItemByProduct()` → quantity merged |
| 5 | Guest cart abandoned | `cart_status='abandoned'`, reservation expires via cron |
| 6 | Cart merge race condition | Redis lock with 30s TTL |
| 7 | Cart merge double-attempt | Checks `cart_status='converted'` |
| 8 | Price changed since added to cart | `priceChanged` flag in cart response, `price_changed` validation issue |
| 9 | Quantity > available stock | SELECT FOR UPDATE + stock check |
| 10 | Cart ownership theft | `verifyCartOwnership()` on every mutation |
| 11 | Invalid product/variant IDs | Zod UUID validation + DB lookup |
| 12 | Reservation expiry | Cron job (`cleanup-expired-reservations.ts`) every 5 min |
| 13 | Reservation extended at checkout | `extendCartReservation()` adds 60 min |
| 14 | Discount auto-invalidation | Re-validated on every `recalculateCartTotals()` |
| 15 | Empty cart checkout | "Cart is empty" error |
| 16 | Auto-repair stale prices | `validate?auto_repair=true` updates prices |
| 17 | Negative committed_quantity protection | `GREATEST(0, committed - N)` SQL |
| 18 | Negative available_quantity protection | `CHECK (available_quantity >= 0)` DB constraint |
| 19 | Variant belongs to product | Cross-check `variant.product_id !== product_id` |
| 20 | Soft delete (not hard delete) | Cart items, carts — all use `is_deleted` flag |

---

## 7. GAPS — Edge Cases NOT Covered

### HIGH Priority

| # | Gap | Risk | Proposed Fix |
|---|-----|------|-------------|
| G1 | **No max items per cart** | A user can add 500+ different products to a cart, causing performance and abuse issues | Add `MAX_CART_ITEMS` config (e.g., 50). Check count before `addItem()` |
| G2 | **No per-product quantity limit (admin-configurable)** | A user can add 100 units of a single product if stock allows, hoarding supply | Add `max_order_quantity` field to `products` table. Default 10. Validate on add/update |
| G3 | **Variant active status not re-checked on quantity update** | User can update qty of a deactivated variant item | Add `variant.is_active` check in `updateItemQuantity()` |
| G4 | **Product active status not re-checked on quantity update** | User can update qty after product archived | Add `product.status === 'active'` check in `updateItemQuantity()` |
| G5 | **Variant price not checked in validation endpoint** | Validate-cart only checks `product.selling_price`, not variant price | Use variant price when `variant_id` is present |
| G6 | **No pending order timeout** | Razorpay failed/abandoned orders stay "pending" forever, holding stock | Add cron to cancel stale pending orders (e.g., after 24 hours) |
| G7 | **Reservation extend vs cron race condition** | Cron may release stock in the same moment checkout extends it | Run extend inside a transaction that locks the inventory row |
| G8 | **Cart merge doesn't release guest cart reservations** | Guest items have reservations → merge adds new items → committed_quantity double-counted | Release guest cart reservations before or after merge |
| G9 | **No `committed <= available` DB constraint** | Bug could push committed above available, creating negative sellable stock | Add CHECK constraint or trigger; use `GREATEST` and validate |

### MEDIUM Priority

| # | Gap | Risk | Proposed Fix |
|---|-----|------|-------------|
| G10 | **No cart staleness detection** | Cart items from 6 months ago may have wrong prices, stock, even deleted products | Add `validateCart()` call on GET /cart if `last_activity_at` > N days ago |
| G11 | **No notification when coupon auto-removed** | User doesn't know their coupon was dropped during item changes | Include `removed_coupons[]` in cart response |
| G12 | **No "recently viewed" / "save for later"** | Users remove items they don't want now but might buy later — data is lost | Add `cart_saved_items` table or `saved_for_later` boolean on `cart_items` |
| G13 | **No atomic variant-switch API** | Switching variant requires remove + add (two API calls, non-atomic) | Add `PUT /cart/items/:id/variant` endpoint |
| G14 | **Guest cart session never expires** | localStorage session persists forever, accumulating abandoned carts | Set session TTL (e.g., 30 days). Add `session_created_at` validation |
| G15 | **No cart-level notes/gift messages** | Missing feature for gift orders, special instructions | Add `customer_note` to carts table |
| G16 | **Discount per-item savings not itemized** | `savings` on each coupon = `discount_total` (total), not per-item | Calculate per-item savings for transparent pricing |
| G17 | **No low-stock warning threshold** | Users don't know they're buying the last few items, creating urgency or trust issues | Use `low_stock_threshold` from inventory; surface in API response |

### LOW Priority

| # | Gap | Risk | Proposed Fix |
|---|-----|------|-------------|
| G18 | **No cart item ordering** | Items may appear in arbitrary order | Add `sort_order` or sort by `created_at` consistently |
| G19 | **No rate limiting on cart APIs** | Bot can spam add-to-cart to fill committed_quantity and deny service | Add per-IP/user rate limits on cart mutation endpoints |
| G20 | **No cart analytics events** | No tracking for: add, remove, quantity change, checkout start, abandon | Emit events for analytics pipeline |
| G21 | **Partial order creation on multi-item stock failure** | If 3/5 items have stock but 2 don't, entire order blocked | Future: allow partial orders with backorder flag |
| G22 | **No product image fallback in cart** | If product image deleted, cart shows broken image | Use `product_image_url` snapshot in cart_item; fallback to placeholder |

---

## 8. Proposed New Database Fields

### `products` table — New Fields

```sql
ALTER TABLE products ADD COLUMN max_order_quantity INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN is_purchasable BOOLEAN DEFAULT true NOT NULL;
```

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `max_order_quantity` | int | 10 | Max units a single customer can add to cart/order |
| `low_stock_threshold` | int | 5 | Below this → show "Only X left!" on frontend |
| `is_purchasable` | bool | true | Quick toggle to prevent purchase without archiving |

### `carts` table — New Fields

```sql
ALTER TABLE carts ADD COLUMN customer_note TEXT;
ALTER TABLE carts ADD COLUMN removed_discount_info JSONB DEFAULT '[]';
ALTER TABLE carts ADD COLUMN session_expires_at TIMESTAMP;
ALTER TABLE carts ADD COLUMN item_count INTEGER DEFAULT 0 NOT NULL;
```

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `customer_note` | text | null | Gift messages, special instructions |
| `removed_discount_info` | jsonb | [] | Track auto-removed coupons for user notification |
| `session_expires_at` | timestamp | null | Guest session expiry (e.g., +30 days from creation) |
| `item_count` | int | 0 | Denormalized count for fast header badge display |

### `cart_items` table — New Fields

```sql
ALTER TABLE cart_items ADD COLUMN saved_for_later BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE cart_items ADD COLUMN variant_option_snapshot VARCHAR(255);
ALTER TABLE cart_items ADD COLUMN price_at_add DECIMAL(12, 2);
ALTER TABLE cart_items ADD COLUMN added_from VARCHAR(50);
```

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `saved_for_later` | bool | false | "Save for Later" vs active cart item |
| `variant_option_snapshot` | varchar | null | Freeze variant name at add time (e.g., "Size: L") |
| `price_at_add` | decimal | null | Original price when added, to detect changes |
| `added_from` | varchar | null | Source: 'product_page', 'quick_view', 'wishlist', 'reorder' |

### `inventory` table — New Fields

```sql
ALTER TABLE inventory ADD COLUMN low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE inventory ADD COLUMN reorder_point INTEGER DEFAULT 0;
ALTER TABLE inventory ADD COLUMN max_order_quantity INTEGER;
```

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `low_stock_threshold` | int | 5 | Per-SKU low stock configuration |
| `reorder_point` | int | 0 | Alert admin when stock falls below this |
| `max_order_quantity` | int | null | Override product-level max (for specific variants) |

---

## 9. Defense Implementation Plan

### Phase 1: Critical Fixes (Week 1-2)

```
┌──────────────────────────────────────────────────────────────────┐
│ P1-1: Max Cart Items Limit                                       │
│ ─ Add MAX_CART_ITEMS=50 to cart config                           │
│ ─ Check item count in addItem() before insert                    │
│ ─ Return 400 "Cart limit reached (max 50 items)"                 │
│ ─ Frontend: show toast with limit info                           │
├──────────────────────────────────────────────────────────────────┤
│ P1-2: Per-Product Quantity Limit                                 │
│ ─ Add max_order_quantity column to products (default 10)         │
│ ─ Check in addItem() and updateItemQuantity()                    │
│ ─ Admin UI: set per-product purchase limit                       │
│ ─ Frontend: cap +/- controls at max                              │
├──────────────────────────────────────────────────────────────────┤
│ P1-3: Product/Variant Status Re-check on Update                  │
│ ─ In updateItemQuantity(), verify product.status='active'        │
│ ─ In updateItemQuantity(), verify variant.is_active=true         │
│ ─ Return 400 "Product no longer available" if checks fail        │
├──────────────────────────────────────────────────────────────────┤
│ P1-4: Variant Price in Validation                                │
│ ─ In validateCart(), use variant selling_price when variant_id    │
│   is present instead of base product selling_price               │
├──────────────────────────────────────────────────────────────────┤
│ P1-5: Pending Order Timeout                                      │
│ ─ Create cron job: cancel orders pending > 24 hours              │
│ ─ Release committed_quantity for cancelled orders                 │
│ ─ Send notification to user about cancelled order                │
├──────────────────────────────────────────────────────────────────┤
│ P1-6: Cart Merge Reservation Fix                                 │
│ ─ Before merge: release ALL guest cart reservations              │
│ ─ During merge: addItem() creates new user cart reservations     │
│ ─ This prevents double-committed stock                           │
└──────────────────────────────────────────────────────────────────┘
```

### Phase 2: Reliability Improvements (Week 3-4)

```
┌──────────────────────────────────────────────────────────────────┐
│ P2-1: Reservation Extend Safety                                  │
│ ─ Wrap extendCartReservation in transaction with inventory lock   │
│ ─ If reservation already expired, re-create it                   │
│ ─ If committed_quantity was already released, re-increment        │
├──────────────────────────────────────────────────────────────────┤
│ P2-2: Stale Cart Detection                                       │
│ ─ On GET /cart: if last_activity_at > 7 days, auto-validate      │
│ ─ Update stale prices, remove unavailable items                  │
│ ─ Include staleness_warnings[] in response                       │
├──────────────────────────────────────────────────────────────────┤
│ P2-3: Low-Stock Warning                                          │
│ ─ Add low_stock_threshold to inventory table                     │
│ ─ In getItemsWithDetails(): add `lowStock: true` and            │
│   `stockMessage: "Only 3 left!"` to items where                 │
│   sellable <= threshold                                          │
│ ─ Frontend: show urgency badge on cart items                     │
├──────────────────────────────────────────────────────────────────┤
│ P2-4: Discount Removal Notification                              │
│ ─ Track auto-removed coupons in removed_discount_info            │
│ ─ Surface in cart response: `removed_discounts[]`                │
│ ─ Frontend: show "Coupon XYZ was removed: minimum not met"       │
├──────────────────────────────────────────────────────────────────┤
│ P2-5: Rate Limiting                                              │
│ ─ Add rate limiter on cart mutation endpoints                    │
│ ─ Per-user: 30 requests/minute for add/update/remove             │
│ ─ Per-IP: 60 requests/minute for all cart endpoints              │
└──────────────────────────────────────────────────────────────────┘
```

### Phase 3: Feature Enhancements (Week 5-6)

```
┌──────────────────────────────────────────────────────────────────┐
│ P3-1: Save for Later                                             │
│ ─ Add saved_for_later to cart_items                              │
│ ─ API: PUT /cart/items/:id/save-for-later                        │
│ ─ API: PUT /cart/items/:id/move-to-cart                          │
│ ─ saved_for_later items: no reservation, no totals               │
│ ─ Frontend: separate section below cart                          │
├──────────────────────────────────────────────────────────────────┤
│ P3-2: Atomic Variant Switch                                      │
│ ─ API: PUT /cart/items/:id/variant { new_variant_id }            │
│ ─ Within transaction: release old reservation, check new stock,  │
│   create new reservation, update cart_item fields                │
├──────────────────────────────────────────────────────────────────┤
│ P3-3: Guest Session Expiry                                       │
│ ─ Set session_expires_at = NOW() + 30 days on guest cart create  │
│ ─ Cron: soft-delete expired guest carts, release reservations    │
│ ─ Frontend: regenerate session_id if expired                     │
├──────────────────────────────────────────────────────────────────┤
│ P3-4: Cart Analytics Events                                      │
│ ─ Emit events: cart_add, cart_remove, cart_update_qty,           │
│   cart_checkout_start, cart_abandon, coupon_applied,             │
│   coupon_removed, coupon_auto_removed                            │
│ ─ Store in analytics table or push to external service           │
├──────────────────────────────────────────────────────────────────┤
│ P3-5: Price-at-Add Tracking                                      │
│ ─ Store price_at_add when item first enters cart                 │
│ ─ Show "Price dropped by ₹X" or "Price increased by ₹X"         │
│ ─ Frontend: visual indicator on price changes                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Flow Diagrams

### 10A. Add to Cart — Complete Decision Tree

```
                         ┌─────────────────┐
                         │  Add to Cart     │
                         │  Request         │
                         └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │ Zod Validation    │
                         │ product_id (uuid) │
                         │ variant_id (opt)  │
                         │ quantity (1-100)  │
                         └────────┬─────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │ Has userId OR sessionId?   │
                    └─────┬──────────────┬──────┘
                     NO   │              │ YES
                    ┌─────▼─────┐  ┌─────▼──────────────┐
                    │ 400 Error │  │ getOrCreateCart()   │
                    └───────────┘  └─────┬──────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ Product exists       │
                              │ & status='active'?   │
                              └──┬──────────────┬───┘
                             NO  │              │ YES
                           ┌─────▼─────┐  ┌────▼────────────────┐
                           │ 400/404   │  │ Has variant_id?      │
                           └───────────┘  └──┬──────────────┬───┘
                                          NO │              │ YES
                         ┌───────────────────┤    ┌─────────▼──────────┐
                         │                   │    │ Variant exists,    │
                         │                   │    │ active, belongs    │
                         │                   │    │ to product?        │
                         │                   │    └──┬────────────┬───┘
                         │                   │   NO  │            │ YES
                         │                   │  ┌────▼──┐   ┌────▼───────┐
                         │                   │  │ 400   │   │ Use variant│
                         │                   │  └───────┘   │ price/sku  │
                         │                   │              └────┬───────┘
                         │                   │                   │
                    ┌────▼───────────────────▼───────────────────▼───────┐
                    │              BEGIN TRANSACTION                      │
                    │   SELECT inventory ... FOR UPDATE                   │
                    └────────────────────┬──────────────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ Inventory record     │
                              │ exists?              │
                              └──┬──────────────┬───┘
                             NO  │              │ YES
                           ┌─────▼─────┐  ┌────▼─────────────────┐
                           │ 404       │  │ sellable stock       │
                           └───────────┘  │ = avail - committed  │
                                          └────┬────────────┬───┘
                                               │            │
                              ┌────────────────▼──┐   ┌────▼────────────┐
                              │ sellable < qty?   │   │[NEW] max_order_ │
                              └──┬────────────┬──┘   │ quantity check?  │
                             YES │         NO │      └────┬────────┬───┘
                           ┌─────▼─────┐      │       YES │     NO │
                           │ 400       │      │    ┌──────▼──┐     │
                           │Insufficient│      │    │ 400 max │     │
                           └───────────┘      │    │ reached │     │
                                              │    └─────────┘     │
                              ┌───────────────▼────────────────────▼───┐
                              │ Existing item in cart                   │
                              │ (same product + variant)?               │
                              └──┬──────────────────────┬──────────────┘
                             YES │                      │ NO
                    ┌────────────▼─────────┐  ┌────────▼──────────────┐
                    │ newQty = old + req    │  │ Create new cart_item  │
                    │ Check newQty ≤ stock  │  │ with pricing          │
                    │ & ≤ max_order_qty     │  │                       │
                    │ Release old reserve   │  │ Reserve stock         │
                    │ Create new reserve    │  │ (committed += qty)    │
                    │ Update pricing        │  │                       │
                    └────────────┬─────────┘  └────────┬──────────────┘
                                 │                      │
                    ┌────────────▼──────────────────────▼──────────────┐
                    │              COMMIT TRANSACTION                   │
                    └────────────────────┬────────────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ Recalculate cart     │
                              │ totals + discounts   │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ Return full cart     │
                              │ response (201)       │
                              └─────────────────────┘
```

### 10B. Cart → Checkout → Order — Complete Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CART PHASE                                     │
│                                                                       │
│  [Add Items] ──► [inventory.committed += N]                           │
│  [Update Qty] ──► [release old, reserve new]                          │
│  [Remove Item] ──► [inventory.committed -= N]                         │
│  [Cron: 5min] ──► [release expired reservations]                      │
│                                                                       │
│  Cart State: items have reservation_id + reservation_expires_at       │
│  Inventory State: committed_quantity holds cart reservations           │
│                                                                       │
│                     ┌──────────┐                                      │
│                     │ 30 min   │ ← reservation TTL                    │
│                     │ countdown│                                       │
│                     └────┬─────┘                                      │
│                          │ expires?                                    │
│                    YES   │    NO                                       │
│                    ┌─────▼──┐  │                                      │
│                    │Release │  │                                      │
│                    │stock   │  │                                      │
│                    │(cron)  │  │                                      │
│                    └────────┘  │                                      │
└─────────────────────┬──────────┘─────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     PRE-CHECKOUT PHASE                                │
│                                                                       │
│  POST /cart/validate                                                  │
│    ├─ Check each item: product exists + active                        │
│    ├─ Check each item: stock sufficient                               │
│    ├─ Check each item: price unchanged                                │
│    ├─ [NEW] Check each item: variant active                           │
│    ├─ [NEW] Check each item: variant price unchanged                  │
│    ├─ [NEW] Check each item: qty ≤ max_order_quantity                 │
│    ├─ If auto_repair=true: fix stale prices                           │
│    └─ Return { valid, issues[] }                                      │
│                                                                       │
│  ┌─────────── valid=false ─────────┐   ┌──── valid=true ──────┐      │
│  │ Show warnings to user           │   │ Proceed to checkout  │      │
│  │ "Fix issues before checkout"    │   └──────────┬───────────┘      │
│  └─────────────────────────────────┘              │                   │
└───────────────────────────────────────────────────┬──────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     CHECKOUT PHASE                                    │
│                                                                       │
│  POST /orders/from-cart                                               │
│    │                                                                  │
│    ├─ 1. Find active cart                                             │
│    ├─ 2. Get cart items                                               │
│    ├─ 3. EXTEND reservations +60min                                   │
│    │      (committed_quantity unchanged, only expires_at updated)      │
│    ├─ 4. Re-validate stock (pass reserved_qty to avoid self-block)    │
│    ├─ 5. Calculate pricing (discount, tax, shipping)                  │
│    │                                                                  │
│    ├─ 6. BEGIN TRANSACTION                                            │
│    │   ├─ Create order (status: pending)                              │
│    │   ├─ Create order_items (copy from cart)                         │
│    │   └─ If COD: mark cart "converted"                               │
│    ├─ COMMIT TRANSACTION                                              │
│    │                                                                  │
│    └─ 7. Queue notifications                                          │
│                                                                       │
│  PAYMENT FORK:                                                        │
│    ├─ COD → order confirmed → stock committed indefinitely            │
│    │                                                                  │
│    └─ RAZORPAY                                                        │
│        ├─ Frontend opens payment modal                                │
│        ├─ SUCCESS → verify → order confirmed → cart "converted"       │
│        ├─ FAILED → error overlay → user can retry                     │
│        ├─ ABANDONED → cart reservation still active (extended)        │
│        │   └─ [NEW] After 24h: cron cancels order, releases stock     │
│        └─ WEBHOOK → backup verification                               │
└──────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     POST-ORDER PHASE                                  │
│                                                                       │
│  Order Status: pending → confirmed → processing → fulfilled           │
│                                                                       │
│  FULFILLED:                                                           │
│    ├─ inventory.available_quantity -= qty (stock left warehouse)       │
│    ├─ inventory.committed_quantity -= qty (reservation used up)        │
│    ├─ inventory.total_sold += qty                                     │
│    ├─ inventory.total_fulfilled += qty                                 │
│    └─ Create inventory_adjustment audit record                        │
│                                                                       │
│  CANCELLED:                                                           │
│    ├─ inventory.committed_quantity -= qty (release hold)               │
│    ├─ inventory.available_quantity unchanged (stock back in pool)      │
│    └─ Create inventory_adjustment audit record                        │
│                                                                       │
│  RETURNED:                                                            │
│    ├─ inventory.available_quantity += qty (restocked)                  │
│    └─ Create inventory_adjustment audit record                        │
└──────────────────────────────────────────────────────────────────────┘
```

### 10C. Cart Merge — Decision Flow

```
               ┌─────────────────────┐
               │ User logs in        │
               │ POST /cart/merge    │
               │ { session_id }      │
               └─────────┬───────────┘
                         │
               ┌─────────▼───────────┐
               │ Acquire Redis lock   │
               │ cart:merge:lock:     │
               │ userId:sessionId     │
               └──┬──────────────┬───┘
              FAIL│              │OK
          ┌───────▼──────┐      │
          │ "Merge in    │      │
          │  progress"   │      │
          └──────────────┘      │
                         ┌──────▼──────────┐
                         │ Find guest cart  │
                         │ by session_id    │
                         └──┬────────┬─────┘
                        NULL│    FOUND│
                   ┌────────▼──┐     │
                   │"No guest  │     │
                   │ cart"     │     │
                   └───────────┘     │
                              ┌──────▼───────────┐
                              │ Guest cart status │
                              └──┬───────────┬───┘
                          converted│      active│
                   ┌────────────▼───┐         │
                   │"Already merged"│         │
                   └────────────────┘         │
                                       ┌──────▼──────────────┐
                                       │ Guest items empty?  │
                                       └──┬──────────────┬───┘
                                      YES │              │ NO
                              ┌───────────▼──┐    ┌──────▼───────────┐
                              │ Mark guest   │    │ [NEW] Release    │
                              │ "converted"  │    │ guest cart       │
                              │ Return empty │    │ reservations     │
                              └──────────────┘    └──────┬───────────┘
                                                         │
                                                  ┌──────▼───────────┐
                                                  │ Get/create user  │
                                                  │ cart              │
                                                  └──────┬───────────┘
                                                         │
                                              ┌──────────▼──────────┐
                                              │ For each guest item │
                                              └──┬─────────────┬───┘
                                                 │             │
                                    ┌────────────▼──┐  ┌──────▼────────┐
                                    │ Duplicate in  │  │ No duplicate  │
                                    │ user cart?    │  │ → addItem()   │
                                    └────┬──────────┘  │ (new reserve) │
                                         │             └───────────────┘
                                  ┌──────▼────────────────┐
                                  │ Sum quantities        │
                                  │ Cap at available stock│
                                  │ updateItemQuantity()  │
                                  │ (release+re-reserve)  │
                                  └───────────────────────┘
                                                  │
                                       ┌──────────▼──────────┐
                                       │ Recalculate totals  │
                                       │ Mark guest cart     │
                                       │ "converted"         │
                                       │ Release Redis lock  │
                                       └─────────────────────┘
```

### 10D. Inventory Lifecycle — State Machine

```
                    ┌─────────────────────────────────┐
                    │      AVAILABLE QUANTITY          │
                    │                                  │
    Admin restock   │    Physical stock on hand         │   Fulfillment
    ────────────►   │                                  │   ──────────►
    available += N  │  ┌──────────────────────────┐   │   available -= N
                    │  │   COMMITTED QUANTITY      │   │   committed -= N
    Cart reserve    │  │                           │   │
    ────────────►   │  │  Reserved for carts &     │   │   Cancel order
    committed += N  │  │  pending orders           │   │   ──────────►
                    │  │                           │   │   committed -= N
    Remove from     │  │                           │   │
    cart            │  │                           │   │   Return
    ────────────►   │  │                           │   │   ──────────►
    committed -= N  │  └──────────────────────────┘   │   available += N
                    │                                  │
                    │  SELLABLE = available - committed │
                    └─────────────────────────────────┘

    IN_STOCK:      sellable > low_stock_threshold
    LOW_STOCK:     0 < sellable ≤ low_stock_threshold
    OUT_OF_STOCK:  sellable ≤ 0
```

---

## 11. Testing Matrix

### Unit Tests

| Test Case | Input | Expected | Priority |
|-----------|-------|----------|----------|
| Add item — product not found | bad UUID | 404 | P0 |
| Add item — product archived | status='archived' | 400 | P0 |
| Add item — zero stock | avail=0, committed=0 | 400 | P0 |
| Add item — stock exactly matches | avail=5, committed=3, qty=2 | ✅ reserved | P0 |
| Add item — stock insufficient | avail=5, committed=4, qty=2 | 400 | P0 |
| Add item — variant inactive | is_active=false | 400 | P0 |
| Add item — variant wrong product | variant.product_id != X | 400 | P0 |
| Add duplicate — quantity merges | existing qty=2, add qty=3 | qty=5 | P0 |
| Add duplicate — merge exceeds stock | existing=8, add=5, stock=10 | 400 | P0 |
| Update qty increase — stock allows | avail=10, committed=3, qty 3→5 | ✅ | P0 |
| Update qty increase — insufficient | avail=10, committed=9, qty 1→3 | 400 | P0 |
| Update qty decrease | qty 5→2 | ✅ committed -= 3 | P0 |
| Remove item | valid item | ✅ committed -= qty | P0 |
| Clear cart | 3 items | ✅ all committed released | P1 |
| Validate — stale price | item price ≠ current | issue: price_changed | P0 |
| Validate — out of stock | avail=0 | issue: out_of_stock | P0 |
| Validate auto-repair | price changed | item price updated | P1 |
| Cart merge — no guest cart | bad session | merged=false | P1 |
| Cart merge — duplicate merge | sum quantities, cap | ✅ capped qty | P1 |
| Cart merge — concurrent | two requests | one succeeds, one locked | P1 |
| [NEW] Add item — max_order_qty exceeded | qty=15, max=10 | 400 | P1 |
| [NEW] Add item — max cart items | 50 items already | 400 | P1 |
| [NEW] Update qty — product deactivated | status='archived' | 400 | P1 |
| [NEW] Update qty — variant deactivated | is_active=false | 400 | P1 |

### Integration Tests

| Test Case | Scope | Priority |
|-----------|-------|----------|
| Full add → update → remove → recalculate cycle | Cart + Inventory | P0 |
| Cart reservation expires → stock freed | Cart + Inventory + Cron | P0 |
| Guest cart → login → merge → checkout | Full pipeline | P0 |
| Concurrent add-to-cart (last item) | Race condition | P0 |
| Checkout → Razorpay fail → retry → success | Orders + Payment | P1 |
| [NEW] Pending order timeout → stock released | Orders + Cron | P1 |
| Price change during checkout flow | Cart + Product | P1 |
| Discount auto-removal on item remove | Cart + Discount | P1 |
| [NEW] Reservation extend vs cron race | Inventory + Cron | P1 |

---

## Summary

### Current System Strengths
- Proper transaction isolation with `SELECT FOR UPDATE` on inventory
- Timed cart reservations with automatic cleanup
- Guest ↔ user cart merge with Redis locking
- Soft-delete architecture preserving data integrity
- Pre-checkout validation with optional auto-repair
- Price change detection and notification
- Discount re-validation on every cart recalculation

### Top 5 Fixes to Implement First
1. **Max cart items limit** — prevent abuse and performance issues
2. **Per-product purchase quantity limit** — prevent hoarding
3. **Product/variant status re-check on update** — prevent stale operations
4. **Pending order timeout cron** — prevent indefinite stock holds
5. **Cart merge reservation release** — prevent double-committed stock

### New DB Fields Priority
1. `products.max_order_quantity` (Phase 1)
2. `inventory.low_stock_threshold` (Phase 2)
3. `cart_items.price_at_add` (Phase 2)
4. `cart_items.saved_for_later` (Phase 3)
5. `carts.removed_discount_info` (Phase 2)
