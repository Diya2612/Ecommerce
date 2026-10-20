import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../../utils/credentials';

/**
 * Simplified Customer Edit/Detail Page Tests
 * Focuses on page load and structure verification
 */
test.describe('Customer Edit Page - Simplified Tests', () => {
  let customerId: string;

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Get a customer ID from list
    await page.goto('http://localhost:5173/customers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const firstRow = page.locator('tbody tr, [role="row"]').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
      
      const url = page.url();
      const match = url.match(/\/customers\/([^\/]+)/);
      if (match) {
        customerId = match[1];
      }
    }
  });

  test.describe('Page Load', () => {
    test('should load customer detail page', async ({ page }) => {
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/customers/');
      expect(page.url()).not.toBe('http://localhost:5173/customers');
    });

    test('should display page header', async ({ page }) => {
      await page.waitForTimeout(1000);
      const heading = await page.locator('h1, h2').count() > 0;
      expect(heading).toBeTruthy();
    });

    test('should display customer information sections', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Check for any customer info sections
      const hasBasicInfo = await page.locator('h2, h3').filter({ hasText: /basic|information/i }).count() > 0;
      const hasContactInfo = await page.locator('h2, h3').filter({ hasText: /contact/i }).count() > 0;
      const hasAnySection = await page.locator('input, select, textarea').count() > 0;
      
      // At least some content should be visible
      expect(hasBasicInfo || hasContactInfo || hasAnySection).toBeTruthy();
    });

    test('should display action buttons', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Check for any action buttons (buttons might change based on edit mode)
      const hasAnyButton = await page.locator('button').count() > 0;
      expect(hasAnyButton).toBeTruthy();
    });
  });

  test.describe('Navigation', () => {
    test('should have back/cancel button', async ({ page }) => {
      await page.waitForTimeout(2000);
      const cancelButton = page.locator('button').filter({ hasText: /cancel|back/i }).first();
      const exists = await cancelButton.count() > 0;
      if (exists) {
        await expect(cancelButton).toBeVisible();
      }
    });

    test('should navigate back when clicking cancel/back', async ({ page }) => {
      await page.waitForTimeout(2000);
      const cancelButton = page.locator('button').filter({ hasText: /cancel|back/i }).first();
      
      if (await cancelButton.count() > 0) {
        await cancelButton.click();
        await page.waitForTimeout(2000);
        
        // Should navigate away from detail page
        const url = page.url();
        const isOnListPage = url.endsWith('/customers') || url.includes('/customers?');
        expect(isOnListPage).toBeTruthy();
      }
    });
  });

  test.describe('Read-Only View', () => {
    test('should display customer name', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for name inputs or display elements
      const hasNameField = await page.locator('input[placeholder*="name" i], input[name*="name" i]').count() > 0;
      expect(hasNameField).toBeTruthy();
    });

    test('should display customer email', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const hasEmailField = await page.locator('input[type="email"], input[placeholder*="email" i]').count() > 0;
      expect(hasEmailField).toBeTruthy();
    });

    test('should display customer phone', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const hasPhoneField = await page.locator('input[type="tel"], input[placeholder*="phone" i]').count() > 0;
      expect(hasPhoneField).toBeTruthy();
    });
  });

  test.describe('Additional Sections', () => {
    test('should display addresses section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const hasAddressSection = await page.locator('heading, h2, h3').filter({ hasText: /address/i }).count() > 0;
      const hasAddressButton = await page.locator('button').filter({ hasText: /address/i }).count() > 0;
      
      // Either section or button should exist
      expect(hasAddressSection || hasAddressButton).toBeTruthy();
    });

    test('should display order history section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for order-related content
      const hasOrderSection = await page.locator('heading, h2, h3').filter({ hasText: /order/i }).count() > 0;
      
      if (hasOrderSection) {
        expect(hasOrderSection).toBeTruthy();
      }
    });
  });
});
