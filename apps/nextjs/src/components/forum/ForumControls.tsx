'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { forumAction } from '@/app/(forum)/actions';
import type { ForumPost, ForumTarget } from '@/types/forum';
import ForumForm from './ForumForm';

export function Vote({
  id,
  target,
  voted,
  owned,
  viewer,
}: {
  id: string;
  target: ForumTarget;
  voted: boolean;
  owned: boolean;
  viewer: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  if (owned)
    return (
      <span
        className='text-primary px-1'
        title='Your submission'
        aria-label='Your submission'
      >
        *
      </span>
    );
  const label = voted ? 'Remove upvote' : 'Upvote';
  if (!viewer)
    return (
      <button
        className='forum-vote'
        type='button'
        disabled
        aria-label='Upvote (sign-in required)'
        title='Sign in to vote'
      >
        ▲
      </button>
    );
  return (
    <span className='relative inline-flex'>
      <button
        className={`forum-vote ${voted ? 'text-primary' : ''}`}
        type='button'
        disabled={pending}
        aria-pressed={voted}
        aria-label={label}
        onClick={() => {
          setError('');
          startTransition(async () => {
            const form = new FormData();
            Object.entries({
              action: 'vote',
              target,
              id,
              voted: String(!voted),
            }).forEach(([key, value]) => form.set(key, value));
            try {
              const result = await forumAction(form);
              if (result.error) setError(result.error);
              else router.refresh();
            } catch {
              setError('Could not vote. Please try again.');
            }
          });
        }}
      >
        ▲
      </button>
      {error && (
        <span
          role='alert'
          className='bg-background text-destructive absolute top-full left-0 z-10 w-56 rounded border p-2 text-xs'
        >
          {error}
          <button
            aria-label='Dismiss error'
            type='button'
            onClick={() => setError('')}
            className='ml-2'
          >
            ×
          </button>
        </span>
      )}
    </span>
  );
}

export function ContentControls({
  id,
  target,
  owned,
  moderator,
  body = '',
  post,
}: {
  id: string;
  target: ForumTarget;
  owned: boolean;
  moderator: boolean;
  body?: string;
  post?: ForumPost;
}) {
  return (
    <div className='forum-controls'>
      {owned && (
        <>
          <details>
            <summary>edit</summary>
            <ForumForm action='edit' fields={{ target, id }}>
              {post ? (
                <PostFields post={post} />
              ) : (
                <label>
                  Comment
                  <textarea
                    aria-label='Comment'
                    name='body'
                    required
                    maxLength={10000}
                    defaultValue={body}
                    rows={5}
                  />
                </label>
              )}
            </ForumForm>
          </details>
          <details>
            <summary>delete</summary>
            <ForumForm
              action='delete'
              fields={{ target, id }}
              label='Delete'
              confirmMessage='Delete your content? Replies will remain.'
            >
              <p>Replies will remain in the discussion.</p>
            </ForumForm>
          </details>
        </>
      )}
      <details>
        <summary>report</summary>
        <ForumForm action='report' fields={{ target, id }} label='Send report'>
          <label>
            Reason
            <textarea name='reason' required maxLength={1000} rows={3} />
          </label>
        </ForumForm>
      </details>
      {moderator && (
        <details>
          <summary>moderate</summary>
          <ModerationForm id={id} target={target} />
        </details>
      )}
    </div>
  );
}

export function PostFields({ post }: { post?: ForumPost }) {
  const [kind, setKind] = useState(post?.kind ?? 'link');
  return (
    <>
      <label>
        Title
        <input
          name='title'
          required
          maxLength={300}
          defaultValue={post?.title}
        />
      </label>
      <div className='flex flex-wrap gap-4'>
        <label>
          Type
          <select
            aria-label='Type'
            name='kind'
            value={kind}
            onChange={(event) => setKind(event.target.value as 'link' | 'text')}
          >
            <option value='link'>Link</option>
            <option value='text'>Text discussion</option>
          </select>
        </label>
        <label>
          Category
          <select
            aria-label='Category'
            name='category'
            defaultValue={post?.category ?? 'general'}
          >
            <option value='general'>General</option>
            <option value='ask'>Ask</option>
            <option value='show'>Show</option>
          </select>
        </label>
      </div>
      {kind === 'link' ? (
        <label>
          URL
          <input
            aria-label='URL'
            name='url'
            type='url'
            required
            maxLength={2048}
            defaultValue={post?.url ?? ''}
            placeholder='https://'
          />
          <span className='text-muted-foreground text-xs'>
            Share a link, then add your thoughts as a comment.
          </span>
        </label>
      ) : (
        <label>
          Text
          <textarea
            name='body'
            required
            maxLength={20000}
            defaultValue={post?.body ?? ''}
            rows={9}
          />
        </label>
      )}
      <p className='text-muted-foreground text-xs'>
        Ask posts must use “Text discussion”. Plain text and HTTP(S) links are
        supported.
      </p>
    </>
  );
}

export function ModerationForm({
  id,
  target,
  reportId,
}: {
  id: string;
  target: ForumTarget;
  reportId?: string;
}) {
  return (
    <ForumForm
      action='moderate'
      fields={{ id, target, ...(reportId ? { reportId } : {}) }}
      label='Apply moderation'
    >
      <label>
        Action
        <select aria-label='Action' name='operation'>
          <option value='hide'>Hide</option>
          <option value='restore'>Restore</option>
          {target === 'post' && (
            <>
              <option value='lock'>Lock replies</option>
              <option value='unlock'>Unlock replies</option>
            </>
          )}
          {reportId && <option value='dismiss'>Dismiss report</option>}
        </select>
      </label>
      <label>
        Reason
        <textarea name='reason' required maxLength={1000} rows={2} />
      </label>
    </ForumForm>
  );
}
