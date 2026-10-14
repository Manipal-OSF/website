import AuthorAvatar from '@/components/authors/AuthorAvatar';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PostAuthor } from '@/types/blog';

interface PostMetaProps {
  authors: PostAuthor[];
  publishDate: string;
  readingTime: string;
  linkAuthors?: boolean;
  className?: string;
}

const Separator = () => <span aria-hidden className='bg-border h-3 w-px' />;

const PostMeta = ({
  authors,
  publishDate,
  readingTime,
  linkAuthors = false,
  className,
}: PostMetaProps) => (
  <div
    className={cn(
      'text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs',
      className
    )}
  >
    {authors.map((author) => (
      <span
        key={author.id ?? author.name}
        className='flex items-center gap-x-1.5'
      >
        <AuthorAvatar
          name={author.name}
          avatar={author.avatar}
          sizes='1.25rem'
          className='size-5 text-[0.625rem]'
        />
        {linkAuthors && author.isRegistered ? (
          <Link
            href={`/authors/${author.id}`}
            className='text-foreground underline-offset-4 hover:underline'
          >
            {author.name}
          </Link>
        ) : (
          <span>{author.name}</span>
        )}
      </span>
    ))}
    <Separator />
    <time dateTime={publishDate}>{formatDate(publishDate)}</time>
    <Separator />
    <span>{readingTime}</span>
  </div>
);

export default PostMeta;
