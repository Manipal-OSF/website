import { siteName, siteUrl } from './site';
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
export const feedPath = '/blog/feed.xml';
export interface PageMetadata {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  openGraph?: {
    type?: string;
    publishedTime?: string;
    authors?: string[];
    tags?: string[];
  };
}
export const pageMetadata = (metadata: PageMetadata): PageMetadata => metadata;
export const baseOpenGraph = { siteName, locale: 'en_IN', type: 'website' };
