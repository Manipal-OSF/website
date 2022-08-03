import type { NextPage } from 'next';

const ServerErrorPage: NextPage = () => {
  return (
    <div className='grid self-center gap-5 m-auto text-center dark:text-white'>
      <h1 className='font-bold text-7xl'>500</h1>
      <h2 className='text-6xl'>Server error</h2>
    </div>
  );
};

export default ServerErrorPage;
