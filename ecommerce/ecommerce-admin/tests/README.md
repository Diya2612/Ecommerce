# Playwright Testing Setup

## Overview
This project uses Playwright for end-to-end testing of the admin panel. Playwright provides reliable, fast, and cross-browser testing capabilities.

## Setup

### 1. Installation
Playwright is already installed as a dev dependency. If you need to reinstall:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

### 2. Configuration
The Playwright configuration is in `playwright.config.ts`. It includes:
- Test directory: `tests/e2e`
- Base URL: `http://localhost:5173` (configurable via `VITE_APP_URL`)
- Automatic dev server startup
- Screenshot and video capture on failure
- HTML and JSON test reports

### 3. Test Credentials
Test credentials are centralized in `tests/utils/credentials.ts`:

**Admin User:**
- Email: `admin@gmail.com`
- Password: `12345678`

**Regular User (should be denied access):**
- Email: `user@example.com`
- Password: `userpass123`

Note: Regular users should be denied access to the admin panel. Tests verify this behavior.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode (recommended for development)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run tests matching a pattern
```bash
npx playwright test --grep "login"
```

## Test Structure

```
tests/
├── e2e/                    # End-to-end test files
│   ├── auth.spec.ts       # Authentication tests
│   ├── dashboard.spec.ts  # Dashboard tests
│   ├── products.spec.ts   # Product management tests
│   ├── orders.spec.ts     # Order management tests
│   └── customers.spec.ts  # Customer management tests
├── fixtures/              # Test fixtures and helpers
│   └── auth.fixture.ts    # Authentication fixture
└── utils/                 # Test utilities
    └── helpers.ts         # Common test helper functions
```

## Writing Tests

### Basic Test
```typescript
import { test, expect } from '@playwright/test';

test('should display login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1')).toHaveText('Login');
});
```

### Authenticated Test
```typescript
import { test, expect } from '../fixtures/auth.fixture';

test('should access dashboard', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await expect(page).toHaveURL(/\/dashboard/);
});
```

### Using Helpers
```typescript
import { waitForPageLoad, navigateViaSidebar } from '../utils/helpers';

test('should navigate to products', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await navigateViaSidebar(page, 'Products');
  await waitForPageLoad(page);
});
```

## Best Practices

1. **Use Data Attributes**: Add `data-testid` attributes to important elements for reliable selection
2. **Wait for Elements**: Use `waitForSelector` or `expect().toBeVisible()` instead of fixed timeouts
3. **Clean State**: Each test should be independent and not rely on other tests
4. **Use Fixtures**: Leverage the auth fixture for tests requiring authentication
5. **Page Objects**: Consider creating page object models for complex pages
6. **Parallel Execution**: Tests run in parallel by default; ensure they don't interfere with each other

## Debugging

### Visual debugging
```bash
npm run test:debug
```

### Screenshot on failure
Screenshots are automatically captured on test failure in `test-results/`

### Trace viewer
View detailed traces of failed tests:
```bash
npx playwright show-trace test-results/.../trace.zip
```

## CI/CD Integration

To run tests in CI:
```bash
# Install dependencies
npm ci
npx playwright install --with-deps chromium

# Run tests
npm test
```

Environment variables for CI:
- `CI=true`: Enables CI-specific settings
- Tests retry twice on failure in CI
- Single worker (no parallel execution) in CI

## Common Issues

### Port already in use
If port 5173 is busy, update `VITE_APP_URL` in your test environment or change the port in `playwright.config.ts`

### Authentication fails
Ensure test user credentials in `.env.test` match actual users in your test database

### Timeouts
Increase timeout in `playwright.config.ts` if your app takes longer to load:
```typescript
timeout: 60000, // 60 seconds
```

## Resources
- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
