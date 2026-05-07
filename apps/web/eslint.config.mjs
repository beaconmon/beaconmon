import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    // Server code (route handlers, lib) prefers Pino (`logger.info/warn/error`)
    // for structured logs. Unlike the workers config — which forbids all
    // console.* — we intentionally allow console.warn / console.error here for
    // genuinely-unrecoverable boot-time errors and client-side dev warnings,
    // where Pino isn't available (browser) or hasn't initialized yet.
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];

export default eslintConfig;
