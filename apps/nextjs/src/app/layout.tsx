import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { env } from '@packages/env';
import AuthNav from '@/components/auth/AuthNav';
import ThemeToggle from '@/components/layout/ThemeToggle';
import ThemeScript from '@/components/common/ThemeScript';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'OSF Forum', template: '%s | OSF Forum' },
  description:
    'Questions, projects, and open source discussions at Manipal OSF.',
  robots: { index: false, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const siteUrl =
    env.PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:4321'
      : 'https://manipalosf.org');
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className='bg-background text-foreground min-h-screen font-sans antialiased'>
        <a
          href='#main'
          className='bg-background sr-only focus:not-sr-only focus:absolute focus:p-3'
        >
          Skip to content
        </a>
        <div className='mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-8'>
          <header className='flex flex-wrap items-center justify-between gap-4 border-b py-5'>
            <nav
              aria-label='Main navigation'
              className='flex items-center gap-5 text-sm'
            >
              <a href={siteUrl} className='font-semibold'>
                Manipal OSF
              </a>
              <Link href='/forum' className='text-primary'>
                Forum
              </Link>
            </nav>
            <div className='flex items-center gap-3'>
              <AuthNav />
              <ThemeToggle />
            </div>
          </header>
          <main id='main' className='min-w-0 flex-1 py-7'>
            {children}
          </main>
          <footer className='text-muted-foreground border-t py-5 text-xs'>
            <a href={siteUrl}>Manipal OSF</a> · Built by the community.
          </footer>
        </div>
      </body>
    </html>
  );
}
