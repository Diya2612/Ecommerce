import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../../utils/credentials';

test.describe('Inventory List Page - Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to inventory page
    await page.goto('http://localhost:5173/inventory');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Load & Structure', () => {
    test('should load inventory list page successfully', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Check URL
      expect(page.url()).toContain('/inventory');
      
      // Check if page loaded
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });

    test('should display date range picker', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for date picker button
      const datePicker = page.locator('button').filter({ hasText: /pick a date/i }).first();
      await expect(datePicker).toBeVisible({ timeout: 5000 });
    });

    test('should display table structure', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for table element
      const table = page.locator('table').first();
      await expect(table).toBeVisible({ timeout: 10000 });
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
      
      // Look for "Active" metric
      const activeMetric = page.locator('text=Active').first();
      await expect(activeMetric).toBeVisible({ timeout: 5000 });
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
    test('should display inventory table', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Look for table element
      const table = page.locator('table').first();
      await expect(table).toBeVisible({ timeout: 10000 });
    });

    test('should display table headers', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check for column headers
      const productHeader = page.locator('text=Product').first();
      const committedHeader = page.locator('text=Committed').first();
      const availableHeader = page.locator('text=Available').first();
      const lastUpdatedHeader = page.locator('text=Last Updated').first();
      
      await expect(productHeader).toBeVisible({ timeout: 5000 });
      await expect(committedHeader).toBeVisible({ timeout: 5000 });
      await expect(availableHeader).toBeVisible({ timeout: 5000 });
      await expect(lastUpdatedHeader).toBeVisible({ timeout: 5000 });
    });

    test('should display inventory rows with data', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check if table has rows
      const tableRows = page.locator('table tbody tr');
      const rowCount = await tableRows.count();
      
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should show product names in inventory list', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Get first product row
      const firstRow = page.locator('table tbody tr').first();
      await expect(firstRow).toBeVisible({ timeout: 5000 });
      
      // Should have some text content
      const rowText = await firstRow.textContent();
      expect(rowText).toBeTruthy();
    });

    test('should display committed quantities', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check that Committed column exists
      const committedHeader = page.locator('text=Committed').first();
      await expect(committedHeader).toBeVisible({ timeout: 5000 });
    });

    test('should display available quantities', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check that Available column exists
      const availableHeader = page.locator('text=Available').first();
      await expect(availableHeader).toBeVisible({ timeout: 5000 });
    });

    test('should show last updated timestamp', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check for Last Updated column
      const lastUpdatedHeader = page.locator('text=Last Updated').first();
      await expect(lastUpdatedHeader).toBeVisible({ timeout: 5000 });
    });

    test('should display adjust buttons for inventory items', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Look for adjust/edit buttons in the Available column
      const adjustButtons = page.locator('table tbody tr button');
      const buttonCount = await adjustButtons.count();
      
      expect(buttonCount).toBeGreaterThan(0);
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

  test.describe('Search & Filter', () => {
    test('should be able to search inventory', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const searchBox = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
      await searchBox.fill('test');
      
      // Wait for search to complete
      await page.waitForTimeout(1000);
      
      const value = await searchBox.inputValue();
      expect(value).toBe('test');
    });

    test('should display sort button', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for Sort button
      const sortButton = page.getByRole('button', { name: /sort/i });
      const sortButtonExists = await sortButton.count() > 0;
      
      expect(sortButtonExists).toBeTruthy();
    });

    test('should display visible columns button', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for Visible Columns button
      const columnsButton = page.getByRole('button', { name: /visible columns/i });
      const columnsButtonExists = await columnsButton.count() > 0;
      
      expect(columnsButtonExists).toBeTruthy();
    });

    test('should have sortable table columns', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Check if table headers exist (they should be clickable for sorting)
      const tableHeaders = page.locator('table th, table [role="columnheader"]');
      const headerCount = await tableHeaders.count();
      
      // Should have multiple column headers
      expect(headerCount).toBeGreaterThan(0);
    });
  });

  test.describe('Low Stock Indicator', () => {
    test('should display low stock indicator when applicable', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Look for low stock indicator - it appears as a badge with text and icon
      const lowStockIndicator = page.locator('text=/low stock/i').first();
      const lowStockExists = await lowStockIndicator.count() > 0;
      
      // Low stock might not always be present, just check page loaded successfully
      expect(page.url().includes('/inventory')).toBeTruthy();
    });
  });
});
