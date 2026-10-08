import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Manipal OSF</title>
      </Head>
      <div className='grid m-auto gap-5 text-center place-self-center text-secondary dark:text-secondary-dark'>
        <h2 className='duration-300 text-left italic hover:-translate-y-1 text-accent dark:text-accent-dark'>Experience</h2>
        <h1 className='text-5xl sm:text-7xl'>Manipal OSF</h1>
      </div>
    </>
  );
};

export default Home;
