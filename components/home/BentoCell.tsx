import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BentoArea =
  | 'about'
  | 'logo'
  | 'stats'
  | 'post'
  | 'map'
  | 'langs'
  | 'activity'
  | 'github'
  | 'discord'
  | 'teams'
  | 'team';

interface BentoCellProps extends ComponentProps<'section'> {
  area: BentoArea;
  // A speech bubble revealed while the cell is hovered.
  note?: ReactNode;
  noteClassName?: string;
}

const BentoCell = ({
  area,
  note,
  noteClassName,
  className,
  children,
  style,
  ...props
}: BentoCellProps) => (
  <section
    style={{ gridArea: area, ...style }}
    className={cn(
      'group bg-card relative overflow-hidden rounded-xl border-2',
      className
    )}
    {...props}
  >
    {children}
    {note && (
      <p
        aria-hidden='true'
        className={cn(
          'bg-background text-foreground pointer-events-none absolute z-20 max-w-[80%] rounded-lg border-2 px-2.5 py-1 text-xs text-pretty opacity-0 shadow-sm transition-[opacity,translate] duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:transition-none sm:text-sm',
          noteClassName
        )}
      >
        {note}
      </p>
    )}
  </section>
);

export default BentoCell;
