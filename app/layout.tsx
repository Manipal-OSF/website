import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Layout from '../components/Layout';
import { themeScript } from '../lib/theme-script';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Manipal OSF',
  icons: { icon: { url: '/logo.png', type: 'image/png' } },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Layout
          header={
            <header className='bg-background/50 sticky top-0 z-50 border-b backdrop-blur-sm'>
              <Header />
            </header>
          }
          footer={<Footer />}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
