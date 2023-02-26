
import { useEffect, useLayoutEffect } from 'react';
import {motion} from 'framer-motion';

const Layout = ({ children }: any) => {
  const variants = {
    hidden: { opacity: 0, x: 0, y: -50 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 0, y: 200 },
  }
  return (
    
      <motion.main className='flex w-full grow justify-center overflow-hidden'
        variants={variants} 
        initial="hidden" 
        animate="enter" 
        exit="exit" 
        transition={{ type: 'linear' }} 
      >
        {children}
      </motion.main>

  );
};

export default Layout;
