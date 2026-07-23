import { resolve } from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@finance/contracts', '@finance/config'],
  turbopack: {
    root: resolve(__dirname, '../..'),
  },
  outputFileTracingRoot: resolve(__dirname, '../..'),
};

export default nextConfig;
