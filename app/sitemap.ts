import type { MetadataRoute } from 'next';
import { getAllAuthors } from '@/lib/content/authors';
import { getPostsByAuthor, getPublishedPosts } from '@/lib/content/posts';
import { absoluteUrl } from '@/lib/seo';

// /team is left out for the time being
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, authors] = await Promise.all([
    getPublishedPosts(),
    getAllAuthors(),
  ]);
  const latest = posts[0]?.publishDate;

  const authorEntries = await Promise.all(
    authors.map(async (author) => ({
      url: absoluteUrl(`/authors/${author.id}`),
      lastModified: (await getPostsByAuthor(author.id))[0]?.publishDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }))
  );

  return [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    {
      url: absoluteUrl('/blog'),
      lastModified: latest,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.id}`),
      lastModified: post.publishDate,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    {
      url: absoluteUrl('/authors'),
      lastModified: latest,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...authorEntries,
  ];
}
