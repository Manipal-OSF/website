import type { MetadataRoute } from 'next';
import { siteDescription, siteName } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'OSF',
    description: siteDescription,
    start_url: '/',
    display: 'browser',
    background_color: '#1e1e2e',
    theme_color: '#1e1e2e',
    icons: [{ src: '/logo.png', sizes: '576x512', type: 'image/png' }],
  };
}
