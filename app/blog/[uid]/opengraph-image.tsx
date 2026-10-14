import { notFound } from 'next/navigation';
import { resolveAuthors } from '@/lib/content/authors';
import { getPost, getPublishedPosts } from '@/lib/content/posts';
import { formatDate } from '@/lib/format';
import { ogContentType, ogImage, ogSize } from '@/lib/og';

export const alt = 'Blog post preview';
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ uid: post.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const post = await getPost((await params).uid);
  if (!post) notFound();
  const authors = await resolveAuthors(post.authors);
  return ogImage({
    eyebrow: 'Blog',
    title: post.title,
    subtitle: `${authors
      .map((author) => author.name)
      .join(', ')} · ${formatDate(post.publishDate)} · ${post.readingTime}`,
  });
}
