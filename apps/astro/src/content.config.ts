import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema, authorSchema } from './lib/content/frontmatter';
import { slug } from './lib/content/schema';
export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: '*.md', base: './content/posts' }),
    schema: postSchema,
  }),
  authors: defineCollection({
    loader: glob({
      pattern: '*.md',
      base: './content/authors',
      generateId: ({ entry }) => slug.parse(entry.replace(/\.md$/, '')),
    }),
    schema: authorSchema,
  }),
};
