import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: any) => {
  return (
    <div className='flex flex-col min-h-screen gap-20 px-5 py-5 md:px-20 dark:bg-black'>
      <Header />
      <main className='flex grow w-full justify-center'>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
