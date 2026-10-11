'use client';

import { useVisibleSections } from '@/hooks/use-visible-sections';
import { cn } from '@/lib/utils';
import type { PostHeading } from '@/types/blog';

const indent: Record<PostHeading['depth'], string> = {
  2: '',
  3: 'ml-4',
  4: 'ml-8',
};

// Highlights the sections currently on screen.
const HeadingList = ({ headings }: { headings: PostHeading[] }) => {
  const visible = useVisibleSections(headings.map((heading) => heading.slug));
  return (
    <ol className='flex flex-col gap-y-2 text-sm'>
      {headings.map((heading) => (
        <li key={heading.slug} className={indent[heading.depth]}>
          <a
            href={`#${heading.slug}`}
            className={cn(
              'underline decoration-transparent underline-offset-[3px] transition-colors hover:decoration-inherit',
              visible.includes(heading.slug)
                ? 'text-foreground'
                : 'text-foreground/60'
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
};

export default HeadingList;
