import { notFound } from 'next/navigation';
import { getForumContext } from '@/lib/forum';
import {
  PostRow,
  ForumUnavailable,
  SafeText,
} from '@/components/forum/ForumDisplay';
import { ContentControls } from '@/components/forum/ForumControls';
import ForumComments from '@/components/forum/ForumComments';
import ForumForm from '@/components/forum/ForumForm';

export default async function ItemPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const { store, viewer, moderator } = await getForumContext();
  if (!store) return <ForumUnavailable />;
  const post = await store.post(publicId, viewer);
  if (!post) notFound();
  const { comments } = await store.comments({ postId: publicId, viewer });
  return (
    <div>
      <h1 className='sr-only'>{post.title}</h1>
      <PostRow post={post} viewer={!!viewer} />
      {post.body && (
        <div className='mt-5'>
          <SafeText text={post.body} />
        </div>
      )}
      {viewer && !post.deleted && (
        <div className='mt-3'>
          <ContentControls
            id={post.id}
            target='post'
            owned={post.owned && !post.hidden}
            moderator={moderator}
            post={post}
          />
        </div>
      )}
      <div className='my-7 max-w-2xl'>
        {post.hidden ? (
          <p className='text-muted-foreground text-sm'>
            This discussion has been hidden by a moderator.
          </p>
        ) : post.deleted ? (
          <p className='text-muted-foreground text-sm'>
            The author deleted this submission. Existing replies remain below.
          </p>
        ) : post.locked ? (
          <p className='text-muted-foreground text-sm'>
            This discussion is locked to new replies.
          </p>
        ) : viewer ? (
          <ForumForm
            action='comment'
            fields={{ postId: post.id }}
            label='Add comment'
          >
            <label>
              Add a comment
              <textarea name='body' required maxLength={10000} rows={4} />
            </label>
          </ForumForm>
        ) : (
          <p className='text-sm'>Sign in to join the discussion.</p>
        )}
      </div>
      <h2 className='mb-5 border-t pt-5 text-sm font-semibold'>Discussion</h2>
      <ForumComments
        comments={comments}
        viewer={!!viewer}
        moderator={moderator}
      />
    </div>
  );
}
