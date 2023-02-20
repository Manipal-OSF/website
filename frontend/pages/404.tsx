import type { NextPage } from 'next';

const ClientErrorPage: NextPage = () => {
  return (
    <div className='grid self-center gap-5 m-auto text-center text-secondary dark:text-secondary-dark'>
      <h1 className='font-bold text-7xl'>404</h1>
      <h2 className='text-6xl'>Page not found</h2>
    </div>
  );
};

export default ClientErrorPage;
