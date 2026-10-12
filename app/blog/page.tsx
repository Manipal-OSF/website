import type { Metadata } from 'next';
import PostList from '@/components/blog/PostList';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Container from '@/components/common/Container';
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
      <Breadcrumbs items={[{ label: 'Blog' }]} />
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
