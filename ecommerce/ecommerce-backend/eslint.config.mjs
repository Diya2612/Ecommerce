import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'build/**',
      'node_modules/**',
      'coverage/**',
      'database-reference/**',
      'tests/**',
      'scripts/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },

  js.configs.recommended,

  {
    languageOptions: {
      globals: globals.node,
    },
  },

  // Use strict preset for stronger guarantees — flags things recommended misses
  ...tseslint.configs.strict,

  // Type-aware rules for source files (requires parserOptions.project)
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // Prevents fire-and-forget async calls — a real source of unhandled rejections
      '@typescript-eslint/no-floating-promises': 'error',

      // Prevents awaiting a non-Promise value (often indicates a logic error)
      '@typescript-eslint/await-thenable': 'error',

      // Disabled per user request (was: Any type undermines TypeScript — treat as error in source code)
      '@typescript-eslint/no-explicit-any': 'off',

      // Enforces use of the logger utility; console is not allowed in production code
      'no-console': 'error',

      // Ignore variables starting with underscore
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Relaxed rules for test files — mocks, assertions, and setup code need flexibility
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
