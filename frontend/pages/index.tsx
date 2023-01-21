import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Manipal OSF</title>
      </Head>
      <div className='m-auto grid place-self-center text-center dark:text-white'>
        <h1 className='text-7xl'>Manipal OSF</h1>
      </div>
    </>
  );
};

export default Home;
