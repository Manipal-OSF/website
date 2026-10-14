import Link from 'next/link';
import { resolveAuthors } from '@/lib/content/authors';
import type { BlogPost } from '@/types/blog';
import CoverImage from './CoverImage';
import PostMeta from './PostMeta';
import Tags from './Tags';

type BlogCardProps = {
  post: Pick<
    BlogPost,
    | 'id'
    | 'title'
    | 'description'
    | 'authors'
    | 'publishDate'
    | 'readingTime'
    | 'tags'
    | 'coverImage'
  >;
};

const BlogCard = async ({ post }: BlogCardProps) => {
  const authors = await resolveAuthors(post.authors);
  return (
    <Link
      href={`/blog/${post.id}`}
      className='hover:bg-muted/50 flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row'
    >
      <CoverImage
        src={post.coverImage}
        alt={post.title}
        sizes='(min-width: 640px) 16rem, 100vw'
        className='w-full shrink-0 rounded-md sm:w-64'
      />
      <div className='flex flex-col gap-2'>
        <h2 className='text-foreground text-lg font-medium'>{post.title}</h2>
        {post.description && (
          <p className='text-muted-foreground text-sm'>{post.description}</p>
        )}
        <PostMeta
          authors={authors}
          publishDate={post.publishDate}
          readingTime={post.readingTime}
        />
        <Tags tags={post.tags} />
      </div>
    </Link>
  );
};

export default BlogCard;
