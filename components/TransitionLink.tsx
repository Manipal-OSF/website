'use client';

import { Link, useTransitionState } from 'next-transition-router';
import type { ComponentProps } from 'react';

export default function TransitionLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const { stage } = useTransitionState();

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          stage !== 'none' &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
        }
      }}
    />
  );
}
