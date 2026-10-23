import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getForumContext } from '@/lib/forum';

export const metadata: Metadata = {
  title: 'Forum',
  description:
    'Questions, projects, and open source discussions at Manipal OSF.',
  robots: { index: false, follow: true },
};

export default async function ForumLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { moderator } = await getForumContext();
  return (
    <section className='forum w-full' aria-label='Community forum'>
      <div className='forum-bar'>
        <Link href='/' className='font-bold'>
          OSF Forum
        </Link>
        <nav
          aria-label='Forum navigation'
          className='flex flex-wrap gap-x-3 gap-y-1'
        >
          <Link href='/'>top</Link>
          <Link href='/?view=new'>new</Link>
          <Link href='/?view=ask'>ask</Link>
          <Link href='/?view=show'>show</Link>
          <Link href='/comments'>comments</Link>
          <Link href='/submit'>submit</Link>
          {moderator && <Link href='/moderation'>moderation</Link>}
        </nav>
      </div>
      <div className='py-5'>{children}</div>
      <form
        action='/'
        className='forum-search mt-6 flex flex-wrap items-center gap-2 border-t pt-4'
      >
        <label htmlFor='forum-search' className='text-muted-foreground text-xs'>
          Search discussions:
        </label>
        <input
          id='forum-search'
          name='q'
          type='search'
          maxLength={200}
          className='bg-background rounded border px-2 py-1 text-sm'
        />
        <button type='submit' className='text-primary text-xs'>
          Search
        </button>
      </form>
    </section>
  );
}
