import Head from 'next/head';

const UnderDev = () => {
  return (
    <>
      <Head>
        <title>Under development</title>
      </Head>
      <div className='m-auto grid gap-10 place-self-center text-center dark:text-white lg:w-[60rem]'>
        <h1 className='text-3xl font-bold md:text-5xl lg:text-7xl'>
          Hey there!
        </h1>
        <p className='text-2xl md:text-4xl lg:text-6xl'>
          This section is still under development. If you find any bugs in the
          site please notify us on the GitHub repo or Discord server linked
          below.
        </p>
      </div>
    </>
  );
};

export default UnderDev;
