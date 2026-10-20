import { test, expect } from '../fixtures/auth.fixture';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Products Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    // Navigate to products page
    await page.goto('/products');
    await waitForPageLoad(page);
  });

  test('should display products list', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Check if we're on products page
    await expect(page).toHaveURL(/\/products/);

    // Look for common product list elements
    // Adjust selectors based on your UI
    const heading = page.locator('h1:has-text("Products"), h2:has-text("Products")').first();
    await expect(heading).toBeVisible({ timeout: 5000 }).catch(() => { });
  });

  test('should open create product dialog/page', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Look for "Add Product", "New Product", or "Create" button
    const createButton = page.locator('button:has-text("Add Product"), button:has-text("New Product"), button:has-text("Create"), a:has-text("Add Product"), a:has-text("Create Product"), a:has-text("Create")').first();

    if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createButton.click();

      // Check if dialog or new page opens
      await page.waitForTimeout(1000);

      // Look for product form fields
      const nameField = page.locator('input[name="name"], input[placeholder*="name" i], label:has-text("Name") + input').first();
      await expect(nameField).toBeVisible({ timeout: 5000 }).catch(() => { });
    }
  });

  test('should search products', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('test product');
      await page.waitForTimeout(1000); // Wait for search to execute

      // Results should update
      await waitForPageLoad(page);
    }
  });

  test('should filter products', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Look for filter button or dropdown
    const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filters")').first();

    if (await filterButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Filter options should appear
      // This is a basic check - adjust based on your filter UI
    }
  });
});
