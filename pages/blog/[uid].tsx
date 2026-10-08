import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { ArrowLeft } from 'lucide-react';
import type { BlogPost } from '../../types/blog';
import { getPost, getPublishedPosts } from '../../lib/posts';
import CustomImage from '../../components/CustomImage';
import MarkdownRenderer from '../../components/MarkdownRenderer';

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: (await getPublishedPosts()).map((post) => ({
    params: { uid: post.id },
  })),
  // Allow new files to appear without restarting the dev server.
  fallback: process.env.NODE_ENV === 'development' ? 'blocking' : false,
});

export const getStaticProps: GetStaticProps<
  { data: BlogPost },
  { uid: string }
> = async ({ params }) => {
  const data = params ? await getPost(params.uid) : null;
  if (!data) return { notFound: true };
  return { props: { data } };
};

const IndividualBlogPage: NextPage<{ data: BlogPost }> = ({ data }) => (
  <>
    <Head>
      <title>{`${data.title} | Manipal OSF`}</title>
    </Head>
    <article className='flex w-full flex-grow-[1] flex-col gap-10 px-3 dark:text-white md:px-10'>
      <h1 className='text-5xl md:text-6xl'>{data.title}</h1>
      <CustomImage data={data.coverImage} alt={data.title} />
      <div className='flex justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-base font-bold md:text-lg'>WRITTEN BY</h2>
          <p className='text-lg md:text-xl'>{data.authors.join(', ')}</p>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <h2 className='text-base font-bold md:text-lg'>PUBLISHED ON</h2>
          <time dateTime={data.publishDate} className='text-lg md:text-xl'>
            {data.publishDate}
          </time>
        </div>
      </div>
      <hr className='border-gray-900 opacity-50 dark:border-gray-300' />
      <MarkdownRenderer content={data.content} />
      <Link
        href='/blog'
        className='flex w-fit items-center justify-center gap-5 rounded-lg bg-black p-2 text-2xl text-white dark:bg-white dark:text-black md:text-3xl'
      >
        <ArrowLeft className='size-4' />
        <span>Return to blog</span>
      </Link>
    </article>
  </>
);

export default IndividualBlogPage;
