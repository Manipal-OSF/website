import { getForumContext } from '@/lib/forum';
import { forumPage } from '@/lib/forum-store';
import ForumComments from '@/components/forum/ForumComments';
import {
  ForumPagination,
  ForumUnavailable,
} from '@/components/forum/ForumDisplay';

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { store, viewer, moderator } = await getForumContext();
  if (!store) return <ForumUnavailable />;
  const result = await store.comments({
    viewer,
    page: forumPage((await searchParams).page),
  });
  return (
    <>
      <h1 className='mb-5 text-sm font-semibold'>Recent comments</h1>
      <ForumComments
        comments={result.comments}
        viewer={!!viewer}
        moderator={moderator}
        threaded={false}
      />
      <ForumPagination {...result} path='/forum/comments' />
    </>
  );
}
