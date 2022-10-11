import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: any) => {
  return (
    <div className='flex flex-col min-h-screen gap-20 px-5 py-5 md:px-20 bg-primary dark:bg-primary-dark'>
      <Header />
      <main className='flex grow'>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
