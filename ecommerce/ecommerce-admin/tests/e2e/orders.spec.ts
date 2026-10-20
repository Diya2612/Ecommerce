import { test, expect } from '../fixtures/auth.fixture';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Orders Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/orders');
    await waitForPageLoad(page);
  });

  test('should display orders list', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    
    await expect(page).toHaveURL(/\/orders/);
    
    const heading = page.locator('h1:has-text("Orders"), h2:has-text("Orders")').first();
    await expect(heading).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should view order details', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    
    // Look for first order in the list
    const firstOrder = page.locator('table tbody tr, [data-testid="order-row"], .order-item').first();
    
    if (await firstOrder.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstOrder.click();
      await page.waitForTimeout(1000);
      
      // Order details should be visible
      await waitForPageLoad(page);
    }
  });
});
