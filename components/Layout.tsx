import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: any) => {
  return (
    <div className='px-20 py-5'>
      <Header />
      <main className='min-h-screen grow'>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
