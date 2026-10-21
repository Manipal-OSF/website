import { ogContentType, ogImage, ogSize } from '@/lib/og';
import { siteDescription, siteName } from '@/lib/site';

export const alt = siteName;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    title: `Hello, we are ${siteName}`,
    subtitle: siteDescription,
  });
}
