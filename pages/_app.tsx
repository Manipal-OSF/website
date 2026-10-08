import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AnimatePresence } from 'framer-motion';

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <div className='bg-background text-foreground flex min-h-screen flex-col gap-y-6 font-sans'>
      <header className='bg-background/50 sticky top-0 z-50 border-b backdrop-blur-sm'>
        <Header />
      </header>

      <AnimatePresence
        mode='wait'
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