# Inventory Tests - Quick Reference

## 📊 Stats
- **41 total tests** (25 list + 16 adjust)
- **100% passing**
- **~54 seconds** runtime

## 🚀 Quick Commands

```bash
# Run all inventory tests
npx playwright test tests/e2e/inventory/

# Run list tests only
npx playwright test tests/e2e/inventory/inventory-list.spec.ts

# Run adjustment tests only
npx playwright test tests/e2e/inventory/inventory-adjust.spec.ts

# Run with HTML report
npx playwright test tests/e2e/inventory/ && npx playwright show-report
```

## 📁 Files

- `INVENTORY_TESTING_PLAN.md` - Testing strategy and approach
- `inventory-list.spec.ts` - 25 tests for inventory list page
- `inventory-adjust.spec.ts` - 16 tests for adjustment modal
- `INVENTORY_TESTING_SUMMARY.md` - Comprehensive results and documentation
- `README.md` - This file

## 🎯 What's Tested

### List Page (25 tests)
- ✅ Page load and structure
- ✅ Metrics (Total, Active, Out of Stock, Low Stock)
- ✅ Table display (Product, Committed, Available, Last Updated)
- ✅ Pagination
- ✅ Search & filter
- ✅ Low stock indicators

### Adjustment Modal (16 tests)
- ✅ Modal opening and structure
- ✅ Quantity adjustments (increase/decrease)
- ✅ Reason selection
- ✅ Modal actions (confirm/cancel)
- ✅ Validation (no negatives, required reason)

## 🔑 Key Differences from Products

1. **No CRUD pages** - Only list view with inline adjustments
2. **Modal-based** - Adjustments happen in modal, not separate page
3. **Reason required** - Must select reason for every adjustment
4. **Quantity focus** - Tracks committed vs available
5. **Low stock alerts** - Visual indicators for items ≤ 5

## 📝 Notes

- Tests use `admin@gmail.com` / `12345678` credentials
- Base URL: `http://localhost:5173`
- Follows same methodology as products tests
- Selectors are flexible and resilient to minor UI changes

## 📖 More Info

See `INVENTORY_TESTING_SUMMARY.md` for detailed documentation.
