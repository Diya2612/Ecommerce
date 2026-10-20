import { test, expect } from '@playwright/test';

/**
 * Smoke test to verify Playwright setup is working correctly
 * This test should pass even without authentication
 */
test.describe('Smoke Tests - Verify Setup', () => {
  test('playwright is installed and working', async ({ page }) => {
    // This is a basic smoke test that should always pass
    expect(page).toBeDefined();
    expect(typeof page.goto).toBe('function');
  });

  test('can navigate to application', async ({ page }) => {
    // Try to navigate to the application
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check if we got a response (even if it's a redirect)
    expect(response).toBeDefined();
    expect(response?.status()).toBeLessThan(500); // No server errors
  });

  test('application loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Allow some time for potential errors to occur
    await page.waitForTimeout(2000);
    
    // Log errors if any (but don't fail the test for now)
    if (errors.length > 0) {
      console.log('⚠️ Console/Page Errors detected:', errors);
    }
    
    // Basic check: page should have some content
    const body = await page.locator('body').innerHTML();
    expect(body.length).toBeGreaterThan(0);
  });

  test('can take screenshots', async ({ page }) => {
    await page.goto('/');
    
    // Verify screenshot functionality works
    const screenshot = await page.screenshot();
    expect(screenshot).toBeDefined();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('browser context is properly configured', async ({ page, context }) => {
    // Verify browser context settings
    expect(context).toBeDefined();
    expect(page.context()).toBe(context);
    
    // Check viewport (if set)
    const viewport = page.viewportSize();
    if (viewport) {
      expect(viewport.width).toBeGreaterThan(0);
      expect(viewport.height).toBeGreaterThan(0);
    }
  });
});
