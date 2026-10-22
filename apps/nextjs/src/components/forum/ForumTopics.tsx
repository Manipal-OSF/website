import Link from 'next/link';
import type { ForumPost } from '@/types/forum';
import { PostRow } from './ForumDisplay';

export default function ForumTopics({
  posts,
  page = 1,
  viewer = false,
  searching = false,
}: {
  posts: ForumPost[];
  page?: number;
  viewer?: boolean;
  searching?: boolean;
}) {
  if (!posts.length)
    return (
      <div className='text-muted-foreground py-10 text-sm'>
        <p>
          {searching
            ? 'No discussions match your search.'
            : 'No discussions yet. Share something interesting with the community.'}
        </p>
        <Link
          href='/forum/submit'
          className='text-primary mt-3 inline-block underline'
        >
          Submit a discussion →
        </Link>
      </div>
    );
  return (
    <div className='space-y-4 py-2'>
      {posts.map((post, index) => (
        <PostRow
          key={post.id}
          post={post}
          rank={(page - 1) * 30 + index + 1}
          viewer={viewer}
        />
      ))}
    </div>
  );
}
