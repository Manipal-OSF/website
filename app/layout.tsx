import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import ThemeScript from '@/components/common/ThemeScript';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import { baseOpenGraph, feedPath } from '@/lib/seo';
import { siteDescription, siteName, siteUrl } from '@/lib/site';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { template: `%s | ${siteName}`, default: siteName },
  description: siteDescription,
  applicationName: siteName,
  icons: {
    icon: { url: '/logo.png', type: 'image/png' },
    apple: { url: '/logo.png', type: 'image/png' },
  },
  alternates: { types: { 'application/rss+xml': feedPath } },
  openGraph: {
    ...baseOpenGraph,
    title: siteName,
    description: siteDescription,
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

// Matches the light (Nord) and dark (Catppuccin) backgrounds in globals.css.
export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eceff4' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1e2e' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeScript />
        <Layout header={<Header />} footer={<Footer />}>
          {children}
        </Layout>
        <SpeedInsights />
      </body>
    </html>
  );
}
