import { Hash } from 'lucide-react';
import { cn } from '@packages/ui/lib/utils';

const Tags = ({ tags, className }: { tags: string[]; className?: string }) =>
  tags.length > 0 ? (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <li
          key={tag}
          className='bg-muted text-muted-foreground flex items-center gap-x-1 rounded-md px-2 py-0.5 text-xs'
        >
          <Hash className='size-3' />
          {tag}
        </li>
      ))}
    </ul>
  ) : null;

export default Tags;
