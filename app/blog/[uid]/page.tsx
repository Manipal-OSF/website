import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from '../../../components/TransitionLink';
import { ArrowLeft } from 'lucide-react';
import { getPost, getPublishedPosts } from '../../../lib/posts';
import CustomImage from '../../../components/CustomImage';
import MarkdownRenderer from '../../../components/MarkdownRenderer';

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
  return { title: `${post.title} | Manipal OSF` };
}

const IndividualBlogPage = async ({ params }: PostPageProps) => {
  const data = await loadPost(params);
  return (
    <>
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
          scroll={false}
          className='flex w-fit items-center justify-center gap-5 rounded-lg bg-black p-2 text-2xl text-white dark:bg-white dark:text-black md:text-3xl'
        >
          <ArrowLeft className='size-4' />
          <span>Return to blog</span>
        </Link>
      </article>
    </>
  );
};

export default IndividualBlogPage;
