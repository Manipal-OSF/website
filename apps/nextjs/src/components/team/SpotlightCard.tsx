'use client';

import { useRef, type ComponentProps, type PointerEvent } from 'react';
import { cn } from '@packages/ui/lib/utils';

const SpotlightCard = ({
  className,
  children,
  onPointerMove,
  ...props
}: ComponentProps<'div'>) => {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (element) {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      element.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    }
    onPointerMove?.(event);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn(
        'group/spot bg-card relative overflow-hidden rounded-xl border-2',
        className
      )}
      {...props}
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100 motion-reduce:transition-none'
        style={{
          background:
            'radial-gradient(18rem circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)',
        }}
      />
      <div className='relative'>{children}</div>
    </div>
  );
};

export default SpotlightCard;
