import Header from './Header';
import Footer from './Footer';
import { useEffect, useLayoutEffect } from 'react';
import {motion} from 'framer-motion';
const Layout = ({ children }: any) => {

  const variants = {
    hidden: { opacity: 0, x: -200, y: 0 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 0, y: -100 },
}
  return (
    <div className='flex flex-col min-h-screen gap-20 px-5 py-5 md:px-20 bg-primary dark:bg-primary-dark'>
      <Header />
      <motion.main className='flex w-full grow justify-center'
        variants={variants} // Pass the variant object into Framer Motion 
        initial="hidden" // Set the initial state to variants.hidden
        animate="enter" // Animated state to variants.enter
        exit="exit" // Exit state (used later) to variants.exit
        transition={{ type: 'linear' }} // Set the transition to linear
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
