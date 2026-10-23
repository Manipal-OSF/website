import Link from 'next/link';
import type { ForumPost } from '@/types/forum';
import { Vote } from './ForumControls';

export function MemberLink({ username }: { username: string | null }) {
  return username ? (
    <Link href={`/user/${encodeURIComponent(username.toLowerCase())}`}>
      {username}
    </Link>
  ) : (
    <span>[deleted user]</span>
  );
}
export function ForumTime({
  value,
  href,
  minutes,
}: {
  value: string;
  href: string;
  minutes: number;
}) {
  const text =
    minutes < 1
      ? 'just now'
      : minutes < 60
        ? `${minutes}m ago`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)}h ago`
          : `${Math.floor(minutes / 1440)}d ago`;
  return (
    <Link href={href}>
      <time dateTime={value} title={new Date(value).toUTCString()}>
        {text}
      </time>
    </Link>
  );
}
export function ForumUnavailable() {
  return (
    <p role='status' className='text-muted-foreground py-10 text-sm'>
      Discussions are temporarily unavailable. Please check back soon.
    </p>
  );
}
export function ForumPagination({
  more,
  page,
  path,
}: {
  more: boolean;
  page: number;
  path: string;
}) {
  const separator = path.includes('?') ? '&' : '?';
  return (
    <nav aria-label='Pagination' className='forum-meta mt-6 flex gap-6'>
      {page > 1 && (
        <Link href={`${path}${separator}page=${page - 1}`}>← Previous</Link>
      )}
      {more && <Link href={`${path}${separator}page=${page + 1}`}>More →</Link>}
    </nav>
  );
}
export function PostRow({
  post,
  rank,
  viewer = false,
}: {
  post: ForumPost;
  rank?: number;
  viewer?: boolean;
}) {
  const path = `/item/${post.id}`;
  let domain = '';
  try {
    domain = post.url ? new URL(post.url).hostname.replace(/^www\./, '') : '';
  } catch {
    /* Invalid legacy links are displayed as text. */
  }
  return (
    <article className='forum-post'>
      {rank !== undefined && (
        <span className='text-muted-foreground min-w-6 text-right text-sm tabular-nums'>
          {rank}.
        </span>
      )}
      {!post.deleted && !post.hidden && (
        <Vote
          id={post.id}
          target='post'
          voted={post.voted}
          owned={post.owned}
          viewer={viewer}
        />
      )}
      <div className='min-w-0 flex-1'>
        <div className='text-sm leading-snug sm:text-[15px]'>
          <Link
            className='forum-title'
            href={post.url ?? path}
            {...(post.url ? { rel: 'nofollow ugc noreferrer' } : {})}
          >
            {post.title}
          </Link>
          {domain && (
            <span className='text-muted-foreground ml-2 text-xs break-all'>
              ({domain})
            </span>
          )}
        </div>
        <div className='forum-meta'>
          <span>
            {post.points} {post.points === 1 ? 'point' : 'points'}
          </span>
          {' by '}
          <MemberLink username={post.username} />
          {' · '}
          <ForumTime
            value={post.createdAt}
            href={path}
            minutes={post.ageMinutes}
          />
          {' | '}
          <Link href={path}>
            {post.commentCount ? `${post.commentCount} comments` : 'discuss'}
          </Link>
          {post.category !== 'general' && (
            <>
              {' | '}
              <Link href={`/?view=${post.category}`}>{post.category}</Link>
            </>
          )}
          {post.locked && <span>{' | '}locked</span>}
        </div>
      </div>
    </article>
  );
}
export function SafeText({ text }: { text: string }) {
  return (
    <div className='forum-body'>
      {text.split(/(https?:\/\/[^\s<>]+)/g).map((part, index) =>
        /^https?:\/\//.test(part) ? (
          <a key={index} href={part} rel='nofollow ugc noreferrer'>
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </div>
  );
}
