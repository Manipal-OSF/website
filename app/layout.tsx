import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ThemeScript from '@/components/common/ThemeScript';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import { siteName } from '@/lib/site';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { template: `%s | ${siteName}`, default: siteName },
  icons: { icon: { url: '/logo.png', type: 'image/png' } },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeScript />
        <Layout header={<Header />} footer={<Footer />}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
