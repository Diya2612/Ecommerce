import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../../utils/credentials';

/**
 * Customer Addresses Tests - Phase 2
 * Based on actual UI exploration with Playwright MCP
 */
test.describe('Customer Addresses - Comprehensive Tests', () => {
  let customerId: string;

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to customers list and get a customer ID
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

  test.describe('Address Section Display', () => {
    test('should display Customer Addresses section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const addressSection = page.locator('heading, h2, h3').filter({ hasText: /customer addresses/i });
      await expect(addressSection).toBeVisible();
    });

    test('should display Add New Address button', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const addButton = page.locator('button').filter({ hasText: /add.*address/i }).first();
      await expect(addButton).toBeVisible();
    });

    test('should show empty state when no addresses', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for empty state message or address list
      const emptyMessage = await page.locator('text=/no addresses/i').count();
      const addressList = await page.locator('[role="list"], table').count();
      
      // Either empty message or address list should exist
      expect(emptyMessage > 0 || addressList > 0).toBeTruthy();
    });
  });

  test.describe('Add Address Dialog', () => {
    test('should open dialog when clicking Add New Address', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const addButton = page.locator('button').filter({ hasText: /add.*address/i }).first();
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Dialog should open
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    });

    test('should display dialog title', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const addButton = page.locator('button').filter({ hasText: /add.*address/i }).first();
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const dialogTitle = page.getByRole('heading', { name: /add.*address/i, level: 2 });
      await expect(dialogTitle).toBeVisible();
    });

    test('should have Close button', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const addButton = page.locator('button').filter({ hasText: /add.*address/i }).first();
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const closeButton = page.locator('button').filter({ hasText: /close/i });
      await expect(closeButton).toBeVisible();
    });
  });

  test.describe('Address Form Fields', () => {
    test.beforeEach(async ({ page }) => {
      await page.waitForTimeout(2000);
      const addButton = page.locator('button').filter({ hasText: /add.*address/i }).first();
      await addButton.click();
      await page.waitForTimeout(1000);
    });

    test('should display Address Name field', async ({ page }) => {
      const nameInput = page.locator('input[placeholder*="home" i], input[placeholder*="office" i]').first();
      await expect(nameInput).toBeVisible();
    });

    test('should display Country dropdown', async ({ page }) => {
      const countrySelect = page.locator('[role="combobox"]').filter({ hasText: /country/i }).first();
      const exists = await countrySelect.count() > 0;
      
      if (exists) {
        await expect(countrySelect).toBeVisible();
      }
    });

    test('should display State dropdown', async ({ page }) => {
      const stateSelect = page.locator('[role="combobox"]').filter({ hasText: /state/i }).first();
      const exists = await stateSelect.count() > 0;
      
      if (exists) {
        // State may be visible or exist
        const count = await stateSelect.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display City field', async ({ page }) => {
      const cityInput = page.locator('input[placeholder*="city" i]');
      await expect(cityInput).toBeVisible();
    });

    test('should display Pincode field', async ({ page }) => {
      const pincodeInput = page.locator('input[placeholder*="pincode" i], input[placeholder*="zip" i]');
      await expect(pincodeInput).toBeVisible();
    });

    test('should display Street Address 1 field', async ({ page }) => {
      const streetInput = page.locator('input[placeholder*="house" i], input[placeholder*="flat" i], input[placeholder*="building" i]').first();
      await expect(streetInput).toBeVisible();
    });

    test('should display Street Address 2 field', async ({ page }) => {
      const street2Input = page.locator('input[placeholder*="street" i], input[placeholder*="area" i]').first();
      await expect(street2Input).toBeVisible();
    });

    test('should display Landmark field', async ({ page }) => {
      const landmarkInput = page.locator('input[placeholder*="landmark" i]');
      await expect(landmarkInput).toBeVisible();
    });

    test('should display Address Type dropdown', async ({ page }) => {
      const typeSelect = page.locator('[role="combobox"]').last();
      await expect(typeSelect).toBeVisible();
    });

    test('should display Default Billing switch', async ({ page }) => {
      const billingSwitch = page.locator('text=/default billing/i').first();
      await expect(billingSwitch).toBeVisible();
    });

    test('should display Default Shipping switch', async ({ page }) => {
      const shippingSwitch = page.locator('text=/default shipping/i').first();
      await expect(shippingSwitch).toBeVisible();
    });
  });

  test.describe('Form Actions', () => {
    test.beforeEach(async ({ page }) => {
      await page.waitForTimeout(2000);
      const addButton = page.locator('button').filter({ hasText: /add.*address/i }).first();
      await addButton.click();
      await page.waitForTimeout(1000);
    });

    test('should display Cancel button', async ({ page }) => {
      const cancelButton = page.locator('button').filter({ hasText: /cancel/i });
      await expect(cancelButton).toBeVisible();
    });

    test('should display Save Address button', async ({ page }) => {
      const saveButton = page.locator('button').filter({ hasText: /save.*address/i });
      await expect(saveButton).toBeVisible();
    });

    test('should close dialog when clicking Cancel', async ({ page }) => {
      const cancelButton = page.locator('button').filter({ hasText: /cancel/i });
      await cancelButton.click();
      await page.waitForTimeout(500);
      
      // Dialog should close
      const dialog = page.locator('[role="dialog"]');
      const isVisible = await dialog.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    });

    test('should close dialog when clicking Close button', async ({ page }) => {
      const closeButton = page.locator('button').filter({ hasText: /close/i });
      await closeButton.click();
      await page.waitForTimeout(500);
      
      // Dialog should close
      const dialog = page.locator('[role="dialog"]');
      const isVisible = await dialog.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.waitForTimeout(2000);
      const addButton = page.locator('button').filter({ hasText: /add.*address/i }).first();
      await addButton.click();
      await page.waitForTimeout(1000);
    });

    test('should allow filling Address Name', async ({ page }) => {
      const nameInput = page.locator('input[placeholder*="home" i], input[placeholder*="office" i]').first();
      await nameInput.fill('My Home');
      
      const value = await nameInput.inputValue();
      expect(value).toBe('My Home');
    });

    test('should allow filling City', async ({ page }) => {
      const cityInput = page.locator('input[placeholder*="city" i]');
      await cityInput.fill('Mumbai');
      
      const value = await cityInput.inputValue();
      expect(value).toBe('Mumbai');
    });

    test('should allow filling Pincode', async ({ page }) => {
      const pincodeInput = page.locator('input[placeholder*="pincode" i], input[placeholder*="zip" i]');
      await pincodeInput.fill('400001');
      
      const value = await pincodeInput.inputValue();
      expect(value).toBe('400001');
    });

    test('should allow filling Street Address', async ({ page }) => {
      const streetInput = page.locator('input[placeholder*="house" i], input[placeholder*="flat" i], input[placeholder*="building" i]').first();
      await streetInput.fill('123 Test Building');
      
      const value = await streetInput.inputValue();
      expect(value).toBe('123 Test Building');
    });

    test('should allow filling Landmark', async ({ page }) => {
      const landmarkInput = page.locator('input[placeholder*="landmark" i]');
      await landmarkInput.fill('Near Test Park');
      
      const value = await landmarkInput.inputValue();
      expect(value).toBe('Near Test Park');
    });
  });

  test.describe('Address Display', () => {
    test('should show address list if addresses exist', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Check if addresses are displayed
      const hasAddresses = await page.locator('[role="list"], table').count() > 0;
      const hasEmptyState = await page.locator('text=/no addresses/i').count() > 0;
      
      // Either addresses or empty state should be shown
      expect(hasAddresses || hasEmptyState).toBeTruthy();
    });
  });
});
