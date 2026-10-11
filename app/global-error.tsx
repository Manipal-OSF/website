'use client';

import ServerError from '@/components/common/ServerError';
import ThemeScript from '@/components/common/ThemeScript';
import '@/styles/globals.css';

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeScript />
        <main className='mx-auto flex min-h-screen max-w-5xl flex-col px-4 font-sans'>
          <ServerError retry={retry} />
        </main>
      </body>
    </html>
  );
}
