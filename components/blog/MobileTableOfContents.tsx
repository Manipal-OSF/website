'use client';

import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { useScrollProgress } from '@/hooks/use-scroll-progress';
import { useVisibleSections } from '@/hooks/use-visible-sections';
import { cn } from '@/lib/utils';
import type { PostHeading } from '@/types/blog';
import HeadingList from './HeadingList';

const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface MobileTableOfContentsProps {
  headings: PostHeading[];
  className?: string;
}

// Sticky bar under the header for narrow screens: shows the section being read
// and a ring that fills as the reader works through the post.
const MobileTableOfContents = ({
  headings,
  className,
}: MobileTableOfContentsProps) => {
  const details = useRef<HTMLDetailsElement>(null);
  const visible = useVisibleSections(headings.map((heading) => heading.slug));
  const progress = useScrollProgress();

  if (headings.length === 0) return null;

  const current =
    headings
      .filter((heading) => visible.includes(heading.slug))
      .map((heading) => heading.text)
      .join(', ') || 'Overview';

  return (
    <details
      ref={details}
      // Collapse once the reader picks a section so the text is not covered.
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('a') && details.current)
          details.current.open = false;
      }}
      className={cn(
        'group bg-background/80 sticky top-14 z-40 -mx-4 border-b px-4 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-xl sm:border',
        className
      )}
    >
      <summary className='flex cursor-pointer list-none items-center gap-2 text-sm [&::-webkit-details-marker]:hidden'>
        <svg
          viewBox='0 0 24 24'
          className='size-4 shrink-0 -rotate-90'
          role='img'
          aria-label={`${Math.round(progress * 100)}% read`}
        >
          <circle
            cx='12'
            cy='12'
            r={RADIUS}
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='text-primary/20'
          />
          <circle
            cx='12'
            cy='12'
            r={RADIUS}
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className='text-primary'
          />
        </svg>
        <span className='text-muted-foreground grow truncate'>{current}</span>
        <ChevronDown className='text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180' />
      </summary>
      <div className='mt-3 max-h-[50vh] overflow-y-auto'>
        <HeadingList headings={headings} />
      </div>
    </details>
  );
};

export default MobileTableOfContents;
