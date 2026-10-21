import 'server-only';
import { cache } from 'react';
import { z } from 'zod';
import type { BlogPost } from '@/types/blog';
import { parseFrontmatter, readMarkdownFiles } from './collection';
import { analyzeMarkdown } from './markdown';
import { isoDate, localPublicPath, nonEmptyString, slug } from './schema';

const postSchema = z.object({
  // Numeric IDs preserve URLs from posts previously published with numeric IDs.
  id: z.preprocess(
    (value) => (typeof value === 'number' ? String(value) : value),
    slug
  ),
  title: nonEmptyString,
  description: nonEmptyString.optional(),
  authors: z
    .array(nonEmptyString)
    .min(1, 'must list at least one author')
    .refine(
      (authors) => new Set(authors).size === authors.length,
      'must not list an author twice'
    ),
  publishDate: isoDate,
  status: z.enum(['draft', 'published']),
  tags: z.array(nonEmptyString).default([]),
  coverImage: localPublicPath.optional(),
});

// Published posts, newest first. Cached so a request reads the files once.
export const getPublishedPosts = cache(async (): Promise<BlogPost[]> => {
  const files = await readMarkdownFiles('posts');
  const posts = files.map((file) => ({
    ...parseFrontmatter(postSchema, file, 'post'),
    content: file.content,
  }));

  const ids = new Set<string>();
  for (const { id } of posts) {
    if (ids.has(id)) throw new Error(`Duplicate blog post id: ${id}`);
    ids.add(id);
  }

  return posts
    .filter((post) => post.status === 'published')
    .sort(
      (a, b) =>
        b.publishDate.localeCompare(a.publishDate) || a.id.localeCompare(b.id)
    )
    .map(({ status: _status, description, coverImage, ...post }) => ({
      ...post,
      description: description ?? null,
      coverImage: coverImage ?? null,
      ...analyzeMarkdown(post.content),
    }));
});

export async function getPost(id: string): Promise<BlogPost | null> {
  return (await getPublishedPosts()).find((post) => post.id === id) ?? null;
}

// Posts are sorted newest first, so the newer post precedes the current one.
export async function getAdjacentPosts(id: string) {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return { newer: null, older: null };
  return { newer: posts[index - 1] ?? null, older: posts[index + 1] ?? null };
}

export async function getPostsByAuthor(authorId: string): Promise<BlogPost[]> {
  return (await getPublishedPosts()).filter((post) =>
    post.authors.includes(authorId)
  );
}
