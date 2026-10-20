import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../../utils/credentials';

test.describe('Product Edit Page - Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to products list page
    await page.goto('http://localhost:5173/products');
    await page.waitForLoadState('networkidle');
    
    // Wait for table to load (skeleton disappears)
    await page.waitForTimeout(3000);
    
    // Click on first product row to navigate to edit page
    const firstProductRow = page.locator('tbody tr').first();
    await firstProductRow.click();
    
    // Wait for navigation to product detail page
    await page.waitForURL('**/products/**', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Wait for skeleton to disappear by checking for actual form content
    await page.waitForSelector('input[id="productTitle"]', { timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test.describe('Page Load & Structure', () => {
    test('should load product edit page successfully', async ({ page }) => {
      // Check URL contains products/
      expect(page.url()).toContain('/products/');
      
      // Verify form loaded by checking product title input exists
      const titleInput = page.locator('input[id="productTitle"]');
      await expect(titleInput).toBeVisible();
    });

    test('should display product name in header', async ({ page }) => {
      // Look for product name heading
      const productHeading = page.locator('h1').first();
      await expect(productHeading).toBeVisible();
      
      const headingText = await productHeading.textContent();
      expect(headingText).toBeTruthy();
      expect(headingText!.length).toBeGreaterThan(0);
    });

    test('should display SKU in header', async ({ page }) => {
      // Look for SKU paragraph (format: "SKU: 12345")
      const skuText = page.locator('p:has-text("SKU:")').first();
      await expect(skuText).toBeVisible();
    });

    test('should display pre-filled form data', async ({ page }) => {
      // Check if product title is pre-filled
      const titleInput = page.locator('input[id="productTitle"]');
      const titleValue = await titleInput.inputValue();
      
      expect(titleValue).toBeTruthy();
      expect(titleValue.length).toBeGreaterThan(0);
    });

    test('should display action buttons', async ({ page }) => {
      // Look for Preview button
      const previewButton = page.locator('button:has-text("Preview")');
      await expect(previewButton).toBeVisible();
    });
  });

  test.describe('Update Basic Information', () => {
    test('should update product title', async ({ page }) => {
      // Find and update product title
      const titleInput = page.locator('input[id="productTitle"]');
      const originalValue = await titleInput.inputValue();
      
      await titleInput.fill(`${originalValue} Updated`);
      
      const newValue = await titleInput.inputValue();
      expect(newValue).toContain('Updated');
    });

    test('should update short description', async ({ page }) => {
      const descInput = page.locator('textarea[placeholder*="Brief product"]').first();
      await descInput.fill('Updated product description for testing');
      
      const value = await descInput.inputValue();
      expect(value).toBe('Updated product description for testing');
    });

    test('should display secondary title field', async ({ page }) => {
      // Check secondary title field exists
      const secondaryInput = page.locator('input[placeholder*="Alternative"]').first();
      await expect(secondaryInput).toBeVisible();
    });
  });

  test.describe('Update Pricing', () => {
    test('should display pricing section', async ({ page }) => {
      // Check for Pricing heading
      const pricingHeading = page.locator('h3:has-text("Pricing")');
      await expect(pricingHeading).toBeVisible();
    });

    test('should update selling price', async ({ page }) => {
      // Find selling price spinbutton (labeled "Selling Price *")
      const sellingInput = page.locator('input[type="number"]').nth(1); // Second number input is selling price
      await sellingInput.fill('999');
      const value = await sellingInput.inputValue();
      expect(value).toBe('999');
    });

    test('should update cost price', async ({ page }) => {
      // Find cost price spinbutton (labeled "Cost Price *") - first number input
      const costInput = page.locator('input[type="number"]').first();
      await costInput.fill('500');
      
      const value = await costInput.inputValue();
      expect(value).toBe('500');
    });

    test('should display inventory quantity field', async ({ page }) => {
      // Check for Base Inventory label
      const inventoryLabel = page.locator('text=Base Inventory Quantity');
      await expect(inventoryLabel).toBeVisible();
    });

    test('should update inventory quantity', async ({ page }) => {
      // Find inventory spinbutton (labeled "Base Inventory Quantity *")
      // It's typically the 4th number input (after cost, selling, compare at price)
      const inventoryInput = page.locator('input[type="number"]').nth(3);
      await inventoryInput.fill('100');
      const newValue = await inventoryInput.inputValue();
      expect(newValue).toBe('100');
    });
  });

  test.describe('Update Status', () => {
    test('should display product status dropdown', async ({ page }) => {
      // Check for Product Status label and combobox
      const statusLabel = page.locator('text=Product Status *');
      await expect(statusLabel).toBeVisible();
    });

    test('should display featured product toggle', async ({ page }) => {
      // Check for Featured Product label and switch
      const featuredLabel = page.locator('text=Featured Product').first();
      await expect(featuredLabel).toBeVisible();
    });

    test('should display availability section', async ({ page }) => {
      // Check for Availability heading
      const availabilityHeading = page.locator('h2:has-text("Availability")');
      await expect(availabilityHeading).toBeVisible();
    });
  });

  test.describe('Product Metrics', () => {
    test('should display product metrics section', async ({ page }) => {
      // Check for Product Metrics heading
      const metricsHeading = page.locator('h2:has-text("Product Metrics")');
      await expect(metricsHeading).toBeVisible();
    });

    test('should display created date', async ({ page }) => {
      // Check for Created label
      const createdLabel = page.locator('p:has-text("Created")');
      await expect(createdLabel).toBeVisible();
    });

    test('should display last modified date', async ({ page }) => {
      // Check for Last Modified label
      const modifiedLabel = page.locator('p:has-text("Last Modified")');
      await expect(modifiedLabel).toBeVisible();
    });
  });

  test.describe('Media Section', () => {
    test('should display media section', async ({ page }) => {
      // Check for Media heading
      const mediaHeading = page.locator('h2:has-text("Media")');
      await expect(mediaHeading).toBeVisible();
    });

    test('should display primary image area', async ({ page }) => {
      // Check for Primary Product Image label
      const primaryLabel = page.locator('text=Primary Product Image');
      await expect(primaryLabel).toBeVisible();
    });

    test('should display additional images area', async ({ page }) => {
      // Check for Additional Images label
      const additionalLabel = page.locator('text=Additional Images').first();
      await expect(additionalLabel).toBeVisible();
    });
  });

  test.describe('Additional Sections', () => {
    test('should display SEO section', async ({ page }) => {
      // Check for SEO & URL heading
      const seoHeading = page.locator('h2:has-text("SEO")');
      await expect(seoHeading).toBeVisible();
    });

    test('should display product categorization', async ({ page }) => {
      // Check for Product Categorization heading
      const categorizationHeading = page.locator('h2:has-text("Product Categorization")');
      await expect(categorizationHeading).toBeVisible();
    });

    test('should display product URL field', async ({ page }) => {
      // Check for Product URL label
      const urlLabel = page.locator('text=Product URL').first();
      await expect(urlLabel).toBeVisible();
    });
  });
});
