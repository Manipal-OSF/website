import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';

const About: NextPage = () => {
  return (
    <div className='grid m-auto text-center place-self-center dark:text-white'>
      <p className='text-3xl md:text-5xl lg:text-7xl'>
        Our vision: To reshape MIT Manipal&apos;s brand image in academics and to
        develop a holistic learning community within MIT Manipal
      </p>
    </div>
  );
};

export default About;
