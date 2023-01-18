import type { NextPage } from 'next';
import Image from 'next/image';
import { BlogPost, fetchOne, getUidList } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Head from 'next/head';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GetStaticProps, GetStaticPaths } from 'next';

interface Response {
  blog?: BlogPost;
  error: boolean;
}

// * Incremental Static Regeneration enabled (ISR)
// * https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getUidList();
  return { paths: paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }: any) => {
  const data = await fetchOne(params.uid);
  return {
    props: {
      data,
    },
    revalidate: 10,
  };
};

const IndividualBlogPage: NextPage<{ data: BlogPost }> = (props: {
  data: BlogPost;
}) => {
  const content = () => {
    return (
      <div className='dark:text-white flex flex-col w-full flex-grow-[1] px-3 md:px-16 gap-10'>
        <h1 className='text-5xl md:text-6xl'>{props.data.title}</h1>
        <Image
          src={props.data.coverImage.url}
          alt={props.data.coverImage.alt}
          layout='responsive'
          height={props.data.coverImage.height}
          width={props.data.coverImage.width}
          className='duration-300 hover:scale-110 max-h-[5rem] rounded-2xl'
          priority={true}
          blurDataURL='../public/logo.jpg'
          placeholder='blur'
        ></Image>
        <div className='flex justify-between'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-base font-bold md:text-lg'>WRITTEN BY</h2>
            <h2 className='text-lg md:text-xl'>{props.data.authors}</h2>
          </div>
          <div className='flex flex-col items-end gap-1'>
            <h2 className='text-base font-bold md:text-lg'>PUBLISHED ON</h2>
            <h2 className='text-lg md:text-xl'>
              {props.data.publishDate.substring(0, 10)}
            </h2>
          </div>
        </div>
        <hr />
        <div className='flex flex-col gap-5'>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {props.data.content}
          </ReactMarkdown>
        </div>
        <Link href='/blog'>
          <button className='flex items-center justify-center gap-5 p-2 text-2xl text-white bg-black rounded-lg md:text-3xl dark:text-black dark:bg-white max-w-'>
            <FontAwesomeIcon icon={faArrowLeft} className='max-w-[1.4rem]' />
            <span>Return to blog</span>
          </button>
        </Link>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{`${props.data?.id} | Manipal OSF`}</title>
      </Head>
      <div className='dark:text-white flex flex-col w-full flex-grow-[1] items-center gap-5'>
        {content()}
      </div>
    </>
  );
};

export default IndividualBlogPage;
