'use client';

const ServerErrorPage = ({ retry }: { retry: () => void }) => {
  return (
    <div className='grid self-center gap-5 m-auto text-center text-secondary dark:text-secondary-dark'>
      <h1 className='font-bold text-7xl'>500</h1>
      <h2 className='text-6xl'>Server error</h2>
      <button
        type='button'
        onClick={retry}
        className='text-foreground hover:bg-muted mx-auto rounded-md border px-4 py-2'
      >
        Try again
      </button>
    </div>
  );
};

export default ServerErrorPage;
