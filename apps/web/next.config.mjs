/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@beaconmon/db',
    '@beaconmon/queue',
    '@beaconmon/types',
  ],
  webpack: (config) => {
    // Prisma v7 generated client and ESM workspace packages use .js extensions
    // in their TypeScript source. Tell webpack to resolve .js → .ts/.tsx/.js
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
