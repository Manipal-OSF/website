import type { APIRoute } from 'astro';
import { getPublishedPosts, getPost } from '@/lib/content/posts';
import { resolveAuthors } from '@/lib/content/authors';
import { formatDate } from '@/lib/format';
import { ogImage } from '@/lib/og';
export async function getStaticPaths() {
  return (await getPublishedPosts()).map((post) => ({
    params: { uid: post.id },
  }));
}
export const GET: APIRoute = async ({ params }) => {
  const post = await getPost(params.uid!);
  if (!post) return new Response(null, { status: 404 });
  const authors = await resolveAuthors(post.authors);
  return ogImage({
    eyebrow: 'Blog',
    title: post.title,
    subtitle: `${authors.map((author) => author.name).join(', ')} · ${formatDate(post.publishDate)} · ${post.readingTime}`,
  });
};
