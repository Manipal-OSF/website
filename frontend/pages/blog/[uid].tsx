import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { serverUrl } from '../../constants';
import { BlogPost, fetchData } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Head from 'next/head';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Response {
  blog?: BlogPost;
  error: boolean;
}

const IndividualBlogPage: NextPage = () => {
  const [data, setData] = useState<Response>({
    blog: undefined,
    error: false,
  });

  const {
    query: { uid },
  } = useRouter();

  useEffect(() => {
    const future = async () => {
      let blog = (await fetchData()).filter((item) => item.uid === uid)[0];
      setData({
        blog: blog,
        error: blog === undefined ? true : false,
      });
    };
    future();
  }, [uid]);

  const content = () => {
    if (data.error) {
      return (
        <div className='grid self-center gap-5 m-auto text-center dark:text-white'>
          <h1 className='font-bold text-7xl'>404</h1>
          <h2 className='text-6xl'>Page not found</h2>
        </div>
      );
    } else {
      if (data.blog === undefined) {
        //! Add loader
        return <div>hiiiii</div>;
      } else {
        return (
          <div className='dark:text-white flex flex-col w-full flex-grow-[1] px-16 gap-10'>
            <h1 className='text-6xl'>{data.blog.title}</h1>
            <Image
              src={`${serverUrl}${data.blog.coverImage.url}`}
              alt={data.blog.coverImage.alt}
              layout='responsive'
              height={data.blog.coverImage.height}
              width={data.blog.coverImage.width}
              className='duration-300 hover:scale-110 max-h-[5rem] rounded-2xl'
            ></Image>
            <div className='flex justify-between'>
              <div className='flex flex-col gap-1'>
                <h2 className='text-lg font-bold'>WRITTEN BY</h2>
                <h2 className='text-xl'>{data.blog.authors}</h2>
              </div>
              <div className='flex flex-col items-end gap-1'>
                <h2 className='text-lg font-bold'>PUBLISHED ON</h2>
                <h2 className='text-xl'>{data.blog.publishDate}</h2>
              </div>
            </div>
            <hr />
            <div className='flex flex-col gap-5'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.blog.content}
              </ReactMarkdown>
            </div>
            <Link href='/blog'>
              <button className='flex items-center justify-center gap-5 p-2 text-3xl text-white bg-black rounded-lg dark:text-black dark:bg-white max-w-'>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  size='lg'
                  className='max-w-[1.4rem]'
                />
                <span>Return to blog</span>
              </button>
            </Link>
          </div>
        );
      }
    }
  };

  return (
    <>
      <Head>
        <title>{`Manipal OSF | ${data.blog?.uid}`}</title>
      </Head>
      <div className='dark:text-white flex flex-col w-full flex-grow-[1] items-center gap-5'>
        {content()}
      </div>
    </>
  );
};

export default IndividualBlogPage;
