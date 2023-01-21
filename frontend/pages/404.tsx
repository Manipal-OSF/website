import type { NextPage } from 'next';

const ClientErrorPage: NextPage = () => {
  return (
    <div className='m-auto grid gap-5 self-center text-center dark:text-white'>
      <h1 className='text-7xl font-bold'>404</h1>
      <h2 className='text-6xl'>Page not found</h2>
    </div>
  );
};

export default ClientErrorPage;
