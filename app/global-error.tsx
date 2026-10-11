'use client';

import ServerError from '../components/ServerError';
import { themeScript } from '../lib/theme-script';
import '../styles/globals.css';

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <main className='mx-auto flex min-h-screen max-w-5xl flex-col px-4 font-sans'>
          <ServerError retry={retry} />
        </main>
      </body>
    </html>
  );
}
