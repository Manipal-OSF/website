'use client';

import { motion, useAnimate } from 'framer-motion';
import { useCallback, useRef, type ReactNode } from 'react';
import { TransitionRouter } from 'next-transition-router';

const variants = {
  hidden: { opacity: 0, y: -50 },
  enter: { opacity: 1, y: 0 },
};

interface LayoutProps {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}

const Layout = ({ children, header, footer }: LayoutProps) => {
  const [scope, animate] = useAnimate<HTMLElement>();
  const transitioning = useRef(false);

  const leave = useCallback(
    (next: () => void) => {
      // React may batch multiple link clicks before the router stage updates.
      if (transitioning.current) return;
      transitioning.current = true;
      const animation = animate(
        scope.current,
        { opacity: 0, y: 200 },
        { duration: 0.3, type: 'tween' }
      );
      animation.then(next);
      return () => animation.stop();
    },
    [animate, scope]
  );

  const enter = useCallback(
    (next: () => void) => {
      window.scrollTo(0, 0);
      const animation = animate(
        scope.current,
        { opacity: [0, 1], y: [-50, 0] },
        { duration: 0.3, type: 'tween' }
      );
      animation.then(() => {
        transitioning.current = false;
        next();
      });
      return () => animation.stop();
    },
    [animate, scope]
  );

  return (
    <TransitionRouter leave={leave} enter={enter}>
      <div className='bg-background text-foreground flex min-h-screen flex-col gap-y-6 font-sans'>
        {header}
        <motion.main
          ref={scope}
          className='mx-auto flex w-full max-w-5xl grow flex-col gap-y-6 overflow-hidden px-4'
          variants={variants}
          initial='hidden'
          animate='enter'
          transition={{ duration: 0.3, type: 'tween' }}
        >
          {children}
        </motion.main>
        {footer}
      </div>
    </TransitionRouter>
  );
};

export default Layout;
