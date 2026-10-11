import type { ReactNode } from 'react';

interface StatusMessageProps {
  code: string;
  message: string;
  children?: ReactNode;
}

// Full-page status screen for error routes such as 404 and 500.
const StatusMessage = ({ code, message, children }: StatusMessageProps) => (
  <div className='text-foreground m-auto grid gap-3 self-center text-center sm:gap-5'>
    <h1 className='text-5xl font-bold sm:text-7xl'>{code}</h1>
    <h2 className='text-3xl sm:text-6xl'>{message}</h2>
    {children}
  </div>
);

export default StatusMessage;
