import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { serverUrl } from '../../constants';
import { BlogPost, fetchData } from '../../services/api';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';

const IndividualBlogPage: NextPage = () => {
  const [data, setData] = useState<BlogPost>();

  const {
    query: { uid },
  } = useRouter();

  useEffect(() => {
    const future = async () => {
      let res = await fetchData();
      console.log(res[1].coverImage.url);
      setData(res.filter((item) => item.uid === uid)[0]);
    };
    future();
  }, [uid]);

  return (
    <div className='dark:text-white flex flex-col w-full flex-grow-[1] items-center gap-5'>
      <h1 className='text-7xl text-center'>{data?.title}</h1>
      <img
        src={`${serverUrl}${data?.coverImage.url}`}
        alt={data?.coverImage.alt}
        height={data?.coverImage.height}
        width={data?.coverImage.width}
        className='hover:scale-110 duration-300'
      ></img>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data!.content}</ReactMarkdown>
    </div>
  );
};

export default IndividualBlogPage;
