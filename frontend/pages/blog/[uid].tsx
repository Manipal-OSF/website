import type { NextPage } from 'next';
import { BlogPost, fetchOne, getUidList } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Head from 'next/head';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GetStaticProps, GetStaticPaths } from 'next';
import CustomImage from '../../components/CustomImage';
import RichTextRenderer from '../../components/RichTextRenderer';

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
      <div className='flex w-full flex-grow-[1] flex-col gap-10 px-3 dark:text-white md:px-10 lg:w-[60rem]'>
        <h1 className='text-5xl md:text-6xl'>{props.data.title}</h1>
        <CustomImage data={props.data.coverImage} />
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
          {/* For future markdown use */}
          {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {JSON.parse(JSON.stringify(props.data.content))
              .map((e: { children: { text: string }[] }) => e.children[0].text)
              .join('\n')}
          </ReactMarkdown> */}
          <RichTextRenderer md={props.data.content}></RichTextRenderer>
        </div>
        <Link href='/blog'>
          <button className='max-w- flex items-center justify-center gap-5 rounded-lg bg-black p-2 text-2xl text-white dark:bg-white dark:text-black md:text-3xl'>
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
      <div className='flex w-full flex-grow-[1] flex-col items-center gap-5 dark:text-white'>
        {content()}
      </div>
    </>
  );
};

export default IndividualBlogPage;
