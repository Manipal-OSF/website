import type { NextPage } from 'next';
import Head from 'next/head';
import BlogCard from '../../components/BlogCard';
import { BlogPost, fetchData } from '../../services/api';

export async function getStaticProps(): Promise<{
  props: { data: BlogPost[] };
}> {
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
        <title>Blog | Manipal OSF</title>
      </Head>
      <div className='flex flex-col gap-10 dark:text-white lg:w-[60rem]'>
        <h1 className='text-center text-5xl'>Featured</h1>
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 '>
          {posts.map((item: BlogPost, index) => (
            <BlogCard data={item} index={index} key={index} />
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
