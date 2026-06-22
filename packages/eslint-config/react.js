// @ts-check
import globals from 'globals';
import { base } from './base.js';

/** @type {import('eslint').Linter.Config[]} */
export const react = [
  ...base,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
