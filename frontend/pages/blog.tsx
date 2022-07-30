import type { NextPage } from 'next';
import Head from 'next/head';
import { serverUrl } from '../constants';

interface Blog {
  id: number,
  title: string,
  uid: string,
  content: string,
  publishDate: string,
}

export async function getServerSideProps(context: any): Promise<{props: {data: Blog[]}}> {
  const res = await fetch(`${serverUrl}/api/blogs`);
  const json = await res.json();
  const data = json['data'];

  return {
    props: {data: data.map((e: any) => {
      const blog: Blog = {
        id: e['id'],
        title: e['title'],
        uid: e['uid'],
        content: e['content'],
        publishDate: e['publish_date']
      }
      return blog;
    })}
  };
}

const Blog: NextPage = (props) => {
  let dummy = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  console.log(props);

  return (
    <>
      <Head>
        <title>Manipal OSF | Blog</title>
      </Head>
      <div className='flex flex-col flex-grow-[1] gap-10 grid-cols-3 dark:text-white'>
        <h1 className='text-5xl text-center'>Featured</h1>
        <div className='grid grid-cols-3 gap-5'>
          {dummy.map((e) => (
            <div key={e} className='border-2 dark:border-gray-500 card min-h-[20rem]'></div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
