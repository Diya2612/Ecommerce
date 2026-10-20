module.exports = {
  // SWC for fast TypeScript transpilation (10-30× faster than ts-jest)
  // V8 coverage avoids the babel-plugin-istanbul → glob → inflight dependency chain
  coverageProvider: 'v8',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
          },
        },
        module: {
          type: 'commonjs',
        },
        sourceMaps: 'inline',
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.schema.ts', // Schema files are declarations, not logic
    '!src/server.ts',
    '!src/app.ts',
    '!src/database/migrations/**', // Generated migration files
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFiles: ['<rootDir>/tests/utils/drizzle-mock.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setup.ts'],
  testTimeout: 10000, // 10s is sufficient for unit tests; integration config overrides to 30s
  verbose: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transformIgnorePatterns: [
    'node_modules/(?!jose)', // jose is ESM-only and must be transpiled
  ],
  moduleNameMapper: {
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
