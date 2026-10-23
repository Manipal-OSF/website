import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getForumContext } from '@/lib/forum';
import { forumPage } from '@/lib/forum-store';
import { ModerationForm } from '@/components/forum/ForumControls';
import {
  ForumPagination,
  ForumUnavailable,
  MemberLink,
  SafeText,
} from '@/components/forum/ForumDisplay';

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { store, viewer, moderator } = await getForumContext();
  if (!store) return <ForumUnavailable />;
  if (!viewer || !moderator) notFound();
  const page = forumPage((await searchParams).page);
  const { reports, more } = await store.reports(viewer, page);
  return (
    <>
      <h1 className='mb-5 text-base font-semibold'>Open reports</h1>
      {!reports.length && (
        <p className='text-muted-foreground text-sm'>No open reports.</p>
      )}
      <div className='space-y-8'>
        {reports.map((report) => (
          <article key={report.id} className='border-b pb-6'>
            <Link
              className='text-sm font-semibold underline'
              href={`/item/${report.postId}${
                report.target === 'comment' ? `#comment-${report.targetId}` : ''
              }`}
            >
              {report.title}
            </Link>
            {report.body && (
              <div className='mt-3'>
                <SafeText text={report.body} />
              </div>
            )}
            <p className='forum-meta my-3'>
              Reported by <MemberLink username={report.username} /> ·{' '}
              {new Date(report.createdAt).toUTCString()}
            </p>
            <SafeText text={report.reason} />
            <div className='mt-4 max-w-lg'>
              <ModerationForm
                id={report.targetId}
                target={report.target}
                reportId={report.id}
              />
            </div>
          </article>
        ))}
      </div>
      <ForumPagination more={more} page={page} path='/moderation' />
    </>
  );
}
