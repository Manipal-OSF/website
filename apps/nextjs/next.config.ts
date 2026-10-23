import type { NextConfig } from 'next';
import '@packages/env';

const config: NextConfig = {
  reactStrictMode: true,
  redirects() {
    return [
      { source: '/forum/:path*', destination: '/:path*', permanent: true },
    ];
  },
};

export default config;
