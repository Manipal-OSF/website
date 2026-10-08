// Import only from getStaticProps, getStaticPaths, or API routes.
// Next.js removes those server functions and imports from browser bundles.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { BlogPost } from '../types/blog';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');
type Post = BlogPost & { status: 'draft' | 'published' };

function parsePost(source: string, filename: string): Post {
  const { data, content } = matter(source);
  const invalid = (message: string): never => {
    throw new Error(`Invalid post ${filename}: ${message}`);
  };
  // Numeric IDs preserve URLs from posts previously published with numeric IDs.
  const id = typeof data.id === 'number' ? String(data.id) : data.id;
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    invalid('id must contain only letters, numbers, underscores, or hyphens');
  }
  if (typeof data.title !== 'string' || !data.title.trim()) {
    invalid('title must be a non-empty string');
  }
  if (
    !Array.isArray(data.authors) ||
    data.authors.length === 0 ||
    data.authors.some(
      (author: unknown) => typeof author !== 'string' || !author.trim()
    )
  ) {
    invalid('authors must be a non-empty array of names');
  }
  if (
    typeof data.publishDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.publishDate)
  ) {
    invalid('publishDate must be a quoted YYYY-MM-DD string');
  }
  const timestamp = Date.parse(`${data.publishDate}T00:00:00Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== data.publishDate
  ) {
    invalid('publishDate must be a valid calendar date');
  }
  if (data.status !== 'draft' && data.status !== 'published') {
    invalid('status must be draft or published');
  }
  if (
    data.coverImage !== undefined &&
    (typeof data.coverImage !== 'string' || !/^\/(?!\/)/.test(data.coverImage))
  ) {
    invalid('coverImage must be a local public path such as /images/post.jpg');
  }
  return {
    id,
    title: data.title.trim(),
    authors: data.authors.map((author: string) => author.trim()),
    publishDate: data.publishDate,
    coverImage: data.coverImage ?? null,
    status: data.status,
    content,
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const filenames = (await readdir(postsDirectory))
    .filter((name) => name.endsWith('.md'))
    .sort();
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const source = await readFile(
        path.join(postsDirectory, filename),
        'utf8'
      );
      try {
        return parsePost(source, filename);
      } catch (error) {
        throw new Error(
          `Could not load ${filename}: ${
            error instanceof Error ? error.message : String(error)
          }`,
          { cause: error }
        );
      }
    })
  );
  const ids = new Set<string>();
  for (const post of posts) {
    if (ids.has(post.id)) throw new Error(`Duplicate blog post id: ${post.id}`);
    ids.add(post.id);
  }
  return posts
    .filter((post) => post.status === 'published')
    .sort(
      (a, b) =>
        b.publishDate.localeCompare(a.publishDate) || a.id.localeCompare(b.id)
    )
    .map((post) => ({
      id: post.id,
      title: post.title,
      authors: post.authors,
      publishDate: post.publishDate,
      coverImage: post.coverImage,
      content: post.content,
    }));
}

export async function getPost(id: string): Promise<BlogPost | null> {
  return (await getPublishedPosts()).find((post) => post.id === id) ?? null;
}
