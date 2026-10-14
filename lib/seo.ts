import type { Metadata } from 'next';
import { siteName, siteUrl } from './site';

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

export const feedPath = '/blog/feed.xml';

export const baseOpenGraph = {
  siteName,
  locale: 'en_IN',
  type: 'website',
} satisfies Metadata['openGraph'];

interface PageMetadata {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  openGraph?: Metadata['openGraph'];
}

export function pageMetadata({
  title,
  description,
  path,
  image = '/opengraph-image',
  openGraph,
}: PageMetadata): Metadata {
  return {
    // An explicit undefined title would replace the root layout's default.
    ...(title && { title }),
    description,
    alternates: {
      canonical: path,
      types: { 'application/rss+xml': feedPath },
    },
    openGraph: {
      ...baseOpenGraph,
      title: title ?? siteName,
      description,
      url: path,
      // A child openGraph drops inherited images
      images: { url: image, width: 1200, height: 630, alt: title ?? siteName },
      ...openGraph,
    },
  };
}
