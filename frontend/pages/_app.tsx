import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AnimatePresence } from 'framer-motion'

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <div className='flex overflow-hidden flex-col min-h-screen gap-20 px-5 py-5 md:px-20 bg-primary dark:bg-primary-dark'>
      <Header />
      <AnimatePresence
        mode="wait"
        initial={true}
        onExitComplete={() => window.scrollTo(0, 0)}
      >
        <Layout key={router.asPath}>
          <Component {...pageProps} />
        </Layout>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default MyApp;
