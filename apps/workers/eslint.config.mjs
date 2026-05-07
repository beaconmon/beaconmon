// @ts-check
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  { ignores: ['lib/env.ts', 'node_modules/', '**/*.js'] },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // TypeScript handles undefined-variable checking; the JS rule produces
      // false positives for Node 18+ globals (fetch, crypto, AbortController).
      'no-undef': 'off',
      // Replace the JS rule with the TypeScript-aware version so that
      // `import type` statements are not flagged as unused.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Workers must use Pino (logger.info/warn/error), never console.*
      // console.log bypasses structured logging and loses context fields.
      // lib/env.ts is excluded from linting via the `ignores` entry above
      // because it runs before the logger is available and uses console.error.
      'no-console': 'error',
    },
  },
];
