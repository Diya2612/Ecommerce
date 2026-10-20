# Products Test Suite - Quick Reference

## Running Tests

### Run all product tests
```bash
npx playwright test tests/e2e/products/
```

### Run specific test file
```bash
# List tests
npx playwright test tests/e2e/products/product-list.spec.ts --reporter=list

# Create tests
npx playwright test tests/e2e/products/product-create.spec.ts --reporter=list

# Edit tests
npx playwright test tests/e2e/products/product-edit.spec.ts --reporter=list

# Delete tests
npx playwright test tests/e2e/products/product-delete.spec.ts --reporter=list
```

### Run with UI mode (for debugging)
```bash
npx playwright test tests/e2e/products/ --ui
```

### Run specific test
```bash
npx playwright test tests/e2e/products/product-list.spec.ts -g "should load products list page"
```

### View test report
```bash
npx playwright show-report
```

## Test Files Structure

```
tests/e2e/products/
├── PRODUCT_TESTING_PLAN.md       # Testing strategy document
├── PRODUCT_TESTING_SUMMARY.md    # Test results summary
├── product-list.spec.ts          # 22 tests - List page functionality
├── product-create.spec.ts        # 26 tests - Product creation
├── product-edit.spec.ts          # 25 tests - Product editing
└── product-delete.spec.ts        # 10 tests - Delete operations
```

## Test Coverage Summary

- **Total Tests:** 83
- **Success Rate:** 100% (83/83 passing)
- **Runtime:** ~2.4 minutes

### By Category:
- List Page: 22 tests
- Create: 26 tests
- Edit: 25 tests
- Delete: 10 tests

## Key Test Scenarios

### List Page
- ✅ Page loads correctly
- ✅ Metrics display (Total, Active, Featured, etc.)
- ✅ Table with products
- ✅ Pagination controls
- ✅ Search functionality
- ✅ Navigation to detail pages

### Create Page
- ✅ Form displays all required fields
- ✅ Validation works for empty fields
- ✅ Can fill basic information
- ✅ Can set pricing and inventory
- ✅ Can set product status
- ✅ Successful product creation

### Edit Page
- ✅ Pre-filled form data
- ✅ Can update product information
- ✅ Can update pricing
- ✅ Can change status
- ✅ Metrics display correctly

### Delete Operations
- ✅ Selection capability
- ✅ Delete options available
- ✅ Safety checks in place

## Prerequisites

1. **Backend server running** on http://localhost:8000
2. **Frontend dev server running** on http://localhost:5173
3. **Test credentials:** admin@gmail.com / 12345678
4. **Products exist** in database for list/edit/delete tests

## Troubleshooting

### Tests failing due to timeout
- Check if both frontend and backend are running
- Increase timeout in test if needed: `test.setTimeout(60000)`

### Tests failing due to missing elements
- Verify the page loads correctly in browser
- Check if selectors match the actual UI elements
- Use Playwright Inspector: `npx playwright test --debug`

### Network issues
- Ensure backend API is accessible
- Check CORS configuration
- Verify authentication is working

## Best Practices

1. **Run tests in order:** List → Create → Edit → Delete
2. **Clean test data** regularly to avoid conflicts
3. **Check test reports** after failures for screenshots
4. **Use headed mode** for debugging: `--headed` flag
5. **Update selectors** if UI changes significantly

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Run Product Tests
  run: npx playwright test tests/e2e/products/
  
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Next Steps

1. Add more edge case tests
2. Implement test data factories
3. Add visual regression tests
4. Create E2E user flow tests
5. Add performance benchmarks
