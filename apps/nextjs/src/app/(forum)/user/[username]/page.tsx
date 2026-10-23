import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getForumContext } from '@/lib/forum';
import { forumPage } from '@/lib/forum-store';
import ForumTopics from '@/components/forum/ForumTopics';
import ForumComments from '@/components/forum/ForumComments';
import {
  ForumPagination,
  ForumUnavailable,
} from '@/components/forum/ForumDisplay';

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { username } = await params;
  const { tab, page: value } = await searchParams;
  const page = forumPage(value);
  const { store, viewer, moderator } = await getForumContext();
  if (!store) return <ForumUnavailable />;
  const member = await store.member(username);
  if (!member) notFound();
  const path = `/user/${encodeURIComponent(username)}`;
  const submissions = tab !== 'comments';
  const posts = submissions
    ? await store.feed({ username, viewer, page, view: 'new' })
    : null;
  const comments = !submissions
    ? await store.comments({ username, viewer, page })
    : null;
  return (
    <>
      <h1 className='text-base font-semibold'>{member.username}</h1>
      <p className='forum-meta mt-2'>
        Joined{' '}
        {new Date(member.createdAt).toLocaleDateString('en-GB', {
          timeZone: 'UTC',
        })}{' '}
        · {member.karma} karma
      </p>
      <nav aria-label='Member activity' className='forum-meta my-6 flex gap-4'>
        <Link href={path} aria-current={submissions ? 'page' : undefined}>
          submissions
        </Link>
        <Link
          href={`${path}?tab=comments`}
          aria-current={!submissions ? 'page' : undefined}
        >
          comments
        </Link>
      </nav>
      {posts && (
        <ForumTopics posts={posts.posts} viewer={!!viewer} page={page} />
      )}
      {comments && (
        <ForumComments
          comments={comments.comments}
          viewer={!!viewer}
          moderator={moderator}
          threaded={false}
        />
      )}
      <ForumPagination
        more={posts?.more ?? comments?.more ?? false}
        page={page}
        path={`${path}?tab=${submissions ? 'submissions' : 'comments'}`}
      />
    </>
  );
}
