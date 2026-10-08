import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import path from 'node:path';
import './lib/env';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'manipalosf.org',
      },
    ],
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
      path.join(process.cwd(), 'lib/rehype-ec.mjs'),
    ],
  },
});

export default withMDX(nextConfig);
