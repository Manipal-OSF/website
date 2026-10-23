import ForumTopics from '@/components/forum/ForumTopics';
import {
  ForumPagination,
  ForumUnavailable,
} from '@/components/forum/ForumDisplay';
import { getForumContext } from '@/lib/forum';
import { forumPage } from '@/lib/forum-store';
import type { ForumView } from '@/types/forum';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forum',
  description: 'Community discussions at Manipal OSF.',
  robots: { index: false, follow: true },
};

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view: ForumView = ['new', 'ask', 'show'].includes(String(params.view))
    ? (params.view as ForumView)
    : 'top';
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 200) : '';
  const { store, viewer } = await getForumContext();
  if (!store) return <ForumUnavailable />;
  const result = await store.feed({
    viewer,
    view,
    q,
    page: forumPage(params.page),
  });
  const path = `/?${new URLSearchParams({ view, ...(q ? { q } : {}) })}`;
  return (
    <>
      <h1 className='mb-5 text-sm font-semibold'>
        {q
          ? `Search: ${q}`
          : {
              top: 'Top discussions',
              new: 'New discussions',
              ask: 'Ask OSF',
              show: 'Show OSF',
            }[view]}
      </h1>
      <ForumTopics
        posts={result.posts}
        page={result.page}
        viewer={!!viewer}
        searching={!!q}
      />
      <ForumPagination {...result} path={path} />
    </>
  );
}
