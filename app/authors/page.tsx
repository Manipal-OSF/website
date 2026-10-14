import type { Metadata } from 'next';
import AuthorCard from '@/components/authors/AuthorCard';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Container from '@/components/common/Container';
import { getAllAuthors } from '@/lib/content/authors';
import { pageMetadata } from '@/lib/seo';
import { siteName } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Authors',
  description: `The people who write for the ${siteName} blog.`,
  path: '/authors',
});

export default async function AuthorsPage() {
  const authors = await getAllAuthors();
  return (
    <Container className='flex flex-col gap-6'>
      <Breadcrumbs
        items={[{ label: 'Blog', href: '/blog' }, { label: 'Authors' }]}
      />
      {authors.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No authors yet.</p>
      ) : (
        <ul className='flex flex-col gap-4'>
          {authors.map((author) => (
            <li key={author.id}>
              <AuthorCard author={author} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
