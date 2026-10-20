import { test as base } from '@playwright/test';

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.fill('input[type="email"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('input[type="password"]', password);
  }

  async clickSubmit() {
    await this.page.click('button[type="submit"]');
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  async waitForRedirect() {
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }
}

/**
 * Page Object Model for Dashboard Page
 */
export class DashboardPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async navigateToProducts() {
    await this.page.click('a:has-text("Products")');
  }

  async navigateToOrders() {
    await this.page.click('a:has-text("Orders")');
  }

  async navigateToCustomers() {
    await this.page.click('a:has-text("Customers")');
  }

  async getWelcomeMessage() {
    return this.page.locator('h1, h2').first().textContent();
  }
}

/**
 * Test fixture with page objects
 */
type PageObjects = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
