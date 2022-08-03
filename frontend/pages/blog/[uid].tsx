import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { serverUrl } from '../../constants';
import { BlogPost, fetchData } from '../../services/api';

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
    <div className='dark:text-white flex flex-col w-full flex-grow-[1]'>
          <h1 className='text-7xl text-center'>{data?.title}</h1>
          <Image
            src={`${serverUrl}${data?.coverImage.url}`}
            alt={data?.coverImage.alt}
            height={data?.coverImage.height}
            width={data?.coverImage.width}
            className='hover:scale-110 duration-300'
          ></Image>
    </div>
  );
};

export default IndividualBlogPage;
