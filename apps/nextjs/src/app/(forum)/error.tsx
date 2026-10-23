'use client';

export default function ForumError({ reset }: { reset: () => void }) {
  return (
    <div className='py-8 text-sm'>
      <p role='alert'>We could not load the forum. Please try again.</p>
      <button className='text-primary mt-3 underline' onClick={reset}>
        Try again
      </button>
    </div>
  );
}
