// @ts-check
import js from '@eslint/js';

export default [
  { ignores: ['lib/env.ts', 'node_modules/', '**/*.js'] },
  js.configs.recommended,
  {
    rules: {
      // Workers must use Pino (logger.info/warn/error), never console.*
      // console.log bypasses structured logging and loses context fields.
      // lib/env.ts is excluded from linting via the `ignores` entry above
      // because it runs before the logger is available and uses console.error.
      // ESLint 9 rejects `allow: []` (must have ≥1 entry); plain 'error' is
      // semantically identical: forbid every console.* method.
      'no-console': 'error',
    },
  },
];
