import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

type PostLink = Pick<BlogPost, 'id' | 'title'>;

interface PostNavigationProps {
  newer: PostLink | null;
  older: PostLink | null;
}

const base =
  'group flex size-full items-center gap-2 rounded-lg border p-3 transition-colors';

const Placeholder = ({
  align,
  text,
}: {
  align: 'start' | 'end';
  text: string;
}) => (
  <div
    aria-disabled
    className={cn(
      base,
      'cursor-not-allowed opacity-50',
      align === 'end' && 'justify-end'
    )}
  >
    <span className='text-muted-foreground text-sm'>{text}</span>
  </div>
);

const PostNavigation = ({ newer, older }: PostNavigationProps) => (
  <nav
    aria-label='Post navigation'
    className='grid grid-cols-1 gap-4 sm:grid-cols-2'
  >
    {older ? (
      <Link
        href={`/blog/${older.id}`}
        className={cn(base, 'hover:bg-muted')}
      >
        <ArrowLeft className='size-4 shrink-0 transition-transform group-hover:-translate-x-1' />
        <span className='flex flex-col items-start'>
          <span className='text-muted-foreground text-xs'>Previous Post</span>
          <span className='text-sm text-balance'>{older.title}</span>
        </span>
      </Link>
    ) : (
      <Placeholder align='start' text="You're at the oldest post!" />
    )}
    {newer ? (
      <Link
        href={`/blog/${newer.id}`}
        className={cn(base, 'justify-end hover:bg-muted')}
      >
        <span className='flex flex-col items-end text-right'>
          <span className='text-muted-foreground text-xs'>Next Post</span>
          <span className='text-sm text-balance'>{newer.title}</span>
        </span>
        <ArrowRight className='size-4 shrink-0 transition-transform group-hover:translate-x-1' />
      </Link>
    ) : (
      <Placeholder align='end' text="You're at the newest post!" />
    )}
  </nav>
);

export default PostNavigation;
