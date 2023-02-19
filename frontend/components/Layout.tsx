import Header from './Header';
import Footer from './Footer';
import { useEffect, useLayoutEffect } from 'react';

const Layout = ({ children }: any) => {
  return (
    <div className='flex min-h-screen flex-col gap-20 px-5 py-5 dark:bg-black md:px-20'>
      <Header />
      <main className='flex w-full grow justify-center'>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
