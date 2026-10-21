import { siteUrl } from '@/lib/site';
export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\nHost: ${siteUrl}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
