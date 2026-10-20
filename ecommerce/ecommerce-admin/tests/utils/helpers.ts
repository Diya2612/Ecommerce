import { Page } from '@playwright/test';

/**
 * Wait for the page to finish loading
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Fill a form field by label text
 */
export async function fillFieldByLabel(page: Page, label: string, value: string) {
  const input = page.locator(`label:has-text("${label}") + input, label:has-text("${label}") ~ input`).first();
  await input.fill(value);
}

/**
 * Click a button by text
 */
export async function clickButtonByText(page: Page, text: string) {
  await page.click(`button:has-text("${text}")`);
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, expectedText?: string) {
  const toast = page.locator('[role="status"], .toast, [data-sonner-toast]').first();
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  
  if (expectedText) {
    await toast.locator(`:has-text("${expectedText}")`).waitFor({ state: 'visible' });
  }
  
  return toast;
}

/**
 * Navigate using sidebar
 */
export async function navigateViaSidebar(page: Page, menuItem: string) {
  const sidebarLink = page.locator(`aside a:has-text("${menuItem}"), nav a:has-text("${menuItem}")`).first();
  await sidebarLink.click();
  await waitForPageLoad(page);
}

/**
 * Check if element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Clear local storage and cookies
 * Note: Must be called after navigating to a page to avoid SecurityError
 */
export async function clearBrowserData(page: Page) {
  await page.context().clearCookies();
  // Only clear storage if we're on a page (not about:blank)
  const url = page.url();
  if (url && !url.startsWith('about:')) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}
