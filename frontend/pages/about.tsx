import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>About | Manipal OSF</title>
      </Head>
      <div className='grid gap-10 m-auto text-center place-self-center dark:text-white'>
        <h1 className='text-3xl font-bold md:text-5xl lg:text-7xl'>
          Our vision
        </h1>
        <p className='text-2xl md:text-4xl lg:text-6xl'>
          To reshape MIT Manipal&apos;s brand image in academics and to develop
          a holistic learning community within MIT Manipal
        </p>
      </div>
    </>
  );
};

export default About;
