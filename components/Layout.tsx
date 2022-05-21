import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: any) => {
  return (
    <div className='px-5'>
      <Header />
      <main className='grow-0'>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
