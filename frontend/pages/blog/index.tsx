import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import BlogCard from '../../components/BlogCard';
import { BlogPost, fetchData } from '../../services/api';

export const getStaticProps: GetStaticProps<{ data: BlogPost[] }> = async () => {
  return {
    props: { data: await fetchData() },
    revalidate: 10,
  };
};

const BlogPage: NextPage<{ data: BlogPost[] }> = ({ data: posts }) => {
  return (
    <>
      <Head>
        <title>Blog | Manipal OSF</title>
      </Head>
      <section className='flex flex-col gap-6'>
        <h1 className='text-foreground text-2xl font-medium'>Featured</h1>
        {posts.length === 0 ? (
          <p className='text-muted-foreground text-sm'>No posts yet.</p>
        ) : (
          <div className='flex flex-col gap-4'>
            {posts.map((item, index) => (
              <BlogCard data={item} index={index} key={item.id} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default BlogPage;