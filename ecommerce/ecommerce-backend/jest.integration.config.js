module.exports = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ...require('./jest.config'),
  setupFiles: [], // Disable global mocks (drizzle-mock etc.)
  testMatch: ['**/tests/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setup.ts'], // Keep real DB setup
  testTimeout: 30000, // Integration tests need more time for real I/O
  detectOpenHandles: false, // DB connections keep handles open intentionally
  forceExit: true, // Ensure the process exits after integration suite
};
