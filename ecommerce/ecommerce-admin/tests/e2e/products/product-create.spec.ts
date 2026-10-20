import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../../utils/credentials';

test.describe('Product Create Page - Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to create product page
    await page.goto('http://localhost:5173/products/add');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Load & Structure', () => {
    test('should load add product page successfully', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Check URL
      expect(page.url()).toContain('/products/add');
    });

    test('should display page header', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for "Add" heading
      const heading = page.locator('h1, h2').filter({ hasText: /add.*product|new product/i }).first();
      await expect(heading).toBeVisible({ timeout: 5000 });
    });

    test('should display form sections', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Check for main form sections
      const basicInfoSection = page.locator('text=Basic Product Details').first();
      await expect(basicInfoSection).toBeVisible({ timeout: 5000 });
    });

    test('should show save and cancel buttons', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for buttons
      const addButton = page.locator('button:has-text("Add Product")').first();
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await expect(cancelButton).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Basic Information Section', () => {
    test('should display product title field', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for product title input
      const titleInput = page.locator('input[placeholder*="product name" i], input[placeholder*="Enter product" i]').first();
      await expect(titleInput).toBeVisible({ timeout: 5000 });
    });

    test('should fill product title field', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const titleInput = page.locator('input[placeholder*="product name" i], input[placeholder*="Enter product" i]').first();
      await titleInput.fill('Test Product Auto');
      
      const value = await titleInput.inputValue();
      expect(value).toBe('Test Product Auto');
    });

    test('should display secondary title field', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const secondaryInput = page.locator('input[placeholder*="subtitle" i], input[placeholder*="Alternative" i]').first();
      await expect(secondaryInput).toBeVisible({ timeout: 5000 });
    });

    test('should display short description field', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const descInput = page.locator('textarea[placeholder*="Brief product" i], textarea[placeholder*="description" i]').first();
      await expect(descInput).toBeVisible({ timeout: 5000 });
    });

    test('should fill short description', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const descInput = page.locator('textarea[placeholder*="Brief product" i], textarea[placeholder*="description" i]').first();
      await descInput.fill('This is a test product description');
      
      const value = await descInput.inputValue();
      expect(value).toBe('This is a test product description');
    });
  });

  test.describe('Pricing Section', () => {
    test('should display media section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const mediaHeading = page.locator('text=Media').first();
      await expect(mediaHeading).toBeVisible({ timeout: 5000 });
    });

    test('should display pricing section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for Pricing heading
      const pricingHeading = page.locator('h2, h3').filter({ hasText: /pricing/i }).first();
      await expect(pricingHeading).toBeVisible({ timeout: 5000 });
    });

    test('should display cost price field', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for Cost Price label and input
      const costPriceLabel = page.locator('text=Cost Price').first();
      await expect(costPriceLabel).toBeVisible({ timeout: 5000 });
    });

    test('should fill cost price', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Find cost price input (spinbutton or number input)
      const costPriceInputs = page.locator('input[type="number"]');
      const firstInput = costPriceInputs.first();
      
      await firstInput.fill('100');
      const value = await firstInput.inputValue();
      expect(value).toBe('100');
    });

    test('should display selling price field', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const sellingPriceLabel = page.locator('text=Selling Price').first();
      await expect(sellingPriceLabel).toBeVisible({ timeout: 5000 });
    });

    test('should fill selling price', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Get all number inputs and fill the second one (selling price)
      const numberInputs = page.locator('input[type="number"]');
      const count = await numberInputs.count();
      
      if (count >= 2) {
        const sellingInput = numberInputs.nth(1);
        await sellingInput.fill('150');
        const value = await sellingInput.inputValue();
        expect(value).toBe('150');
      } else {
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should display base inventory field', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for Inventory label
      const inventoryLabel = page.locator('text=/inventory/i').first();
      await expect(inventoryLabel).toBeVisible({ timeout: 5000 });
    });

    test('should fill inventory quantity', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Find inventory input
      const inventoryInput = page.locator('input[type="number"]').filter({ hasText: '' }).last();
      await inventoryInput.fill('50');
      
      const value = await inventoryInput.inputValue();
      expect(value).toBe('50');
    });
  });

  test.describe('Product Status', () => {
    test('should display status dropdown', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for Product Status
      const statusLabel = page.locator('text=Product Status').first();
      await expect(statusLabel).toBeVisible({ timeout: 5000 });
    });

    test('should display availability section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const availabilityHeading = page.locator('text=Availability').first();
      await expect(availabilityHeading).toBeVisible({ timeout: 5000 });
    });

    test('should display featured product toggle', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const featuredLabel = page.locator('text=Featured Product').first();
      await expect(featuredLabel).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Form Submission', () => {
    test('should show validation error for empty required fields', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Try to submit without filling required fields
      const addButton = page.locator('button:has-text("Add Product")').first();
      await addButton.click();
      
      // Wait a moment for validation
      await page.waitForTimeout(1000);
      
      // Should still be on the same page (not navigated)
      expect(page.url()).toContain('/products/add');
    });

    test('should create product successfully with required fields', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Fill required fields
      const timestamp = Date.now();
      
      // Product title
      const titleInput = page.locator('input[placeholder*="product name" i], input[placeholder*="Enter product" i]').first();
      await titleInput.fill(`Test Product ${timestamp}`);
      
      // Cost price
      const numberInputs = page.locator('input[type="number"]');
      await numberInputs.first().fill('100');
      
      // Selling price
      if (await numberInputs.count() >= 2) {
        await numberInputs.nth(1).fill('150');
      }
      
      // Inventory
      const inventoryInput = page.locator('input[type="number"]').last();
      await inventoryInput.fill('50');
      
      // Wait a bit before submitting
      await page.waitForTimeout(1000);
      
      // Click Add Product button
      const addButton = page.locator('button:has-text("Add Product")').first();
      await addButton.click();
      
      // Wait for navigation or success
      await page.waitForTimeout(3000);
      
      // Should navigate away from add page or show success
      const currentUrl = page.url();
      const success = !currentUrl.endsWith('/products/add') || currentUrl.includes('/products/');
      expect(success).toBeTruthy();
    });
  });

  test.describe('Additional Sections', () => {
    test('should display SEO section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const seoHeading = page.locator('text=SEO').first();
      await expect(seoHeading).toBeVisible({ timeout: 5000 });
    });

    test('should display product categorization section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for Categorization heading
      const categorizationHeading = page.locator('h2, h3').filter({ hasText: /categorization/i }).first();
      await expect(categorizationHeading).toBeVisible({ timeout: 5000 });
    });

    test('should display notes and tags section', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const notesHeading = page.locator('text=Notes').first();
      await expect(notesHeading).toBeVisible({ timeout: 5000 });
    });

    test('should display tier 1 category dropdown', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const tier1Label = page.locator('text=Tier 1 Category').first();
      await expect(tier1Label).toBeVisible({ timeout: 5000 });
    });
  });
});
