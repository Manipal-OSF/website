import type { ComponentProps } from 'react';
import { cn } from '@packages/ui/lib/utils';

// The reading-width column shared by blog and author pages.
const Container = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('mx-auto w-full max-w-3xl', className)} {...props} />
);

export default Container;
