import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '@packages/env';

const appRoot = fileURLToPath(new URL('.', import.meta.url));
const workspaceRoot = path.resolve(appRoot, '../..');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: workspaceRoot },
  outputFileTracingRoot: workspaceRoot,
  outputFileTracingIncludes: { '/*': ['./content/**/*.md'] },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    // AVIF is usually 20-30% smaller than WebP; browsers without it get WebP.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'manipalosf.org',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/services', destination: '/', permanent: false },
      { source: '/events', destination: '/', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ['remark-math', 'remark-emoji'],
    rehypePlugins: [
      [
        'rehype-external-links',
        {
          target: '_blank',
          rel: ['nofollow', 'noreferrer', 'noopener'],
        },
      ],
      'rehype-slug',
      'rehype-katex',
      path.join(appRoot, 'src/lib/rehype-ec.mjs'),
    ],
  },
});

export default withMDX(nextConfig);
