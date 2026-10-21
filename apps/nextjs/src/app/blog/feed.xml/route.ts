import { resolveAuthors } from '@/lib/content/authors';
import { getPublishedPosts } from '@/lib/content/posts';
import { absoluteUrl, feedPath } from '@/lib/seo';
import { siteDescription, siteName } from '@/lib/site';

export const dynamic = 'force-static';

const escapeXml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (char) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[
        char
      ]!)
  );

const toRfc822 = (date: string) => new Date(`${date}T00:00:00Z`).toUTCString();

export async function GET() {
  const posts = await getPublishedPosts();
  const items = await Promise.all(
    posts.map(async (post) => {
      const url = absoluteUrl(`/blog/${post.id}`);
      const authors = await resolveAuthors(post.authors);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(post.publishDate)}</pubDate>
      <dc:creator>${escapeXml(
        authors.map((a) => a.name).join(', ')
      )}</dc:creator>${
        post.description
          ? `\n      <description>${escapeXml(post.description)}</description>`
          : ''
      }${post.tags
        .map((tag) => `\n      <category>${escapeXml(tag)}</category>`)
        .join('')}
    </item>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${siteName} Blog`)}</title>
    <link>${absoluteUrl('/blog')}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <atom:link href="${absoluteUrl(
      feedPath
    )}" rel="self" type="application/rss+xml"/>${
    posts[0]
      ? `\n    <lastBuildDate>${toRfc822(posts[0].publishDate)}</lastBuildDate>`
      : ''
  }
${items.join('\n')}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
