import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Services | Manipal OSF' };

const Services = () => {
  return (
    <>
      <div className='grid gap-10 m-auto text-center place-self-center text-accent dark:text-accent-dark'>
        <h1 className='text-3xl font-bold md:text-5xl lg:text-7xl'>
          Our vision
        </h1>
        <p className='text-2xl md:text-4xl lg:text-6xl text-secondary dark:text-secondary-dark'>
          To reshape MIT Manipal&apos;s brand image in academics and to develop
          a holistic learning community within MIT Manipal
        </p>
      </div>
    </>
  );
};

export default Services;
