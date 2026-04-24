import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['ioredis', '@prisma/client', 'pg', 'pg-connection-string', 'pgpass', 'split2', 'string_decoder', 'buffer', 'redis-parser', 'redis-errors'],
  transpilePackages: [
    '@beaconmon/db',
    '@beaconmon/queue',
    '@beaconmon/types',
  ],
  // Webpack is used explicitly (next dev --webpack / next build --webpack) because
  // Turbopack does not yet support extensionAlias. The Prisma v7 prisma-client
  // generator emits TypeScript source files that import sibling files with .js
  // extensions (ESM convention), and only webpack's extensionAlias can remap those
  // to .ts at resolve time. Remove this block and drop --webpack once Turbopack
  // adds extensionAlias support or @beaconmon/db is pre-compiled to JavaScript.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
