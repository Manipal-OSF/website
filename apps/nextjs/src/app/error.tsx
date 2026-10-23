'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className='py-10'>
      <h1 className='mb-3 text-xl'>Something went wrong</h1>
      <p>Please try again in a moment.</p>
      <button
        type='button'
        onClick={reset}
        className='text-primary mt-4 underline'
      >
        Try again
      </button>
    </section>
  );
}
