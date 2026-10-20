# Stock Reservation Issue - Diagnosis & Fix

## Problem Explanation

You're seeing "Insufficient stock" errors even though the database shows available quantity. This is because of the **inventory reservation system**.

### How Stock Works

```typescript
Available to Sell = available_quantity - committed_quantity
```

**Example:**
- `available_quantity` = 10 (physical stock in database)
- `committed_quantity` = 10 (reserved by carts/orders)
- **Available to sell** = 10 - 10 = **0** ❌

### What Causes Stuck Stock?

1. **Expired cart reservations not cleaned up** - Users added items but didn't complete checkout
2. **Abandoned carts** - Stock locked by inactive sessions
3. **Failed/cancelled orders** - Stock not properly released
4. **System errors** - Cleanup cron job not running or failing

---

## Immediate Solutions

### Option 1: Run Diagnostic Script (Recommended)

Check what's actually reserving the stock:

```bash
cd anant-enterprises-backend
npm run ts-node scripts/inventory/check-product-stock.ts "Championship Pro"
```

This shows:
- Total available vs committed stock
- Active cart reservations (and if expired)
- Pending orders holding stock

### Option 2: Auto-Fix All Stuck Stock

Analyze and fix all products with mismatched committed_quantity:

```bash
# Dry run first (see what will change)
npm run ts-node scripts/inventory/fix-stuck-stock.ts

# Actually fix it
npm run ts-node scripts/inventory/fix-stuck-stock.ts -- --fix
```

### Option 3: Manual Fix via Database

If you need immediate access:

```sql
-- Check current state
SELECT 
  p.product_title,
  i.available_quantity,
  i.committed_quantity,
  (i.available_quantity - i.committed_quantity) as sellable
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE p.product_title ILIKE '%Championship Pro%';

-- Reset committed_quantity (CAUTION: only if no actual pending orders)
UPDATE inventory 
SET committed_quantity = 0,
    updated_at = NOW()
WHERE product_id IN (
  SELECT id FROM products WHERE product_title ILIKE '%Championship Pro%'
);
```

### Option 4: Admin API Endpoint

Use the new admin endpoint (requires admin authentication):

```bash
POST /api/inventory/release-stuck-stock

{
  "product_id": "uuid-here",
  "dry_run": true  // Remove to actually fix
}
```

---

## Prevention & Monitoring

### 1. Verify Cleanup Job is Running

Check server logs for:
```
Cart reservation cleanup cron job started (every 5 minutes)
```

If not running, ensure:
```bash
# .env
ENABLE_CART_RESERVATIONS=true  # Should be true (default)
CART_RESERVATION_TIMEOUT=30    # Minutes
CART_CLEANUP_INTERVAL=5        # Minutes
```

### 2. Monitor Stuck Stock

Run diagnostic regularly:
```bash
# Add to cron or monitoring
npm run ts-node scripts/inventory/check-product-stock.ts "Product Name"
```

### 3. When to Manually Release

**Safe to release when:**
- Cart reservation is expired (> 30 minutes old)
- User's cart is empty or deleted
- Order was cancelled/failed

**DO NOT release if:**
- Order status is 'pending', 'confirmed', or 'processing'
- Cart reservation is still active (< 30 minutes)

---

## System Architecture

### Cart Reservation Flow

1. **User adds to cart** → `committed_quantity` increases
2. **Reservation expires** (30 min) → Cleanup job releases stock
3. **User completes order** → Converts to order reservation
4. **Order fulfilled** → Decreases `available_quantity`

### Stock States

```
Total Stock = available_quantity + committed_quantity

available_quantity: Physical stock in warehouse
committed_quantity: Reserved (carts + pending orders)
Available to Sell = available_quantity - committed_quantity
```

---

## Quick Reference

### Scripts
```bash
# Diagnose specific product
npm run ts-node scripts/inventory/check-product-stock.ts "Product Name"

# Fix all stuck stock (dry run)
npm run ts-node scripts/inventory/fix-stuck-stock.ts

# Fix all stuck stock (actually fix)
npm run ts-node scripts/inventory/fix-stuck-stock.ts -- --fix
```

### API Endpoints
```bash
# Get stock info
GET /api/inventory/available-stock/:productId

# Release stuck stock (admin only)
POST /api/inventory/release-stuck-stock
{
  "product_id": "uuid",
  "variant_id": "uuid" (optional),
  "dry_run": false
}
```

### Database Queries
```sql
-- Find all stuck stock
SELECT 
  p.product_title,
  i.available_quantity,
  i.committed_quantity,
  (i.available_quantity - i.committed_quantity) as actual_available
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.committed_quantity > 0
ORDER BY i.committed_quantity DESC;
```

---

## Next Steps

1. **Immediate fix**: Run `check-product-stock.ts` to diagnose Championship Pro
2. **If stuck**: Run `fix-stuck-stock.ts -- --fix` to release it
3. **Verify**: Check if cleanup cron job is running in server logs
4. **Monitor**: Set up periodic checks for stuck stock
5. **Consider**: Reducing `CART_RESERVATION_TIMEOUT` if users abandon carts frequently

---

## Need Help?

- Check server logs: `logs/info/*.log` and `logs/error/*.log`
- Database stats: Run diagnostic script
- Still stuck? Check if cleanup job is actually running in server.ts
