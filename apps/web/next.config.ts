import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@beaconmon/db',
    '@beaconmon/logger',
    '@beaconmon/types',
  ],
};

export default nextConfig;
