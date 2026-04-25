// @ts-check
import js from '@eslint/js';

export default [
  { ignores: ['lib/env.ts', 'node_modules/', '**/*.js'] },
  js.configs.recommended,
  {
    rules: {
      // Workers must use Pino (logger.info/warn/error), never console.*
      // console.log bypasses structured logging and loses context fields.
      // Exception: env.ts uses console.error at startup before the logger is available.
      'no-console': ['error', { allow: [] }],
    },
  },
];
