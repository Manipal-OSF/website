import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: any) => {
  return (
    <div className='flex flex-col min-h-screen px-20 py-5'>
      <Header />
      <main className='flex grow'>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
