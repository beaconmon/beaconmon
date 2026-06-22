// @ts-check
import globals from 'globals';
import { base } from '@beaconmon/eslint-config/base';

export default [
  { ignores: ['dist/', 'node_modules/', 'build.mjs'] },
  ...base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
