import type { NextPage } from 'next';
import Head from 'next/head';
import BoardCarousel from '../components/BoardCarousel';

const Team: NextPage = () => {
  return (
    <>
      <Head>
        <title>Team | Manipal OSF</title>
      </Head>
      <div className='flex flex-col gap-10 m-auto text-center place-self-center dark:text-white '>
        <h1 className='text-3xl font-bold md:text-5xl lg:text-7xl'>Team</h1>
        <BoardCarousel />
      </div>
    </>
  );
};

export default Team;
