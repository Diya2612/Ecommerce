# Order List Display Issue - Resolution

## Issue Summary

The order list page (`/profile/orders`) was displaying **incorrect item counts** due to a bug in the order creation process that counted deleted cart items.

### Reported Problems
1. Order list showing incorrect total item numbers
2. Some orders had mismatched `total_quantity` vs actual items

---

## Root Cause Analysis

### The Bug

The `order-conversion.service.ts` had a critical bug in the `getCartItems()` method:

**BEFORE (Buggy):**
```typescript
async getCartItems(cartId: string, tx: Database = db) {
  const items = await tx.select().from(cartItems).where(eq(cartItems.cart_id, cartId));
  return items;
}
```

**Issue:** This retrieved **ALL cart items including deleted ones** (`is_deleted = true`)

### How It Caused Problems

During order creation in `order-creation.service.ts`:

1. **Line 102**: `const items = await getCartItems(cart.id);`
   - Uses cart feature's `getCartItems()` 
   - ✅ Correctly filters `is_deleted = false`

2. **Line 132**: `const cartData = await orderConversionService.extractCartData(cart.id);`
   - Internally calls conversion service's `getCartItems()` 
   - ❌ Includes deleted items

3. **Line 138**: `items: cartData.items`
   - Pricing calculated with deleted items

4. **Line 174**: `total_quantity: pricing.total_quantity`
   - ❌ Stores WRONG total (includes deleted items)

5. **Line 180**: `const orderItemsData = items.map(...)`
   - ✅ Creates order items only from non-deleted items

**Result:** `total_quantity` was inflated by deleted cart items, but actual order items were correct.

### Example

User had 4 items in cart, removed 3 → left with 1 item:
- Cart DB showed: 4 items total (3 with `is_deleted=true`, 1 with `is_deleted=false`)
- Order created: 1 actual order item
- `total_quantity` stored: **4** (WRONG - counted all 4 including deleted)
- Frontend displayed: "4 items" but only 1 product shown

---

## The Fix

### 1. Backend Code Fix

**File:** `src/features/orders/services/order-conversion.service.ts`

```typescript
async getCartItems(cartId: string, tx: Database = db) {
  const items = await tx
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.is_deleted, false)));
  
  return items;
}
```

**Change:** Added `eq(cartItems.is_deleted, false)` filter to exclude deleted items.

### 2. Data Migration Script

**File:** `scripts/orders/fix-order-quantities.ts`

Created a script to fix existing orders with incorrect `total_quantity`:

```bash
npm run ts-node scripts/orders/fix-order-quantities.ts
```

**What it does:**
- Fetches all orders
- Recalculates correct `total_quantity` from actual order items
- Updates any mismatched orders
- Reports summary of fixed orders

**Result:** Fixed 1 order (ORD-26-000006: 4 → 1)

### 3. Diagnostic Script

**File:** `scripts/orders/check-order-data.ts`

Created diagnostic tool to verify order data integrity:

```bash
npm run ts-node scripts/orders/check-order-data.ts
```

**Checks:**
- Order `total_quantity` matches sum of item quantities
- Product names are populated
- Product images are populated

---

## Verification

### Database State - AFTER Fix

All 6 orders verified correct:

| Order          | total_quantity | Items | Item Quantities | Status |
|----------------|----------------|-------|-----------------|--------|
| ORD-26-000006  | 1              | 1     | 1               | ✅      |
| ORD-26-000005  | 1              | 1     | 1               | ✅      |
| ORD-26-000004  | 1              | 1     | 1               | ✅      |
| ORD-26-000003  | 1              | 1     | 1               | ✅      |
| ORD-26-000002  | 4              | 3     | 2+1+1 = 4       | ✅      |
| ORD-26-000001  | N/A            | N/A   | N/A             | ✅      |

### API Response Structure

The `/api/orders` endpoint returns correct structure:

```typescript
{
  orders: [
    {
      id: string,
      order_number: string,
      total_quantity: number,      // ✅ Now correct
      total_amount: string,
      order_status: string,
      payment_method: string | null,
      created_at: string,
      items: [                      // ✅ All fields present
        {
          id: string,
          product_name: string,     // ✅ Product names populated
          product_image_url: string | null,  // ✅ Images populated
          quantity: number,
          unit_price: string,
          line_total: string
        }
      ]
    }
  ],
  pagination: { ... }
}
```

### Frontend Display

The [MyOrders.tsx](../../sportzsaga-frontend/src/components/features/profile/MyOrders.tsx) component correctly displays:

- ✅ Accurate item counts: `{order.total_quantity} item{s}`
- ✅ Product images: `order.items.map(item => item.product_image_url)`
- ✅ Product names: Visible in item tooltips

---

## Related Files Modified

### Backend
- ✅ `src/features/orders/services/order-conversion.service.ts` - Fixed cart item filtering
- 📝 `scripts/orders/fix-order-quantities.ts` - Migration script (NEW)
- 📝 `scripts/orders/check-order-data.ts` - Diagnostic script (NEW)

### Frontend
- ℹ️ No changes needed - was already correct

---

## Prevention

### Testing Checklist

When testing order creation:

1. ✅ Add items to cart
2. ✅ Remove some items (marks them as deleted)
3. ✅ Create order with remaining items
4. ✅ Verify `total_quantity` matches sum of actual item quantities
5. ✅ Check order list displays correct count

### Future Safeguards

Consider adding:
- Database constraint to validate `total_quantity` on insert/update
- Integration test covering cart item deletion → order creation
- Automated data integrity checks in CI/CD

---

## Summary

**Root Cause:** Order conversion service included deleted cart items in quantity calculation

**Impact:** Order list showed inflated item counts (e.g., "4 items" when only 1 actual product)

**Fix:** 
1. Filter deleted cart items in order conversion service
2. Migrate existing incorrect order data

**Status:** ✅ **RESOLVED** - All orders now display accurate item counts and product names

**Timeline:**
- Issue identified: 2026-03-07
- Root cause found: 2026-03-07 (deleted cart items not filtered)
- Fix applied: 2026-03-07
- Data migrated: 2026-03-07 (1 order corrected)
- Verified: 2026-03-07 ✅
