import { cn } from '@/lib/utils';
import type { PostHeading } from '@/types/blog';
import HeadingList from './HeadingList';

interface TableOfContentsProps {
  headings: PostHeading[];
  className?: string;
}

// Server-rendered sticky sidebar for wide screens; only HeadingList runs on the client.
// Narrow screens use MobileTableOfContents instead.
export const TableOfContentsSidebar = ({
  headings,
  className,
}: TableOfContentsProps) =>
  headings.length > 0 ? (
    <nav
      aria-label='Table of contents'
      className={cn(
        'sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4',
        className
      )}
    >
      <p className='text-foreground mb-3 text-lg font-medium'>
        Table of Contents
      </p>
      <HeadingList headings={headings} />
    </nav>
  ) : null;
