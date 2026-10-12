import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AuthorProfiles from '@/components/authors/AuthorProfiles';
import CoverImage from '@/components/blog/CoverImage';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';
import PostHeader from '@/components/blog/PostHeader';
import PostNavigation from '@/components/blog/PostNavigation';
import MobileTableOfContents from '@/components/blog/MobileTableOfContents';
import { TableOfContentsSidebar } from '@/components/blog/TableOfContents';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Container from '@/components/common/Container';
import { resolveAuthors } from '@/lib/content/authors';
import {
  getAdjacentPosts,
  getPost,
  getPublishedPosts,
} from '@/lib/content/posts';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ uid: post.id }));
}

type PostPageProps = { params: Promise<{ uid: string }> };

async function loadPost(params: PostPageProps['params']) {
  const { uid } = await params;
  const post = await getPost(uid);
  if (!post) notFound();
  return post;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await loadPost(params);
  const authors = await resolveAuthors(post.authors);
  const description = post.description ?? undefined;
  return {
    title: post.title,
    description,
    authors: authors.map((author) => ({
      name: author.name,
      url: author.isRegistered ? `/authors/${author.id}` : undefined,
    })),
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: post.publishDate,
      authors: authors.map((author) => author.name),
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await loadPost(params);
  const [authors, { newer, older }] = await Promise.all([
    resolveAuthors(post.authors),
    getAdjacentPosts(post.id),
  ]);

  return (
    // data-wide widens the site's main column so the sidebar fits beside the text.
    <article data-wide className='flex w-full flex-col gap-6'>
      <Container>
        <Breadcrumbs
          items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]}
        />
      </Container>
      <CoverImage
        src={post.coverImage}
        alt={post.title}
        sizes='(min-width: 64rem) 64rem, 100vw'
        preload
        className='mx-auto aspect-[1200/630] w-full max-w-5xl rounded-xl'
      />
      <Container className='flex flex-col gap-6'>
        <PostHeader post={post} authors={authors} />
        <PostNavigation newer={newer} older={older} />
      </Container>
      <div className='grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_48rem_minmax(0,1fr)]'>
        <aside className='hidden xl:block'>
          <TableOfContentsSidebar headings={post.headings} className='pr-8' />
        </aside>
        <Container className='flex flex-col gap-6'>
          <MobileTableOfContents
            headings={post.headings}
            className='xl:hidden'
          />
          <MarkdownRenderer content={post.content} />
          <AuthorProfiles authors={authors} />
          <PostNavigation newer={newer} older={older} />
        </Container>
      </div>
    </article>
  );
}
