import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: any) => {
  return (
    <div className='flex flex-col min-h-screen px-5 py-5 md:px-20 dark:bg-black'>
      <Header />
      <main className='flex grow'>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
