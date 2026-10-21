import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { loadRootEnv } from '@packages/env/load';

loadRootEnv(
  process.env.NODE_ENV === 'development' ? 'development' : 'production',
);
const local = process.env.ASTRO_TARGET === 'node';

export default defineConfig({
  site: 'https://manipalosf.org',
  output: 'static',
  trailingSlash: 'never',
  adapter: local
    ? node({ mode: 'standalone' })
    : vercel({ isr: { expiration: 3600 } }),
  markdown: {
    processor: unified({
      remarkPlugins: [remarkGfm],
      smartypants: false,
      rehypePlugins: [rehypeSlug],
      remarkRehype: { allowDangerousHtml: false },
    }),
    shikiConfig: { theme: 'github-dark' },
  },
  vite: { ssr: { noExternal: ['@packages/ui'] } },
});
