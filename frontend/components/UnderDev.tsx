import Head from 'next/head';

const UnderDev = () => {
  return (
    <>
      <Head>
        <title>Under development</title>
      </Head>
      <div className='m-auto grid max-w-2xl gap-4 py-16 text-center'>
        <h1 className='text-foreground text-3xl font-medium md:text-4xl'>
          Hey there!
        </h1>
        <p className='text-muted-foreground text-base md:text-lg'>
          This section is still under development. If you find any bugs in the
          site, please let us know on the GitHub repo or Discord server linked
          below.
        </p>
      </div>
    </>
  );
};

export default UnderDev;