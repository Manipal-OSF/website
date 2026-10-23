'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ForumComment } from '@/types/forum';
import { ContentControls, Vote } from './ForumControls';
import ForumForm from './ForumForm';
import { ForumTime, MemberLink, SafeText } from './ForumDisplay';

export default function ForumComments({
  comments,
  viewer,
  moderator = false,
  threaded = true,
}: {
  comments: ForumComment[];
  viewer: boolean;
  moderator?: boolean;
  threaded?: boolean;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const rows = useMemo(() => {
    if (!threaded)
      return comments.map((comment) => ({
        comment,
        depth: 0,
        ancestors: [] as string[],
      }));
    const ids = new Set(comments.map((comment) => comment.id));
    const children = new Map<string | null, ForumComment[]>();
    for (const comment of comments) {
      const parent =
        comment.parentId && ids.has(comment.parentId) ? comment.parentId : null;
      children.set(parent, [...(children.get(parent) ?? []), comment]);
    }
    const stack = (children.get(null) ?? [])
      .map((comment) => ({ comment, depth: 0, ancestors: [] as string[] }))
      .reverse();
    const result = [];
    const seen = new Set<string>();
    while (stack.length) {
      const row = stack.pop()!;
      if (seen.has(row.comment.id)) continue;
      seen.add(row.comment.id);
      result.push(row);
      for (const comment of [...(children.get(row.comment.id) ?? [])].reverse())
        stack.push({
          comment,
          depth: row.depth + 1,
          ancestors: [...row.ancestors, row.comment.id],
        });
    }
    return result;
  }, [comments, threaded]);
  if (!comments.length)
    return (
      <p className='text-muted-foreground py-5 text-sm'>No comments yet.</p>
    );
  return (
    <div className='space-y-5'>
      {rows
        .filter((row) => !row.ancestors.some((id) => collapsed.has(id)))
        .map(({ comment: c, depth }) => {
          const path = `/item/${c.postId}#comment-${c.id}`;
          const unavailable = c.deleted || c.hidden;
          return (
            <article
              key={c.id}
              id={`comment-${c.id}`}
              className='forum-comment'
              style={{ marginInlineStart: `${Math.min(depth, 5) * 0.85}rem` }}
            >
              <div className='forum-meta flex flex-wrap items-center gap-x-2'>
                {!unavailable && (
                  <Vote
                    id={c.id}
                    target='comment'
                    voted={c.voted}
                    owned={c.owned}
                    viewer={viewer}
                  />
                )}
                <MemberLink username={c.username} />
                <ForumTime
                  value={c.createdAt}
                  href={path}
                  minutes={c.ageMinutes}
                />
                {!unavailable && (
                  <span>
                    {c.points} {c.points === 1 ? 'point' : 'points'}
                  </span>
                )}
                {threaded && (
                  <button
                    type='button'
                    aria-expanded={!collapsed.has(c.id)}
                    aria-label={`${
                      collapsed.has(c.id) ? 'Expand' : 'Collapse'
                    } comment by ${c.username ?? 'deleted user'}`}
                    onClick={() =>
                      setCollapsed((previous) => {
                        const next = new Set(previous);
                        if (next.has(c.id)) next.delete(c.id);
                        else next.add(c.id);
                        return next;
                      })
                    }
                  >
                    {collapsed.has(c.id) ? '[+]' : '[−]'}
                  </button>
                )}
                {!threaded && <Link href={path}>on: {c.postTitle}</Link>}
                {threaded && c.parentId && (
                  <Link href={`#comment-${c.parentId}`}>parent</Link>
                )}
              </div>
              {!collapsed.has(c.id) && (
                <div className='mt-1 pl-1'>
                  <SafeText text={c.body} />
                  {!unavailable && (
                    <>
                      {!c.locked &&
                        (viewer ? (
                          <details className='forum-reply'>
                            <summary>reply</summary>
                            <ForumForm
                              action='comment'
                              fields={{ postId: c.postId, parentId: c.id }}
                              label='Reply'
                            >
                              <label>
                                Reply
                                <textarea
                                  name='body'
                                  required
                                  maxLength={10000}
                                  rows={4}
                                />
                              </label>
                            </ForumForm>
                          </details>
                        ) : (
                          <span className='forum-meta'>Sign in to reply.</span>
                        ))}
                      {viewer && (
                        <ContentControls
                          id={c.id}
                          target='comment'
                          body={c.body}
                          owned={c.owned}
                          moderator={moderator}
                        />
                      )}
                    </>
                  )}
                  {c.hidden && moderator && (
                    <details className='forum-reply'>
                      <summary>moderate hidden comment</summary>
                      <ContentControls
                        id={c.id}
                        target='comment'
                        owned={false}
                        moderator
                      />
                    </details>
                  )}
                </div>
              )}
            </article>
          );
        })}
    </div>
  );
}
