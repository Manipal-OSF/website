import { ogImage } from '@/lib/og';
import { siteName, siteDescription } from '@/lib/site';
export function GET() {
  return ogImage({
    title: `Hello, we are ${siteName}`,
    subtitle: siteDescription,
  });
}
