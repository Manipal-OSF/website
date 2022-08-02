import type { NextPage } from 'next';
import Head from 'next/head';
import BlogCard from '../../components/BlogCard';
import { BlogPost, fetchData } from '../../services/api';

export async function getServerSideProps(
  context: any
): Promise<{ props: { data: BlogPost[] } }> {
  return {
    props: {
      data: await fetchData(),
    },
  };
}

const BlogPage: NextPage<{ data: BlogPost[] }> = (props) => {
  const posts = props.data;
  return (
    <>
      <Head>
        <title>Manipal OSF | Blog</title>
      </Head>
      <div className='flex flex-col flex-grow-[1] gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 dark:text-white'>
        <h1 className='text-5xl text-center'>Featured</h1>
        <div className='grid grid-cols-3 gap-5'>
          {posts.map((item: BlogPost, index) => (
            <BlogCard data={item} index={index} key={index} />
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
