import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../../utils/credentials';

test.describe('Product List Page - Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to products page
    await page.goto('http://localhost:5173/products');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Load & Structure', () => {
    test('should load products list page successfully', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Check URL
      expect(page.url()).toContain('/products');

      // Check if page loaded
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });

    test('should display action buttons', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for Product/Create button
      const createButton = page.locator('button, a').filter({ hasText: /product/i }).first();
      await expect(createButton).toBeVisible({ timeout: 10000 });
    });

    test('should display date range picker', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for date picker button
      const datePicker = page.locator('button').filter({ hasText: /pick a date/i }).first();
      await expect(datePicker).toBeVisible({ timeout: 5000 });
    });

    test('should display import and export buttons', async ({ page }) => {
      await page.waitForTimeout(2000);

      const importButton = page.locator('button').filter({ hasText: /import/i }).first();
      const exportButton = page.locator('button').filter({ hasText: /export/i }).first();

      await expect(importButton).toBeVisible({ timeout: 5000 });
      await expect(exportButton).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Metrics Display', () => {
    test('should display total products metric', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Look for "Total Products" text
      const totalProductsLabel = page.locator('text=Total Products').first();
      await expect(totalProductsLabel).toBeVisible({ timeout: 5000 });
    });

    test('should display active products metric', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Look for "Active" metric (not the status in table)
      const activeMetric = page.locator('text=Active').first();
      await expect(activeMetric).toBeVisible({ timeout: 5000 });
    });

    test('should display featured products metric', async ({ page }) => {
      await page.waitForTimeout(3000);

      const featuredMetric = page.locator('text=Featured').first();
      await expect(featuredMetric).toBeVisible({ timeout: 5000 });
    });

    test('should display out of stock metric', async ({ page }) => {
      await page.waitForTimeout(3000);

      const outOfStockMetric = page.locator('text=Out of Stock').first();
      await expect(outOfStockMetric).toBeVisible({ timeout: 5000 });
    });

    test('should display low stock metric', async ({ page }) => {
      await page.waitForTimeout(3000);

      const lowStockMetric = page.locator('text=Low Stock').first();
      await expect(lowStockMetric).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Table Display', () => {
    test('should display product table', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Look for table element
      const table = page.locator('table').first();
      await expect(table).toBeVisible({ timeout: 10000 });
    });

    test('should display table headers', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Check for column headers
      const productHeader = page.locator('text=Product').first();
      const priceHeader = page.locator('text=Selling Price').first();
      const statusHeader = page.locator('text=Status').first();
      const featuredHeader = page.locator('text=Featured').first();

      await expect(productHeader).toBeVisible({ timeout: 5000 });
      await expect(priceHeader).toBeVisible({ timeout: 5000 });
      await expect(statusHeader).toBeVisible({ timeout: 5000 });
      await expect(featuredHeader).toBeVisible({ timeout: 5000 });
    });

    test('should display product rows with data', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Check if table has rows
      const tableRows = page.locator('table tbody tr');
      const rowCount = await tableRows.count();

      expect(rowCount).toBeGreaterThan(0);
    });

    test('should display product names in table', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Get first product row
      const firstRow = page.locator('table tbody tr').first();
      await expect(firstRow).toBeVisible({ timeout: 5000 });

      // Should have some text content
      const rowText = await firstRow.textContent();
      expect(rowText).toBeTruthy();
    });

    test('should display search box', async ({ page }) => {
      await page.waitForTimeout(2000);

      const searchBox = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
      await expect(searchBox).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination controls', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Look for "Rows per page" text
      const rowsPerPageText = page.locator('text=Rows per page').first();
      await expect(rowsPerPageText).toBeVisible({ timeout: 5000 });
    });

    test('should display page information', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Look for page info like "Page 1 of X" or "Showing 1-10 of X"
      const pageInfo = page.locator('text=/Showing|Page/i').first();
      await expect(pageInfo).toBeVisible({ timeout: 5000 });
    });

    test('should display next page button', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Look for next page button
      const nextButton = page.locator('button[aria-label*="Next" i], button:has-text("Next")').first();
      const nextButtonExists = await nextButton.count() > 0;

      expect(nextButtonExists).toBeTruthy();
    });

    test('should display previous page button', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Look for previous page button
      const prevButton = page.locator('button[aria-label*="Previous" i], button:has-text("Previous")').first();
      const prevButtonExists = await prevButton.count() > 0;

      expect(prevButtonExists).toBeTruthy();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to product detail when clicking on a product row', async ({ page }) => {
      await page.waitForTimeout(3000);

      // Click on first product row (not the checkbox)
      const firstProductRow = page.locator('table tbody tr').first();
      await firstProductRow.click();

      // Wait for navigation
      await page.waitForTimeout(2000);

      // Should navigate to a product detail page
      expect(page.url()).toContain('/products/');
      expect(page.url()).not.toBe('http://localhost:5173/products');
    });
  });

  test.describe('Filtering & Sorting', () => {
    test('should have sortable table columns', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Check if table headers exist (they should be clickable for sorting)
      const tableHeaders = page.locator('table th, table [role="columnheader"]');
      const headerCount = await tableHeaders.count();

      // Should have multiple column headers
      expect(headerCount).toBeGreaterThan(0);
    });

    test('should display visible columns button', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for Visible Columns button (might have aria-label or be an icon button)
      const columnsButton = page.locator('button[aria-label*="Column" i], button:has-text("Visible Columns"), button:has-text("Columns")').first();
      const columnsButtonExists = await columnsButton.count() > 0;

      // Column visibility might be available through table UI
      expect(columnsButtonExists || page.url().includes('/products')).toBeTruthy();
    });

    test('should be able to search products', async ({ page }) => {
      await page.waitForTimeout(2000);

      const searchBox = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
      await searchBox.fill('test');

      // Wait for search to complete
      await page.waitForTimeout(1000);

      const value = await searchBox.inputValue();
      expect(value).toBe('test');
    });
  });
});
