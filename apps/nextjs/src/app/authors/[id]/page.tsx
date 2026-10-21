import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AuthorCard from '@/components/authors/AuthorCard';
import PostList from '@/components/blog/PostList';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Container from '@/components/common/Container';
import JsonLd from '@/components/common/JsonLd';
import { getAllAuthors, getAuthor } from '@/lib/content/authors';
import { getPostsByAuthor } from '@/lib/content/posts';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

// reference: https://pranavu.dev

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllAuthors()).map((author) => ({ id: author.id }));
}

type AuthorPageProps = { params: Promise<{ id: string }> };

async function loadAuthor(params: AuthorPageProps['params']) {
  const { id } = await params;
  const author = await getAuthor(id);
  if (!author) notFound();
  return author;
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const author = await loadAuthor(params);
  return pageMetadata({
    title: author.name,
    description: author.bio ?? `Posts by ${author.name}.`,
    path: `/authors/${author.id}`,
    openGraph: { type: 'profile' },
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const author = await loadAuthor(params);
  const posts = await getPostsByAuthor(author.id);

  return (
    <Container className='flex flex-col gap-6'>
      <JsonLd
        data={{
          '@type': 'ProfilePage',
          url: absoluteUrl(`/authors/${author.id}`),
          mainEntity: {
            '@type': 'Person',
            name: author.name,
            description: author.bio ?? undefined,
            image: author.avatar ? absoluteUrl(author.avatar) : undefined,
            sameAs: author.links
              .filter((link) => link.href.startsWith('https://'))
              .map((link) => link.href),
          },
        }}
      />
      <Breadcrumbs
        items={[
          { label: 'Blog', href: '/blog' },
          { label: 'Authors', href: '/authors' },
          { label: author.name },
        ]}
      />
      <AuthorCard author={author} linkToProfile={false} />
      <h2 className='text-foreground text-2xl font-medium'>
        Posts by {author.name}
      </h2>
      {posts.length === 0 ? (
        <p className='text-muted-foreground text-sm'>
          No posts available from this author.
        </p>
      ) : (
        <PostList posts={posts} />
      )}
    </Container>
  );
}
