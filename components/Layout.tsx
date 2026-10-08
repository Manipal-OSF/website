import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const variants = {
  hidden: { opacity: 0, y: -50 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 200 },
};

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <motion.main
      className='mx-auto flex w-full max-w-5xl grow flex-col gap-y-6 overflow-hidden px-4'
      variants={variants}
      initial='hidden'
      animate='enter'
      exit='exit'
      transition={{ type: 'tween' }}
    >
      {children}
    </motion.main>
  );
};

export default Layout;