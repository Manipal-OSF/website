'use client';

import StatusMessage from './StatusMessage';

const ServerError = ({ retry }: { retry: () => void }) => (
  <StatusMessage code='500' message='Server error'>
    <button
      type='button'
      onClick={() => retry()}
      className='text-foreground hover:bg-muted mx-auto rounded-md border px-4 py-2'
    >
      Try again
    </button>
  </StatusMessage>
);

export default ServerError;
