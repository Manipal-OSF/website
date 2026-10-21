import { getCollection } from 'astro:content';
import type { BlogPost } from '@/types/blog';
import { analyzeMarkdown } from './markdown';
import { assertUniquePostIds } from './frontmatter';

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const entries = await getCollection('posts');
  const posts = entries.map((entry) => ({
    ...entry.data,
    content: entry.body ?? '',
  }));
  assertUniquePostIds(posts);

  return posts
    .filter((post) => post.status === 'published')
    .sort(
      (a, b) =>
        b.publishDate.localeCompare(a.publishDate) || a.id.localeCompare(b.id),
    )
    .map(({ status: _status, description, coverImage, ...post }) => ({
      ...post,
      description: description ?? null,
      coverImage: coverImage ?? null,
      ...analyzeMarkdown(post.content),
    }));
}
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
    post.authors.includes(authorId),
  );
}
