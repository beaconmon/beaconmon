import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Server code (route handlers, lib) prefers Pino (`logger.info/warn/error`)
    // for structured logs. Unlike the workers config — which forbids all
    // console.* — we intentionally allow console.warn / console.error here for
    // genuinely-unrecoverable boot-time errors and client-side dev warnings,
    // where Pino isn't available (browser) or hasn't initialized yet.
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];

export default eslintConfig;
