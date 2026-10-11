import type { Metadata } from 'next';
import PostList from '@/components/blog/PostList';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Container from '@/components/common/Container';
import Link from '@/components/common/TransitionLink';
import { getPublishedPosts } from '@/lib/content/posts';

export const metadata: Metadata = { title: 'Blog' };

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  // Posts are sorted newest first, so years come out in descending order.
  const postsByYear = Map.groupBy(posts, (post) =>
    post.publishDate.slice(0, 4)
  );

  return (
    <Container className='flex flex-col gap-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <Breadcrumbs items={[{ label: 'Blog' }]} />
        <Link
          href='/authors'
          scroll={false}
          className='text-muted-foreground hover:text-foreground text-sm'
        >
          Authors
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No posts yet.</p>
      ) : (
        [...postsByYear].map(([year, yearPosts]) => (
          <section key={year} className='flex flex-col gap-4'>
            <h2 className='text-foreground font-medium'>{year}</h2>
            <PostList posts={yearPosts} />
          </section>
        ))
      )}
    </Container>
  );
}
