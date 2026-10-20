import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow setState in useEffect for legitimate cases (form initialization, dialog reset)
      'react-hooks/set-state-in-effect': 'off',
      // Allow empty object types in specific cases
      '@typescript-eslint/no-empty-object-type': 'off',
      // Allow @ts-ignore comments (prefer @ts-expect-error but allow both)
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': false }],
      // Allow unused variables in specific patterns (catch variables, destructuring)
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_'
      }],
      // Allow explicit any in development (can be stricter in production)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
])
