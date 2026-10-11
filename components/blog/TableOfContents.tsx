import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostHeading } from '@/types/blog';
import HeadingList from './HeadingList';

interface TableOfContentsProps {
  headings: PostHeading[];
  className?: string;
}

// Server-rendered wrappers; only HeadingList runs on the client.
// Sticky sidebar for wide screens.

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

// Collapsible box for narrow screens.
export const TableOfContentsDropdown = ({
  headings,
  className,
}: TableOfContentsProps) =>
  headings.length > 0 ? (
    <details className={cn('group rounded-xl border p-4', className)}>
      <summary className='flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden'>
        <ChevronRight className='size-4 transition-transform group-open:rotate-90' />
        Table of Contents
      </summary>
      <div className='mt-3 max-h-[50vh] overflow-y-auto'>
        <HeadingList headings={headings} />
      </div>
    </details>
  ) : null;
