import type { Metadata } from 'next';
import BlogCard from '../../components/BlogCard';
import { getPublishedPosts } from '../../lib/posts';

export const metadata: Metadata = { title: 'Blog | Manipal OSF' };

const BlogPage = async () => {
  const posts = await getPublishedPosts();
  return (
    <>
      <section className='flex flex-col gap-6'>
        <h1 className='text-foreground text-2xl font-medium'>Featured</h1>
        {posts.length === 0 ? (
          <p className='text-muted-foreground text-sm'>No posts yet.</p>
        ) : (
          <div className='flex flex-col gap-4'>
            {posts.map((item) => (
              <BlogCard data={item} key={item.id} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default BlogPage;
