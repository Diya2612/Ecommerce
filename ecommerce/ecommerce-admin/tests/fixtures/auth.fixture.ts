import { test as base, Page } from '@playwright/test';
import { TEST_CREDENTIALS } from '../utils/credentials';

/**
 * Test user credentials for authenticated tests
 */
export const testUsers = TEST_CREDENTIALS;

/**
 * Extended test fixture with authentication helpers
 */
type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Helper to perform login
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');

  // Wait for the login form to be visible
  await page.waitForSelector('input[type="email"]', { state: 'visible' });

  // Fill in credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation after successful login
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Authenticated test fixture
 * Usage: test.use({ authenticatedPage: true });
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Perform login before each test
    await login(page, testUsers.email, testUsers.password);

    // Use the authenticated page
    await use(page);

    // Cleanup: logout after test
    // You can add logout logic here if needed
  },
});

export { expect } from '@playwright/test';
